#!/bin/bash

# 🚀 স্বয়ংক্রিয় GitHub Push স্ক্রিপ্ট
# রিয়াদ সাপ গেম - Riyad Snake Game

set -e

# রঙ সংজ্ঞা
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ফাংশন: প্রিন্ট করা
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}  🚀 রিয়াদ সাপ গেম - স্বয়ংক্রিয় GitHub Push${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# মূল স্ক্রিপ্ট
main() {
    print_header
    
    # Git স্ট্যাটাস চেক করা
    print_info "Git স্ট্যাটাস চেক করছি..."
    
    if ! git status > /dev/null 2>&1; then
        print_error "এটি একটি Git repository নয়!"
        exit 1
    fi
    
    # পরিবর্তন চেক করা
    if git diff-index --quiet HEAD --; then
        print_error "কোনো পরিবর্তন নেই!"
        exit 1
    fi
    
    print_success "পরিবর্তন পাওয়া গেছে"
    
    # সব ফাইল যোগ করা
    print_info "সব ফাইল যোগ করছি..."
    git add -A
    print_success "ফাইল যোগ করা হয়েছে"
    
    # Commit message তৈরি করা
    print_info "Commit message তৈরি করছি..."
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    COMMIT_MSG="🚀 আপডেট: নতুন ফিচার যোগ করা হয়েছে ($TIMESTAMP)"
    
    # Commit করা
    print_info "Commit করছি..."
    git commit -m "$COMMIT_MSG"
    print_success "Commit সম্পূর্ণ হয়েছে"
    
    # Push করা
    print_info "GitHub এ push করছি..."
    git push origin main
    print_success "GitHub এ push সম্পূর্ণ হয়েছে!"
    
    # সারসংক্ষেপ
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║${NC}  ✅ সব কিছু সফলভাবে সম্পূর্ণ হয়েছে!${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}📊 সারসংক্ষেপ:${NC}"
    echo -e "  • Commit Message: $COMMIT_MSG"
    echo -e "  • Branch: main"
    echo -e "  • Repository: serpent-chronicles"
    echo ""
}

# স্ক্রিপ্ট চালানো
main "$@"
