#!/bin/bash
# ==============================================================================
# CURL Test Suite - OData Query Operations
# ==============================================================================
# Tests OData query parameters ($filter, $orderby, $top, $skip, $select, $count)
#
# Usage: bash tests/curl/02-odata-queries.sh
# ==============================================================================

set -e

BASE_URL="http://localhost:8080/b1s/v2"
PASSED=0
FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "======================================"
echo "  CURL Test Suite - OData Queries"
echo "======================================"
echo ""

# Test helper function
test_query() {
    local name="$1"
    local url="$2"
    local check_command="$3"

    echo -n "Testing: $name ... "

    response=$(curl -s "$url")

    if eval "$check_command"; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "Response: $response"
        ((FAILED++))
        return 1
    fi
}

# Test 1: $filter - Equality (eq)
test_query "\$filter eq" \
    "$BASE_URL/Warehouses?\$filter=WarehouseCode eq 'WH01'" \
    "echo '$response' | grep -q 'WH01'"

# Test 2: $filter - Greater than (gt)
test_query "\$filter gt" \
    "$BASE_URL/Items?\$filter=ItemCode gt 'ITEM003'" \
    "echo '$response' | grep -q 'ITEM004'"

# Test 3: $filter - Less than (lt)
test_query "\$filter lt" \
    "$BASE_URL/Items?\$filter=ItemCode lt 'ITEM002'" \
    "echo '$response' | grep -q 'ITEM001'"

# Test 4: $filter - Contains
test_query "\$filter contains" \
    "$BASE_URL/Items?\$filter=contains(ItemName,'Laptop')" \
    "echo '$response' | grep -q 'Laptop'"

# Test 5: $filter - StartsWith
test_query "\$filter startswith" \
    "$BASE_URL/Warehouses?\$filter=startswith(WarehouseCode,'WH')" \
    "echo '$response' | grep -q 'WH01'"

# Test 6: $filter - AND logic
test_query "\$filter AND" \
    "$BASE_URL/Users?\$filter=UserCode eq 'admin' and Superuser eq 'tYES'" \
    "echo '$response' | grep -q 'admin'"

# Test 7: $orderby ascending
test_query "\$orderby asc" \
    "$BASE_URL/Warehouses?\$orderby=WarehouseCode asc" \
    "echo '$response' | grep -q 'WH01'"

# Test 8: $orderby descending
test_query "\$orderby desc" \
    "$BASE_URL/Items?\$orderby=ItemCode desc" \
    "echo '$response' | grep -q 'ITEM005'"

# Test 9: $top - Limit results
test_query "\$top" \
    "$BASE_URL/Items?\$top=2" \
    "echo '$response' | jq '.value | length' | grep -q '^2$'"

# Test 10: $skip - Skip results
test_query "\$skip" \
    "$BASE_URL/Items?\$skip=2&\$top=1" \
    "echo '$response' | grep -q 'ITEM003'"

# Test 11: $select - Select specific fields
test_query "\$select" \
    "$BASE_URL/Warehouses?\$select=WarehouseCode,WarehouseName" \
    "echo '$response' | grep -q 'WarehouseCode' && echo '$response' | grep -qv 'Street'"

# Test 12: $count - Get total count
test_query "\$count" \
    "$BASE_URL/Warehouses?\$count=true" \
    "echo '$response' | grep -q '@odata.count'"

# Test 13: Combined query (filter + orderby + top)
test_query "Combined query" \
    "$BASE_URL/Items?\$filter=ItemCode gt 'ITEM001'&\$orderby=ItemCode asc&\$top=2" \
    "echo '$response' | grep -q 'ITEM002'"

# Test 14: Complex filter with OR
test_query "\$filter OR" \
    "$BASE_URL/Warehouses?\$filter=WarehouseCode eq 'WH01' or WarehouseCode eq 'WH02'" \
    "echo '$response' | grep -q 'WH01'"

# Test 15: Filter with greater or equal (ge)
test_query "\$filter ge" \
    "$BASE_URL/Items?\$filter=ItemCode ge 'ITEM004'" \
    "echo '$response' | grep -q 'ITEM004'"

# Test 16: Filter with less or equal (le)
test_query "\$filter le" \
    "$BASE_URL/Items?\$filter=ItemCode le 'ITEM002'" \
    "echo '$response' | grep -q 'ITEM001'"

# Test 17: EndsWith filter
test_query "\$filter endswith" \
    "$BASE_URL/Items?\$filter=endswith(ItemCode,'001')" \
    "echo '$response' | grep -q 'ITEM001'"

# Test 18: Pagination (skip + top + count)
test_query "Pagination" \
    "$BASE_URL/Items?\$skip=1&\$top=2&\$count=true" \
    "echo '$response' | grep -q '@odata.count' && echo '$response' | jq '.value | length' | grep -q '^2$'"

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
