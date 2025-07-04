const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization header missing or malformed' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // JWT_SECRET yerine ACCESS_TOKEN_SECRET kullan
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.log('Token verification error:', error.message); // Debug için
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;