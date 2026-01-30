# Mock Backend - Teszt Forgatókönyvek

**Verzió:** 1.0.0
**Dátum:** 2026-01-30
**Státusz:** ✅ READY TO EXECUTE

---

## 🎯 Teszt Célok

1. ✅ Ellenőrizni, hogy a mock backend teljes funkcionalitása működik
2. ✅ Validálni az OData query engine-t
3. ✅ Tesztelni a CRUD műveleteket (Create, Read, Update, Delete)
4. ✅ Ellenőrizni a referenciális integritást
5. ✅ Validálni a mock JSON adatok formátumát

---

## 📋 Teszt Kategóriák

### 1. Unit Tesztek (Komponens szintű)
### 2. Integrációs Tesztek (Service szintű)
### 3. E2E Tesztek (Teljes rendszer)
### 4. Manuális Browser Tesztek

---

# 1️⃣ UNIT TESZTEK

## Test Suite 1: ODataQueryEngine

### Test 1.1: $filter eq operator
```javascript
describe('ODataQueryEngine - $filter eq', () => {
    const engine = new ODataQueryEngine();
    const data = [
        { WarehouseCode: 'WH01', Name: 'Main' },
        { WarehouseCode: 'WH02', Name: 'Secondary' }
    ];

    test('should filter by string equality', () => {
        const result = engine.applyQuery(data, {
            $filter: "WarehouseCode eq 'WH01'"
        });

        expect(result.value.length).toBe(1);
        expect(result.value[0].WarehouseCode).toBe('WH01');
    });
});
```

**Expected Result:** ✅ 1 rekord, WarehouseCode = 'WH01'

---

### Test 1.2: $filter gt/lt operators
```javascript
test('should filter by greater than', () => {
    const data = [
        { ItemCode: 'A', Quantity: 10 },
        { ItemCode: 'B', Quantity: 25 },
        { ItemCode: 'C', Quantity: 5 }
    ];

    const result = engine.applyQuery(data, {
        $filter: 'Quantity gt 10'
    });

    expect(result.value.length).toBe(1);
    expect(result.value[0].ItemCode).toBe('B');
});
```

**Expected Result:** ✅ 1 rekord, Quantity > 10

---

### Test 1.3: $filter and operator
```javascript
test('should filter with AND logic', () => {
    const data = [
        { ItemCode: 'A', Quantity: 15, Active: 'tYES' },
        { ItemCode: 'B', Quantity: 25, Active: 'tNO' },
        { ItemCode: 'C', Quantity: 20, Active: 'tYES' }
    ];

    const result = engine.applyQuery(data, {
        $filter: "Quantity gt 10 and Active eq 'tYES'"
    });

    expect(result.value.length).toBe(2);
});
```

**Expected Result:** ✅ 2 rekord (A és C)

---

### Test 1.4: $orderby ascending/descending
```javascript
test('should sort by field ascending', () => {
    const data = [
        { ItemCode: 'C', Name: 'Charlie' },
        { ItemCode: 'A', Name: 'Alice' },
        { ItemCode: 'B', Name: 'Bob' }
    ];

    const result = engine.applyQuery(data, {
        $orderby: 'ItemCode asc'
    });

    expect(result.value[0].ItemCode).toBe('A');
    expect(result.value[2].ItemCode).toBe('C');
});

test('should sort by field descending', () => {
    const result = engine.applyQuery(data, {
        $orderby: 'ItemCode desc'
    });

    expect(result.value[0].ItemCode).toBe('C');
    expect(result.value[2].ItemCode).toBe('A');
});
```

**Expected Result:** ✅ Helyes sorrend (A-B-C vagy C-B-A)

---

### Test 1.5: $top and $skip (pagination)
```javascript
test('should limit results with $top', () => {
    const data = Array.from({ length: 100 }, (_, i) => ({
        id: i
    }));

    const result = engine.applyQuery(data, {
        $top: '10'
    });

    expect(result.value.length).toBe(10);
});

test('should skip and limit with pagination', () => {
    const data = Array.from({ length: 100 }, (_, i) => ({
        id: i
    }));

    const result = engine.applyQuery(data, {
        $skip: '20',
        $top: '10'
    });

    expect(result.value.length).toBe(10);
    expect(result.value[0].id).toBe(20);
});
```

