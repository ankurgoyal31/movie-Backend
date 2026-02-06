// server/auth.js
import jwt from "jsonwebtoken";

const SECRET = "MY_SECRET_KEY"; // 🔒 server की secret

export function auth(req, res, next) {
  const header = req.headers.authorization;

  // token नहीं आया
  if (!header) {
    return res.status(401).json({ message: "No token" });
  }

  const token = header.split(" ")[1]; // Bearer TOKEN

  try {
    // 🔥 VERIFY
    const decoded = jwt.verify(token, SECRET);

    // decoded = { userId, email, iat, exp }
    req.user = decoded;

    next(); // route को जाने दो
  } catch (err) {
    // return  res.status("fuck...")
    return res.send({ok:false});
  }
}