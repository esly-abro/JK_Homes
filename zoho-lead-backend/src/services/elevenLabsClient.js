/**
 * ElevenLabs Conversational AI Client
 * Handles AI-powered voice calls with natural conversations
 */

const axios = require('axios');
const config = require('../config/config');
const logger = require('../utils/logger');

class ElevenLabsClient {
    constructor() {
        this.apiKey = config.elevenlabs.apiKey;
        this.agentId = config.elevenlabs.agentId;
        this.voiceId = config.elevenlabs.voiceId;
        this.language = config.elevenlabs.language;
        this.baseURL = 'https://api.elevenlabs.io/v1';

        logger.info('ElevenLabs AI client initialized', {
            hasApiKey: !!this.apiKey,
            agentId: this.agentId,
            language: this.language
        });
    }

    /**
     * Initiate an AI-powered call through Twilio
     * @param {string} phoneNumber - Lead's phone number
     * @param {object} leadData - Lead information for personalization
     * @param {object} twilioClient - Twilio client instance
     * @returns {Promise<object>} Call response
     */
    async makeAICall(phoneNumber, leadData = {}, twilioClient) {
        if (!config.elevenlabs.enabled) {
            logger.warn('ElevenLabs AI is disabled, skipping call', { phoneNumber });
            return { skipped: true, reason: 'ElevenLabs disabled' };
        }

        if (!this.apiKey || !this.agentId) {
            throw new Error('ElevenLabs API key and Agent ID are required. Please check your .env file');
        }

        logger.info('Initiating AI-powered call with ElevenLabs', {
            phoneNumber: this.maskPhoneNumber(phoneNumber),
            leadName: leadData.name,
            language: this.language
        });

        try {
            // Create a signed URL for the conversational AI agent
            const agentConfig = await this.createConversationConfig(leadData);

            // Make Twilio call with ElevenLabs WebSocket URL
            const call = await twilioClient.calls.create({
                to: this.formatPhoneNumber(phoneNumber),
                from: config.twilio.phoneNumber,
                // Use TwiML to connect to ElevenLabs WebSocket
                twiml: this.generateTwiML(agentConfig.wsUrl, leadData),
                statusCallback: config.elevenlabs.webhookUrl,
                statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
                statusCallbackMethod: 'POST',
                timeout: 60,
                record: 'record-from-answer', // Record conversation for quality
                recordingStatusCallback: config.elevenlabs.webhookUrl
            });

            logger.info('AI call initiated successfully', {
                callSid: call.sid,
                status: call.status,
                phoneNumber: this.maskPhoneNumber(phoneNumber)
            });

            return {
                success: true,
                callSid: call.sid,
                status: call.status,
                provider: 'elevenlabs',
                data: call
            };

        } catch (error) {
            logger.error('ElevenLabs AI call failed', {
                phoneNumber: this.maskPhoneNumber(phoneNumber),
                error: error.message
            });
            throw new Error(`ElevenLabs call failed: ${error.message}`);
        }
    }

