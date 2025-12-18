// src/config/permissions.ts
import SchoolIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";
import SecurityIcon from "@mui/icons-material/Security";
import EmailIcon from "@mui/icons-material/Email";
import SmsIcon from "@mui/icons-material/Sms";

export const PERMISSIONS = [
  { key: "students", label: "Students", icon: SchoolIcon },
  { key: "classes", label: "Classes" },
  { key: "attendance", label: "Attendance" },
  { key: "reportCards", label: "Report Cards" },
  { key: "grades", label: "Grades" },

  { key: "applications", label: "Applications" },
  { key: "admissions", label: "Admissions" },
  { key: "enrollment", label: "Enrollment" },

  { key: "communications_email", label: "Send Email", icon: EmailIcon },
  { key: "communications_sms", label: "Send SMS", icon: SmsIcon },
  { key: "communications_voice", label: "Robocalls" },

  { key: "users", label: "Users", icon: PeopleIcon },
  { key: "roles", label: "Roles", icon: SecurityIcon },

  { key: "reports", label: "Reports" },
  { key: "analytics", label: "Analytics" },

  { key: "settings", label: "Settings" },
  { key: "integrations", label: "Integrations" },
];
