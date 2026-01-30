#!/bin/bash
# ==============================================================================
# CURL Test Suite - Authentication & Session
# ==============================================================================
# Tests login, session, and user permission endpoints
#
# Usage: bash tests/curl/04-authentication.sh
# ==============================================================================

set -e

BASE_URL="http://localhost:8080"
B1S_URL="$BASE_URL/b1s/v2"
PASSED=0
FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "======================================"
echo "  CURL Test Suite - Authentication"
echo "======================================"
echo ""

# Test helper function
test_auth() {
    local name="$1"
    local url="$2"
    local method="${3:-GET}"
    local data="$4"
    local expected_status="${5:-200}"

    echo -n "Testing: $name ... "

    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$url")
    fi

    status_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')

    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $status_code)"
        ((PASSED++))
        echo "$body"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Expected HTTP $expected_status, got $status_code)"
        echo "Response: $body"
        ((FAILED++))
        return 1
    fi
}

echo ""
echo "--- Login Endpoint ---"
echo ""

# Test 1: Login with admin credentials
LOGIN_DATA='{
  "CompanyDB": "SBODEMOHUN",
  "UserName": "admin",
  "Password": "password"
}'

login_response=$(test_auth "POST /Login (admin)" "$B1S_URL/Login" "POST" "$LOGIN_DATA" "200")
session_id=$(echo "$login_response" | jq -r '.SessionId // empty')

if [ -n "$session_id" ]; then
    echo -e "Session ID retrieved: ${GREEN}$session_id${NC}"
fi

# Test 2: Login with warehouse user credentials
LOGIN_DATA_WAREHOUSE='{
  "CompanyDB": "SBODEMOHUN",
  "UserName": "warehouse_user",
  "Password": "password"
}'

test_auth "POST /Login (warehouse_user)" "$B1S_URL/Login" "POST" "$LOGIN_DATA_WAREHOUSE" "200"

# Test 3: Login with invalid credentials
INVALID_LOGIN='{
  "CompanyDB": "SBODEMOHUN",
  "UserName": "invalid_user",
  "Password": "wrong_password"
}'

test_auth "POST /Login (invalid)" "$B1S_URL/Login" "POST" "$INVALID_LOGIN" "401"

echo ""
echo "--- User Permissions ---"
echo ""

# Test 4: Get current user info
test_auth "GET /Users (current user)" "$B1S_URL/Users" "GET"

# Test 5: Get specific user by ID
test_auth "GET /Users(1)" "$B1S_URL/Users(1)" "GET"

# Test 6: Check user permissions
user_response=$(curl -s "$B1S_URL/Users(1)")
if echo "$user_response" | grep -q "UserPermission"; then
    echo -e "User permissions check: ${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "User permissions check: ${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

# Test 7: Verify superuser flag
if echo "$user_response" | jq -r '.Superuser' | grep -q "tYES"; then
    echo -e "Superuser flag check: ${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "Superuser flag check: ${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

echo ""
echo "--- Company & Admin Info ---"
echo ""

# Test 8: Get company admin info
test_auth "GET /CompanyService_GetAdminInfo" "$B1S_URL/CompanyService_GetAdminInfo" "GET"

# Test 9: Verify admin info contains company name
admin_response=$(curl -s "$B1S_URL/CompanyService_GetAdminInfo")
if echo "$admin_response" | grep -q "CompanyName"; then
    echo -e "Company name in admin info: ${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "Company name in admin info: ${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

echo ""
echo "--- License Validation ---"
echo ""

# Test 10: Check WMS licenses
LICENSE_URL="$BASE_URL/wms/api/licenses"
license_response=$(curl -s "$LICENSE_URL")

if echo "$license_response" | grep -q "WMS"; then
    echo -e "GET /wms/api/licenses: ${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "GET /wms/api/licenses: ${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

# Test 11: Verify specific module licenses
for module in "WMS_OWTR" "WMS_OWTQ" "WMS_PICK"; do
    if echo "$license_response" | grep -q "$module"; then
        echo -e "License check ($module): ${GREEN}✓ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "License check ($module): ${RED}✗ FAILED${NC}"
        ((FAILED++))
    fi
done

# Test 12: Verify license expiration date
if echo "$license_response" | grep -q "2027"; then
    echo -e "License expiration check: ${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "License expiration check: ${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

echo ""
echo "--- User Filtering ---"
echo ""

# Test 13: Filter users by Superuser
test_auth "GET /Users?\$filter=Superuser eq 'tYES'" "$B1S_URL/Users?\$filter=Superuser eq 'tYES'" "GET"

# Test 14: Filter users by UserCode
test_auth "GET /Users?\$filter=UserCode eq 'admin'" "$B1S_URL/Users?\$filter=UserCode eq 'admin'" "GET"

# Test 15: Get non-superusers
test_auth "GET /Users?\$filter=Superuser eq 'tNO'" "$B1S_URL/Users?\$filter=Superuser eq 'tNO'" "GET"

# Summary
echo ""
echo "======================================"
echo "  Test Summary"
echo "======================================"
echo -e "Total:  $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
