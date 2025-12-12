import mongoose from "mongoose";

const userSettingsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },

    // Notification Settings
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: false },
    notifyStudentAbsence: { type: Boolean, default: true },
    notifyNewApplication: { type: Boolean, default: true },
    notifyParentMessage: { type: Boolean, default: true },
    notifyReportCardDue: { type: Boolean, default: true },

    // Display Settings
    theme: { type: String, default: "light" },
    language: { type: String, default: "en" },
    dateFormat: { type: String, default: "MM/DD/YYYY" },
    timeFormat: { type: String, default: "12h" },

    // Privacy Settings
    showEmail: { type: Boolean, default: true },
    showPhone: { type: Boolean, default: false },
    profileVisibility: { type: String, default: "staff" },
  },
  { timestamps: true }
);

export default mongoose.model("UserSettings", userSettingsSchema);
