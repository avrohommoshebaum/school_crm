import { PERMISSION_KEYS } from "../config/permissions.js";

export default function buildFullPermissions() {
  const perms = {};

  for (const key of PERMISSION_KEYS) {
    perms[key] = {
      view: true,
      create: true,
      edit: true,
      delete: true,
    };
  }

  return perms;
}
