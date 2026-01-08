/**
 * SiteVisit Schema
 * Stores confirmed site visits for leads (leads stored in Zoho CRM)
 */

const mongoose = require('mongoose');

const siteVisitSchema = new mongoose.Schema({
    // Lead reference (Zoho CRM ID)
    leadId: {
        type: String,
        required: true,
        index: true
    },
    leadName: {
        type: String,
        required: true
    },
    leadPhone: {
        type: String
    },
    
    // Visit scheduling
    scheduledAt: {
        type: Date,
        required: true
    },
    completedAt: {
        type: Date
    },
    
    // Agent who scheduled/conducted the visit
    agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    agentName: {
        type: String
    },
    
    // Visit status
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
        default: 'scheduled'
    },
    
    // Visit notes
    notes: {
        type: String
    },
    
    // Zoho CRM sync fields
    zohoActivityId: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    syncStatus: {
        type: String,
        enum: ['pending', 'synced', 'failed'],
        default: 'pending'
    },
    syncedAt: {
        type: Date
    },
    syncError: {
        type: String
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
siteVisitSchema.index({ leadId: 1, scheduledAt: -1 });
siteVisitSchema.index({ agentId: 1, scheduledAt: -1 });
siteVisitSchema.index({ status: 1 });
siteVisitSchema.index({ syncStatus: 1, createdAt: -1 });

/**
 * Get site visits by agent
 */
siteVisitSchema.statics.getByAgentId = async function(agentId, limit = 50) {
    return this.find({ agentId })
        .sort({ scheduledAt: -1 })
        .limit(limit)
        .populate('agentId', 'name email');
};

/**
 * Get site visits by lead
 */
siteVisitSchema.statics.getByLeadId = async function(leadId, limit = 50) {
    return this.find({ leadId })
        .sort({ scheduledAt: -1 })
        .limit(limit);
};

const SiteVisit = mongoose.model('SiteVisit', siteVisitSchema);

module.exports = SiteVisit;
