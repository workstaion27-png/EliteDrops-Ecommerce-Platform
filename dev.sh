#!/bin/bash

# EliteDrops Development Helper Script
# This script helps manage both projects in the repository

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if we're in the right directory
check_directory() {
    if [[ ! -f "README.md" ]] || [[ ! -d "elitedrops-store" ]] || [[ ! -d "elitedrops" ]]; then
        print_error "This script must be run from the project root directory"
        exit 1
    fi
}

# Function to install dependencies for both projects
install_deps() {
    print_status "Installing dependencies for both projects..."
    
    if [[ -d "elitedrops-store" ]]; then
        print_status "Installing dependencies for Vite/React version..."
        cd elitedrops-store
        pnpm install --prefer-offline
        cd ..
        print_success "Vite/React dependencies installed"
    fi
    
    if [[ -d "elitedrops" ]]; then
        print_status "Installing dependencies for Next.js version..."
        cd elitedrops
        pnpm install
        cd ..
        print_success "Next.js dependencies installed"
    fi
}

# Function to build both projects
build_projects() {
    print_status "Building both projects..."
    
    if [[ -d "elitedrops-store" ]]; then
        print_status "Building Vite/React version..."
        cd elitedrops-store
        pnpm build
        cd ..
        print_success "Vite/React build completed"
    fi
    
    if [[ -d "elitedrops" ]]; then
        print_status "Building Next.js version..."
        cd elitedrops
        pnpm build
        cd ..
        print_success "Next.js build completed"
    fi
}

# Function to run development servers
dev_servers() {
    print_status "Starting development servers..."
    print_warning "This will start both development servers"
    print_warning "Vite/React: http://localhost:5173"
    print_warning "Next.js: http://localhost:3000"
    print_warning "Press Ctrl+C to stop both servers"
    
    # Start both servers in background
    if [[ -d "elitedrops-store" ]]; then
        (cd elitedrops-store && pnpm dev) &
        VITE_PID=$!
    fi
    
    if [[ -d "elitedrops" ]]; then
        (cd elitedrops && pnpm dev) &
        NEXT_PID=$!
    fi
    
    # Wait for user interrupt
    trap "kill $VITE_PID $NEXT_PID 2>/dev/null || true; exit" INT
    wait
}

# Function to show project status
show_status() {
    print_status "EliteDrops Project Status"
    echo "=============================="
    
    if [[ -d "elitedrops-store" ]]; then
        echo "📦 Vite/React Version (elitedrops-store):"
        if [[ -d "elitedrops-store/node_modules" ]]; then
            echo "   ✅ Dependencies installed"
        else
            echo "   ❌ Dependencies not installed"
        fi
        
        if [[ -d "elitedrops-store/dist" ]]; then
            echo "   ✅ Build artifacts present"
        else
            echo "   ❌ No build artifacts"
        fi
        
        if [[ -f "elitedrops-store/.env" ]]; then
            echo "   ✅ Environment configured"
        else
            echo "   ❌ No environment file"
        fi
        echo
    fi
    
    if [[ -d "elitedrops" ]]; then
        echo "📦 Next.js Version (elitedrops):"
        if [[ -d "elitedrops/node_modules" ]]; then
            echo "   ✅ Dependencies installed"
        else
            echo "   ❌ Dependencies not installed"
        fi
        
        if [[ -d "elitedrops/.next" ]]; then
            echo "   ✅ Build artifacts present"
        else
            echo "   ❌ No build artifacts"
        fi
        
        if [[ -f "elitedrops/.env.local" ]]; then
            echo "   ✅ Environment configured"
        else
            echo "   ❌ No environment file"
        fi
        echo
    fi
    
    if [[ -d "supabase" ]]; then
        echo "🗄️  Supabase Configuration:"
        echo "   ✅ Database migrations present"
        echo "   ✅ Edge functions configured"
        echo
    fi
}

# Function to show help
show_help() {
    echo "EliteDrops Development Helper"
    echo "=============================="
    echo
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  install    Install dependencies for both projects"
    echo "  build      Build both projects for production"
    echo "  dev        Start development servers for both projects"
    echo "  status     Show project status and configuration"
    echo "  help       Show this help message"
    echo
    echo "Examples:"
    echo "  $0 install    # Install all dependencies"
    echo "  $0 build      # Build both projects"
    echo "  $0 dev        # Start development servers"
    echo "  $0 status     # Check project status"
}

# Main script logic
main() {
    check_directory
    
    case "${1:-help}" in
        "install")
            install_deps
            ;;
        "build")
            build_projects
            ;;
        "dev")
            dev_servers
            ;;
        "status")
            show_status
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@"