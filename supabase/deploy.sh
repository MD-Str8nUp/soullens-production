#!/bin/bash

# SoulLens AI - Supabase Deployment Script
# Automated deployment script for production-ready database setup
# Version: 1.0.0

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    log "Checking prerequisites..."
    
    if ! command -v supabase &> /dev/null; then
        error "Supabase CLI is not installed"
        echo "Install it with: npm install -g supabase"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
        exit 1
    fi
    
    success "All prerequisites are installed"
}

# Check environment variables
check_environment() {
    log "Checking environment variables..."
    
    if [[ ! -f ".env.local" ]]; then
        error ".env.local file not found"
        echo "Please copy .env.example to .env.local and fill in your values"
        exit 1
    fi
    
    # Source environment variables
    set -a
    source .env.local
    set +a
    
    if [[ -z "$NEXT_PUBLIC_SUPABASE_URL" ]]; then
        error "NEXT_PUBLIC_SUPABASE_URL is not set in .env.local"
        exit 1
    fi
    
    if [[ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]]; then
        error "NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in .env.local"
        exit 1
    fi
    
    success "Environment variables are configured"
}

# Initialize Supabase project
init_supabase() {
    log "Initializing Supabase project..."
    
    # Check if already linked
    if [[ -f ".supabase/config.toml" ]]; then
        warning "Project already linked to Supabase"
        return 0
    fi
    
    # Extract project ID from URL
    PROJECT_ID=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed -n 's/.*\/\/\([^.]*\)\.supabase\.co/\1/p')
    
    if [[ -z "$PROJECT_ID" ]]; then
        error "Could not extract project ID from SUPABASE_URL"
        exit 1
    fi
    
    log "Linking to project: $PROJECT_ID"
    supabase link --project-ref $PROJECT_ID
    
    success "Supabase project linked successfully"
}

# Run database migrations in order
run_migrations() {
    log "Running database migrations..."
    
    # Check if we should reset the database
    if [[ "$1" == "--reset" ]]; then
        warning "Resetting database (this will delete all data)..."
        read -p "Are you sure? Type 'yes' to continue: " confirm
        if [[ $confirm == "yes" ]]; then
            supabase db reset
        else
            error "Database reset cancelled"
            exit 1
        fi
    fi
    
    # Apply migrations in order
    log "Applying migration 01: Foundation Schema"
    supabase db push --file supabase/migrations/01_foundation_schema.sql || {
        error "Failed to apply foundation schema"
        exit 1
    }
    
    log "Applying migration 02: RLS Policies"
    supabase db push --file supabase/migrations/02_rls_policies.sql || {
        error "Failed to apply RLS policies"
        exit 1
    }
    
    log "Applying migration 03: Functions and Triggers"
    supabase db push --file supabase/migrations/03_functions_triggers.sql || {
        error "Failed to apply functions and triggers"
        exit 1
    }
    
    log "Applying migration 04: Seed Data and Optimizations"
    supabase db push --file supabase/migrations/04_seed_data.sql || {
        error "Failed to apply seed data and optimizations"
        exit 1
    }
    
    success "All migrations applied successfully"
}

# Verify database setup
verify_setup() {
    log "Verifying database setup..."
    
    # Test basic connectivity
    log "Testing database connectivity..."
    RESULT=$(supabase db query "SELECT 1 as test" --output json)
    if [[ $? -ne 0 ]]; then
        error "Database connectivity test failed"
        exit 1
    fi
    
    # Check if tables exist
    log "Checking if tables exist..."
    TABLES=$(supabase db query "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'" --output json)
    TABLE_COUNT=$(echo $TABLES | jq -r '.[0].count')
    
    if [[ $TABLE_COUNT -lt 10 ]]; then
        error "Expected at least 10 tables, found $TABLE_COUNT"
        exit 1
    fi
    
    # Check if sample programs exist
    log "Checking sample programs..."
    PROGRAMS=$(supabase db query "SELECT COUNT(*) FROM programs" --output json)
    PROGRAM_COUNT=$(echo $PROGRAMS | jq -r '.[0].count')
    
    if [[ $PROGRAM_COUNT -lt 3 ]]; then
        error "Expected at least 3 sample programs, found $PROGRAM_COUNT"
        exit 1
    fi
    
    # Check if RLS is enabled
    log "Checking RLS policies..."
    RLS_CHECK=$(supabase db query "SELECT COUNT(*) FROM pg_policies" --output json)
    POLICY_COUNT=$(echo $RLS_CHECK | jq -r '.[0].count')
    
    if [[ $POLICY_COUNT -lt 20 ]]; then
        error "Expected at least 20 RLS policies, found $POLICY_COUNT"
        exit 1
    fi
    
    success "Database verification completed successfully"
    success "Tables: $TABLE_COUNT"
    success "Programs: $PROGRAM_COUNT"
    success "RLS Policies: $POLICY_COUNT"
}

