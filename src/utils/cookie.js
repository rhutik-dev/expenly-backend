/**
 * Utility to set a cookie on the response
 * @param {Object} res - Express response object
 * @param {string} key - Cookie name
 * @param {string} value - Cookie value
 * @param {Object} options - Cookie options (maxAge, sameSite, etc)
 */
export const sendCookie = (res, key, value, options = {}) => {
    const defaultOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day default
    };

    res.cookie(key, value, { ...defaultOptions, ...options });
};
