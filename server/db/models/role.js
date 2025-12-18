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
  students: permissionSchema,
  classes: permissionSchema,
  attendance: permissionSchema,
  reportCards: permissionSchema,
  grades: permissionSchema,

  applications: permissionSchema,
  admissions: permissionSchema,
  enrollment: permissionSchema,

  communications_email: permissionSchema,
  communications_sms: permissionSchema,
  communications_voice: permissionSchema,

  financial: permissionSchema,
  tuition: permissionSchema,
  donations: permissionSchema,

  users: permissionSchema,
  roles: permissionSchema,
  invites: permissionSchema,

  reports: permissionSchema,
  analytics: permissionSchema,

  settings: permissionSchema,
  integrations: permissionSchema,
}

  },
  { timestamps: true }
);

export default mongoose.model("Role", roleSchema);
