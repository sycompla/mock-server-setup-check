#!/bin/bash
# ==============================================================================
# CURL Test Suite - Master Test Runner
# ==============================================================================
# Runs all curl test suites in sequence and generates a summary report
#
# Usage: bash tests/curl/run-all-tests.sh
# ==============================================================================

set +e  # Don't exit on first error

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8080"
TEST_DIR="$(dirname "$0")"
TOTAL_PASSED=0
TOTAL_FAILED=0
SUITE_PASSED=0
SUITE_FAILED=0

echo ""
echo "================================================================"
echo -e "  ${CYAN}WMS MOCK BACKEND - CURL TEST SUITE${NC}"
echo "================================================================"
echo ""
echo "Base URL: $BASE_URL"
echo "Test Directory: $TEST_DIR"
echo ""

# Check if server is running
echo -n "Checking if mock backend is running ... "
if curl -s -f "$BASE_URL/b1s/v2/Warehouses" > /dev/null; then
    echo -e "${GREEN}✓ Server is running${NC}"
else
    echo -e "${RED}✗ Server is not running${NC}"
    echo ""
    echo "Please start the mock backend server first:"
    echo "  npm run start:mock"
    echo ""
    exit 1
fi

echo ""
echo "================================================================"
echo ""

# Function to run a test suite
run_test_suite() {
    local suite_name="$1"
    local suite_file="$2"

    echo ""
    echo "----------------------------------------------------------------"
    echo -e "${BLUE}Running Test Suite: $suite_name${NC}"
    echo "----------------------------------------------------------------"
    echo ""

    if [ -f "$suite_file" ]; then
        chmod +x "$suite_file"
        if bash "$suite_file"; then
            echo ""
            echo -e "${GREEN}✓ $suite_name - PASSED${NC}"
            ((SUITE_PASSED++))
            return 0
        else
            echo ""
            echo -e "${RED}✗ $suite_name - FAILED${NC}"
            ((SUITE_FAILED++))
            return 1
        fi
    else
        echo -e "${RED}✗ Test suite not found: $suite_file${NC}"
        ((SUITE_FAILED++))
        return 1
    fi
}

# Run all test suites
run_test_suite "Basic Endpoints" "$TEST_DIR/01-basic-endpoints.sh"
run_test_suite "OData Queries" "$TEST_DIR/02-odata-queries.sh"
run_test_suite "CRUD Operations" "$TEST_DIR/03-crud-operations.sh"
run_test_suite "Authentication" "$TEST_DIR/04-authentication.sh"

# Final Summary
echo ""
echo "================================================================"
echo -e "  ${CYAN}FINAL TEST SUMMARY${NC}"
echo "================================================================"
echo ""
echo "Test Suites:"
echo -e "  Total:  $((SUITE_PASSED + SUITE_FAILED))"
echo -e "  ${GREEN}Passed: $SUITE_PASSED${NC}"
echo -e "  ${RED}Failed: $SUITE_FAILED${NC}"
echo ""
echo "----------------------------------------------------------------"
echo ""

if [ $SUITE_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TEST SUITES PASSED! 🎉${NC}"
    echo ""
    echo "The mock backend is working correctly!"
    echo ""
    exit 0
else
    echo -e "${RED}❌ SOME TEST SUITES FAILED ❌${NC}"
    echo ""
    echo "Please review the failed tests above."
    echo ""
    exit 1
fi
