# 🤖 ElevenLabs AI Voice Integration - Setup Guide

## What Changed?

Your system now uses **ElevenLabs Conversational AI** for natural, human-like conversations in **Tamil and English** instead of simple button-press IVR.

## ✅ Features Added

1. **Natural Conversations** - AI talks like a real sales person
2. **Tamil Language Support** - Native Tamil voice and understanding
3. **Direct Site Visit Booking** - Books appointments during the call
4. **Lead Qualification** - AI analyzes conversation and scores leads
5. **Full Transcripts** - Every conversation saved to Zoho CRM
6. **Intelligent Follow-up** - Updates lead status based on conversation

---

## 🚀 Setup Instructions

### Step 1: Sign up for ElevenLabs

1. Go to **https://elevenlabs.io/**
2. Sign up for a **Pro Plan** (required for Conversational AI)
3. Cost: ~$99/month for 500 minutes + $0.24/min extra

### Step 2: Create Your AI Agent

1. Go to **ElevenLabs Dashboard** → **Conversational AI**
2. Click **"Create Agent"**
3. Configure:

```
Agent Name: JK Real Estate Tamil Assistant

Voice: Select Tamil voice
- Recommended: "Deepa" or "Priya" (female Tamil)
- Or choose male Tamil voice

Language: Tamil (ta-IN)

First Message: 
"வணக்கம்! நான் ஜே.கே. ரியல் எஸ்டேட் நிறுவனத்தின் ப்ரியா. எப்படி இருக்கிறீர்கள்?"

System Prompt:
[The prompt is already configured in the code - see elevenLabsClient.js]

Knowledge Base:
Add your property details:
- Property types and prices
- Locations available
- Amenities and features
- EMI options
- Special offers

Functions:
Enable "book_site_visit" function
```

4. **Test the agent** with a sample call
5. Copy the **Agent ID** from settings

### Step 3: Get API Credentials

1. Go to **Profile** → **API Keys**
2. Click **"Create New API Key"**
3. Copy the API key (starts with `xi_...`)

### Step 4: Configure Your Application

Update `.env` file in `zoho-lead-backend/`:

```env
# ElevenLabs Conversational AI
ELEVENLABS_ENABLED=true
ELEVENLABS_API_KEY=xi_your_api_key_here
ELEVENLABS_AGENT_ID=your_agent_id_here
ELEVENLABS_VOICE_ID=your_tamil_voice_id
ELEVENLABS_LANGUAGE=ta-IN

# Keep Twilio enabled (used for making calls)
TWILIO_ENABLED=true
```

### Step 5: Update Webhook URL

1. Get your public URL (ngrok or production domain)
2. Update `BASE_URL` in `.env`:

```env
BASE_URL=https://your-domain.com
```

3. In ElevenLabs agent settings, set webhook:
```
https://your-domain.com/ai-conversation-webhook
```

### Step 6: Update Zoho CRM Fields

Add these custom fields to Leads module in Zoho:

```
Field Name                  | Field Type    | Description
---------------------------|---------------|---------------------------
AI_Call_Status             | Single Line   | Call completion status
AI_Call_Duration           | Number        | Duration in seconds
AI_Call_Transcript         | Multi Line    | Full conversation text
AI_Conversation_Sentiment  | Single Line   | positive/neutral/negative
Lead_Quality_Score         | Number        | AI-assigned score (0-100)
Site_Visit_Date            | Date          | Scheduled visit date
Site_Visit_Time            | Single Line   | Scheduled visit time
AI_Call_Recording_URL      | URL           | Link to recording
Last_AI_Call_Date          | DateTime      | Last AI call timestamp
```

### Step 7: Test the System

1. Start your application:
```bash
cd zoho-lead-backend
npm start
```

2. Create a test lead:
```bash
curl -X POST http://localhost:3000/leads \
  -H "Content-Type: application/json" \
  -d '{
    "source": "website",
    "name": "Test User",
    "phone": "9876543210",
    "email": "test@example.com"
  }'
```

3. Wait 60 seconds - AI will call automatically!