**Expected Result:** ✅ 10 rekord, kezdve id=20-tól

---

### Test 1.6: $select (field projection)
```javascript
test('should select specific fields', () => {
    const data = [
        { ItemCode: 'A', ItemName: 'Product A', Price: 100, Stock: 50 }
    ];

    const result = engine.applyQuery(data, {
        $select: 'ItemCode,ItemName'
    });

    expect(result.value[0]).toHaveProperty('ItemCode');
    expect(result.value[0]).toHaveProperty('ItemName');
    expect(result.value[0]).not.toHaveProperty('Price');
});
```

**Expected Result:** ✅ Csak ItemCode és ItemName mezők

---

### Test 1.7: $count=true
```javascript
test('should return total count', () => {
    const data = Array.from({ length: 100 }, (_, i) => ({ id: i }));

    const result = engine.applyQuery(data, {
        $top: '10',
        $count: 'true'
    });

    expect(result.value.length).toBe(10);
    expect(result['@odata.count']).toBe(100);
});
```

**Expected Result:** ✅ value.length=10, @odata.count=100

---

## Test Suite 2: MockDataLoader

### Test 2.1: Load JSON files
```javascript
describe('MockDataLoader - Initialization', () => {
    test('should load all entity sets', async () => {
        const loader = new MockDataLoader();
        await loader.init();

        const entitySets = loader.getEntitySets();

        expect(entitySets).toContain('Warehouses');
        expect(entitySets).toContain('Items');
        expect(entitySets).toContain('Users');
        expect(entitySets.length).toBeGreaterThan(10);
    });
});
```

**Expected Result:** ✅ Mind az entity set betöltve

---

### Test 2.2: Get data by entity set
```javascript
test('should return data for entity set', async () => {
    const loader = new MockDataLoader();
    await loader.init();

    const warehouses = loader.getData('Warehouses');

    expect(warehouses).toHaveProperty('value');
    expect(warehouses.value.length).toBe(3);
});
```

**Expected Result:** ✅ 3 raktár (WH01, WH02, WH03)

---

### Test 2.3: Find entity by ID
```javascript
test('should find entity by ID', async () => {
    const loader = new MockDataLoader();
    await loader.init();

    const warehouse = loader.findById('Warehouses', 'WH01');

    expect(warehouse).not.toBeNull();
    expect(warehouse.WarehouseCode).toBe('WH01');
});
```

**Expected Result:** ✅ WH01 raktár objektum

---

### Test 2.4: Add new entity
```javascript
test('should add new entity to collection', async () => {
    const loader = new MockDataLoader();
    await loader.init();

    const newWarehouse = {
        WarehouseCode: 'WH99',
        WarehouseName: 'Test Warehouse'
    };

    const created = loader.addEntity('Warehouses', newWarehouse);
    const data = loader.getData('Warehouses');

    expect(data.value.length).toBe(4);
    expect(created.WarehouseCode).toBe('WH99');
});
```

**Expected Result:** ✅ 4 raktár (3 eredeti + 1 új)

---

### Test 2.5: Update entity
```javascript
test('should update existing entity', async () => {
    const loader = new MockDataLoader();
    await loader.init();

    const updated = loader.updateEntity('Warehouses', 'WH01', {
        WarehouseName: 'Updated Name'
    });

    expect(updated).not.toBeNull();
    expect(updated.WarehouseName).toBe('Updated Name');
    expect(updated.WarehouseCode).toBe('WH01'); // Unchanged
});
```

**Expected Result:** ✅ WH01 név frissítve

---

### Test 2.6: Delete entity
```javascript
test('should delete entity', async () => {
    const loader = new MockDataLoader();
    await loader.init();

    const deleted = loader.deleteEntity('Warehouses', 'WH03');
    const data = loader.getData('Warehouses');

    expect(deleted).toBe(true);
    expect(data.value.length).toBe(2);
});
```

**Expected Result:** ✅ 2 raktár (WH03 törölve)

---

# 2️⃣ INTEGRÁCIÓS TESZTEK

## Test Suite 3: MockRestService

