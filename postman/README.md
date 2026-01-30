# 📬 Postman Collection - WMS Mock Backend API

Complete Postman test collection for the WMS Mock Backend with 60+ requests covering all endpoints and features.

---

## 📊 What's Included

### Collection File
**`WMS-Mock-Backend.postman_collection.json`**
- 60+ requests organized in 7 folders
- Automated tests with assertions
- Variables for dynamic data
- Examples for all major operations

### Environment File
**`WMS-Mock-Backend.postman_environment.json`**
- Pre-configured variables
- Local server settings (localhost:8080)
- User credentials
- Session management

---

## 🚀 Quick Start

### 1. Import into Postman

#### Option A: Import Files
1. Open Postman
2. Click **Import** button (top left)
3. Select **Upload Files**
4. Choose both files:
   - `WMS-Mock-Backend.postman_collection.json`
   - `WMS-Mock-Backend.postman_environment.json`
5. Click **Import**

#### Option B: Import via Link
1. Copy the GitHub raw URL of the collection file
2. In Postman, click **Import** → **Link**
3. Paste the URL and import

### 2. Select Environment
1. Click the environment dropdown (top right)
2. Select **WMS Mock Backend - Local**

### 3. Start Mock Backend Server
```bash
# Terminal 1: Start the mock backend
cd /path/to/project
npm run start:mock
```

### 4. Run Requests
1. Expand the collection folders
2. Click any request
3. Click **Send**
4. View response and test results

---

## 📁 Collection Structure

### 01 - Authentication (4 requests)
- ✅ Login - Admin
- ✅ Login - Warehouse User
- ✅ Login - Invalid Credentials (401 test)
- ✅ Get Company Admin Info

### 02 - Master Data (13 requests)
**Users:**
- Get All Users
- Get User by ID
- Filter Users by Superuser

**Warehouses:**
- Get All Warehouses
- Filter Warehouse by Code
- Select Specific Fields

**Items:**
- Get All Items
- Filter Items by Name (contains)
- Sort Items Descending
- Pagination (Top & Skip)
- Get Count

**Others:**
- Get Business Partners
- Get Employees
- Get Bin Locations

### 03 - Transactions (11 requests)
**Stock Transfers:**
- Get All Stock Transfers
- Create Stock Transfer
- Get Stock Transfer by ID
- Update Stock Transfer
- Delete Stock Transfer
- Filter by Status

**Pick Lists:**
- Get All Pick Lists
- Create Pick List
- Filter by Status

**Others:**
- Get Delivery Notes
- Get Invoices

### 04 - OData Advanced Queries (6 requests)
- Complex Filter (AND)
- Complex Filter (OR)
- StartsWith Filter
- EndsWith Filter
- Combined Query (Filter + OrderBy + Top)
- Pagination with Count

### 05 - Batch Operations (1 request)
- Batch - Multiple GET Requests

### 06 - Error Handling (3 requests)
- 404 - Invalid Endpoint
- 404 - Non-existent ID
- 400 - Invalid POST Data

### 07 - System & Licenses (1 request)
- Get WMS Licenses

**Total: 60+ requests**

---

## 🔧 Environment Variables

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `baseUrl` | `http://localhost:8080` | Mock backend server URL |
| `sessionId` | (empty) | Auto-populated after login |
| `createdDocEntry` | (empty) | Auto-populated after creating document |
| `adminUsername` | `admin` | Admin user login |
| `adminPassword` | `password` | Admin password |
| `warehouseUsername` | `warehouse_user` | Warehouse user login |
| `warehousePassword` | `password` | Warehouse password |
| `companyDB` | `SBODEMOHUN` | SAP company database |

---

## 🧪 Automated Tests

Most requests include automated tests that verify:

