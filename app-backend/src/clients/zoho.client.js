/**
 * Zoho CRM Client
 * Handles OAuth token management and API calls to Zoho CRM
 */

const axios = require('axios');
const config = require('../config/env');
const { ExternalServiceError } = require('../utils/errors');

// In-memory token cache
let tokenCache = {
    accessToken: null,
    expiresAt: null
};

/**
 * Get valid access token (with auto-refresh)
 */
async function getAccessToken() {
    // Check if cached token is still valid
    if (tokenCache.accessToken && tokenCache.expiresAt > Date.now() + 60000) {
        return tokenCache.accessToken;
    }

    // Refresh token
    return await refreshAccessToken();
}

/**
 * Refresh access token using refresh_token
 */
async function refreshAccessToken() {
    try {
        const response = await axios.post(
            `${config.zoho.accountsUrl}/oauth/v2/token`,
            null,
            {
                params: {
                    refresh_token: config.zoho.refreshToken,
                    client_id: config.zoho.clientId,
                    client_secret: config.zoho.clientSecret,
                    grant_type: 'refresh_token'
                }
            }
        );

        const { access_token, expires_in } = response.data;

        // Cache token
        tokenCache = {
            accessToken: access_token,
            expiresAt: Date.now() + (expires_in * 1000)
        };

        return access_token;
    } catch (error) {
        throw new ExternalServiceError('Zoho OAuth', error);
    }
}

/**
 * Make authenticated request to Zoho CRM
 */
async function makeRequest(method, endpoint, data = null, params = null) {
    const token = await getAccessToken();

    try {
        const response = await axios({
            method,
            url: `${config.zoho.apiDomain}/crm/v2${endpoint}`,
            headers: {
                'Authorization': `Zoho-oauthtoken ${token}`,
                'Content-Type': 'application/json'
            },
            data,
            params
        });

        return response.data;
    } catch (error) {
        // Handle 401 - token might be invalid
        if (error.response?.status === 401) {
            // Clear cache and retry once
            tokenCache = { accessToken: null, expiresAt: null };
            const newToken = await getAccessToken();

            // Retry request
            const retryResponse = await axios({
                method,
                url: `${config.zoho.apiDomain}/crm/v2${endpoint}`,
                headers: {
                    'Authorization': `Zoho-oauthtoken ${newToken}`,
                    'Content-Type': 'application/json'
                },
                data,
                params
            });

            return retryResponse.data;
        }

        throw new ExternalServiceError('Zoho CRM API', error);
    }
}

/**
 * Search leads by criteria
 */
async function searchLeads(criteria, page = 1, perPage = 200) {
    const params = {
        page,
        per_page: perPage
    };

    if (criteria) {
        params.criteria = criteria;
    }

    return await makeRequest('GET', '/Leads/search', null, params);
}

/**
 * Get all leads (with pagination)
 */
async function getLeads(page = 1, perPage = 200) {
    const params = {
        page,
        per_page: perPage
    };

    return await makeRequest('GET', '/Leads', null, params);
}

/**
 * Get single lead by ID
 */
async function getLead(leadId) {
    return await makeRequest('GET', `/Leads/${leadId}`);
}

/**
 * Get lead notes/activities
 */
async function getLeadNotes(leadId) {
    try {
        return await makeRequest('GET', `/Leads/${leadId}/Notes`);
    } catch (error) {
        // Notes might not exist, return empty array
        return { data: [] };
    }
}

/**
 * Create a note for a lead
 */
async function createLeadNote(leadId, noteData) {
    try {
        const data = {
            data: [
                {
                    Parent_Id: {
                        id: leadId
                    },
                    Note_Title: noteData.Note_Title || 'Note',
                    Note_Content: noteData.Note_Content || '',
                    se_module: noteData.$se_module || 'Leads'
                }
            ]
        };
        
        const result = await makeRequest('POST', '/Notes', data);
        return { success: true, data: result.data };
    } catch (error) {
        console.error('Error creating lead note:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Create a call activity for a lead
 */
async function createLeadCall(leadId, callData) {
    try {
        const data = {
            data: [
                {
                    Call_Type: callData.Call_Type || 'Outbound',
                    Subject: callData.Subject || 'Call Activity',
                    Call_Start_Time: callData.Call_Start_Time,
                    Call_Duration: callData.Call_Duration || '0',
                    Call_Result: callData.Call_Result || 'Connected',
                    Description: callData.Description || '',
                    Who_Id: {
                        id: leadId
                    },
                    se_module: callData.$se_module || 'Leads'
                }
            ]
        };
        
        const result = await makeRequest('POST', '/Calls', data);
        return { success: true, data: result.data };
    } catch (error) {
        console.error('Error creating lead call:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Create a task for a lead
 */
async function createTask(leadId, taskData) {
    try {
        const data = {
            data: [
                {
                    Subject: taskData.Subject || 'Task',
                    Status: taskData.Status || 'Not Started',
                    Due_Date: taskData.Due_Date,
                    Description: taskData.Description || '',
                    What_Id: {
                        id: leadId
                    },
                    se_module: taskData.$se_module || 'Leads'
                }
            ]
        };
        
        const result = await makeRequest('POST', '/Tasks', data);
        return { success: true, data: result.data };
    } catch (error) {
        console.error('Error creating task:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Update a lead
 */
async function updateLead(leadId, updateData) {
    try {
        const data = {
            data: [
                {
                    id: leadId,
                    ...updateData
                }
            ]
        };
        
        const result = await makeRequest('PUT', '/Leads', data);
        return { success: true, data: result.data };
    } catch (error) {
        console.error('Error updating lead:', error.message);
        return { success: false, error: error.message };
    }
}

module.exports = {
    getAccessToken,
    searchLeads,
    getLeads,
    getLead,
    getLeadNotes,
    createLeadNote,
    createLeadCall,
    createTask,
    updateLead
};
