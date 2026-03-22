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

/* =========================
   FORGOT PASSWORD (VERIFY)
   ========================= */
export const forgotPasswordAdmin = async (req, res) => {
  try {
    const { email, phone } = req.body;

    const admin = await User.findOne({ email, role: "admin" });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (admin.phone !== phone) {
      return res.status(400).json({ message: "Verification failed. Phone number does not match." });
    }

    res.json({ success: true, message: "Identity verified" });
  } catch (error) {
    console.error("Admin forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   RESET PASSWORD
   ========================= */
export const resetPasswordAdmin = async (req, res) => {
  try {
    const { email, phone, newPassword } = req.body;

    const admin = await User.findOne({ email, role: "admin" });
    if (!admin || admin.phone !== phone) {
      return res.status(401).json({ message: "Unauthorized reset attempt" });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Admin reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
