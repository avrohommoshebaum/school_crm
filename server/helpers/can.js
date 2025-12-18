export function can(user, moduleKey, action) {
  if (!user) return false;

  const roles = user.roles || [];

  // 🔑 ADMIN OVERRIDE
  const isAdmin = roles.some((r) => r.name === "admin");
  if (isAdmin) return true;

  // 1️⃣ User-level override (fine-grained future feature)
  const overrideKey = `${moduleKey}.${action}`;
  if (user.permissionsOverride?.get?.(overrideKey) === true) {
    return true;
  }

  // 2️⃣ Role permissions
  return roles.some(
    (role) => role.permissions?.[moduleKey]?.[action] === true
  );
}
