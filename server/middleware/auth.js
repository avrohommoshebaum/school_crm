// middleware/auth.js
export function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Not authenticated" });
}

// Require a specific role (e.g. "admin")
export function requireRole(roleName) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });

    const hasRole =
      req.user.roles?.some((r) => r.name === roleName) ?? false;

    if (!hasRole) return res.status(403).json({ message: "Forbidden" });

    next();
  };
}

// Require permission on module + action
export function requirePermission(moduleKey, action) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Not authenticated" });

    // Check overrides first: e.g. "students.view"
    const overrideKey = `${moduleKey}.${action}`;
    if (user.permissionsOverride?.get(overrideKey) === true) {
      return next();
    }

    const roles = user.roles || [];
    let allowed = false;

    roles.forEach((role) => {
      const perms = role.permissions?.[moduleKey];
      if (perms && perms[action]) allowed = true;
    });

    if (!allowed) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
}
