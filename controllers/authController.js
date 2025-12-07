const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const createToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: `Email ${email} is already used, Please try with another email.`, });

        // ⚠️ Remove manual hash (your schema already hashes it)
        const user = await User.create({ name, email, password });

        const token = createToken(user);

        // ✅ Use consistent cookie name
        const cookieName = process.env.COOKIE_NAME || 'token';

        res.cookie(cookieName, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });

        res.status(201).json({
            message: "Signup successful!",
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = createToken(user);

        // ✅ Use consistent cookie name
        const cookieName = process.env.COOKIE_NAME || 'token';

        res.cookie(cookieName, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });

        res.status(200).json({
            message: `Login successful! Welcome back, ${user.name}👋`,
            user: { id: user._id, name: user.name, email: user.email },
            token,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.logout = (req, res) => {
    res.clearCookie(process.env.COOKIE_NAME);
    res.json({ message: 'Logged out' })
}

exports.me = (req, res) => {
    res.json({ user: req.user })
} 