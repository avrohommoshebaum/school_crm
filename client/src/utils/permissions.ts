export function hasPermission(
  user: any,
  module: string,
  action: "view" | "create" | "edit" | "delete"
): boolean {
  if (!user) return false;

  // 🔑 ADMIN OVERRIDE (must be first)
  const isAdmin = user.roles?.some((r: any) => r.name === "admin");
  if (isAdmin) return true;

  // 1️⃣ User-level override
  const overrideKey = `${module}.${action}`;
  if (user.permissionsOverride?.[overrideKey] === true) {
    return true;
  }

  // 2️⃣ Role permissions
  return (
    user.roles?.some((role: any) => {
      return role.permissions?.[module]?.[action] === true;
    }) ?? false
  );
}
