export function hasPermission(
  user: any,
  module: string,
  action: "view" | "create" | "edit" | "delete"
): boolean {
  if (!user) return false;

  const overrideKey = `${module}.${action}`;
  if (user.permissionsOverride?.[overrideKey] === true) {
    return true;
  }

  return (
    user.roles?.some((role: any) => {
      return role.permissions?.[module]?.[action] === true;
    }) ?? false
  );
}
