const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const secretKey = "phyvauac.lk@2024";

// Register route
router.post("/register", async (req, res) => {
  try {
    let { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .send({ error_message: "Please fill the Required Field" });
    }
    const user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ error_message: "User already exists" });
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const result = await User.create({ username, password: hashedPassword });

    return res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({ error_message: error.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    let { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .send({ error_message: "Please fill the Required Field" });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error_message: "Invalid Credentials" });
    }
    const passMatch = await bcrypt.compare(password, user.password);
    if (!passMatch) {
      return res.status(400).json({ error_message: "Invalid Credentials" });
    }
    const token = jwt.sign({ username: user.username }, secretKey);
    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json({ error_message: error.message });
  }
});

module.exports = router;