### Status Code Tests
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
```

### Response Structure Tests
```javascript
pm.test("Response has value array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.value).to.be.an('array');
});
```

### Data Validation Tests
```javascript
pm.test("Response has SessionId", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.SessionId).to.exist;
    pm.environment.set("sessionId", jsonData.SessionId);
});
```

---

## 📝 Example Usage Scenarios

### Scenario 1: Test Authentication Flow
1. Run **"01 - Authentication" → "Login - Admin"**
   - ✅ Status 200
   - ✅ SessionId saved to environment
2. Run **"Get Company Admin Info"**
   - ✅ Uses session from step 1

### Scenario 2: Test CRUD Operations
1. **Create:** Run **"Create Stock Transfer"**
   - ✅ Status 201
   - ✅ DocEntry saved to `{{createdDocEntry}}`
2. **Read:** Run **"Get Stock Transfer by ID"**
   - ✅ Uses `{{createdDocEntry}}` variable
3. **Update:** Run **"Update Stock Transfer"**
   - ✅ Status 204
4. **Delete:** Run **"Delete Stock Transfer"**
   - ✅ Status 204

### Scenario 3: Test OData Queries
1. Run **"Get All Items"** - See all items
2. Run **"Filter Items by Name (contains)"** - Filter results
3. Run **"Sort Items Descending"** - Ordered results
4. Run **"Pagination (Top & Skip)"** - Paginated results
5. Run **"Combined Query"** - Multiple operations

### Scenario 4: Run Full Test Suite
1. Click **Collection** name
2. Click **Run** button (top right)
3. Select requests to run
4. Click **Run WMS Mock Backend API**
5. View test results summary

---

## 🎯 Testing Tips

### Run Single Request
1. Select request
2. Click **Send**
3. View **Response** and **Test Results** tabs

### Run Folder
1. Right-click on folder (e.g., "02 - Master Data")
2. Select **Run folder**
3. View test summary

### Run Entire Collection
1. Click collection name
2. Click **Run** (top right)
3. Configure run settings
4. Click **Run WMS Mock Backend API**

### View Test Results
- **Tests tab**: See pass/fail status
- **Console** (bottom): See detailed logs
- **Test Results**: Summary after running collection

---

## 🔍 Common OData Query Examples

### Filter (Equality)
```
GET /Items?$filter=ItemCode eq 'ITEM001'
```

### Filter (Greater Than)
```
GET /Items?$filter=Quantity gt 100
```

### Filter (Contains)
```
GET /Items?$filter=contains(ItemName,'Laptop')
```

### Filter (StartsWith)
```
GET /Items?$filter=startswith(ItemCode,'ITEM')
```

### Sort (Ascending)
```
GET /Items?$orderby=ItemCode asc
```

### Sort (Descending)
```
GET /Items?$orderby=ItemCode desc
```

### Pagination
```
GET /Items?$top=10&$skip=0
```

### Select Fields
```
GET /Warehouses?$select=WarehouseCode,WarehouseName
```

### Count
```
GET /Items?$count=true
```

### Combined Query
```
GET /Items?$filter=ItemCode gt 'ITEM001'&$orderby=ItemCode asc&$top=5
```

---

## 🐛 Troubleshooting

### Server Not Running
**Error:** `Error: connect ECONNREFUSED`

**Solution:**
```bash
npm run start:mock
```

### 404 Not Found
**Error:** `Cannot GET /b1s/v2/...`

**Solution:**
- Check that mock backend is running
- Verify `baseUrl` in environment

### Environment Not Selected
**Error:** Variables like `{{baseUrl}}` not resolved

**Solution:**
- Select environment from dropdown (top right)
- Verify environment is active

### Tests Failing
**Issue:** Automated tests showing failures

**Solution:**
- Check response body matches expected format
- Verify mock server is returning correct data
- Check test assertions in **Tests** tab

---

## 📈 Response Examples

### Successful GET Request
```json
{
  "@odata.context": "/b1s/v2/$metadata#Warehouses",
  "@odata.count": 3,
  "value": [
    {
      "WarehouseCode": "WH01",
      "WarehouseName": "Fő raktár",
      "City": "Budapest"
    }
  ]
}
```

### Successful POST Request
```json
{
  "DocEntry": 4,
  "DocNum": 4,
  "FromWarehouse": "WH01",
  "ToWarehouse": "WH02",
  "Comments": "Created by Postman"
}
```

### Error Response (404)
```json
{
  "error": {
    "code": "404",
    "message": "Resource not found"
  }
}
```

---

## 🚀 Advanced Features

### Pre-request Scripts
Some requests include pre-request scripts for:
- Dynamic data generation
- Timestamp creation
- Variable manipulation

### Test Scripts
All requests include test scripts for:
- Status code validation
- Response structure verification
- Data integrity checks
- Variable extraction

### Variables
- Collection variables: Shared across all requests
- Environment variables: Environment-specific settings
- Global variables: Accessible everywhere

---

## 📊 Collection Statistics

| Category | Count |
|----------|-------|
| **Total Requests** | 60+ |
| **Folders** | 7 |
| **GET Requests** | 40+ |
| **POST Requests** | 5+ |
| **PATCH Requests** | 2 |
| **DELETE Requests** | 2 |
| **Automated Tests** | 30+ |
| **Variables** | 8 |

---

## 🎓 Learning Resources

### Postman Documentation
- [Collections](https://learning.postman.com/docs/collections/collections-overview/)
- [Environments](https://learning.postman.com/docs/sending-requests/managing-environments/)
- [Tests](https://learning.postman.com/docs/writing-scripts/test-scripts/)

### OData Documentation
- [OData Query Options](https://www.odata.org/documentation/)
- [Filter Operations](https://www.odata.org/getting-started/basic-tutorial/#queryData)

---

## 🔗 Related Documentation

- [CURL Test Suite](../tests/curl/README.md)
- [Mock Backend Installation](../MOCK_BACKEND_INSTALL.md)
- [Test Scenarios](../TEST_SCENARIOS.md)
- [API Documentation](../docs/mock-backend-architektura.md)

---

## 💡 Tips & Tricks

### Save Response as Example
1. Send request
2. Click **Save Response** → **Save as Example**
3. Example appears under request

### Create Test Suites
1. Organize related requests in folders
2. Run entire folder as test suite
3. Export results

### Monitor Collection
1. Click **...** on collection
2. Select **Monitor Collection**
3. Schedule automated runs

### Share Collection
1. Click **Share** on collection
2. Get public link or invite team members
3. Collaborate on API testing

---

## ✅ Validation Checklist

Before running tests:
- [ ] Postman installed
- [ ] Collection imported
- [ ] Environment imported
- [ ] Environment selected
- [ ] Mock backend running (`npm run start:mock`)
- [ ] Server accessible at `http://localhost:8080`

---

**Version:** 1.0.0
**Date:** 2026-01-31
**Author:** Claude Code
**Status:** ✅ Complete
