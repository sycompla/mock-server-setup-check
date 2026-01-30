#!/bin/bash
# ==============================================================================
# CURL Test Suite - Interactive Demo
# ==============================================================================
# Demonstrates mock backend capabilities with live curl examples
#
# Usage: bash tests/curl/demo.sh
# ==============================================================================

set +e

BASE_URL="http://localhost:8080/b1s/v2"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

clear

echo ""
echo "================================================================"
echo -e "  ${CYAN}WMS MOCK BACKEND - INTERACTIVE DEMO${NC}"
echo "================================================================"
echo ""
echo "This demo will show you the mock backend in action!"
echo ""

# Check server
echo -n "Checking if mock backend is running ... "
if curl -s -f "$BASE_URL/Warehouses" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
    echo ""
    echo "Please start the server first:"
    echo "  npm run start:mock"
    echo ""
    exit 1
fi

echo ""
echo "Press ENTER to start the demo..."
read

# Demo 1: Basic GET
echo ""
echo "================================================================"
echo -e "${BLUE}Demo 1: Basic GET Request${NC}"
echo "================================================================"
echo ""
echo -e "${YELLOW}Command:${NC}"
echo "curl $BASE_URL/Warehouses"
echo ""
echo "Press ENTER to execute..."
read
curl -s "$BASE_URL/Warehouses" | jq . 2>/dev/null || curl -s "$BASE_URL/Warehouses"
echo ""
echo "Press ENTER to continue..."
read

# Demo 2: OData Filter
echo ""
echo "================================================================"
echo -e "${BLUE}Demo 2: OData \$filter (Equality)${NC}"
echo "================================================================"
echo ""
echo -e "${YELLOW}Command:${NC}"
echo "curl \"$BASE_URL/Warehouses?\\\$filter=WarehouseCode eq 'WH01'\""
echo ""
echo "Press ENTER to execute..."
read
curl -s "$BASE_URL/Warehouses?\$filter=WarehouseCode eq 'WH01'" | jq . 2>/dev/null || curl -s "$BASE_URL/Warehouses?\$filter=WarehouseCode eq 'WH01'"
echo ""
echo "Press ENTER to continue..."
read

# Demo 3: OData Contains
echo ""
echo "================================================================"
echo -e "${BLUE}Demo 3: OData \$filter (Contains)${NC}"
echo "================================================================"
echo ""
echo -e "${YELLOW}Command:${NC}"
echo "curl \"$BASE_URL/Items?\\\$filter=contains(ItemName,'Laptop')\""
echo ""
echo "Press ENTER to execute..."
read
curl -s "$BASE_URL/Items?\$filter=contains(ItemName,'Laptop')" | jq . 2>/dev/null || curl -s "$BASE_URL/Items?\$filter=contains(ItemName,'Laptop')"
echo ""
echo "Press ENTER to continue..."
read

# Demo 4: OData Sorting
echo ""
echo "================================================================"
echo -e "${BLUE}Demo 4: OData \$orderby (Descending)${NC}"
echo "================================================================"
echo ""
echo -e "${YELLOW}Command:${NC}"
echo "curl \"$BASE_URL/Items?\\\$orderby=ItemCode desc\""
echo ""
echo "Press ENTER to execute..."
read
curl -s "$BASE_URL/Items?\$orderby=ItemCode desc" | jq . 2>/dev/null || curl -s "$BASE_URL/Items?\$orderby=ItemCode desc"
echo ""
echo "Press ENTER to continue..."
read

# Demo 5: OData Pagination
echo ""
echo "================================================================"
echo -e "${BLUE}Demo 5: OData Pagination (\$top + \$skip)${NC}"
echo "================================================================"
echo ""
echo -e "${YELLOW}Command:${NC}"
echo "curl \"$BASE_URL/Items?\\\$top=2&\\\$skip=1\""
echo ""
echo "Press ENTER to execute..."
read
curl -s "$BASE_URL/Items?\$top=2&\$skip=1" | jq . 2>/dev/null || curl -s "$BASE_URL/Items?\$top=2&\$skip=1"
echo ""
echo "Press ENTER to continue..."
read

