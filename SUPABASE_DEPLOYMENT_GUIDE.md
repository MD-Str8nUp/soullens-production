# SoulLens AI - Complete Supabase Deployment Guide

> **Production-ready database setup for 50K+ users**

This guide provides complete instructions for setting up and deploying the SoulLens AI database infrastructure using Supabase.

## 📋 Overview

This deployment includes:
- ✅ Complete database schema with 15+ tables
- ✅ Row Level Security (RLS) policies for data protection
- ✅ Database functions and triggers for business logic
- ✅ Performance optimizations and indexes
- ✅ Sample data and seed programs
- ✅ Real-time subscriptions setup
- ✅ Analytics and monitoring
- ✅ Backup and recovery procedures

## 🚀 Quick Start (5 minutes)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `soullens-ai-production` (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Pro (for production) or Free (for testing)

### 2. Set Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials (found in Settings > API):
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### 3. Run Database Migrations

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Run all migrations
supabase db push

# Or run manually in order:
# 1. Foundation schema
# 2. RLS policies  
# 3. Functions and triggers
# 4. Seed data and optimizations
```

### 4. Verify Setup

```bash
# Test the API connection
npm run test:api

# Or visit your Supabase dashboard > SQL Editor and run:
SELECT COUNT(*) FROM programs;
```

You should see 3 sample programs if setup was successful.

## 📊 Database Schema

### Core Tables

| Table | Purpose | Records (50K users) |
|-------|---------|-------------------|
| `profiles` | User profiles and subscription data | 50,000 |
| `conversations` | Chat conversations | 500,000 |
| `messages` | Individual chat messages | 5,000,000 |
| `journal_entries` | User journal entries | 1,500,000 |
| `programs` | Available programs/courses | 50-100 |
| `user_programs` | User enrollments | 150,000 |
| `program_progress` | Lesson completion tracking | 2,000,000 |

### Analytics Tables

| Table | Purpose | Records (50K users) |
|-------|---------|-------------------|
| `usage_analytics` | Event tracking | 10,000,000 |
| `user_sessions` | Session tracking | 1,000,000 |
| `subscription_events` | Billing events | 500,000 |

### Support Tables

| Table | Purpose | Records (50K users) |
|-------|---------|-------------------|
| `support_tickets` | Customer support | 25,000 |
| `journal_insights` | Cached AI insights | 100,000 |

## 🔒 Security Features

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- Public program content is accessible to all
- Admin functions are restricted to admin users
- Anonymous analytics are allowed

### Key Security Functions

```sql
-- Check premium access
SELECT public.user_has_premium_access();

-- Check program access
SELECT public.user_can_access_program('program-uuid');

-- Check daily message limits
SELECT public.check_daily_message_limit();
```

## ⚡ Performance Optimizations

### Indexes

The database includes 30+ indexes optimized for:
- User dashboard queries
- Program browsing
- Journal entry retrieval
- Analytics queries
- Real-time chat

### Materialized Views

- `program_analytics`: Real-time program statistics
- Refreshed daily via cron job

### Query Optimization

- Composite indexes for complex queries
- Partial indexes for filtered queries
- GIN indexes for array and JSON columns

## 🔄 Real-time Features

### Enabled Real-time Tables

```sql
-- Enable real-time for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable real-time for program progress
ALTER PUBLICATION supabase_realtime ADD TABLE program_progress;

-- Enable real-time for journal insights
ALTER PUBLICATION supabase_realtime ADD TABLE journal_insights;
```

### Client-side Subscriptions

```javascript
// Subscribe to new messages
const subscription = supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, handleNewMessage)
  .subscribe()
```

## 📱 Mobile Optimization

### Connection Pooling

The database supports 100+ concurrent connections for mobile apps.

### Offline Support

- Essential data caching
- Optimistic updates
- Sync conflict resolution

## 🔧 Advanced Configuration

### Database Settings (Production)

In Supabase Dashboard > Settings > Database:

```sql
-- Connection settings
max_connections = 100
shared_preload_libraries = 'pg_stat_statements'

-- Performance settings
effective_cache_size = 2GB
shared_buffers = 512MB
maintenance_work_mem = 256MB

