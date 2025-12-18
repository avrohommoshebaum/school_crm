import crypto from "crypto";
import Invitation from "../db/models/invitation.js";
import Role from "../db/models/role.js";
import User from "../db/models/user.js";
import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

import  sendInviteEmail from "../utils/email/sendInviteEmail.js"; 

export const createInvite = async (req, res) => {
  const { email, roleIds } = req.body;

  const normalizedEmail = email.toLowerCase();

  // 1️⃣ Prevent duplicate users
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(400).json({
      message: "A user with this email already exists",
    });
  }

  // 2️⃣ Load roles
  const roles = await Role.find({ _id: { $in: roleIds } });

  if (!roles.length) {
    return res.status(400).json({ message: "Invalid roles selected" });
  }

  // 3️⃣ Create INVITED user immediately
  const user = await User.create({
    email: normalizedEmail,
    roles: roles.map((r) => r._id),
    status: "invited",
    invitedBy: req.user._id,
  });

  // 4️⃣ Create invite token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await Invitation.create({
    email: normalizedEmail,
    token,
    roles: roles.map((r) => r._id),
    createdBy: req.user._id,
    expiresAt,
  });

  // 5️⃣ Send email
  const link = `${process.env.CLIENT_URL}/invite/accept?token=${token}`;
  await sendInviteEmail({ to: normalizedEmail, inviteLink: link });

  res.json({ message: "Invite sent successfully" });
};

export const getInviteDetails = async (req, res) => {
  const invite = await Invitation.findOne({
    token: req.params.token,
    accepted: false,
  }).populate("roles");

  if (!invite) return res.status(400).json({ message: "Invalid or expired invite" });

  res.json({
    email: invite.email,
    roles: invite.roles.map((r) => ({
      id: r._id,
      name: r.name,
      displayName: r.displayName,
    })),
  });
};

export const completeInvite = async (req, res) => {
  const { name, password } = req.body;
  const token = req.params.token;

  const invite = await Invitation.findOne({
    token,
    accepted: false,
    expiresAt: { $gt: new Date() },
  });

  if (!invite) {
    return res.status(400).json({ message: "Invalid or expired invite" });
  }

  const user = await User.findOne({ email: invite.email });

  if (!user) {
    return res.status(400).json({ message: "User record not found" });
  }

  // Activate user
  user.name = name;
  user.status = "active";
  user.roles = invite.roles;

  await user.setPassword(password);
  await user.save();

  invite.accepted = true;
  await invite.save();

  req.login(user, async () => {
    await user.populate("roles");
    res.json({ user });
  });
};
