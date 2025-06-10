-- MOBILE RLS POLICIES FOR SOULLENS
-- Secure but optimized for mobile performance

-- Users can see/update own profile
CREATE POLICY "Users can manage own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own profile" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Conversation access
CREATE POLICY "Users can access own conversations" ON conversations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own messages" ON messages
  FOR ALL USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

-- Personal development data
CREATE POLICY "Users can access own patterns" ON user_patterns
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own insights" ON insights
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own journal" ON journal_entries
  FOR ALL USING (auth.uid() = user_id);

-- Analytics (read-only for users)
CREATE POLICY "Users can view own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Service role policies for backend operations
CREATE POLICY "Service role full access" ON mobile_analytics
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role notifications" ON notification_queue
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');