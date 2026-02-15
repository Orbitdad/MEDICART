import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

/* =========================
   REGISTER DOCTOR
========================= */
export const registerDoctor = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const doctor = await User.create({
      name,
      email,
      password,
      role: "doctor",
    });

    const token = generateToken(doctor._id, "doctor");

    return res.status(201).json({
      success: true,
      token,
      role: "doctor",
      user: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
      },
    });
  } catch (error) {
    console.error("Doctor register error:", error);

    return res.status(500).json({
      success: false,
      message: "Doctor registration failed",
    });
  }
};

/* =========================
   LOGIN DOCTOR
========================= */
export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    const doctor = await User.findOne({ email });

    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (doctor.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Not a doctor account",
      });
    }

    let isMatch = false;

    try {
      isMatch = await doctor.matchPassword(password);
    } catch (err) {
      console.error("Password compare failed:", err);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(doctor._id, "doctor");

    return res.status(200).json({
      success: true,
      token,
      role: "doctor",
      user: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
      },
    });
  } catch (error) {
    console.error("Doctor login error:", error);

    return res.status(500).json({
      success: false,
      message: "Doctor login failed",
    });
  }
};

/* =========================
   UPDATE PROFILE
   ========================= */
export const updateDoctorProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      user.hospital = req.body.hospital || user.hospital;

      const updatedUser = await user.save();

      return res.json({
        success: true,
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          address: updatedUser.address,
          hospital: updatedUser.hospital,
        },
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Update failed" });
  }
};
