const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 🔥 DEBUG (leave this)
  console.log("AUTH HEADER:", authHeader);

  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  // 🔥 HANDLE BOTH CASES (Bearer or raw token)
  let token;

  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    token = authHeader;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 IMPORTANT FIX
    req.user = { id: decoded.id || decoded._id };

    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message);
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;