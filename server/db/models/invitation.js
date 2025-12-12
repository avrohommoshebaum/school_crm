// models/Invitation.js
import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true },
    token: { type: String, required: true, unique: true },
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    accepted: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Invitation", invitationSchema);