-- Logging
log_statement = 'mod'
log_min_duration_statement = 1000
```

### Custom Types

The schema includes custom ENUM types:
- `subscription_tier`: 'free', 'premium', 'enterprise'
- `message_role`: 'user', 'assistant', 'system'
- `completion_status`: 'not_started', 'in_progress', 'completed', 'skipped'

## 📈 Monitoring & Analytics

### Built-in Analytics

The database tracks:
- User engagement metrics
- Program completion rates
- Message volume and patterns
- Performance metrics

### Health Checks

```sql
-- Database health check
SELECT public.supabaseHelpers.healthCheck();

-- Connection count
SELECT count(*) FROM pg_stat_activity;

-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 🛠 Maintenance

### Daily Tasks (Automated)

```sql
-- Scheduled function runs daily at 2 AM UTC
SELECT cron.schedule('daily-maintenance', '0 2 * * *', 'SELECT public.daily_maintenance();');
```

This function:
- Cleans up expired insights
- Removes old anonymous analytics
- Updates program completion rates
- Optimizes table statistics

### Weekly Tasks

- Review slow queries in Dashboard > Logs
- Monitor database size and growth
- Check connection pool utilization
- Review RLS policy performance

### Monthly Tasks

- Analyze and optimize indexes
- Review user growth trends
- Plan capacity scaling
- Update materialized views schema if needed

## 💾 Backup & Recovery

### Automatic Backups

Supabase Pro includes:
- Daily automated backups (30 days retention)
- Point-in-time recovery
- Cross-region backup replication

### Manual Backup

```bash
# Export specific tables
supabase db dump --data-only --table=profiles > profiles_backup.sql

# Export entire schema
supabase db dump > full_backup.sql
```

### Disaster Recovery

1. **RTO (Recovery Time Objective)**: < 30 minutes
2. **RPO (Recovery Point Objective)**: < 1 hour
3. **Backup retention**: 30 days (Pro), 7 days (Free)

## 🚨 Troubleshooting

### Common Issues

#### Migration Errors

```bash
# Check migration status
supabase migration list

# Fix migration conflicts
supabase db reset

# Re-run migrations
supabase db push
```

#### Performance Issues

```sql
-- Find slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

#### Connection Issues

```sql
-- Check active connections
SELECT state, count(*) 
FROM pg_stat_activity 
GROUP BY state;

-- Kill long-running queries
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'active' 
AND query_start < now() - interval '5 minutes';
```

### Error Codes

| Code | Issue | Solution |
|------|-------|----------|
| `23505` | Unique constraint violation | Check for duplicate data |
| `42P01` | Table doesn't exist | Run migrations |
| `42501` | Insufficient privileges | Check RLS policies |
| `53300` | Too many connections | Scale connection pool |

## 📞 Support

### Getting Help

1. **Documentation**: [Supabase Docs](https://supabase.com/docs)
2. **Community**: [Discord](https://discord.supabase.com)
3. **Issues**: GitHub Issues for this project
4. **Enterprise**: Supabase Enterprise Support

### Monitoring Alerts

Set up alerts for:
- Database CPU > 80%
- Connection count > 80% of limit
- Failed queries > 1% of total
- Backup failures

## 🎯 Production Checklist

### Pre-Launch

- [ ] All migrations applied successfully
- [ ] RLS policies tested with different user roles
- [ ] Performance benchmarks completed
- [ ] Backup strategy verified
- [ ] Monitoring alerts configured
- [ ] Environment variables secured
- [ ] SSL/TLS certificates validated

### Post-Launch

- [ ] Monitor database performance for 24h
- [ ] Verify real-time subscriptions working
- [ ] Check backup completion
- [ ] Monitor error rates
- [ ] Review query performance
- [ ] Validate user registration flow

### Scaling Preparation

- [ ] Set up read replicas (Enterprise)
- [ ] Configure connection pooling
- [ ] Plan table partitioning for large tables
- [ ] Set up database monitoring
- [ ] Plan capacity expansion triggers

---

## 🎉 Congratulations!

Your SoulLens AI database is now production-ready and optimized for 50K+ users. The system includes comprehensive security, monitoring, and scalability features to support your growth.

For questions or issues, refer to the troubleshooting section above or reach out to the development team.