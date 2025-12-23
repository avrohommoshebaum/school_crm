import crypto from "crypto";
import { invitationService } from "../db/services/invitationService.js";
import { roleService } from "../db/services/roleService.js";
import { userService } from "../db/services/userService.js";
import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

import  sendInviteEmail from "../utils/email/sendInviteEmail.js"; 

export const createInvite = async (req, res) => {
  const { email, roleIds } = req.body;

  const normalizedEmail = email.toLowerCase();

  // 1️⃣ Prevent duplicate users
  const existingUser = await userService.findByEmail(normalizedEmail);
  if (existingUser) {
    return res.status(400).json({
      message: "A user with this email already exists",
    });
  }

  // 2️⃣ Load roles
  const roles = await roleService.findByIds(roleIds);

  if (!roles.length) {
    return res.status(400).json({ message: "Invalid roles selected" });
  }

  // 3️⃣ Create INVITED user immediately
  const user = await userService.create({
    email: normalizedEmail,
    roles: roles.map((r) => r._id || r.id),
    status: "invited",
    invitedBy: req.user._id || req.user.id,
  });

  // 4️⃣ Create invite token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await invitationService.create({
    email: normalizedEmail,
    token,
    roles: roles.map((r) => r._id || r.id),
    createdBy: req.user._id || req.user.id,
    expiresAt,
  });

  // 5️⃣ Send email
  const link = `${process.env.CLIENT_URL}/invite/accept?token=${token}`;
  await sendInviteEmail({ to: normalizedEmail, inviteLink: link });

  res.json({ message: "Invite sent successfully" });
};

export const getInviteDetails = async (req, res) => {
  const invite = await invitationService.findByToken(req.params.token);

  if (!invite || invite.accepted) {
    return res.status(400).json({ message: "Invalid or expired invite" });
  }

  // Check expiration
  if (invite.expiresAt) {
    const expiresAt = invite.expiresAt.toDate ? invite.expiresAt.toDate() : new Date(invite.expiresAt);
    if (expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired invite" });
    }
  }

  const inviteWithRoles = await invitationService.populateRoles(invite);

  res.json({
    email: inviteWithRoles.email,
    roles: inviteWithRoles.roles.map((r) => ({
      id: r._id || r.id,
      name: r.name,
      displayName: r.displayName,
    })),
  });
};

export const completeInvite = async (req, res) => {
  const { name, password } = req.body;
  const token = req.params.token;

  const invite = await invitationService.findByToken(token);

  if (!invite || invite.accepted) {
    return res.status(400).json({ message: "Invalid or expired invite" });
  }

  // Check expiration
  if (invite.expiresAt) {
    const expiresAt = invite.expiresAt.toDate ? invite.expiresAt.toDate() : new Date(invite.expiresAt);
    if (expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired invite" });
    }
  }

  const user = await userService.findByEmail(invite.email);

  if (!user) {
    return res.status(400).json({ message: "User record not found" });
  }

  // Activate user
  await userService.update(user._id || user.id, {
    name,
    status: "active",
    roles: invite.roles,
  });

  await userService.setPassword(user._id || user.id, password);

  await invitationService.update(invite._id || invite.id, { accepted: true });

  const updatedUser = await userService.findById(user._id || user.id);
  const userWithRoles = await userService.populateRoles(updatedUser);

  req.login(userWithRoles, async () => {
    res.json({ user: userWithRoles });
  });
};

export const resendInvite = async (req, res) => {
  const { userId } = req.params;

  // 1️⃣ Find the user
  const user = await userService.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.status !== "invited") {
    return res.status(400).json({
      message: "User is not in invited status. Cannot resend invitation.",
    });
  }

  const normalizedEmail = user.email.toLowerCase();

  // 2️⃣ Get user's roles (they're stored as IDs)
  const userRoles = user.roles || [];
  if (!userRoles.length) {
    return res.status(400).json({
      message: "User has no roles assigned. Cannot resend invitation.",
    });
  }

  // 3️⃣ Find existing invitation or create new one
  let invite = await invitationService.findByEmail(normalizedEmail);
  
  // 4️⃣ Generate new token and extend expiration
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  if (invite) {
    // Update existing invitation with new token
    await invitationService.update(invite._id || invite.id, {
      token,
      expiresAt,
      accepted: false, // Reset accepted status in case it was marked
      roles: userRoles, // Update roles in case they changed
    });
  } else {
    // Create new invitation if none exists
    invite = await invitationService.create({
      email: normalizedEmail,
      token,
      roles: userRoles,
      createdBy: req.user._id || req.user.id,
      expiresAt,
    });
  }

  // 5️⃣ Send email with new token
  const link = `${process.env.CLIENT_URL}/invite/accept?token=${token}`;
  await sendInviteEmail({ to: normalizedEmail, inviteLink: link });

  res.json({ message: "Invitation resent successfully" });
};