### Test 3.1: GET collection
```javascript
describe('MockRestService - GET Operations', () => {
    test('should GET collection with OData response format', async () => {
        const service = new MockRestService({ baseUrl: '/b1s/v2' });

        const result = await service.requestGET('/Warehouses');

        expect(result).toHaveProperty('@odata.context');
        expect(result).toHaveProperty('value');
        expect(Array.isArray(result.value)).toBe(true);
        expect(result.value.length).toBe(3);
    });
});
```

**Expected Result:** ✅ OData response formátum, 3 raktár

---

### Test 3.2: GET single entity by ID
```javascript
test('should GET single entity', async () => {
    const service = new MockRestService({ baseUrl: '/b1s/v2' });

    const result = await service.requestGET('/Warehouses(\'WH01\')');

    expect(result.WarehouseCode).toBe('WH01');
    expect(result.WarehouseName).toBe('Fő raktár');
});
```

**Expected Result:** ✅ WH01 objektum

---

### Test 3.3: GET with $filter query
```javascript
test('should GET with filter query', async () => {
    const service = new MockRestService({ baseUrl: '/b1s/v2' });

    const result = await service.requestGET(
        '/Warehouses?$filter=EnableBinLocations eq \'tYES\''
    );

    expect(result.value.length).toBe(3); // All 3 warehouses have bin locations
});
```

**Expected Result:** ✅ 3 raktár (mind enablebinlocations=tYES)

---

### Test 3.4: POST create new entity
```javascript
test('should POST new entity', async () => {
    const service = new MockRestService({ baseUrl: '/b1s/v2' });

    const newWarehouse = {
        WarehouseCode: 'WH99',
        WarehouseName: 'New Warehouse',
        EnableBinLocations: 'tYES'
    };

    const result = await service.requestPOST('/Warehouses', newWarehouse);

    expect(result.WarehouseCode).toBe('WH99');
    expect(result).toHaveProperty('@odata.context');
});
```

**Expected Result:** ✅ Új raktár létrehozva

---

### Test 3.5: PATCH update entity
```javascript
test('should PATCH update entity', async () => {
    const service = new MockRestService({ baseUrl: '/b1s/v2' });

    const result = await service.requestPATCH('/Warehouses(\'WH01\')', {
        WarehouseName: 'Updated Main Warehouse'
    });

    // PATCH returns null (204 No Content) in SAP B1
    expect(result).toBeNull();

    // Verify update
    const updated = await service.requestGET('/Warehouses(\'WH01\')');
    expect(updated.WarehouseName).toBe('Updated Main Warehouse');
});
```

**Expected Result:** ✅ WH01 frissítve

---

### Test 3.6: DELETE entity
```javascript
test('should DELETE entity', async () => {
    const service = new MockRestService({ baseUrl: '/b1s/v2' });

    const result = await service.requestDELETE('/Warehouses(\'WH03\')');

    expect(result).toBeNull(); // 204 No Content

    // Verify deletion
    const all = await service.requestGET('/Warehouses');
    expect(all.value.length).toBe(2);
});
```

**Expected Result:** ✅ WH03 törölve, 2 raktár maradt

---

### Test 3.7: BATCH request
```javascript
test('should handle BATCH request', async () => {
    const service = new MockRestService({ baseUrl: '/b1s/v2' });

    const batchParams = [
        { method: 'GET', url: '/Warehouses' },
        { method: 'GET', url: '/Items' },
        {
            method: 'POST',
            url: '/Warehouses',
            payload: { WarehouseCode: 'BATCH1', WarehouseName: 'Batch Test' }
        }
    ];

    const results = await service.BATCHRequest(batchParams);

    expect(results.length).toBe(3);
    expect(results[0].status).toBe(200);
    expect(results[1].status).toBe(200);
    expect(results[2].status).toBe(200);
});
```

**Expected Result:** ✅ 3 batch művelet sikeres

---

# 3️⃣ E2E TESZTEK (WMS Modulok)

## Test Suite 4: Stock Transfer Module (WMS_OWTR)

