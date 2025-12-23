import { userService } from "../db/services/userService.js";
import { userSettingsService } from "../db/services/userSettingsService.js";

export const getMe = async (req, res) => {
  const userId = req.user._id || req.user.id;
  const user = await userService.findById(userId);
  const userWithRoles = await userService.populateRoles(user);

  const settings = await userSettingsService.findByUserId(userId);

  res.json({
    user: userWithRoles,
    settings,
  });
};



export const updateProfile = async (req, res) => {
  const allowed = [
    "name",
    "phone",
    "employeeId",
    "department",
    "hireDate",
    "address",
    "city",
    "state",
    "zipCode",
    "emergencyContact",
    "emergencyPhone",
    "bio",
  ];

  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const userId = req.user._id || req.user.id;
  const user = await userService.update(userId, updates);

  res.json({ user });
};

export const updateSettings = async (req, res) => {
  const userId = req.user._id || req.user.id;
  const settings = await userSettingsService.upsert(userId, req.body);

  res.json({ settings });
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await userService.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isValid = await userService.verifyPassword(user, req.body.currentPassword);
    if (!isValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Set new password
    await userService.setPassword(userId, req.body.newPassword);

    return res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error("Change password error:", err);
    return res.status(400).json({ message: err.message || "Failed to change password" });
  }
};