# Demo 6: OData Select
echo ""
echo "================================================================"
echo -e "${BLUE}Demo 6: OData \$select (Field Projection)${NC}"
echo "================================================================"
echo ""
echo -e "${YELLOW}Command:${NC}"
echo "curl \"$BASE_URL/Warehouses?\\\$select=WarehouseCode,WarehouseName\""
echo ""
echo "Press ENTER to execute..."
read
curl -s "$BASE_URL/Warehouses?\$select=WarehouseCode,WarehouseName" | jq . 2>/dev/null || curl -s "$BASE_URL/Warehouses?\$select=WarehouseCode,WarehouseName"
echo ""
echo "Press ENTER to continue..."
read

# Demo 7: OData Count
echo ""
echo "================================================================"
echo -e "${BLUE}Demo 7: OData \$count${NC}"
echo "================================================================"
echo ""
echo -e "${YELLOW}Command:${NC}"
echo "curl \"$BASE_URL/Items?\\\$count=true\""
echo ""
echo "Press ENTER to execute..."
read
response=$(curl -s "$BASE_URL/Items?\$count=true")
echo "$response" | jq . 2>/dev/null || echo "$response"
count=$(echo "$response" | jq -r '."@odata.count"' 2>/dev/null)
if [ -n "$count" ]; then
    echo ""
    echo -e "${GREEN}Total count: $count items${NC}"
fi
echo ""
echo "Press ENTER to continue..."
read

# Demo 8: POST (Create)
echo ""
echo "================================================================"
echo -e "${BLUE}Demo 8: POST - Create Stock Transfer${NC}"
echo "================================================================"
echo ""
echo -e "${YELLOW}Command:${NC}"
echo "curl -X POST $BASE_URL/StockTransfers \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{...}'"
echo ""
echo "Press ENTER to execute..."
read
create_response=$(curl -s -X POST "$BASE_URL/StockTransfers" \
  -H "Content-Type: application/json" \
  -d '{
    "DocDate": "2026-01-30",
    "FromWarehouse": "WH01",
    "ToWarehouse": "WH02",
    "Comments": "Created by CURL Demo",
    "U_WMS_STATUS": "O",
    "StockTransferLines": [
      {
        "LineNum": 0,
        "ItemCode": "ITEM001",
        "Quantity": 5
      }
    ]
  }')

echo "$create_response" | jq . 2>/dev/null || echo "$create_response"
doc_entry=$(echo "$create_response" | jq -r '.DocEntry' 2>/dev/null)

if [ -n "$doc_entry" ] && [ "$doc_entry" != "null" ]; then
    echo ""
    echo -e "${GREEN}✓ Stock Transfer created with DocEntry: $doc_entry${NC}"
    CREATED_DOC_ENTRY="$doc_entry"
fi

echo ""
echo "Press ENTER to continue..."
read

# Demo 9: GET by ID
if [ -n "$CREATED_DOC_ENTRY" ]; then
    echo ""
    echo "================================================================"
    echo -e "${BLUE}Demo 9: GET - Read by ID${NC}"
    echo "================================================================"
    echo ""
    echo -e "${YELLOW}Command:${NC}"
    echo "curl $BASE_URL/StockTransfers($CREATED_DOC_ENTRY)"
    echo ""
    echo "Press ENTER to execute..."
    read
    curl -s "$BASE_URL/StockTransfers($CREATED_DOC_ENTRY)" | jq . 2>/dev/null || curl -s "$BASE_URL/StockTransfers($CREATED_DOC_ENTRY)"
    echo ""
    echo "Press ENTER to continue..."
    read
fi

