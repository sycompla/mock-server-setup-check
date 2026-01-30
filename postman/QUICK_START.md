# ⚡ Postman Quick Start Guide

**Get started with the WMS Mock Backend Postman collection in 5 minutes!**

---

## 🚀 3-Step Setup

### Step 1: Import (1 minute)
```
1. Open Postman
2. Click "Import" (top left)
3. Drag & drop both files:
   ✓ WMS-Mock-Backend.postman_collection.json
   ✓ WMS-Mock-Backend.postman_environment.json
4. Click "Import"
```

### Step 2: Select Environment (10 seconds)
```
1. Click environment dropdown (top right)
2. Select "WMS Mock Backend - Local"
3. ✓ Environment active!
```

### Step 3: Start Server (30 seconds)
```bash
npm run start:mock
```

**✅ Ready! Start testing!**

---

## 🎯 First 5 Requests to Try

### 1️⃣ Login
```
Collection → 01 - Authentication → Login - Admin
Click "Send"
✅ Should see SessionId in response
```

### 2️⃣ Get Warehouses
```
Collection → 02 - Master Data → Warehouses → Get All Warehouses
Click "Send"
✅ Should see 3 warehouses
```

### 3️⃣ Filter Items
```
Collection → 02 - Master Data → Items → Filter Items by Name (contains)
Click "Send"
✅ Should see filtered results
```

### 4️⃣ Create Stock Transfer
```
Collection → 03 - Transactions → Stock Transfers → Create Stock Transfer
Click "Send"
✅ Should get 201 Created with DocEntry
```

### 5️⃣ Run All Tests
```
Click collection name → Click "Run"
Select all requests → Click "Run WMS Mock Backend API"
✅ Should see test results
```

---

## 📋 Collection Overview

```
📬 WMS Mock Backend API (60+ requests)
│
├── 01 - Authentication (4)
│   ├── Login - Admin
│   ├── Login - Warehouse User
│   ├── Login - Invalid (401 test)
│   └── Get Company Info
│
├── 02 - Master Data (13)
│   ├── Users (3 requests)
│   ├── Warehouses (3 requests)
│   ├── Items (5 requests)
│   └── Others (2 requests)
│
├── 03 - Transactions (11)
│   ├── Stock Transfers (6 requests - full CRUD)
│   ├── Pick Lists (3 requests)
│   └── Others (2 requests)
│
├── 04 - OData Advanced (6)
│   ├── Complex filters
│   ├── String functions
│   └── Combined queries
│
├── 05 - Batch Operations (1)
│   └── Multiple requests
│
├── 06 - Error Handling (3)
│   └── 404, 400 tests
│
└── 07 - System & Licenses (1)
    └── Get licenses
```

---

## 🔑 Key Variables

| Variable | Value | Auto-set? |
|----------|-------|-----------|
| `{{baseUrl}}` | http://localhost:8080 | ✓ |
| `{{sessionId}}` | (from login) | ✓ After login |
| `{{createdDocEntry}}` | (from create) | ✓ After POST |

---

## 💡 Common Tasks

### Test Full CRUD Workflow
```
1. Create Stock Transfer    → Status 201 ✓
2. Get by ID               → Status 200 ✓
3. Update                  → Status 204 ✓
4. Delete                  → Status 204 ✓
```

### Test OData Queries
```
1. Filter: ItemCode eq 'ITEM001'
2. Contains: contains(ItemName,'Laptop')
3. OrderBy: $orderby=ItemCode desc
4. Pagination: $top=5&$skip=0
5. Combined: Filter + Sort + Page
```

### Run Test Suite
```
1. Click collection name
2. Click "Run" button
3. Click "Run WMS Mock Backend API"
4. View results
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `ECONNREFUSED` | Start server: `npm run start:mock` |
| `{{baseUrl}} not resolved` | Select environment (top right) |
| `404 Not Found` | Check server is running on port 8080 |
| Tests failing | Check response format matches expectations |

---

## 📊 Test Results

After running collection:
- ✅ **Pass:** Green checkmark
- ❌ **Fail:** Red X with details
- **Summary:** Total passed/failed

---

## 🎓 Next Steps

1. ✅ Run basic requests
2. ✅ Try OData queries
3. ✅ Test CRUD operations
4. ✅ Run full collection
5. 📖 Read [Full README](./README.md)

---

## 🔗 Quick Links

- [Full Documentation](./README.md)
- [CURL Tests](../tests/curl/README.md)
- [Mock Backend Guide](../MOCK_BACKEND_INSTALL.md)

---

**That's it! You're ready to test!** 🚀

**Version:** 1.0.0
**Date:** 2026-01-31