---

## 📊 How It Works

### Call Flow

```
New Lead → Zoho CRM → Wait 60s → AI Call (Tamil) → Conversation → Update CRM
```

### Conversation Example (Tamil)

**AI:** வணக்கம்! நான் ஜே.கே. ரியல் எஸ்டேட் நிறுவனத்தின் ப்ரியா. எப்படி இருக்கிறீர்கள்?

**Customer:** நலமா இருக்கேன். நீங்க எதுக்கு கூப்புடுறீங்க?

**AI:** நீங்க எங்க வெப்சைட்ல சொத்து பார்த்திருக்கிங்க அதான் உங்களுக்கு உதவி செய்ய நினைச்சேன். என்ன மாதிரி சொத்து தேடுறீங்க?

**Customer:** சென்னையில் 2 BHK தேடுறேன். 50 லட்சம் வரைக்கும்.

**AI:** அருமை! எங்களுக்கு சென்னையில் நல்ல விருப்பங்கள் இருக்கு. நீங்க ஒரு தள பார்வை எப்போ வரலாம்? இந்த வீக்கண்ட் நல்லா இருக்குமா?

**Customer:** சரி, சனிக்கிழமை காலையில் வரலாம்.

**AI:** சரி! சனிக்கிழமை காலை 10 மணிக்கு எப்படி? உங்க பெயர் மற்றும் மொபைல் எண்ணை கன்ஃபார்ம் பண்ணுங்க.

**Customer:** சரி சரி. [confirms details]

**AI:** நன்றி! உங்க தள பார்வை முன்பதிவு முடிந்தது. கன்ஃபர்மேஷன் SMS வரும். மேலும் ஏதாவது தேவைப்பட்டால் தொடர்பு கொள்ளுங்கள். வணக்கம்!

### What Gets Saved to Zoho

After the call:
- Lead Status: "Site Visit Scheduled"
- Site Visit Date: Saturday
- Site Visit Time: 10:00 AM
- Budget: 50 lakhs
- Location: Chennai
- Property Type: 2 BHK
- Full transcript saved
- Call recording URL
- Sentiment: Positive
- Lead Score: 85/100

---

## 💰 Pricing

### ElevenLabs
- **Pro Plan:** $99/month (500 minutes)
- **Additional:** $0.24/minute

### Example Costs
- Average call: 3-5 minutes
- Cost per call: ₹15-25
- For 1000 calls: ₹15,000-25,000/month

**Still 50-70% cheaper than BPO agents!**

---

## 🎯 Benefits Over BPO

| Feature | BPO Agent | AI Agent |
|---------|-----------|----------|
| **Cost per call** | ₹30-50 | ₹15-25 |
| **Availability** | 9 AM - 6 PM | 24/7 |
| **Consistency** | Varies | Perfect |
| **Scalability** | Limited | Unlimited |
| **Languages** | 1-2 | Multiple |
| **Quality** | Depends on agent | Always good |
| **Training time** | Weeks | Instant |

---

## 🔧 Troubleshooting

### AI not calling?
- Check `ELEVENLABS_ENABLED=true`
- Verify `TWILIO_ENABLED=true`
- Check API keys are correct

### Calls connecting but no voice?
- Check Agent ID is correct
- Verify voice is selected in ElevenLabs
- Test agent in ElevenLabs dashboard first

### Not updating Zoho?
- Check webhook URL is accessible
- Verify Zoho custom fields exist
- Check server logs for errors

### Tamil not working?
- Verify `ELEVENLABS_LANGUAGE=ta-IN`
- Select Tamil voice in agent settings
- Test with Tamil greeting in dashboard

---

## 📞 Support

For issues:
1. Check logs: `tail -f logs/combined.log`
2. Test AI agent in ElevenLabs dashboard
3. Verify Twilio account is active
4. Check Zoho CRM API limits

---

## 🎉 You're All Set!

Your system is now powered by AI! Every new lead will get a professional AI call in Tamil, and site visits will be booked automatically.

**No more BPO needed! 🚀**
