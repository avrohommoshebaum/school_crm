// middleware/auth.js
export function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Not authenticated" });
}


// Require permission on module + action
export function requirePermission(moduleKey, action) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const roles = req.user.roles || [];

    // 🔑 ADMIN OVERRIDE (MUST BE HERE)
    const isAdmin = roles.some((r) => r.name === "admin");
    if (isAdmin) {
      return next();
    }

    // 1️⃣ User-level override
    const overrideKey = `${moduleKey}.${action}`;
    if (req.user.permissionsOverride?.get?.(overrideKey) === true) {
      return next();
    }

    // 2️⃣ Role permissions
    const allowed = roles.some(
      (role) => role.permissions?.[moduleKey]?.[action] === true
    );

    if (!allowed) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
}
