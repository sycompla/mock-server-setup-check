# CURL Test Suite for WMS Mock Backend

Complete HTTP-level testing suite for the WMS Mock Backend using curl commands.

---

## 📋 Test Suites

### 1. Basic Endpoints (`01-basic-endpoints.sh`)
Tests basic GET requests to all major mock backend endpoints.

**Tests (15):**
- ✅ Users
- ✅ Warehouses
- ✅ Items
- ✅ BinLocations
- ✅ Employees
- ✅ Business Partners
- ✅ Stock Transfers
- ✅ Pick Lists
- ✅ Stock Transfer Requests
- ✅ Material Issues
- ✅ Material Receipts
- ✅ Delivery Notes
- ✅ Returns
- ✅ Purchase Deliveries
- ✅ Invoices

### 2. OData Queries (`02-odata-queries.sh`)
Tests OData query parameters ($filter, $orderby, $top, $skip, $select, $count).

**Tests (18):**
- ✅ `$filter` - Equality (eq)
- ✅ `$filter` - Greater than (gt)
- ✅ `$filter` - Less than (lt)
- ✅ `$filter` - Greater or equal (ge)
- ✅ `$filter` - Less or equal (le)
- ✅ `$filter` - Contains
- ✅ `$filter` - StartsWith
- ✅ `$filter` - EndsWith
- ✅ `$filter` - AND logic
- ✅ `$filter` - OR logic
- ✅ `$orderby` - Ascending
- ✅ `$orderby` - Descending
- ✅ `$top` - Limit results
- ✅ `$skip` - Skip results
- ✅ `$select` - Select specific fields
- ✅ `$count` - Get total count
- ✅ Combined queries (filter + orderby + top)
- ✅ Pagination (skip + top + count)

### 3. CRUD Operations (`03-crud-operations.sh`)
Tests Create, Read, Update, Delete operations.

**Tests (13):**
- ✅ POST - Create Stock Transfer
- ✅ POST - Create Pick List
- ✅ GET - Read single entity by ID
- ✅ GET - Read with filtering
- ✅ GET - Read with field selection
- ✅ PATCH - Update entity
- ✅ PATCH - Verify update
- ✅ DELETE - Delete entity
- ✅ DELETE - Verify deletion (404)
- ✅ BATCH - Multiple operations
- ✅ Error: 404 for invalid endpoint
- ✅ Error: 404 for invalid ID
- ✅ Error: 400 for invalid data

### 4. Authentication (`04-authentication.sh`)
Tests login, session, and user permission endpoints.

**Tests (15):**
- ✅ Login with admin credentials
- ✅ Login with warehouse user
- ✅ Login with invalid credentials (401)
- ✅ Get current user info
- ✅ Get specific user by ID
- ✅ Check user permissions
- ✅ Verify superuser flag
- ✅ Get company admin info
- ✅ Verify company name in admin info
- ✅ Check WMS licenses
- ✅ Verify module licenses (WMS_OWTR, WMS_OWTQ, WMS_PICK)
- ✅ Verify license expiration date
- ✅ Filter users by Superuser
- ✅ Filter users by UserCode
- ✅ Get non-superusers

---

## 🚀 Quick Start

### Prerequisites

1. **Start the mock backend server:**
   ```bash
   # In your WMS project
   npm run start:mock
   ```

2. **Verify dependencies:**
   ```bash
   # Required tools
   which curl    # HTTP client
   which jq      # JSON processor (optional but recommended)
   ```

### Run All Tests

```bash
# Run all test suites
bash tests/curl/run-all-tests.sh
```

### Run Individual Test Suites

```bash
# Basic endpoints
bash tests/curl/01-basic-endpoints.sh

# OData queries
bash tests/curl/02-odata-queries.sh

# CRUD operations
bash tests/curl/03-crud-operations.sh

# Authentication
bash tests/curl/04-authentication.sh
```

---

## 📊 Expected Output

### Successful Test Run

```
================================================================
  WMS MOCK BACKEND - CURL TEST SUITE
================================================================

Base URL: http://localhost:8080
Test Directory: ./tests/curl

Checking if mock backend is running ... ✓ Server is running

================================================================

----------------------------------------------------------------
Running Test Suite: Basic Endpoints
----------------------------------------------------------------

======================================
  CURL Test Suite - Basic Endpoints
======================================

Testing: GET /Users ... ✓ PASSED (HTTP 200)
Testing: GET /Warehouses ... ✓ PASSED (HTTP 200)
Testing: GET /Items ... ✓ PASSED (HTTP 200)
...

======================================
  Test Summary
======================================
Total:  15
Passed: 15
Failed: 0

✓ All tests passed!

✓ Basic Endpoints - PASSED

...

================================================================
  FINAL TEST SUMMARY
================================================================

Test Suites:
  Total:  4
  Passed: 4
  Failed: 0

----------------------------------------------------------------

🎉 ALL TEST SUITES PASSED! 🎉

The mock backend is working correctly!
```

---

## 🔧 Configuration

### Base URL

Default: `http://localhost:8080`

To change the base URL, edit the `BASE_URL` variable in each test script:

```bash
BASE_URL="http://your-server:port"
```

### Test Timeout

If tests are timing out, increase the curl timeout:

