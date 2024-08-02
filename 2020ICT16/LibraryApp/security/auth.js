const jwt = require("jsonwebtoken");
const secretKey = "phyvauac.lk@2024";

function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(403).send("Token Not Available");
    }
    jwt.verify(token.split(" ")[1], secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message_error: "Invalid Token" });
      }
      console.log(token);
      console.log(decoded);
      next();
    });
  } catch (error) {
    return res.status(401).json({ message_error: error.message });
  }
}

module.exports = { verifyToken };