# Demo 10: PATCH (Update)
if [ -n "$CREATED_DOC_ENTRY" ]; then
    echo ""
    echo "================================================================"
    echo -e "${BLUE}Demo 10: PATCH - Update${NC}"
    echo "================================================================"
    echo ""
    echo -e "${YELLOW}Command:${NC}"
    echo "curl -X PATCH $BASE_URL/StockTransfers($CREATED_DOC_ENTRY) \\"
    echo "  -H \"Content-Type: application/json\" \\"
    echo "  -d '{\"Comments\": \"Updated by demo\"}'"
    echo ""
    echo "Press ENTER to execute..."
    read
    curl -s -X PATCH "$BASE_URL/StockTransfers($CREATED_DOC_ENTRY)" \
      -H "Content-Type: application/json" \
      -d '{"Comments": "Updated by CURL Demo", "U_WMS_STATUS": "C"}'
    echo -e "${GREEN}✓ Updated${NC}"
    echo ""
    echo "Press ENTER to continue..."
    read
fi

# Demo 11: Verify Update
if [ -n "$CREATED_DOC_ENTRY" ]; then
    echo ""
    echo "================================================================"
    echo -e "${BLUE}Demo 11: Verify Update${NC}"
    echo "================================================================"
    echo ""
    echo -e "${YELLOW}Command:${NC}"
    echo "curl $BASE_URL/StockTransfers($CREATED_DOC_ENTRY)"
    echo ""
    echo "Press ENTER to execute..."
    read
    updated_response=$(curl -s "$BASE_URL/StockTransfers($CREATED_DOC_ENTRY)")
    echo "$updated_response" | jq . 2>/dev/null || echo "$updated_response"

    if echo "$updated_response" | grep -q "Updated by CURL Demo"; then
        echo ""
        echo -e "${GREEN}✓ Update verified!${NC}"
    fi
    echo ""
    echo "Press ENTER to continue..."
    read
fi

# Demo 12: DELETE
if [ -n "$CREATED_DOC_ENTRY" ]; then
    echo ""
    echo "================================================================"
    echo -e "${BLUE}Demo 12: DELETE${NC}"
    echo "================================================================"
    echo ""
    echo -e "${YELLOW}Command:${NC}"
    echo "curl -X DELETE $BASE_URL/StockTransfers($CREATED_DOC_ENTRY)"
    echo ""
    echo "Press ENTER to execute..."
    read
    curl -s -X DELETE "$BASE_URL/StockTransfers($CREATED_DOC_ENTRY)"
    echo -e "${GREEN}✓ Deleted${NC}"
    echo ""
    echo "Press ENTER to continue..."
    read
fi

# Demo 13: Login
echo ""
echo "================================================================"
echo -e "${BLUE}Demo 13: Login${NC}"
echo "================================================================"
echo ""
echo -e "${YELLOW}Command:${NC}"
echo "curl -X POST $BASE_URL/Login \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"UserName\": \"admin\", \"Password\": \"password\"}'"
echo ""
echo "Press ENTER to execute..."
read
login_response=$(curl -s -X POST "$BASE_URL/Login" \
  -H "Content-Type: application/json" \
  -d '{"CompanyDB": "SBODEMOHUN", "UserName": "admin", "Password": "password"}')

echo "$login_response" | jq . 2>/dev/null || echo "$login_response"
session_id=$(echo "$login_response" | jq -r '.SessionId' 2>/dev/null)

if [ -n "$session_id" ] && [ "$session_id" != "null" ]; then
    echo ""
    echo -e "${GREEN}✓ Login successful! SessionId: $session_id${NC}"
fi

echo ""
echo "Press ENTER to continue..."
read

# Final Summary
echo ""
echo "================================================================"
echo -e "  ${CYAN}Demo Complete!${NC}"
echo "================================================================"
echo ""
echo "You've seen:"
echo "  ✅ Basic GET requests"
echo "  ✅ OData \$filter (eq, contains)"
echo "  ✅ OData \$orderby"
echo "  ✅ OData \$top, \$skip (pagination)"
echo "  ✅ OData \$select (field projection)"
echo "  ✅ OData \$count"
echo "  ✅ POST (Create)"
echo "  ✅ GET by ID"
echo "  ✅ PATCH (Update)"
echo "  ✅ DELETE"
echo "  ✅ Login & Authentication"
echo ""
echo "To run the full test suite:"
echo "  npm run test:curl"
echo ""
echo "To see all available commands:"
echo "  cat tests/curl/README.md"
echo ""
echo -e "${GREEN}Thank you for watching the demo!${NC}"
echo ""
