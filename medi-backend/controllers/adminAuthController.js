import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email, role: "admin" });
    if (!admin)
      return res.status(403).json({ message: "Not admin" });

    if (!(await admin.matchPassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      token: generateToken(admin._id, "admin"),
      role: "admin",
      user: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Admin login failed" });
  }
};
