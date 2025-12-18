interface Role {
  name?: string;
  permissions?: Record<string, Record<string, boolean>>;
}

export function usePermissions(user: { roles?: Role[] }) {
  const roles = user?.roles || [];

  // 🔑 ADMIN OVERRIDE
  const isAdmin = roles.some((r) => r.name === "admin");

  function can(
    moduleKey: string,
    action: "view" | "create" | "edit" | "delete"
  ) {
    // Admin always allowed
    if (isAdmin) return true;

    // Normal permission check
    return roles.some(
      (r) => r.permissions?.[moduleKey]?.[action] === true
    );
  }

  return { can, isAdmin };
}
