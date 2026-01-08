/**
 * Auth Service
 * Business logic for authentication
 */

const usersModel = require('../users/users.model');
const { generateTokenPair, verifyToken } = require('./jwt');
const { UnauthorizedError, ValidationError } = require('../utils/errors');

/**
 * Login user with email and password
 */
async function login(email, password) {
    // Validate input
    if (!email || !password) {
        throw new ValidationError('Email and password are required');
    }

    // Find user
    const user = await usersModel.findByEmail(email);
    if (!user) {
        throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user is approved
    if (user.approvalStatus !== 'approved') {
        if (user.approvalStatus === 'pending') {
            throw new UnauthorizedError('Your account is pending approval from the owner');
        } else if (user.approvalStatus === 'rejected') {
            throw new UnauthorizedError('Your account registration was rejected');
        }
    }

    // Check if user is active
    if (!user.isActive) {
        throw new UnauthorizedError('Your account has been deactivated');
    }

    // Verify password
    const isValidPassword = await usersModel.verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
        throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const tokens = generateTokenPair(user);

    // Store refresh token
    usersModel.storeRefreshToken(tokens.refreshToken);

    return {
        ...tokens,
        user: usersModel.getSafeUser(user)
    };
}

/**
 * Refresh access token using refresh token
 */
async function refresh(refreshToken) {
    if (!refreshToken) {
        throw new ValidationError('Refresh token is required');
    }

    // Verify token exists in store
    if (!usersModel.hasRefreshToken(refreshToken)) {
        throw new UnauthorizedError('Invalid refresh token');
    }

    // Verify and decode token
    let decoded;
    try {
        decoded = verifyToken(refreshToken);
    } catch (error) {
        // Remove invalid token from store
        usersModel.removeRefreshToken(refreshToken);
        throw error;
    }

    // Get user
    const user = await usersModel.findById(decoded.userId);
    if (!user) {
        usersModel.removeRefreshToken(refreshToken);
        throw new UnauthorizedError('User not found');
    }

    // Generate new access token (keep same refresh token)
    const { accessToken } = generateTokenPair(user);

    return {
        accessToken
    };
}

/**
 * Logout user (invalidate refresh token)
 */
async function logout(refreshToken) {
    if (refreshToken) {
        usersModel.removeRefreshToken(refreshToken);
    }

    return { message: 'Logged out successfully' };
}

module.exports = {
    login,
    refresh,
    logout
};