```bash
# In test scripts, add timeout parameter
curl -s --max-time 30 "$url"
```

---

## 🧪 Manual Testing Examples

### Basic GET Request

```bash
curl http://localhost:8080/b1s/v2/Warehouses
```

### OData Query

```bash
# Filter
curl "http://localhost:8080/b1s/v2/Items?\$filter=ItemCode eq 'ITEM001'"

# Sort
curl "http://localhost:8080/b1s/v2/Items?\$orderby=ItemCode desc"

# Pagination
curl "http://localhost:8080/b1s/v2/Items?\$top=5&\$skip=0"

# Select fields
curl "http://localhost:8080/b1s/v2/Warehouses?\$select=WarehouseCode,WarehouseName"

# Count
curl "http://localhost:8080/b1s/v2/Items?\$count=true"
```

### POST (Create)

```bash
curl -X POST http://localhost:8080/b1s/v2/StockTransfers \
  -H "Content-Type: application/json" \
  -d '{
    "DocDate": "2026-01-30",
    "FromWarehouse": "WH01",
    "ToWarehouse": "WH02",
    "StockTransferLines": [
      {
        "LineNum": 0,
        "ItemCode": "ITEM001",
        "Quantity": 10
      }
    ]
  }'
```

### PATCH (Update)

```bash
curl -X PATCH http://localhost:8080/b1s/v2/StockTransfers(1) \
  -H "Content-Type: application/json" \
  -d '{
    "Comments": "Updated via curl",
    "U_WMS_STATUS": "C"
  }'
```

### DELETE

```bash
curl -X DELETE http://localhost:8080/b1s/v2/StockTransfers(1)
```

### Login

```bash
curl -X POST http://localhost:8080/b1s/v2/Login \
  -H "Content-Type: application/json" \
  -d '{
    "CompanyDB": "SBODEMOHUN",
    "UserName": "admin",
    "Password": "password"
  }'
```

---

## 🐛 Troubleshooting

### Server Not Running

**Error:**
```
✗ Server is not running

Please start the mock backend server first:
  npm run start:mock
```

**Solution:**
```bash
cd /path/to/wms/project
npm run start:mock
```

### jq Not Found

**Error:**
```
jq: command not found
```

**Solution:**
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# Or run tests without jq (limited functionality)
```

### Permission Denied

**Error:**
```
bash: ./01-basic-endpoints.sh: Permission denied
```

**Solution:**
```bash
chmod +x tests/curl/*.sh
```

### Connection Refused

**Error:**
```
curl: (7) Failed to connect to localhost port 8080: Connection refused
```

**Solution:**
- Verify the server is running: `lsof -i :8080`
- Check if the port is correct
- Ensure no firewall is blocking the connection

---

## 📈 Test Statistics

| Test Suite | Tests | Lines of Code | Status |
|------------|-------|---------------|--------|
| Basic Endpoints | 15 | ~120 | ✅ Ready |
| OData Queries | 18 | ~180 | ✅ Ready |
| CRUD Operations | 13 | ~200 | ✅ Ready |
| Authentication | 15 | ~180 | ✅ Ready |
| **TOTAL** | **61** | **~680** | **✅ Complete** |

---

## 🎯 Use Cases

### 1. Development Testing
Run tests during development to verify mock backend functionality:
```bash
# Watch mode (re-run on changes)
watch -n 5 bash tests/curl/run-all-tests.sh
```

### 2. CI/CD Integration
Add to your CI pipeline:
```yaml
# .github/workflows/test.yml
- name: Start mock backend
  run: npm run start:mock &

- name: Wait for server
  run: sleep 5

- name: Run curl tests
  run: bash tests/curl/run-all-tests.sh
```

### 3. API Documentation Validation
Verify that the API behaves as documented:
```bash
bash tests/curl/01-basic-endpoints.sh > api-validation.log
```

### 4. Performance Baseline
Measure response times:
```bash
curl -w "\nTime: %{time_total}s\n" http://localhost:8080/b1s/v2/Items
```

---

## 📝 Adding New Tests

### Template for New Test Script

```bash
#!/bin/bash
set -e

BASE_URL="http://localhost:8080/b1s/v2"
PASSED=0
FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "======================================"
echo "  Your Test Suite Name"
echo "======================================"

# Test helper function
test_operation() {
    local name="$1"
    local url="$2"

    echo -n "Testing: $name ... "

    response=$(curl -s -w "\n%{http_code}" "$url")
    status_code=$(echo "$response" | tail -n 1)

    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((FAILED++))
    fi
}

# Your tests here
test_operation "Test name" "$BASE_URL/YourEndpoint"

# Summary
echo ""
echo "Total:  $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

[ $FAILED -eq 0 ] && exit 0 || exit 1
```

---

## 🔗 Related Documentation

- [Mock Backend Installation](../../MOCK_BACKEND_INSTALL.md)
- [Mock Backend Architecture](../../docs/mock-backend-architektura.md)
- [Developer Guide](../../docs/mock-backend-fejlesztoi-utmutato.md)
- [Test Scenarios](../../TEST_SCENARIOS.md)

---

## 📄 License

This test suite is part of the WMS Mock Backend project.

**Version:** 1.0.0
**Date:** 2026-01-30
**Author:** Claude Code
