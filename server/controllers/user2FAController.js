/**
 * Admin 2FA Management Controller
 * Allows admins to manage user 2FA settings
 */

import { userService } from "../db/services/userService.js";

/**
 * Admin: Update user's 2FA phone number
 */
export const updateUser2FAPhone = async (req, res) => {
  try {
    const userId = req.params.id;
    const { phoneNumber, method } = req.body;

    const user = await userService.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.mfaEnabled) {
      return res.status(400).json({ message: "User does not have 2FA enabled" });
    }

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const updates = {
      mfaPhone: phoneNumber,
    };

    if (method && ['SMS', 'phone_call'].includes(method)) {
      updates.mfaMethod = method;
    }

    await userService.update(userId, updates);

    const updatedUser = await userService.findById(userId);
    const userWithRoles = await userService.populateRoles(updatedUser);

    res.json({
      message: "2FA phone number updated successfully",
      user: userWithRoles,
    });
  } catch (error) {
    console.error("Error updating user 2FA phone:", error);
    res.status(500).json({ message: "Failed to update 2FA phone number" });
  }
};

