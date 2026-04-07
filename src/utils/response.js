/**
 * Base utility to send a JSON response
 * @param {Object} res - Express response object
 * @param {number} status - HTTP status code
 * @param {Object} data - Response payload
 */
export const jsonSender = (res, status, data) => {
    return res.status(status).json(data);
};

/**
 * Utility to format a standardized response object (useful for services)
 */
export const formatResponse = (success, message, data = null, extra = {}) => {
    return {
        success,
        message,
        data,
        ...extra,
    };
};

/**
 * Standard utility to send a structured JSON response
 */
export const sendResponse = (res, status, success, message, data = null, extra = {}) => {
    return jsonSender(res, status, formatResponse(success, message, data, extra));
};
