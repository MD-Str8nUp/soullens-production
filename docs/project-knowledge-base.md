# SOULLENS.AI - PROJECT KNOWLEDGE BASE

## CORE CONCEPT & VISION

### **What is SoulLens?**
SoulLens is the world's first AI companion that develops a deep understanding of users through systematic questioning and creates personalized insights, coaching, and guidance. Unlike generic AI chatbots, SoulLens becomes smarter and more personalized the longer someone uses it.

**Tagline: "See yourself clearly through intelligent questioning"**

### **The Core Innovation:**
- **Dynamic Question Generation**: AI generates questions based on user's emotional state, patterns, and growth areas
- **Deep Personal Understanding**: Builds comprehensive knowledge of user's triggers, dreams, fears, patterns
- **Contextual Insights**: Provides personalized guidance like "Based on your patterns, here's why you're feeling this way"
- **Multiple AI Personas**: Users can choose different coaching styles ("act like my brother," "be my therapist," etc.)

### **Mission Statement:**
To create the most personalized personal development experience ever built - an AI that knows you better than you know yourself and guides you toward authentic growth and self-mastery.

---

## BUSINESS MODEL & STRATEGY

### **Brand Identity:**
- **Name**: SoulLens
- **Domain**: SoulLens.ai (secured)
- **Backup Domain**: MySoulLens.com (secured)
- **Tagline**: "See yourself clearly"
- **Mission**: Help users see themselves clearly through intelligent questioning

### **Target Market:**
- **Primary**: Anyone seeking personal growth and self-awareness (ages 18-65)
- **Secondary**: Professionals wanting emotional intelligence development
- **Tertiary**: People in therapy/coaching who want supplemental support

### **Revenue Streams:**
1. **Core App Subscription**: $29/month for unlimited AI conversations
2. **Premium Features**: $49/month (voice integration, advanced analytics)
3. **Corporate Licensing**: $199/user/year for team development
4. **Physical Journal Integration**: $97 one-time (bridges to app)
5. **Data Insights**: Anonymous behavioral research partnerships

### **Financial Projections:**
- **Year 1**: 1,000 subscribers = $348K ARR
- **Year 2**: 10,000 subscribers = $3.48M ARR  
- **Year 3**: 50,000 subscribers = $17.4M ARR
- **Exit Strategy**: Acquisition by major tech/wellness company at 5-10x revenue

---

## TECHNICAL ARCHITECTURE

### **Tech Stack:**
- **Frontend**: React/Next.js (built in Cursor IDE)
- **Backend**: Supabase (PostgreSQL)
- **AI Engine**: Claude API (Sonnet 4.0)
- **Development**: Cursor IDE + Claude Projects
- **Automation**: Zapier/Make.com for workflows
- **Analytics**: Custom dashboard + Supabase analytics

### **App Structure:**
```
SoulLens App
├── My Journal (Dynamic question generation)
├── My Inbox (Saved insights and notes)
├── My Convos (AI chat with personas)
└── Dashboard (Progress tracking, patterns)
```

### **Database Schema (Supabase):**
```sql
-- Users and profiles
users (id, email, created_at, subscription_tier)
user_profiles (user_id, name, age, goals, preferences)

-- Journal and responses
journal_sessions (id, user_id, date, emotional_state, context)
journal_responses (id, session_id, question, response, sentiment_score)

-- AI conversations
conversations (id, user_id, persona_type, context)
messages (id, conversation_id, role, content, timestamp)

-- AI insights and patterns
user_patterns (id, user_id, pattern_type, description, confidence_score)
ai_insights (id, user_id, insight_text, triggered_by, relevance_score)

-- Question generation
question_bank (id, category, subcategory, question_text, triggers)
user_question_history (user_id, question_id, asked_date, response_quality)
```

### **AI Integration Flow:**
1. **User Input** → Analyze emotional state and context
2. **Pattern Recognition** → Check historical responses and patterns
3. **Question Generation** → Select/create relevant questions
4. **Response Analysis** → Extract insights and update user model
5. **Conversation** → Provide personalized coaching/insights

---

## DEVELOPMENT PROGRESS

### **✅ COMPLETED:**
- [x] Brand name secured (SoulLens.ai + MySoulLens.com)
- [x] Core AI conversation engine built
- [x] Dynamic question generation system
- [x] Multiple AI personas (mentor, coach, friend, challenger, therapist, sage)
- [x] User profile building with pattern recognition
- [x] Testing framework with quality evaluation
- [x] Interactive chat interface for validation
- [x] Project structure organized for Cursor development

### **🎯 IMMEDIATE PRIORITIES:**
1. **Test AI engine** with real Claude API key
2. **Validate conversation quality** (target score >8/10)
3. **Set up Supabase database** for persistence
4. **Build React frontend** with chat interface
5. **Deploy MVP** to SoulLens.ai domain

