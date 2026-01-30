#!/bin/bash
# ==============================================================================
# CURL Test Suite - Basic Endpoints
# ==============================================================================
# Tests basic GET requests to mock backend endpoints
#
# Usage: bash tests/curl/01-basic-endpoints.sh
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
echo "  CURL Test Suite - Basic Endpoints"
echo "======================================"
echo ""

# Test helper function
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="${3:-200}"

    echo -n "Testing: $name ... "

    response=$(curl -s -w "\n%{http_code}" "$url")
    status_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')

    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $status_code)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Expected HTTP $expected_status, got $status_code)"
        echo "Response: $body"
        ((FAILED++))
        return 1
    fi
}

# Test 1: Users endpoint
test_endpoint "GET /Users" "$BASE_URL/Users"

# Test 2: Warehouses endpoint
test_endpoint "GET /Warehouses" "$BASE_URL/Warehouses"

# Test 3: Items endpoint
test_endpoint "GET /Items" "$BASE_URL/Items"

# Test 4: BinLocations endpoint
test_endpoint "GET /BinLocations" "$BASE_URL/BinLocations"

# Test 5: Employees endpoint
test_endpoint "GET /EmployeesInfo" "$BASE_URL/EmployeesInfo"

# Test 6: Business Partners endpoint
test_endpoint "GET /BusinessPartners" "$BASE_URL/BusinessPartners"

# Test 7: Stock Transfers endpoint
test_endpoint "GET /StockTransfers" "$BASE_URL/StockTransfers"

# Test 8: Pick Lists endpoint
test_endpoint "GET /PickLists" "$BASE_URL/PickLists"

# Test 9: Stock Transfer Requests endpoint
test_endpoint "GET /StockTransferRequests" "$BASE_URL/StockTransferRequests"

# Test 10: Material Issues endpoint
test_endpoint "GET /InventoryGenExits" "$BASE_URL/InventoryGenExits"

# Test 11: Material Receipts endpoint
test_endpoint "GET /InventoryGenEntries" "$BASE_URL/InventoryGenEntries"

# Test 12: Delivery Notes endpoint
test_endpoint "GET /DeliveryNotes" "$BASE_URL/DeliveryNotes"

# Test 13: Returns endpoint
test_endpoint "GET /Returns" "$BASE_URL/Returns"

# Test 14: Purchase Deliveries endpoint
test_endpoint "GET /PurchaseDeliveryNotes" "$BASE_URL/PurchaseDeliveryNotes"

# Test 15: Invoices endpoint
test_endpoint "GET /Invoices" "$BASE_URL/Invoices"

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
