import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const plugin = passportLocalMongoose.default ?? passportLocalMongoose;

const userSchema = new mongoose.Schema(
  {
    name: { type: String },

    email: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },

    googleId: { type: String },
    phone: { type: String },
  employeeId: { type: String },
  department: { type: String },
  hireDate: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  emergencyContact: { type: String },
  emergencyPhone: { type: String },
  bio: { type: String },

    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],

    permissionsOverride: {
      type: Map,
      of: Boolean,
      default: {},
    },

    status: {
      type: String,
      enum: ["pending", "active", "inactive"],
      default: "pending",
    },

    lastLogin: Date,
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);


userSchema.plugin(plugin, {
  usernameField: "email",
  usernameLowerCase: true,
});

export default mongoose.models.User || mongoose.model("User", userSchema);
