import User from "../db/models/user.js";
import UserSettings from "../db/models/userSettings.js";

export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate("roles")

  const settings = await UserSettings.findOne({ user: req.user._id });

  res.json({
    user,
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

const user = await User.findById(req.user._id);
Object.assign(user, updates);
await user.save();

  res.json({ user });
};

export const updateSettings = async (req, res) => {
  const settings = await UserSettings.findOneAndUpdate(
    { user: req.user._id },
    req.body,
    { new: true, upsert: true }
  );

  res.json({ settings });
};

export const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Use the wrapped async version
    await user.changePassword(req.body.currentPassword, req.body.newPassword);

    await user.save();

    return res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error("Change password error:", err);

    if (err.name === "IncorrectPasswordError") {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    return res.status(400).json({ message: err.message || "Failed to change password" });
  }
};


