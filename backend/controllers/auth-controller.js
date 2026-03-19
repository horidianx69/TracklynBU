
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Verification from "../models/verification.js";
import { sendEmail } from "../libs/send-email.js";

// ─── helpers ────────────────────────────────────────────────────────────────

const createVerificationToken = (userId, purpose, expiresIn) =>
  jwt.sign({ userId, purpose }, process.env.JWT_SECRET, { expiresIn });

const sendVerificationEmail = async (email, token) => {
  const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const body = `<p>Click <a href="${link}">here</a> to verify your email</p>`;
  return sendEmail(email, "Verify your email", body);
};

// ─── register ───────────────────────────────────────────────────────────────

const registerUser = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    // ✅ Removed Arcjet — no more false positives blocking real users

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email address already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({ email, password: hashPassword, name });

    const token = createVerificationToken(newUser._id, "email-verification", "1h");

    await Verification.create({
      userId: newUser._id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    const isEmailSent = await sendVerificationEmail(email, token);
    if (!isEmailSent) {
      return res.status(500).json({ message: "Failed to send verification email" });
    }

    return res.status(201).json({
      message:
        "Verification email sent to your email. Please check and verify your account.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── login ───────────────────────────────────────────────────────────────────

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ✅ FIX: was missing `return` — execution used to fall through into login
    //    even when we just sent a new verification email
    if (!user.isEmailVerified) {
      const existing = await Verification.findOne({ userId: user._id });

      if (existing && existing.expiresAt > new Date()) {
        // Token still valid — tell the user to check their inbox
        return res.status(400).json({
          message:
            "Email not verified. Please check your email for the verification link.",
        });
      }

      // Token expired (or missing) — delete old one and send a fresh link
      if (existing) {
        await Verification.findByIdAndDelete(existing._id);
      }

      const token = createVerificationToken(user._id, "email-verification", "1h");

      await Verification.create({
        userId: user._id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });

      const isEmailSent = await sendVerificationEmail(email, token);
      if (!isEmailSent) {
        return res.status(500).json({ message: "Failed to send verification email" });
      }

      // ✅ `return` here — stop execution, do NOT fall through to the login logic
      return res.status(400).json({
        message:
          "Verification email sent to your email. Please check and verify your account.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id, purpose: "login" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    user.lastLogin = new Date();
    await user.save();

    const userData = user.toObject();
    delete userData.password;

    return res.status(200).json({ message: "Login successful", token, user: userData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── verify email ─────────────────────────────────────────────────────────

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // covers both expired and malformed tokens with a clear message
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const { userId, purpose } = payload;

    if (purpose !== "email-verification") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const verification = await Verification.findOne({ userId, token });
    if (!verification) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (verification.expiresAt < new Date()) {
      return res.status(401).json({ message: "Token expired" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    user.isEmailVerified = true;
    await user.save();

    await Verification.findByIdAndDelete(verification._id);

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── forgot password ──────────────────────────────────────────────────────

const resetPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({ message: "Please verify your email first" });
    }

    const existing = await Verification.findOne({ userId: user._id });

    if (existing && existing.expiresAt > new Date()) {
      return res.status(400).json({ message: "Reset password request already sent" });
    }

    if (existing) {
      await Verification.findByIdAndDelete(existing._id);
    }

    const token = createVerificationToken(user._id, "reset-password", "15m");

    await Verification.create({
      userId: user._id,
      token,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const body = `<p>Click <a href="${link}">here</a> to reset your password</p>`;
    const isEmailSent = await sendEmail(email, "Reset your password", body);

    if (!isEmailSent) {
      return res.status(500).json({ message: "Failed to send reset password email" });
    }

    return res.status(200).json({ message: "Reset password email sent" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── reset password ───────────────────────────────────────────────────────

const verifyResetPasswordTokenAndResetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const { userId, purpose } = payload;

    if (purpose !== "reset-password") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const verification = await Verification.findOne({ userId, token });
    if (!verification) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (verification.expiresAt < new Date()) {
      return res.status(401).json({ message: "Token expired" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    await Verification.findByIdAndDelete(verification._id);

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export {
  registerUser,
  loginUser,
  verifyEmail,
  resetPasswordRequest,
  verifyResetPasswordTokenAndResetPassword,
};