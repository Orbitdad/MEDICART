import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = (roles = []) => async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer "))
    return res.status(401).json({ message: "Unauthorized" });

  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    if (roles.length && !roles.includes(user.role))
      return res.status(403).json({ message: "Access denied" });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
