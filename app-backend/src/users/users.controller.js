/**
 * Users Controller
 * Handles user management operations
 */

const User = require('../models/User');
const { notifyOwnerOfNewAgent, notifyAgentApproval, notifyAgentRejection } = require('../services/email.service');

/**
 * Get all users (with optional filtering)
 */
async function getAllUsers(req, reply) {
  try {
    const { status, role } = req.query;
    const filter = {};

    if (status) {
      filter.approvalStatus = status;
    }
    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    return reply.send({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to fetch users'
    });
  }
}

/**
 * Get pending users (awaiting approval)
 */
async function getPendingUsers(req, reply) {
  try {
    const pendingUsers = await User.find({ approvalStatus: 'pending' })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    return reply.send({
      success: true,
      data: pendingUsers,
      count: pendingUsers.length
    });
  } catch (error) {
    console.error('Get pending users error:', error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to fetch pending users'
    });
  }
}

/**
 * Approve user
 */
async function approveUser(req, reply) {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    const user = await User.findById(id);
    if (!user) {
      return reply.status(404).send({
        success: false,
        message: 'User not found'
      });
    }

    if (user.approvalStatus === 'approved') {
      return reply.status(400).send({
        success: false,
        message: 'User is already approved'
      });
    }

    user.approvalStatus = 'approved';
    user.approvedBy = currentUser.id;
    user.approvedAt = new Date();
    user.isActive = true;
    await user.save();

    // Send approval email to agent
    try {
      await notifyAgentApproval(user.email, user.name);
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Don't fail the approval if email fails
    }

    return reply.send({
      success: true,
      message: 'User approved successfully',
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        approvalStatus: user.approvalStatus
      }
    });
  } catch (error) {
    console.error('Approve user error:', error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to approve user'
    });
  }
}

/**
 * Reject user
 */
async function rejectUser(req, reply) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const currentUser = req.user;

    const user = await User.findById(id);
    if (!user) {
      return reply.status(404).send({
        success: false,
        message: 'User not found'
      });
    }

    user.approvalStatus = 'rejected';
    user.approvedBy = currentUser.id;
    user.approvedAt = new Date();
    user.rejectionReason = reason || 'No reason provided';
    user.isActive = false;
    await user.save();

    // Send rejection email to agent
    try {
      await notifyAgentRejection(user.email, user.name, reason);
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
    }

    return reply.send({
      success: true,
      message: 'User rejected',
      data: {
        id: user._id,
        email: user.email,
        approvalStatus: user.approvalStatus
      }
    });
  } catch (error) {
    console.error('Reject user error:', error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to reject user'
    });
  }
}

/**
 * Update user role
 */
async function updateUserRole(req, reply) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['owner', 'admin', 'manager', 'agent', 'bpo'].includes(role)) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return reply.status(404).send({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent changing own role
    if (user._id.toString() === req.user.id) {
      return reply.status(403).send({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    user.role = role;
    await user.save();

    return reply.send({
      success: true,
      message: 'User role updated',
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to update user role'
    });
  }
}

/**
 * Delete user
 */
async function deleteUser(req, reply) {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return reply.status(404).send({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user.id) {
      return reply.status(403).send({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Prevent deleting owners (safety)
    if (user.role === 'owner') {
      return reply.status(403).send({
        success: false,
        message: 'Cannot delete owner accounts'
      });
    }

    await User.findByIdAndDelete(id);

    return reply.send({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to delete user'
    });
  }
}

/**
 * Get user by ID
 */
async function getUserById(req, reply) {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-passwordHash')
      .populate('approvedBy', 'name email');

    if (!user) {
      return reply.status(404).send({
        success: false,
        message: 'User not found'
      });
    }

    return reply.send({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to fetch user'
    });
  }
}

module.exports = {
  getAllUsers,
  getPendingUsers,
  approveUser,
  rejectUser,
  updateUserRole,
  deleteUser,
  getUserById
};
