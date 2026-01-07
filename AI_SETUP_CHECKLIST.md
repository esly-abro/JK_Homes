# ✅ ElevenLabs AI Integration - Quick Setup Checklist

## Before You Start
- [ ] ElevenLabs Pro account ($99/month)
- [ ] Twilio account active
- [ ] Zoho CRM access

## Setup Steps (30 minutes)

### 1️⃣ ElevenLabs Setup (10 min)
- [ ] Sign up at elevenlabs.io
- [ ] Subscribe to Pro plan
- [ ] Create Conversational AI agent
- [ ] Select Tamil voice (Deepa/Priya)
- [ ] Test agent in dashboard
- [ ] Copy Agent ID
- [ ] Generate API key

### 2️⃣ Update Environment Variables (2 min)
Edit `zoho-lead-backend/.env`:
```env
ELEVENLABS_ENABLED=true
ELEVENLABS_API_KEY=xi_your_key_here
ELEVENLABS_AGENT_ID=your_agent_id
ELEVENLABS_VOICE_ID=your_voice_id
ELEVENLABS_LANGUAGE=ta-IN
```

### 3️⃣ Add Zoho CRM Fields (5 min)
Add these custom fields in Zoho Leads:
- [ ] AI_Call_Status (Single Line)
- [ ] AI_Call_Duration (Number)
- [ ] AI_Call_Transcript (Multi Line)
- [ ] AI_Conversation_Sentiment (Single Line)
- [ ] Lead_Quality_Score (Number)
- [ ] Site_Visit_Date (Date)
- [ ] Site_Visit_Time (Single Line)
- [ ] AI_Call_Recording_URL (URL)
- [ ] Last_AI_Call_Date (DateTime)

### 4️⃣ Configure Webhooks (3 min)
- [ ] Set BASE_URL in .env to your public URL
- [ ] Add webhook in ElevenLabs: `https://your-domain.com/ai-conversation-webhook`

### 5️⃣ Test (10 min)
```bash
# Start server
npm start

# Create test lead
curl -X POST http://localhost:3000/leads \
  -H "Content-Type: application/json" \
  -d '{
    "source": "website",
    "name": "Test Tamil",
    "phone": "9876543210",
    "email": "test@example.com"
  }'

# Wait 60 seconds - you'll get an AI call!
```

## Verify Setup
- [ ] Server starts without errors
- [ ] Shows "🤖 AI-Powered Calling ENABLED with ElevenLabs"
- [ ] Test call is received
- [ ] AI speaks in Tamil
- [ ] Conversation flows naturally
- [ ] Zoho CRM updates after call

## Cost Calculator
- Average call duration: 3-5 minutes
- Cost per call: ₹15-25
- Monthly (1000 calls): ₹15,000-25,000

**BPO Comparison:** ₹30,000-50,000 for same volume
**Savings:** 40-60%

## Quick Commands

Start everything:
```bash
.\start-all.bat
```

Check AI status:
```bash
curl http://localhost:3000/health
```

View logs:
```bash
tail -f zoho-lead-backend/logs/combined.log
```

## Language Switching

For Tamil:
```env
ELEVENLABS_LANGUAGE=ta-IN
```

For English:
```env
ELEVENLABS_LANGUAGE=en-IN
```

For Both (bilingual):
```env
ELEVENLABS_LANGUAGE=ta-IN,en-IN
```

## Support URLs
- ElevenLabs Dashboard: https://elevenlabs.io/app
- Twilio Console: https://console.twilio.com
- Zoho CRM: https://crm.zoho.in

## Common Issues

**No calls?**
```bash
# Check config
grep ELEVENLABS_ENABLED zoho-lead-backend/.env
# Should show: ELEVENLABS_ENABLED=true
```

**API key invalid?**
```bash
# Test API key
curl https://api.elevenlabs.io/v1/user \
  -H "xi-api-key: YOUR_KEY"
```

**Calls silent?**
- Test agent in ElevenLabs dashboard first
- Check voice is selected
- Verify Agent ID is correct

---

## 🎉 Success Indicators

When everything works:
1. ✅ New lead created → Log shows "Scheduling call"
2. ✅ 60 seconds later → Log shows "🤖 AI call initiated"
3. ✅ Phone rings → Natural Tamil greeting
4. ✅ Conversation happens → AI books site visit
5. ✅ After call → Zoho updates with transcript

**You're now running AI-powered lead calls! 🚀**
