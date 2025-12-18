// middleware/auth.js
export function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Not authenticated" });
}


// Require permission on module + action
export function requirePermission(moduleKey, action) {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });

    // 1️⃣ User-level overrides (future-proof)
    const overrideKey = `${moduleKey}.${action}`;
    if (req.user.permissionsOverride?.get?.(overrideKey) === true) {
      return next();
    }

    // 2️⃣ Role permissions
    const roles = req.user.roles || [];
    const allowed = roles.some((role) =>
      role.permissions?.[moduleKey]?.[action] === true
    );

    if (!allowed) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
}
