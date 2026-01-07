/**
 * Configuration Module
 * Loads and validates environment variables
 */

require('dotenv').config();

const config = {
    // Server configuration
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // Zoho OAuth credentials
    zoho: {
        clientId: process.env.ZOHO_CLIENT_ID,
        clientSecret: process.env.ZOHO_CLIENT_SECRET,
        refreshToken: process.env.ZOHO_REFRESH_TOKEN,
        apiDomain: process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.in',
        accountsUrl: process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.in',
        scope: process.env.ZOHO_CRM_SCOPE || 'ZohoCRM.modules.ALL'
    },

    // Twilio Configuration
    twilio: {
        enabled: process.env.TWILIO_ENABLED === 'true',
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER,
        callDelayMs: parseInt(process.env.TWILIO_CALL_DELAY_MS, 10) || 60000,
        maxRetries: parseInt(process.env.TWILIO_MAX_RETRIES, 10) || 3
    },

    // Exotel Configuration
    exotel: {
        enabled: process.env.EXOTEL_ENABLED === 'true',
        accountSid: process.env.EXOTEL_ACCOUNT_SID,
        apiKey: process.env.EXOTEL_API_KEY,
        apiToken: process.env.EXOTEL_API_TOKEN,
        subdomain: process.env.EXOTEL_SUBDOMAIN || 'api.exotel.com',
        exophone: process.env.EXOTEL_EXOPHONE,
        appId: process.env.EXOTEL_APP_ID || null,
        callDelayMs: parseInt(process.env.EXOTEL_CALL_DELAY_MS, 10) || 60000,
        callType: process.env.EXOTEL_CALL_TYPE || 'trans',
        maxRetries: parseInt(process.env.EXOTEL_MAX_RETRIES, 10) || 3
    },

    // ElevenLabs AI Voice Configuration
    elevenlabs: {
        enabled: process.env.ELEVENLABS_ENABLED === 'true',
        apiKey: process.env.ELEVENLABS_API_KEY,
        agentId: process.env.ELEVENLABS_AGENT_ID,
        voiceId: process.env.ELEVENLABS_VOICE_ID,
        language: process.env.ELEVENLABS_LANGUAGE || 'ta-IN', // Tamil by default
        webhookUrl: process.env.BASE_URL ? `${process.env.BASE_URL}/ai-call-webhook` : null
    },

    // Logging
    logLevel: process.env.LOG_LEVEL || 'info'
};

// Validate required environment variables
function validateConfig() {
    const required = [
        'ZOHO_CLIENT_ID',
        'ZOHO_CLIENT_SECRET',
        'ZOHO_REFRESH_TOKEN'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}\n` +
            'Please check your .env file'
        );
    }
}

// Validate on module load
validateConfig();

module.exports = config;
