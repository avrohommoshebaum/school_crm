// models/Role.js
import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema(
  {
    view: { type: Boolean, default: false },
    create: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  { _id: false }
);

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true }, // e.g. "admin"
    displayName: { type: String, required: true },        // e.g. "Administrator"
    description: { type: String, default: "" },
    isSystem: { type: Boolean, default: false },
    color: { type: String, default: "#0097a7" },

    permissions: {
      students: { type: permissionSchema, default: () => ({}) },
      classes: { type: permissionSchema, default: () => ({}) },
      reportCards: { type: permissionSchema, default: () => ({}) },
      communications: { type: permissionSchema, default: () => ({}) },
      businessOfficeCenter: { type: permissionSchema, default: () => ({}) },
      principalCenter: { type: permissionSchema, default: () => ({}) },
      admissions: { type: permissionSchema, default: () => ({}) },
      enrollment: { type: permissionSchema, default: () => ({}) },
      applications: { type: permissionSchema, default: () => ({}) },
      financial: { type: permissionSchema, default: () => ({}) },
      users: { type: permissionSchema, default: () => ({}) },
      settings: { type: permissionSchema, default: () => ({}) },
      reports: { type: permissionSchema, default: () => ({}) },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Role", roleSchema);