### **📋 DEVELOPMENT PHASES:**

#### **Phase 1: AI Engine Validation (Current)**
- Test conversation quality with real users
- Optimize AI prompts for better responses
- Ensure pattern recognition works effectively
- Validate persona differences are meaningful

#### **Phase 2: MVP Development**
- Set up Supabase backend
- Build React chat interface
- Implement user authentication
- Add conversation persistence

#### **Phase 3: Advanced Features**
- Voice integration
- Advanced analytics dashboard
- Goal tracking system
- Community features

#### **Phase 4: Scale & Growth**
- User acquisition campaigns
- Enterprise features
- API integrations
- Mobile app development

---

## AI CONVERSATION FRAMEWORK

### **AI Persona Types:**
- **The Mentor**: Wise, encouraging, supportive guidance
- **The Coach**: Direct, challenging, action-oriented
- **The Therapist**: Compassionate, exploratory, healing-focused
- **The Friend**: Casual, relatable, peer-to-peer support
- **The Challenger**: Tough love, no-nonsense, accountability-focused
- **The Sage**: Deep, philosophical, meaning-focused

### **Question Generation Categories:**

#### **Self-Awareness Foundation:**
- Emotional patterns and triggers
- Childhood conditioning and beliefs
- Values clarification and alignment
- Strengths and weakness identification
- Behavioral pattern recognition

#### **Relationship Dynamics:**
- Communication patterns
- Conflict resolution styles
- Attachment and intimacy patterns
- Family relationship dynamics
- Social and professional relationships

#### **Life Purpose & Direction:**
- Goal clarification and motivation
- Values-based decision making
- Career and life purpose exploration
- Dreams and aspiration analysis
- Legacy and impact consideration

#### **Emotional Intelligence:**
- Emotion identification and regulation
- Stress and anxiety management
- Resilience and coping strategies
- Empathy and social awareness
- Motivation and self-discipline

#### **Growth & Transformation:**
- Change readiness and resistance
- Habit formation and breaking
- Personal development planning
- Challenge and obstacle navigation
- Success celebration and integration

---

## SUCCESS METRICS

### **Technical Quality (Current Focus):**
- AI response quality score >8/10
- Response time <3 seconds
- Pattern recognition accuracy
- Persona differentiation clarity

### **User Engagement (Next Phase):**
- Daily active users and session length
- Question response rates and depth
- AI conversation frequency and quality ratings
- User retention and churn rates
- Feature adoption and usage patterns

### **Business Metrics (Future):**
- Monthly Recurring Revenue (MRR) growth
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV) and LTV:CAC ratio
- Conversion rates from free to paid
- Net Promoter Score (NPS)

### **Impact Metrics (Long-term):**
- User-reported personal growth improvements
- Emotional intelligence development scores
- Goal achievement and life satisfaction ratings
- Mental health and wellbeing indicators
- Long-term behavior change sustainability

---

## BUDGET ALLOCATION

### **Spent: $320 (32% of $1000 budget)**
- Domain registration: SoulLens.ai + MySoulLens.com
- Domain protection services

### **Remaining: $680**
- Claude API testing: ~$50
- Supabase setup: Free tier initially
- Additional tools/services: ~$100
- Marketing/user acquisition: ~$530

---

## IMMEDIATE NEXT STEPS

### **TODAY:**
1. **Test AI engine** with Claude API key
2. **Run quality validation** using test scenarios
3. **Optimize AI prompts** if quality score <8
4. **Document any issues** and improvement areas

### **THIS WEEK:**
1. **Set up Supabase** database and authentication
2. **Build basic React frontend** with chat interface
3. **Deploy to SoulLens.ai** domain
4. **Test with 3-5 real users** for feedback

### **NEXT 2 WEEKS:**
1. **Refine based on user feedback**
2. **Add advanced features** (insights dashboard, persona switching)
3. **Prepare for beta launch** with 50-100 users
4. **Begin content marketing** strategy

---

## COMPETITIVE ADVANTAGES

### **Unique Positioning:**
- **Systematic approach** to personal development vs. random conversations
- **Deep personalization** through continuous learning vs. generic responses
- **Multi-modal engagement** (questions + conversations + insights)
- **Evidence-based framework** rooted in psychology and leadership development

### **Technical Moat:**
- **User data becomes more valuable over time** (network effects)
- **Personalization improves with usage** (competitive advantage increases)
- **Multiple persona system** creates stickiness
- **Pattern recognition** provides unique insights

### **Market Position:**
- **Between casual AI companions** (Replika) and therapy apps (Woebot)
- **Structured personal development** focus vs. general conversation
- **Premium positioning** with proven value vs. freemium competitors

---

*This knowledge base will be continuously updated as SoulLens evolves from MVP to $10M business.*