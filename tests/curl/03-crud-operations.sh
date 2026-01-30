#!/bin/bash
# ==============================================================================
# CURL Test Suite - CRUD Operations
# ==============================================================================
# Tests Create, Read, Update, Delete operations on mock backend
#
# Usage: bash tests/curl/03-crud-operations.sh
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
echo "  CURL Test Suite - CRUD Operations"
echo "======================================"
echo ""

# Test helper function
test_operation() {
    local name="$1"
    local method="$2"
    local url="$3"
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
        echo "$body" # Return body for further tests
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Expected HTTP $expected_status, got $status_code)"
        echo "Response: $body"
        ((FAILED++))
        return 1
    fi
}

echo ""
echo "--- CREATE Operations (POST) ---"
echo ""

# Test 1: Create new Stock Transfer
NEW_STOCK_TRANSFER='{
  "DocDate": "2026-01-30",
  "DueDate": "2026-01-30",
  "TaxDate": "2026-01-30",
  "Comments": "Test Stock Transfer - Created by CURL",
  "FromWarehouse": "WH01",
  "ToWarehouse": "WH02",
  "U_WMS_STATUS": "O",
  "U_WMS_CREATED_BY": "curl_test",
  "StockTransferLines": [
    {
      "LineNum": 0,
      "ItemCode": "ITEM001",
      "ItemDescription": "Laptop HP EliteBook 840",
      "Quantity": 5,
      "FromWarehouseCode": "WH01",
      "WarehouseToCode": "WH02"
    }
  ]
}'

created_response=$(test_operation "POST /StockTransfers" "POST" "$BASE_URL/StockTransfers" "$NEW_STOCK_TRANSFER" "201")
created_docentry=$(echo "$created_response" | jq -r '.DocEntry')

# Test 2: Create new Pick List
NEW_PICK_LIST='{
  "Name": "PICK-TEST-001",
  "OwnerCode": 1,
  "OwnerName": "Administrator",
  "PickDate": "2026-01-30",
  "Remarks": "Test Pick List - Created by CURL",
  "Status": "N",
  "ObjectType": "17",
  "U_WMS_STATUS": "O"
}'

test_operation "POST /PickLists" "POST" "$BASE_URL/PickLists" "$NEW_PICK_LIST" "201"

echo ""
echo "--- READ Operations (GET) ---"
echo ""

# Test 3: Read single Stock Transfer by ID
if [ -n "$created_docentry" ]; then
    test_operation "GET /StockTransfers($created_docentry)" "GET" "$BASE_URL/StockTransfers($created_docentry)"
fi

# Test 4: Read with filtering
test_operation "GET /StockTransfers (filtered)" "GET" "$BASE_URL/StockTransfers?\$filter=FromWarehouse eq 'WH01'"

# Test 5: Read with field selection
test_operation "GET /Warehouses (selected fields)" "GET" "$BASE_URL/Warehouses?\$select=WarehouseCode,WarehouseName"

echo ""
echo "--- UPDATE Operations (PATCH) ---"
echo ""

# Test 6: Update Stock Transfer
if [ -n "$created_docentry" ]; then
    UPDATE_DATA='{
      "Comments": "Updated by CURL test",
      "U_WMS_STATUS": "C"
    }'
    test_operation "PATCH /StockTransfers($created_docentry)" "PATCH" "$BASE_URL/StockTransfers($created_docentry)" "$UPDATE_DATA" "204"
fi

# Test 7: Verify update
if [ -n "$created_docentry" ]; then
    verify_response=$(curl -s "$BASE_URL/StockTransfers($created_docentry)")
    if echo "$verify_response" | grep -q "Updated by CURL test"; then
        echo -e "Verifying update: ${GREEN}✓ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "Verifying update: ${RED}✗ FAILED${NC}"
        ((FAILED++))
    fi
fi

echo ""
echo "--- DELETE Operations (DELETE) ---"
echo ""

# Test 8: Delete Stock Transfer
if [ -n "$created_docentry" ]; then
    test_operation "DELETE /StockTransfers($created_docentry)" "DELETE" "$BASE_URL/StockTransfers($created_docentry)" "" "204"
fi

# Test 9: Verify deletion (should return 404)
if [ -n "$created_docentry" ]; then
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL/StockTransfers($created_docentry)")
    status_code=$(echo "$response" | tail -n 1)

    if [ "$status_code" = "404" ]; then
        echo -e "Verifying deletion: ${GREEN}✓ PASSED${NC} (HTTP 404)"
        ((PASSED++))
    else
        echo -e "Verifying deletion: ${RED}✗ FAILED${NC} (Expected HTTP 404, got $status_code)"
        ((FAILED++))
    fi
fi

echo ""
echo "--- BATCH Operations ---"
echo ""

# Test 10: Batch request with multiple operations
BATCH_DATA='{
  "requests": [
    {
      "id": "1",
      "method": "GET",
      "url": "/Warehouses"
    },
    {
      "id": "2",
      "method": "GET",
      "url": "/Items?\$top=2"
    }
  ]
}'

test_operation "POST /\$batch" "POST" "$BASE_URL/\$batch" "$BATCH_DATA" "200"

echo ""
echo "--- Error Handling ---"
echo ""

# Test 11: Invalid endpoint (should return 404)
test_operation "GET /InvalidEndpoint (404)" "GET" "$BASE_URL/InvalidEndpoint" "" "404"

# Test 12: Invalid ID (should return 404)
test_operation "GET /StockTransfers(99999) (404)" "GET" "$BASE_URL/StockTransfers(99999)" "" "404"

# Test 13: Invalid POST data (should return 400)
INVALID_DATA='{"invalid": "data"}'
test_operation "POST /StockTransfers (400)" "POST" "$BASE_URL/StockTransfers" "$INVALID_DATA" "400"

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
