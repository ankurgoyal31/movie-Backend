import jwt from "jsonwebtoken";
const SECRET = "MY_SECRET_KEY"; 
export function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: "No token" });
  }
  const token = header.split(" ")[1];  
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    return res.send({ok:false});
  }
}
