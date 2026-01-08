const User = require('../models/User');
const leadsService = require('../leads/leads.service');
const propertiesService = require('../properties/properties.service');

class AssignmentService {
  async assignLeads(leadIds, agentId, assignedBy, autoAssign = false) {
    try {
      const results = [];
      
      for (const leadId of leadIds) {
        try {
          let targetAgentId = agentId;
          
          // If auto-assign is enabled and no specific agent provided
          if (autoAssign && !agentId) {
            const lead = await leadsService.getLeadById(leadId);
            targetAgentId = await this.findBestAgent(lead);
          }
          
          // Update lead with assigned agent
          const updatedLead = await leadsService.updateLead(leadId, {
            owner: targetAgentId,
            assignedAt: new Date(),
            assignedBy: assignedBy
          });
          
          results.push({
            leadId,
            success: true,
            assignedTo: targetAgentId
          });
        } catch (error) {
          results.push({
            leadId,
            success: false,
            error: error.message
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Assign leads error:', error);
      throw error;
    }
  }

  async findBestAgent(lead) {
    try {
      // Get all active agents (role: agent or bpo)
      const agents = await User.find({
        role: { $in: ['agent', 'bpo'] }
      });

      if (agents.length === 0) {
        throw new Error('No agents available for assignment');
      }

      // Get current workload for each agent
      const agentWorkload = await Promise.all(
        agents.map(async (agent) => {
          const activeLeads = await leadsService.getLeadsByOwner(agent._id.toString());
          const activeCount = activeLeads.filter(
            l => !['Deal Closed', 'Lost', 'Disqualified'].includes(l.status)
          ).length;
          
          return {
            agentId: agent._id.toString(),
            agent: agent,
            activeLeads: activeCount,
            totalLeads: activeLeads.length
          };
        })
      );

      // Sort by active leads (ascending) - agents with fewer leads get priority
      agentWorkload.sort((a, b) => a.activeLeads - b.activeLeads);

      // Priority 1: High-value leads (budget > 5000000) go to least busy agent
      if (lead.value && lead.value > 5000000) {
        return agentWorkload[0].agentId;
      }

      // Priority 2: Property type matching (if lead has property)
      if (lead.propertyId) {
        const property = await propertiesService.getPropertyById(lead.propertyId);
        
        // Find agent with experience in this property type (based on past leads)
        for (const agentData of agentWorkload) {
          const agentLeads = await leadsService.getLeadsByOwner(agentData.agentId);
          const propertyTypeMatch = agentLeads.some(
            l => l.propertyId && l.propertyType === property.propertyType
          );
          
          if (propertyTypeMatch && agentData.activeLeads < 10) {
            return agentData.agentId;
          }
        }
      }

      // Priority 3: Location matching
      if (lead.location) {
        for (const agentData of agentWorkload) {
          const agentLeads = await leadsService.getLeadsByOwner(agentData.agentId);
          const locationMatch = agentLeads.some(
            l => l.location && l.location.toLowerCase().includes(lead.location.toLowerCase())
          );
          
          if (locationMatch && agentData.activeLeads < 10) {
            return agentData.agentId;
          }
        }
      }

      // Default: Round-robin (agent with least active leads)
      return agentWorkload[0].agentId;
    } catch (error) {
      console.error('Find best agent error:', error);
      // Fallback: return first available agent
      const agents = await User.find({ role: { $in: ['agent', 'bpo'] } }).limit(1);
      return agents[0]?._id.toString();
    }
  }

  async getAgentWorkload() {
    try {
      const agents = await User.find({
        role: { $in: ['agent', 'bpo', 'manager'] }
      });

      const workload = await Promise.all(
        agents.map(async (agent) => {
          const leads = await leadsService.getLeadsByOwner(agent._id.toString());
          
          const activeLeads = leads.filter(
            l => !['Deal Closed', 'Lost', 'Disqualified'].includes(l.status)
          );
          
          const closedDeals = leads.filter(l => l.status === 'Deal Closed');
          
          return {
            agentId: agent._id,
            name: agent.name || agent.email.split('@')[0],
            email: agent.email,
            role: agent.role,
            totalLeads: leads.length,
            activeLeads: activeLeads.length,
            closedDeals: closedDeals.length,
            conversionRate: leads.length > 0 
              ? ((closedDeals.length / leads.length) * 100).toFixed(1)
              : '0.0'
          };
        })
      );

      return workload.sort((a, b) => b.activeLeads - a.activeLeads);
    } catch (error) {
      console.error('Get agent workload error:', error);
      throw error;
    }
  }

  async reassignLeads(fromAgentId, toAgentId, leadIds = null) {
    try {
      let leadsToReassign;
      
      if (leadIds && leadIds.length > 0) {
        // Reassign specific leads
        leadsToReassign = leadIds;
      } else {
        // Reassign all active leads from agent
        const allLeads = await leadsService.getLeadsByOwner(fromAgentId);
        leadsToReassign = allLeads
          .filter(l => !['Deal Closed', 'Lost', 'Disqualified'].includes(l.status))
          .map(l => l.id);
      }

      const results = await this.assignLeads(leadsToReassign, toAgentId, null, false);
      
      return {
        reassigned: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };
    } catch (error) {
      console.error('Reassign leads error:', error);
      throw error;
    }
  }
}

module.exports = new AssignmentService();
