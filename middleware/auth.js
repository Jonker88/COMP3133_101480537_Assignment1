const jwt = require('jsonwebtoken');

const authenticate = (req) => {
    const authHeader = req.headers.authorization || '';

    if (authHeader) {
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;

        try {
            const user = jwt.verify(token, process.env.JWT_SECRET);
            return user;
        } catch (err) {
            return null;
        }
    }

    return null;
};

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, username: user.username, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

module.exports = { authenticate, generateToken };
