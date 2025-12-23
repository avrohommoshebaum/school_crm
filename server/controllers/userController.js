import { userService } from "../db/services/userService.js";
import crypto from "crypto";
import sendResetEmail from "../utils/email/sendResetEmail.js";

// Helper to convert Firestore Timestamp to ISO string
const convertDate = (dateValue) => {
  if (!dateValue) return null;
  
  // Handle Firestore Timestamp objects (has toDate method)
  if (dateValue.toDate && typeof dateValue.toDate === 'function') {
    return dateValue.toDate().toISOString();
  }
  
  // Handle Firestore Timestamp objects (has seconds/nanoseconds)
  if (dateValue.seconds !== undefined) {
    return new Date(dateValue.seconds * 1000 + (dateValue.nanoseconds || 0) / 1000000).toISOString();
  }
  
  // Handle regular Date objects
  if (dateValue instanceof Date) {
    return dateValue.toISOString();
  }
  
  // If it's already a string, return as-is
  if (typeof dateValue === 'string') {
    return dateValue;
  }
  
  return null;
};

export const getAllUsers = async (req, res) => {
  const users = await userService.findAll();
  const usersWithRoles = await userService.populateRolesForUsers(users);

  const formatted = usersWithRoles.map((u) => ({
    id: u._id || u.id,
    name: u.name,
    email: u.email,
    status: u.status,
    roles: (u.roles || []).map(r => ({
      id: r._id || r.id,
      name: r.name,
      displayName: r.displayName,
      color: r.color
    })),
    lastLogin: convertDate(u.lastLogin),
    createdAt: convertDate(u.createdAt),
  }));

  res.json({ users: formatted });
};

export const updateUser = async (req, res) => {
  const { name, email, status, roleIds } = req.body;
  const user = await userService.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email.toLowerCase();
  if (status !== undefined) updates.status = status;
  if (Array.isArray(roleIds) && roleIds.length > 0) {
    updates.roles = roleIds;
  }

  const updatedUser = await userService.update(user._id || user.id, updates);
  const userWithRoles = await userService.populateRoles(updatedUser);

  res.json({ message: "User updated", user: userWithRoles });
};

export const deleteUser = async (req, res) => {
  const user = await userService.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  await userService.delete(user._id || user.id);

  res.json({ message: "User deleted" });
};

export const adminSetPassword = async (req, res) => {
  const { tempPassword, requireChange } = req.body;
  const user = await userService.findById(req.params.id);

  if (!user) return res.status(404).json({ message: "User not found" });

  await userService.setPassword(user._id || user.id, tempPassword);
  await userService.update(user._id || user.id, {
    mustChangePassword: !!requireChange,
  });

  res.json({ message: "Password updated" });
};


export const adminSendPasswordReset = async (req, res) => {
  const user = await userService.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const token = crypto.randomBytes(32).toString("hex");

  await userService.update(user._id || user.id, {
    passwordResetToken: token,
    passwordResetExpires: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
  });

  const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await sendResetEmail({ to: user.email, resetLink: link });

  res.json({ message: "Reset email sent" });
};
