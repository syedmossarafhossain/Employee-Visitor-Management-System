const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar || ""
});

const roleForEmail = (email) =>
  process.env.ADMIN_EMAIL &&
  email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
    ? "admin"
    : "employee";

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: roleForEmail(normalizedEmail)
    });

    res.status(201).json({
      message: "Registration successful",
      token: generateToken(user),
      user: publicUser(user)
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || "").trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Keep the configured admin email authoritative if the role was created earlier.
    if (roleForEmail(normalizedEmail) === "admin" && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    res.json({
      message: "Login successful",
      token: generateToken(user),
      user: publicUser(user)
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: "Google authentication is not configured on the server" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const email = payload.email?.toLowerCase();

    if (!payload.email || !payload.email_verified) {
      return res.status(401).json({ message: "Google email could not be verified" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: payload.name || email.split("@")[0],
        email,
        googleId: payload.sub,
        avatar: payload.picture || "",
        role: roleForEmail(email)
      });
    } else {
      let changed = false;

      if (!user.googleId) {
        user.googleId = payload.sub;
        changed = true;
      }
      if (payload.picture && user.avatar !== payload.picture) {
        user.avatar = payload.picture;
        changed = true;
      }
      if (roleForEmail(email) === "admin" && user.role !== "admin") {
        user.role = "admin";
        changed = true;
      }

      if (changed) await user.save();
    }

    res.json({
      message: "Google login successful",
      token: generateToken(user),
      user: publicUser(user)
    });
  } catch (error) {
    console.error("GOOGLE LOGIN ERROR:", error);
    res.status(401).json({ message: "Google authentication failed" });
  }
};

const me = async (req, res) => {
  res.json({ user: publicUser(req.user) });
};

module.exports = { register, login, googleLogin, me };
