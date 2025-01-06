const jwt = require("jsonwebtoken");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header is missing" });
  }

  const token = authHeader.split(" ")[1]; // Assuming 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ message: "Token is missing or incorrect" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token with secret key
    console.log("token",  process.env.JWT_SECRET);
    req.user = decoded; // Set user data in request
    next(); // Continue to the next middleware/route
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authenticate;