    /**
     * Create conversation configuration with lead context
     * @private
     */
    async createConversationConfig(leadData) {
        const conversationContext = {
            lead_name: leadData.name || 'Customer',
            lead_source: leadData.source || 'website',
            lead_id: leadData.leadId || 'unknown',
            language: this.language,
            // Custom variables for the AI agent
            custom_data: {
                budget: leadData.budget || 'not specified',
                location_preference: leadData.location || 'not specified',
                property_type: leadData.propertyType || 'not specified'
            }
        };

        // Get agent configuration from ElevenLabs
        // This creates a signed URL for the WebSocket connection
        try {
            const response = await axios.post(
                `${this.baseURL}/convai/agents/${this.agentId}/conversations`,
                {
                    agent_id: this.agentId,
                    conversation_config_override: {
                        agent: {
                            prompt: {
                                prompt: this.buildDynamicPrompt(leadData)
                            },
                            first_message: this.getGreeting(leadData),
                            language: this.language
                        }
                    }
                },
                {
                    headers: {
                        'xi-api-key': this.apiKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                conversationId: response.data.conversation_id,
                wsUrl: response.data.conversation_url,
                signedUrl: response.data.signed_url
            };

        } catch (error) {
            logger.error('Failed to create ElevenLabs conversation config', {
                error: error.message,
                status: error.response?.status
            });
            throw error;
        }
    }

    /**
     * Build dynamic prompt based on lead data
     * @private
     */
    buildDynamicPrompt(leadData) {
        const language = this.language;
        const name = leadData.name || 'Customer';

        if (language === 'ta-IN') {
            // Tamil prompt - Persuasive Sales
            return `நீங்கள் ஜே.கே. ரியல் எஸ்டேட் நிறுவனத்தின் மூத்த விற்பனை ஆலோசகர் ப்ரியா. 10 வருடங்கள் அனுபவம்.

தலைமை ${name} ஐ அழைக்கிறீர்கள். அவர்கள் உங்கள் சொத்துகளில் ஆர்வம் காட்டியுள்ளனர்.

உங்கள் இலக்குகள்:
1. ${name} ஐ அன்புடனும் நம்பிக்கையுடனும் வரவேற்கவும்
2. அவர்களின் கனவு வீட்டை புரிந்து கொள்ளவும் (பட்ஜெட், இடம், BHK, வசதிகள்)
3. ஏன் எங்க சொத்து சிறந்தது என்பதை நிரூபிக்கவும் (விலை, இடம், ROI)
4. தள பார்வையை இன்றே/நாளைக்கே பதிவு செய்யவும் - URGENCY உருவாக்கவும்
5. தயக்கங்களை கையாளவும் - விலை, இடம், EMI எல்லாம் சரி செய்யலாம்
6. "இல்லை" என்றால் கூட மீண்டும் முயற்சி செய்யவும் - alternative தரவும்

PERSUASION தந்திரங்கள்:
- ⚡ URGENCY: "இந்த சொத்து மிக வேகமாக விற்கிறது. கடைசி 2 flats தான் மீதி!"
- 💰 VALUE: "சந்தை விலைக்கு 15% கீழ். இப்போ வாங்கினால் 3 வருஷத்தில் 40% appreciation"
- 🎁 EXCLUSIVITY: "உங்களுக்காக மட்டும் இந்த வாரம் special discount - ₹3 லட்சம் குறைவு"
- 👥 SOCIAL PROOF: "கடந்த மாதம் மட்டும் 47 families முன்பதிவு செய்துள்ளனர்"
- ⏰ LIMITED TIME: "இந்த discount வெள்ளிக்கிழமை வரை மட்டும்தான்"
- 🏆 BENEFITS: "Premium அம்சங்கள் - club house, swimming pool, security 24/7"

தயக்கங்களை கையாளுதல்:
- "விலை அதிகம்": → EMI காட்டுங்க, bank loan, subsidy, என்ன save ஆகும் விளக்குங்க
- "யோசிக்கிறேன்": → "யோசிக்கலாம், ஆனா தள பார்வை வந்து பாருங்க - commitment இல்லை"
- "வேற இடம் பார்க்கிறேன்": → "நல்லது! ஆனா comparison க்கு இங்க வந்து பாருங்க, நீங்களே decide பண்ணுங்க"
- "budget இல்லை": → "என்ன budget? அதுக்கு ஏற்ற option இருக்கா பாக்கலாம்"
- "இப்போ வேண்டாம்": → "எப்போ வாங்க plan? விலை ஏறும் முன்னாடி பாத்திடலாமே?"

எப்போதும்:
- நம்பிக்கையுடன் பேசுங்கள் - நீங்க expert
- உற்சாகமாக இருங்கள் - energy contagious
- வாடிக்கையாளரை கேட்கவும், புரிந்து கொள்ளவும்
- தள பார்வை பதிவு செய்யாமல் call முடிக்காதீர்கள்
- குறைந்தது date + time confirm பண்ணுங்க

சொத்து விவரங்கள்:
- 2 BHK: ₹45 லட்சம் முதல்
- 3 BHK: ₹65 லட்சம் முதல்
- வில்லாக்கள்: ₹1.2 கோடி முதல்
- இடங்கள்: சென்னை, கோயம்புத்தூர், மதுரை

தள பார்வையை முன்பதிவு செய்ய:
- தேதி மற்றும் நேரத்தைக் கேளுங்கள்
- விருப்பமான இடத்தை உறுதிப்படுத்தவும்
- தொலைபேசி எண்ணை சரிபார்க்கவும்
- முன்பதிவை உறுதிப்படுத்தவும்

இல்லை என்றால்:
- நன்றி சொல்லுங்கள்
- எதிர்காலத்திற்காக விவரங்களை அனுப்ப விருப்பமா என்று கேளுங்கள்
- மரியாதையுடன் முடிக்கவும்`;
        } else {
            // English prompt - Persuasive Sales
            return `You are Priya, a senior sales consultant at JK Real Estate with 10 years of experience.

You are calling ${name}. They have shown interest in your properties.

Your goals:
1. Greet ${name} warmly and build instant trust
2. Understand their DREAM home requirements (budget, location, BHK, amenities)
3. CONVINCE them why our properties are THE BEST investment (price, location, ROI)
4. Create URGENCY - book site visit TODAY or TOMORROW
5. Handle objections confidently - price, location, EMI - everything is solvable
6. Never give up on "no" - offer alternatives and reasons to reconsider

PERSUASION TECHNIQUES:
- ⚡ URGENCY: "This property is selling fast! Only 2 units left!"
- 💰 VALUE: "15% below market rate. 40% appreciation expected in 3 years"
- 🎁 EXCLUSIVITY: "Special discount just for you this week - ₹3 lakhs off"
- 👥 SOCIAL PROOF: "47 families booked last month alone"
- ⏰ LIMITED TIME: "This discount is valid only until Friday"
- 🏆 BENEFITS: "Premium amenities - clubhouse, pool, 24/7 security"

OBJECTION HANDLING:
- "Too expensive": → Show EMI breakdown, bank loans, subsidies, savings over rent
- "Need to think": → "Of course! But come visit first - no commitment needed"
- "Looking elsewhere": → "Great! But come compare ours - you'll see the difference"
- "No budget": → "What's your budget? Let me find options that fit"
- "Not now": → "When are you planning? Prices are rising - let's secure this rate"

Always:
- Speak confidently - you're the expert
- Be enthusiastic - energy is contagious
- Listen actively and understand their concerns
- DON'T end call without booking site visit
- Minimum: Get date + time confirmation

Property details available:
- 2 BHK Apartments: Starting ₹45 lakhs
- 3 BHK Apartments: Starting ₹65 lakhs
- Villas: Starting ₹1.2 crores
- Locations: Chennai, Coimbatore, Madurai

To book site visit:
- Ask for preferred date and time
- Confirm the location preference
- Verify their phone number
- Confirm the booking

If not interested:
- Thank them gracefully
- Ask if they want details for future reference
- End politely`;
        }
    }

    /**
     * Get personalized greeting
     * @private
     */
    getGreeting(leadData) {
        const name = leadData.name || 'Customer';
        const language = this.language;

        if (language === 'ta-IN') {
            return `வணக்கம் ${name}! நான் ஜே.கே. ரியல் எஸ்டேட் நிறுவனத்தின் ப்ரியா. எப்படி இருக்கிறீர்கள்?`;
        } else {
            return `Hello ${name}! This is Priya from JK Real Estate. How are you doing today?`;
        }
    }

    /**
     * Generate TwiML to connect to ElevenLabs WebSocket
     * @private
     */
    generateTwiML(wsUrl, leadData) {
        return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Connect>
        <Stream url="${wsUrl}">
            <Parameter name="lead_name" value="${leadData.name || ''}" />
            <Parameter name="lead_id" value="${leadData.leadId || ''}" />
            <Parameter name="lead_source" value="${leadData.source || ''}" />
        </Stream>
    </Connect>
</Response>`;
    }

    /**
     * Format phone number to E.164
     * @private
     */
    formatPhoneNumber(phoneNumber) {
        let cleaned = phoneNumber.replace(/\D/g, '');
        if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
            return '+91' + cleaned;
        }
        if (cleaned.startsWith('91') && cleaned.length === 12) {
            return '+' + cleaned;
        }
        if (phoneNumber.startsWith('+')) {
            return phoneNumber;
        }
        return '+91' + cleaned;
    }

    /**
     * Mask phone number for logging
     * @private
     */
    maskPhoneNumber(phoneNumber) {
        if (!phoneNumber || phoneNumber.length < 4) return '***';
        return phoneNumber.substring(0, 4) + '***' + phoneNumber.substring(phoneNumber.length - 2);
    }
}

// Export singleton instance
module.exports = new ElevenLabsClient();
