import {generateToken, verifyToken} from '../../utils/jsonWebTokensHelper.js';


export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];  // e.g "Bearer <token>"
    if (!token) return res.status(401).json({ message: 'Token missing' });
    const verificationResult = verifyToken(token);
    if (!verificationResult.success) {
        return res.status(401).json({ message: verificationResult.error });
    }

    //  call next middleware or route handler
    req.user = verificationResult.data;
    next();
}

/**
 * Role-based access control middleware
 * @param {...string} allowedRoles - Roles permitted to access this route
 * @returns {Function} Express middleware
 */
export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: insufficient permissions' });
        }

        next();
    };
};