# Set up real-time subscriptions
setup_realtime() {
    log "Setting up real-time subscriptions..."
    
    # Enable real-time for key tables
    supabase db query "ALTER PUBLICATION supabase_realtime ADD TABLE messages;" || warning "Messages table already in publication"
    supabase db query "ALTER PUBLICATION supabase_realtime ADD TABLE program_progress;" || warning "Program progress table already in publication"
    supabase db query "ALTER PUBLICATION supabase_realtime ADD TABLE journal_insights;" || warning "Journal insights table already in publication"
    supabase db query "ALTER PUBLICATION supabase_realtime ADD TABLE user_programs;" || warning "User programs table already in publication"
    
    success "Real-time subscriptions configured"
}

# Set up scheduled functions (if supported)
setup_cron() {
    log "Setting up scheduled functions..."
    
    # Note: pg_cron is only available on hosted Supabase with proper extensions
    CRON_CHECK=$(supabase db query "SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'" --output json 2>/dev/null || echo "[]")
    
    if [[ $CRON_CHECK == "[]" ]]; then
        warning "pg_cron extension not available - scheduled jobs must be set up manually"
        warning "Consider setting up external cron job to call: SELECT public.daily_maintenance();"
        return 0
    fi
    
    # Schedule daily maintenance
    supabase db query "SELECT cron.schedule('daily-maintenance', '0 2 * * *', 'SELECT public.daily_maintenance();');" || warning "Cron job may already exist"
    
    # Schedule analytics refresh
    supabase db query "SELECT cron.schedule('refresh-analytics', '0 */6 * * *', 'SELECT public.refresh_analytics_views();');" || warning "Analytics refresh job may already exist"
    
    success "Scheduled functions configured"
}

# Generate database documentation
generate_docs() {
    log "Generating database documentation..."
    
    # Create docs directory if it doesn't exist
    mkdir -p docs/database
    
    # Generate table documentation
    supabase db query "
    SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    ORDER BY table_name, ordinal_position
    " --output csv > docs/database/schema.csv
    
    # Generate index documentation
    supabase db query "
    SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
    FROM pg_indexes 
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname
    " --output csv > docs/database/indexes.csv
    
    success "Database documentation generated in docs/database/"
}

# Performance analysis
run_performance_check() {
    log "Running performance analysis..."
    
    # Check table sizes
    log "Analyzing table sizes..."
    supabase db query "
    SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY size_bytes DESC
    " --output table
    
    # Check index usage
    log "Analyzing index usage..."
    supabase db query "
    SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan as scans,
        idx_tup_read as tuples_read
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
    ORDER BY idx_scan DESC
    LIMIT 10
    " --output table
    
    success "Performance analysis completed"
}

# Test API endpoints
test_api() {
    log "Testing API endpoints..."
    
    if [[ -f "test-programs-api.js" ]]; then
        log "Running API tests..."
        node test-programs-api.js
        success "API tests completed"
    else
        warning "API test file not found - skipping API tests"
    fi
}

# Main deployment function
deploy() {
    local RESET_DB=false
    local SKIP_VERIFICATION=false
    local PRODUCTION_MODE=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --reset)
                RESET_DB=true
                shift
                ;;
            --skip-verification)
                SKIP_VERIFICATION=true
                shift
                ;;
            --production)
                PRODUCTION_MODE=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    log "Starting SoulLens AI Supabase deployment..."
    
    if [[ $PRODUCTION_MODE == true ]]; then
        warning "PRODUCTION MODE ENABLED"
        warning "This will deploy to production database"
        read -p "Are you sure? Type 'PRODUCTION' to continue: " confirm
        if [[ $confirm != "PRODUCTION" ]]; then
            error "Production deployment cancelled"
            exit 1
        fi
    fi
    
    # Run deployment steps
    check_prerequisites
    check_environment
    init_supabase
    
    if [[ $RESET_DB == true ]]; then
        run_migrations --reset
    else
        run_migrations
    fi
    
    setup_realtime
    setup_cron
    
    if [[ $SKIP_VERIFICATION == false ]]; then
        verify_setup
        test_api
    fi
    
    generate_docs
    run_performance_check
    
    success "🎉 SoulLens AI database deployment completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update your application's environment variables"
    echo "2. Test user registration and login"
    echo "3. Verify real-time features are working"
    echo "4. Set up monitoring and alerts"
    echo "5. Configure backup schedules"
    echo ""
    echo "Database URL: $NEXT_PUBLIC_SUPABASE_URL"
    echo "Dashboard: https://app.supabase.com/project/$PROJECT_ID"
}

# Show help
show_help() {
    echo "SoulLens AI Supabase Deployment Script"
    echo ""
    echo "Usage: ./deploy.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --reset              Reset database before deployment (DESTRUCTIVE)"
    echo "  --skip-verification  Skip database verification steps"
    echo "  --production         Enable production mode with extra confirmations"
    echo "  --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh                    # Standard deployment"
    echo "  ./deploy.sh --reset            # Reset and redeploy"
    echo "  ./deploy.sh --production       # Production deployment"
}

# Make the script executable and run main function
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    deploy "$@"
fi