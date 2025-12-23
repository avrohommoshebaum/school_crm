export function can(user, moduleKey, action) {
  if (!user) return false;

  const roles = user.roles || [];

  // 🔑 ADMIN OVERRIDE
  const isAdmin = roles.some((r) => r.name === "admin");
  if (isAdmin) return true;

  // 1️⃣ User-level override (handle both Map and object)
  const overrideKey = `${moduleKey}.${action}`;
  const overrideValue = user.permissionsOverride?.get 
    ? user.permissionsOverride.get(overrideKey)  // Map
    : user.permissionsOverride?.[overrideKey];   // Object
  if (overrideValue === true) {
    return true;
  }

  // 2️⃣ Role permissions
  return roles.some(
    (role) => role.permissions?.[moduleKey]?.[action] === true
  );
}