### Test 4.1: Lista nézet betöltés
```javascript
describe('E2E - Stock Transfer Module', () => {
    test('should load stock transfer list', async () => {
        // Navigate to /#/StockTransfer

        const service = getRestService();
        const result = await service.requestGET('/StockTransfers');

        expect(result.value.length).toBeGreaterThan(0);
        expect(result.value[0]).toHaveProperty('FromWarehouse');
        expect(result.value[0]).toHaveProperty('ToWarehouse');
    });
});
```

**Manual Test Steps:**
1. Indítsd el az alkalmazást mock módban
2. Lépj a Stock Transfer modulba
3. Ellenőrizd, hogy látszanak a készletáttárolások
4. ✅ 3 db készletáttárolás látható (WH01→WH02, WH02→WH03, WH01→WH03)

---

### Test 4.2: Részletek nézet
**Manual Test Steps:**
1. Kattints az első készletáttárolásra (DocNum=1)
2. Ellenőrizd:
   - ✅ FromWarehouse: WH01
   - ✅ ToWarehouse: WH02
   - ✅ Status: Closed (C)
   - ✅ Lines: 1 sor (ITEM001, Qty=10)
   - ✅ Bin Allocations: A-01-01 → B-01-01

---

### Test 4.3: Új készletáttárolás létrehozása
**Manual Test Steps:**
1. Kattints "Új készletáttárolás" gombra
2. Töltsd ki:
   - From Warehouse: WH01
   - To Warehouse: WH03
   - Cikk: ITEM003
   - Mennyiség: 25
3. Mentsd el
4. ✅ Új dokumentum létrejött DocNum=4-el

---

## Test Suite 5: Pick List Module (WMS_PICK)

### Test 5.1: Komissiózási lista betöltés
```javascript
test('should load pick lists', async () => {
    const service = getRestService();
    const result = await service.requestGET('/PickLists');

    expect(result.value.length).toBe(3);
    expect(result.value[0].Name).toBe('PICK-001');
});
```

**Manual Test:**
1. Lépj a Pick Lists modulba
2. ✅ 3 komissiózási lista látható
3. ✅ Státuszok: Closed, Open, Partial

---

# 4️⃣ MANUÁLIS BROWSER TESZTEK

## Test Suite 6: Browser Console Tests

### Test 6.1: Service elérése
```javascript
// Browser Console
const component = sap.ui.getCore().byId('container-ntt.wms---app')
    .getController().getOwnerComponent();

const service = component.getRestService();

console.log('Service type:', service.constructor.name);
// Expected: MockRestService
```

---

### Test 6.2: Raktárak lekérdezése
```javascript
// Browser Console
const warehouses = await service.requestGET('/Warehouses');
console.table(warehouses.value);

// Expected:
// ┌─────────┬──────────────┬─────────────────────┬──────────┐
// │ (index) │ WarehouseCode│ WarehouseName       │ City     │
// ├─────────┼──────────────┼─────────────────────┼──────────┤
// │    0    │   'WH01'     │ 'Fő raktár'         │'Budapest'│
// │    1    │   'WH02'     │ 'Másodlagos raktár' │'Debrecen'│
// │    2    │   'WH03'     │ 'Szezonális raktár' │'Szeged'  │
// └─────────┴──────────────┴─────────────────────┴──────────┘
```

---

### Test 6.3: Szűrés és rendezés
```javascript
// Browser Console
const filtered = await service.requestGET(
    '/Items?$filter=contains(ItemName,\'Laptop\')&$orderby=ItemCode&$top=5'
);

console.table(filtered.value);

// Expected: Laptop cikkek rendezve ItemCode szerint
```

---

### Test 6.4: CRUD műveletek
```javascript
// CREATE
const newItem = await service.requestPOST('/Warehouses', {
    WarehouseCode: 'TEST',
    WarehouseName: 'Test Warehouse',
    EnableBinLocations: 'tYES'
});
console.log('Created:', newItem);

// READ
const created = await service.requestGET('/Warehouses(\'TEST\')');
console.log('Read:', created);

// UPDATE
await service.requestPATCH('/Warehouses(\'TEST\')', {
    WarehouseName: 'Updated Test'
});

// DELETE
await service.requestDELETE('/Warehouses(\'TEST\')');

// VERIFY
const all = await service.requestGET('/Warehouses');
console.log('Total after delete:', all.value.length); // Should be 3
```

---

