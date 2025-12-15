const sessionTimeout = ({ idleTimeoutMs = 30 * 60 * 1000 } = {}) => {
  return (req, res, next) => {
    if (!req.session) return next();

    const now = Date.now();

    // First activity
    if (!req.session.lastActivity) {
      req.session.lastActivity = now;
      return next();
    }

    const idleTime = now - req.session.lastActivity;

    if (idleTime > idleTimeoutMs) {
      return req.session.destroy(() => {
        req.logout(() => {
          res.clearCookie("connect.sid");
          return res.status(401).json({
            message: "Session expired due to inactivity",
            reason: "IDLE_TIMEOUT",
          });
        });
      });
    }

    // Update activity timestamp
    req.session.lastActivity = now;
    next();
  };
}

export default sessionTimeout;
