import jwt from "jsonwebtoken";

/**
 * Generates a signed JWT.
 * @param {Object} payload - data to embed (e.g. { id, role, name, username })
 * @returns {string} signed token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export default generateToken;