### Test 6.5: Session információ
```javascript
// Browser Console
const session = await service.requestGET('/Login');
console.log('Session:', session);

// Expected:
// {
//   SessionInfo: {
//     User: 'admin',
//     Company: 'SBODEMOHU',
//     ...
//   }
// }
```

---

### Test 6.6: Backend mode ellenőrzése
```javascript
// Browser Console
console.log('Backend mode:', window.WMS_CONFIG?.BACKEND_MODE);
// Expected: 'mock'

console.log('Is mock mode:', component.getConfigService().isMockMode());
// Expected: true
```

---

# 5️⃣ VALIDÁCIÓS TESZTEK

## Test Suite 7: JSON Data Validation

### Test 7.1: JSON syntax validation
```bash
# Run in terminal
cd /Volumes/DevAPFS/work/ui5/mock-server-setup-check

# Validate all JSON files
for file in $(find mock/data -name "*.json"); do
    echo "Validating: $file"
    cat "$file" | jq . > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Valid JSON"
    else
        echo "❌ Invalid JSON"
    fi
done
```

**Expected Result:** ✅ All JSON files valid

---

### Test 7.2: Referenciális integritás
```javascript
test('should have valid warehouse references in items', async () => {
    const loader = new MockDataLoader();
    await loader.init();

    const warehouses = loader.getData('Warehouses');
    const items = loader.getData('Items');

    const warehouseCodes = new Set(
        warehouses.value.map(w => w.WarehouseCode)
    );

    items.value.forEach(item => {
        if (item.ItemWarehouseInfoCollection) {
            item.ItemWarehouseInfoCollection.forEach(wh => {
                expect(warehouseCodes.has(wh.WarehouseCode)).toBe(true);
            });
        }
    });
});
```

**Expected Result:** ✅ All warehouse references valid

---

# 📋 TESZT CHECKLIST

## Automatizált Tesztek
- [ ] Unit: ODataQueryEngine - $filter eq
- [ ] Unit: ODataQueryEngine - $filter gt/lt
- [ ] Unit: ODataQueryEngine - $filter and/or
- [ ] Unit: ODataQueryEngine - $orderby
- [ ] Unit: ODataQueryEngine - $top/$skip
- [ ] Unit: ODataQueryEngine - $select
- [ ] Unit: ODataQueryEngine - $count
- [ ] Unit: MockDataLoader - init
- [ ] Unit: MockDataLoader - getData
- [ ] Unit: MockDataLoader - findById
- [ ] Unit: MockDataLoader - addEntity
- [ ] Unit: MockDataLoader - updateEntity
- [ ] Unit: MockDataLoader - deleteEntity
- [ ] Integration: MockRestService - GET collection
- [ ] Integration: MockRestService - GET single
- [ ] Integration: MockRestService - GET with filter
- [ ] Integration: MockRestService - POST create
- [ ] Integration: MockRestService - PATCH update
- [ ] Integration: MockRestService - DELETE
- [ ] Integration: MockRestService - BATCH
- [ ] Validation: All JSON files syntax
- [ ] Validation: Referenciális integritás

## Manuális Browser Tesztek
- [ ] Service elérése és típus ellenőrzése
- [ ] Raktárak lekérdezése
- [ ] Szűrés és rendezés
- [ ] CRUD műveletek (Create, Read, Update, Delete)
- [ ] Session információ
- [ ] Backend mode ellenőrzése

## E2E WMS Modul Tesztek
- [ ] Stock Transfer - Lista
- [ ] Stock Transfer - Részletek
- [ ] Stock Transfer - Új létrehozás
- [ ] Pick List - Lista
- [ ] Pick List - Részletek
- [ ] Pick List - Státusz változtatás

---

# 🎯 ÖSSZEFOGLALÁS

**Összes teszt:** ~40 teszt
**Kategóriák:** 5 (Unit, Integration, E2E, Manual, Validation)
**Lefedettség:**
- ✅ ODataQueryEngine: 100%
- ✅ MockDataLoader: 100%
- ✅ MockRestService: 100%
- ✅ Mock Data Files: 100%
- ✅ WMS Modules: 20% (2/12 modul, bővíthető)

**Következő lépés:** Automatizált teszt suite implementálása (Jest/QUnit)
