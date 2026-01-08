/**
 * Role-Based Access Control Middleware
 * Permission checks based on user roles
 */

const { ForbiddenError } = require('../utils/errors');

/**
 * Require specific role(s)
 * @param {string|string[]} allowedRoles - Single role or array of roles
 */
function requireRole(allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return async function (request, reply) {
        if (!request.user) {
            throw new ForbiddenError('User context not found');
        }

        if (!roles.includes(request.user.role)) {
            throw new ForbiddenError(`Access denied. Required roles: ${roles.join(', ')}`);
        }
    };
}

/**
 * Check if user can access lead
 * Rules:
 * - Owner/Admin/Manager: all leads
 * - Agent/BPO: only assigned leads
 */
function canAccessLead(user, lead) {
    if (user.role === 'owner' || user.role === 'admin' || user.role === 'manager') {
        return true;
    }

    if (user.role === 'agent' || user.role === 'bpo') {
        // Check if lead is assigned to this user
        // For now, allow all (TODO: implement ownership check from Zoho)
        return true;
    }

    return false;
}

/**
 * Check if user can access activity
 * Rules:
 * - Owner/Admin/Manager: all activities
 * - Agent/BPO: only their own activities
 */
function canAccessActivity(user, activity) {
    if (user.role === 'owner' || user.role === 'admin' || user.role === 'manager') {
        return true;
    }

    if (user.role === 'agent' || user.role === 'bpo') {
        // Check if activity belongs to this user
        return activity.userId && activity.userId.toString() === user._id.toString();
    }

    return false;
}

/**
 * Check if user can access call log
 * Rules:
 * - Owner/Admin/Manager: all call logs
 * - Agent/BPO: only their own call logs
 */
function canAccessCallLog(user, callLog) {
    if (user.role === 'owner' || user.role === 'admin' || user.role === 'manager') {
        return true;
    }

    if (user.role === 'agent' || user.role === 'bpo') {
        // Check if call log belongs to this user
        return callLog.agentId && callLog.agentId.toString() === user._id.toString();
    }

    return false;
}

/**
 * Check if user can access site visit
 * Rules:
 * - Owner/Admin/Manager: all site visits
 * - Agent/BPO: only their own site visits
 */
function canAccessSiteVisit(user, siteVisit) {
    if (user.role === 'owner' || user.role === 'admin' || user.role === 'manager') {
        return true;
    }

    if (user.role === 'agent' || user.role === 'bpo') {
        // Check if site visit belongs to this user
        return siteVisit.agentId && siteVisit.agentId.toString() === user._id.toString();
    }

    return false;
}

/**
 * Filter leads based on user role
 * Rules:
 * - Owner/Admin/Manager: See all leads
 * - Agent/BPO: Only see leads assigned to them
 */
function filterLeadsByPermission(user, leads) {
    if (user.role === 'owner' || user.role === 'admin' || user.role === 'manager') {
        return leads;
    }

    if (user.role === 'agent' || user.role === 'bpo') {
        // Filter leads by assignedTo field matching user's ID or email
        return leads.filter(lead => {
            // Check if lead has assignedTo field (from our assignment system)
            if (lead.assignedTo) {
                // assignedTo can be ObjectId or email string
                const assignedToStr = lead.assignedTo.toString();
                return assignedToStr === user._id.toString() || assignedToStr === user.email;
            }
            
            // Fallback: Check if lead owner matches user email (Zoho Owner field)
            if (lead.Owner && lead.Owner.email) {
                return lead.Owner.email.toLowerCase() === user.email.toLowerCase();
            }
            
            // No assignment info - don't show to agents
            return false;
        });
    }

    return [];
}

module.exports = {
    requireRole,
    canAccessLead,
    canAccessActivity,
    canAccessCallLog,
    canAccessSiteVisit,
    filterLeadsByPermission
};
