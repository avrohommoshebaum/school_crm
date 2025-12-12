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

  const roles = await Role.find({ _id: { $in: roleIds } });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);

  const invite = await Invitation.create({
    email: email.toLowerCase(),
    token,
    roles: roles.map((r) => r._id),
    createdBy: req.user._id,
    expiresAt,
  });

  const link = `${process.env.CLIENT_URL}/invite/accept?token=${token}`;

  await sendInviteEmail({ to: email, inviteLink: link });

  res.json({ message: "Invite sent" });
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

  const invite = await Invitation.findOne({ token, accepted: false });

  if (!invite) return res.status(400).json({ message: "Invalid invite" });

  let user = await User.findOne({ email: invite.email });

  if (!user) {
    user = new User({
      email: invite.email,
      name,
      roles: invite.roles,
      status: "active",
      invitedBy: invite.createdBy,
    });
  } else {
    user.name = name;
    user.status = "active";
    user.roles = [...new Set([...(user.roles || []), ...invite.roles])];
  }

  await user.setPassword(password);
  await user.save();

  invite.accepted = true;
  await invite.save();

  req.login(user, async () => {
    await user.populate("roles");
    res.json({ user });
  });
};
