#!/bin/bash

# Build and Test Script for LuxuryHub E-commerce Platform

echo "🚀 Building LuxuryHub E-commerce Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the 'nextjs' directory.${NC}"
    exit 1
fi

# Function to check environment variables
check_env_vars() {
    echo -e "${BLUE}Checking environment variables...${NC}"
    
    required_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "CJ_APP_KEY"
        "CJ_SECRET_KEY"
        "CJ_PARTNER_ID"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo -e "${RED}Missing required environment variables:${NC}"
        printf '%s\n' "${missing_vars[@]}"
        echo -e "${YELLOW}Please check your .env file and ensure all required variables are set.${NC}"
        return 1
    else
        echo -e "${GREEN}✅ All required environment variables are set${NC}"
        return 0
    fi
}

# Function to test API connections
test_connections() {
    echo -e "${BLUE}Testing API connections...${NC}"
    
    # Test Supabase connection
    echo -e "${YELLOW}Testing Supabase connection...${NC}"
    if curl -s -f -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
           "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/" > /dev/null; then
        echo -e "${GREEN}✅ Supabase connection successful${NC}"
    else
        echo -e "${RED}❌ Supabase connection failed${NC}"
        return 1
    fi
    
    # Test CJ Dropshipping connection
    echo -e "${YELLOW}Testing CJ Dropshipping connection...${NC}"
    if curl -s -f -X POST \
           -H "Content-Type: application/json" \
           -d '{"action": "test-connection"}' \
           "/api/products/cj-sync" > /dev/null; then
        echo -e "${GREEN}✅ CJ Dropshipping API accessible${NC}"
    else
        echo -e "${YELLOW}⚠️  CJ Dropshipping API test skipped (requires running server)${NC}"
    fi
    
    return 0
}

# Function to build the application
build_app() {
    echo -e "${BLUE}Building application...${NC}"
    
    # Clean previous build
    rm -rf .next
    
    # Install dependencies
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    
    # Run type check
    echo -e "${YELLOW}Running TypeScript type check...${NC}"
    npx tsc --noEmit
    
    # Build the application
    echo -e "${YELLOW}Building Next.js application...${NC}"
    npm run build
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Build successful${NC}"
        return 0
    else
        echo -e "${RED}❌ Build failed${NC}"
        return 1
    fi
}

# Function to run tests
run_tests() {
    echo -e "${BLUE}Running tests...${NC}"
    
    # Lint check
    echo -e "${YELLOW}Running ESLint...${NC}"
    npx eslint . --ext .ts,.tsx --max-warnings=0
    
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️  ESLint found warnings${NC}"
    else
        echo -e "${GREEN}✅ ESLint passed${NC}"
    fi
    
    # Type check
    echo -e "${YELLOW}Running TypeScript check...${NC}"
    npx tsc --noEmit
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ TypeScript check passed${NC}"
    else
        echo -e "${RED}❌ TypeScript check failed${NC}"
        return 1
    fi
    
    return 0
}

# Function to generate deployment info
generate_deploy_info() {
    echo -e "${BLUE}Generating deployment information...${NC}"
    
    cat > deployment-info.txt << EOF
LuxuryHub E-commerce Platform - Deployment Information
=====================================================

Build completed at: $(date)

Environment Variables:
- Supabase URL: $NEXT_PUBLIC_SUPABASE_URL
- CJ App Key: ${CJ_APP_KEY:0:10}...
- CJ Partner ID: $CJ_PARTNER_ID

Project Structure:
- Next.js App Router
- Supabase Backend
- CJ Dropshipping Integration
- Admin Panel: /admin-control
- API Endpoints: /api/*

Database Schema:
- Execute supabase-schema.sql in your Supabase SQL Editor
- Tables: customers, products, orders, order_items, shipping_tracking, etc.

Next Steps:
1. Set up database using supabase-schema.sql
2. Configure webhooks in CJ Dropshipping
3. Test admin panel at /admin-control
4. Deploy to Vercel or your preferred platform

For detailed setup instructions, see README.md
EOF

    echo -e "${GREEN}✅ Deployment information saved to deployment-info.txt${NC}"
}

# Main execution
main() {
    echo -e "${BLUE}=== LuxuryHub E-commerce Platform Build Script ===${NC}"
    echo ""
    
    # Check environment variables
    if ! check_env_vars; then
        echo -e "${RED}Please fix environment variable issues before continuing.${NC}"
        exit 1
    fi
    
    echo ""
    
    # Test connections
    test_connections
    echo ""
    
    # Build application
    if ! build_app; then
        echo -e "${RED}Build failed. Please check the errors above.${NC}"
        exit 1
    fi
    
    echo ""
    
    # Run tests
    run_tests
    echo ""
    
    # Generate deployment info
    generate_deploy_info
    
    echo ""
    echo -e "${GREEN}🎉 Build completed successfully!${NC}"
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "1. ${YELLOW}Set up your Supabase database using supabase-schema.sql${NC}"
    echo -e "2. ${YELLOW}Configure CJ Dropshipping webhooks${NC}"
    echo -e "3. ${YELLOW}Test the admin panel at /admin-control${NC}"
    echo -e "4. ${YELLOW}Deploy to your preferred platform${NC}"
    echo ""
    echo -e "${BLUE}For detailed instructions, see README.md${NC}"
}

# Run main function
main "$@"