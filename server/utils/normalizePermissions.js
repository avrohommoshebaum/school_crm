import { PERMISSION_KEYS, EMPTY_PERMISSION } from "../config/permissions.js";

export function normalizePermissions(input = {}) {
  const normalized = {};

  for (const key of PERMISSION_KEYS) {
    normalized[key] = {
      view: !!input?.[key]?.view,
      create: !!input?.[key]?.create,
      edit: !!input?.[key]?.edit,
      delete: !!input?.[key]?.delete,
    };
  }

  return normalized;
}
