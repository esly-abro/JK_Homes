/**
 * Auth Controller
 * HTTP handlers for authentication endpoints
 */

const authService = require('./auth.service');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { notifyOwnerOfNewAgent } = require('../services/email.service');

/**
 * POST /auth/register
 * Register a new agent (requires owner approval)
 */
async function register(request, reply) {
    try {
        const { email, password, name, phone } = request.body;

        // Validation
        if (!email || !password || !name) {
            return reply.code(400).send({
                success: false,
                message: 'Email, password, and name are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return reply.code(409).send({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create new user with pending status
        const newUser = new User({
            email: email.toLowerCase(),
            passwordHash,
            name,
            phone,
            role: 'agent', // New signups are agents by default
            approvalStatus: 'pending',
            isActive: false // Not active until approved
        });

        await newUser.save();

        // Find all owners to notify
        const owners = await User.find({ 
            role: 'owner', 
            isActive: true,
            approvalStatus: 'approved'
        });

        // Send email notification to all owners
        for (const owner of owners) {
            try {
                await notifyOwnerOfNewAgent(owner.email, {
                    email: newUser.email,
                    name: newUser.name,
                    phone: newUser.phone
                });
            } catch (emailError) {
                console.error(`Failed to notify owner ${owner.email}:`, emailError);
            }
        }

        console.log(`✅ New agent registered: ${email} (pending approval)`);

        return reply.code(201).send({
            success: true,
            message: 'Registration successful! Your account is pending approval from the owner.',
            data: {
                id: newUser._id,
                email: newUser.email,
                name: newUser.name,
                approvalStatus: newUser.approvalStatus
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        return reply.code(500).send({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
}

/**
 * POST /auth/login
 */
async function login(request, reply) {
    const { email, password } = request.body;

    const result = await authService.login(email, password);

    return reply.code(200).send(result);
}

/**
 * POST /auth/refresh
 */
async function refresh(request, reply) {
    const { refreshToken } = request.body;

    const result = await authService.refresh(refreshToken);

    return reply.code(200).send(result);
}

/**
 * POST /auth/logout
 */
async function logout(request, reply) {
    const { refreshToken } = request.body;

    const result = await authService.logout(refreshToken);

    return reply.code(200).send(result);
}

module.exports = {
    register,
    login,
    refresh,
    logout
};
