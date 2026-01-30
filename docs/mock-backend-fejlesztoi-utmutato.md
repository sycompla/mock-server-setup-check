# Mock Backend - Fejlesztői Útmutató

Részletes útmutató a WMS alkalmazás mock backend rendszerének használatához fejlesztők számára.

---

## Tartalom

1. [Gyors Kezdés](#gyors-kezdés)
2. [Konfiguráció](#konfiguráció)
3. [Mock Adatok Kezelése](#mock-adatok-kezelése)
4. [Development Workflow](#development-workflow)
5. [Új Mock Service Hozzáadása](#új-mock-service-hozzáadása)
6. [Tesztelés](#tesztelés)
7. [Gyakori Fejlesztési Feladatok](#gyakori-fejlesztési-feladatok)
8. [Best Practices](#best-practices)

---

## Gyors Kezdés

### 1. Environment Setup

```bash
# Navigate to project
cd /Volumes/DevAPFS/work/ui5/wms

# Copy environment template
cp .env.example .env

# Edit .env file
nano .env
```

**.env tartalma mock módhoz:**
```bash
BACKEND_MODE=mock
MOCK_DATA_PATH=/mock
```

### 2. Mock Adatok Generálása

```bash
# Generáld a mock adatokat
npm run generate:mock-data

# Ellenőrizd, hogy létrejöttek
ls -la wms/webapp/mock/data/master/
ls -la wms/webapp/mock/data/transactions/
```

### 3. Alkalmazás Indítása Mock Módban

```bash
# Indítás mock backend-del
npm run start:mock

# Vagy normál indítás (ha .env-ben BACKEND_MODE=mock)
npm run start
```

### 4. Ellenőrzés

Böngészőben:
- Nyisd meg: http://localhost:8080
- Konzolban látszódik: `[AppConfig] Backend mode: mock`
- Jelentkezz be mock user-rel: `admin` / `password`

---

## Konfiguráció

### Environment Variables (.env)

**Alapértelmezett konfiguráció:**

```bash
# ============================================
# Backend Mode
# ============================================
BACKEND_MODE=mock          # 'real' | 'mock'
MOCK_DATA_PATH=/mock       # Mock adatok mappája

# ============================================
# Debug Options
# ============================================
MOCK_DEBUG=true            # Mock service debug logging
MOCK_LATENCY=0             # Simulated latency (ms)

# ============================================
# Real Backend URLs (csak BACKEND_MODE=real esetén)
# ============================================
REAL_BACKEND_B1S=/b1s/v2
REAL_BACKEND_ODBC=./ODBC
REAL_BACKEND_WMS=/wms
```

### Runtime Konfiguráció (index.html)

Ha nem használsz build-time .env feldolgozást, akkor az `index.html`-ben:

```html
<!DOCTYPE html>
<html>
<head>
    <script>
        // Runtime config injection
        window.WMS_CONFIG = {
            BACKEND_MODE: 'mock',
            MOCK_DATA_PATH: '/mock',
            MOCK_DEBUG: true
        };
    </script>

    <!-- UI5 Bootstrap -->
    <script id="sap-ui-bootstrap" ...>
    </script>
</head>
<body class="sapUiBody sapUiSizeCompact" id="content">
    <div data-sap-ui-component ...></div>
</body>
</html>
```

### URL Paraméter Alapú Váltás

**Gyors váltás fejlesztés közben:**

```bash
# Mock mód kényszerítése
http://localhost:8080/index.html?mock=true

# Real mód kényszerítése
http://localhost:8080/index.html?mock=false
```

**AppConfig.ts támogatja az URL paramétereket:**

```typescript
// URL param prioritása magasabb mint .env
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('mock')) {
    mode = urlParams.get('mock') === 'true' ? 'mock' : 'real';
}
```

---

## Mock Adatok Kezelése

### Könyvtárstruktúra

```
wms/webapp/mock/data/
├── master/
│   ├── users.json              # Felhasználók
│   ├── warehouses.json         # Raktárak
│   ├── binlocations.json       # Raktárhelyek
│   ├── items.json              # Cikkek
│   ├── employees.json          # Alkalmazottak
│   └── businesspartners.json   # Üzleti partnerek
│
├── transactions/
│   ├── stocktransfers.json           # Készletáttárolások
│   ├── stocktransferrequests.json    # Áttárolási kérelmek
│   ├── materialreceipts.json         # Anyagbevételek
│   ├── materialissues.json           # Anyagkiadások
│   ├── picklists.json                # Komissiózási listák
│   └── ... (további 6 modul)
│
├── system/
│   ├── session.json            # Session információk
│   ├── licenses.json           # WMS licenszek
│   ├── admininfo.json          # Admin info
│   └── modules.json            # Modul beállítások
│
└── views/
    └── items-view.json         # Custom OData view-k
```

### JSON Fájl Formátumok

#### Master Data (Collection)

**warehouses.json példa:**

```json
{
  "@odata.context": "/b1s/v2/$metadata#Warehouses",
  "@odata.count": 3,
  "value": [
    {
      "WarehouseCode": "WH01",
      "WarehouseName": "Fő raktár",
      "EnableBinLocations": "tYES",
      "Inactive": "tNO"
    },
    {
      "WarehouseCode": "WH02",
      "WarehouseName": "Másodlagos raktár",
      "EnableBinLocations": "tYES",
      "Inactive": "tNO"
    }
  ]
}
```

**Fontos mezők:**
- `@odata.context` - OData metadata URL
- `@odata.count` - Teljes rekordszám (optional)
- `value` - Adatok tömbje

#### Transaction Documents

**stocktransfers.json példa:**

```json
{
  "@odata.context": "/b1s/v2/$metadata#StockTransfers",
  "idCounter": 100,
  "value": [
    {
      "DocEntry": 1,
      "DocNum": 1,
      "DocDate": "2026-01-15",
      "FromWarehouse": "WH01",
      "ToWarehouse": "WH02",
      "StockTransferLines": [
        {
          "LineNum": 0,
          "ItemCode": "ITEM001",
          "Quantity": 10,
          "StockTransferLinesBinAllocations": [
            {
              "BinAbsEntry": 1,
              "Quantity": 10,
              "BinActionType": "batFromWarehouse"
            }
          ]
        }
      ]
    }
  ]
}
```

**Speciális mezők:**
- `idCounter` - Következő DocEntry ID POST műveletekhez
- Nested arrays - Lines, BinAllocations, stb.

#### Users (Special Format)

**users.json példa:**

```json
{
  "@odata.context": "/b1s/v2/$metadata#Users",
  "entities": {
    "1": {
      "InternalKey": 1,
      "UserCode": "admin",
      "UserName": "Administrator",
      "Superuser": "tYES",
      "UserPermission": [
        { "PermissionID": "ITCORE_WMS", "Permission": "boper_Full" }
      ]
    },
    "2": {
      "InternalKey": 2,
      "UserCode": "warehouse_user",
      "UserName": "Raktáros"
    }
  },
  "currentUserId": "1"
}
```

**Miért map formátum?**
- Gyorsabb lookup: `users.entities[userId]`
- Egyedi formátum a jelenlegi user jelölésére

### Új Mock Adat Hozzáadása

#### 1. Manuális Létrehozás

```bash
# Új JSON fájl létrehozása
nano wms/webapp/mock/data/master/customers.json
```

```json
{
  "@odata.context": "/b1s/v2/$metadata#BusinessPartners",
  "@odata.count": 5,
  "value": [
    {
      "CardCode": "C00001",
      "CardName": "Teszt Ügyfél Kft.",
      "CardType": "cCustomer",
      "Currency": "HUF",
      "Phone1": "+36301234567"
    }
  ]
}
```

#### 2. Script Alapú Generálás

**Hozz létre generátor script-et:**

```javascript
// scripts/generateCustomers.js
const fs = require('fs');
const path = require('path');

function generateCustomers(count = 20) {
    const customers = [];

    for (let i = 1; i <= count; i++) {
        customers.push({
            CardCode: `C${String(i).padStart(5, '0')}`,
            CardName: `Teszt Ügyfél ${i} Kft.`,
            CardType: 'cCustomer',
            Currency: 'HUF',
            Phone1: `+3630${Math.floor(1000000 + Math.random() * 9000000)}`,
            EmailAddress: `customer${i}@example.com`
        });
    }

    const data = {
        "@odata.context": "/b1s/v2/$metadata#BusinessPartners",
        "@odata.count": customers.length,
        "value": customers
    };

    const outputPath = path.join(__dirname, '../wms/webapp/mock/data/master/customers.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

    console.log(`✅ Generated ${count} customers → ${outputPath}`);
}

generateCustomers(20);
```

**Futtatás:**

```bash
node scripts/generateCustomers.js
```

#### 3. Referenciális Integritás

**Fontos:** Mock adatok között hivatkozások konzisztensek legyenek!

**Példa - Items hivatkozik Warehouses-ra:**

```json
// items.json
{
  "value": [
    {
      "ItemCode": "ITEM001",
      "ItemWarehouseInfoCollection": [
        {
          "WarehouseCode": "WH01",  // ← Léteznie kell warehouses.json-ban!
          "InStock": 100
        }
      ]
    }
  ]
}
```

**MockDataLoader validálja induláskor:**

```typescript
// Console warning ha rossz referencia
⚠️  [MockDataLoader] Invalid reference: Item 'ITEM001'
    references Warehouse 'WH99' which doesn't exist
```

---

## Development Workflow

### Scenario 1: Új Funkció Fejlesztése Mock Adatokkal

```bash
# 1. Mock mód bekapcsolása
echo "BACKEND_MODE=mock" > .env

# 2. Új mock adatok készítése az új funkcióhoz
nano wms/webapp/mock/data/transactions/new-feature.json

# 3. Fejlesztés
npm run start:mock

# 4. Tesztelés mock adatokkal
# ... kódolás, tesztelés ...

# 5. Real backend tesztelés
echo "BACKEND_MODE=real" > .env
npm run start

# 6. Commit
git add wms/webapp/mock/data/transactions/new-feature.json
git commit -m "Add mock data for new feature"
```

### Scenario 2: Frontend-First Fejlesztés

**Amikor a backend API még nem létezik:**

```bash
# 1. Tervezd meg az API response formátumot
# 2. Hozd létre a mock JSON-t az elvárt struktúrával
# 3. Fejlessz a mock alapján
# 4. Amikor a backend elkészül, válts real módra
```

**Példa - Új API endpoint mock-olása:**

```json
// mock/data/custom/new-api-response.json
{
  "success": true,
  "data": {
    "reportId": "REP123",
    "downloadUrl": "/reports/REP123.pdf",
    "generatedAt": "2026-01-30T10:00:00Z"
  }
}
```

**MockRestService hook:**

```typescript
// Specifikus endpoint mock-olása
if (path === '/CustomReports/Generate') {
    return this.loadMockFile('custom/new-api-response.json');
}
```

### Scenario 3: Bug Reprodukálás Mock Adatokkal

```bash
# 1. Készíts mock adatot ami reprodukálja a bug-ot
cp wms/webapp/mock/data/transactions/stocktransfers.json \
   wms/webapp/mock/data/custom/bug-stocktransfer.json

# 2. Szerkeszd a custom file-t a hibás állapot létrehozásához
nano wms/webapp/mock/data/custom/bug-stocktransfer.json
# Pl.: Hiányzó FromWarehouse, negatív Quantity, stb.

# 3. MockDataLoader-ben prioritizáld a custom file-t
# (vagy manually load in test)

# 4. Reprodukáld és fix-eld a bug-ot

# 5. Commit a bug reprodukáló mock adatot (regressziós teszthez)
git add wms/webapp/mock/data/custom/bug-stocktransfer.json
git commit -m "Add mock data to reproduce issue #123"
```

### Scenario 4: Team Collaboration

**Több fejlesztő párhuzamos munkája:**

```bash
# Developer A - Mock adatok módosítása
git checkout -b feature/warehouse-management
# ... mock adatok módosítása ...
git add wms/webapp/mock/data/master/warehouses.json
git commit -m "Add new warehouses for testing"
git push origin feature/warehouse-management

# Developer B - Saját mock adatok (nem committálva)
# .gitignore miatt custom/ mappa nem kerül git-be
mkdir -p wms/webapp/mock/data/custom/
nano wms/webapp/mock/data/custom/my-test-data.json
# ... lokális tesztelés ...
```

**Best Practice:**
- Közös mock adatok: `master/`, `transactions/`, `system/` → Git-ben
- Fejlesztő-specifikus: `custom/` → `.gitignore`-ban

---

## Új Mock Service Hozzáadása

### 1. Service Interface Definiálása

**Példa: CrystalReportsService mock-olása**

```typescript
// wms/webapp/services/CrystalReportsService.ts (meglévő)
export default class CrystalReportsService {
    async generateReport(reportCode: string, params: any): Promise<Blob> {
        // Real implementation
    }

    async getReportParameters(reportCode: string): Promise<any> {
        // Real implementation
    }
}
```

### 2. Mock Service Implementáció

```typescript
// wms/webapp/mock/services/MockCrystalReportsService.ts (ÚJ)
import CrystalReportsService from "../../services/CrystalReportsService";

export default class MockCrystalReportsService extends CrystalReportsService {

    async generateReport(reportCode: string, params: any): Promise<Blob> {
        console.log('[MockCrystalReportsService] Generate report:', reportCode, params);

        // Mock PDF content
        const mockPdfContent = `%PDF-1.4
Mock Report: ${reportCode}
Parameters: ${JSON.stringify(params)}
Generated: ${new Date().toISOString()}`;

        return new Blob([mockPdfContent], { type: 'application/pdf' });
    }

    async getReportParameters(reportCode: string): Promise<any> {
        // Load mock parameters from JSON
        const mockParams = {
            "STR_REPORT": [
                { name: "DocEntry", type: "number", required: true },
                { name: "ShowPrices", type: "boolean", required: false }
            ],
            "PICK_REPORT": [
                { name: "PickListId", type: "number", required: true }
            ]
        };

        return mockParams[reportCode] || [];
    }
}
```

### 3. ConfigService Integráció

```typescript
// wms/webapp/services/ConfigService.ts
import MockCrystalReportsService from "../mock/services/MockCrystalReportsService";

export default class ConfigService extends BaseService {

    private _crystalReportsService: CrystalReportsService;

    async init(): Promise<void> {
        const isMock = AppConfig.isMockMode();

        if (isMock) {
            this._crystalReportsService = new MockCrystalReportsService();
        } else {
            this._crystalReportsService = new CrystalReportsService();
        }
    }

    public getCrystalReportsService(): CrystalReportsService {
        return this._crystalReportsService;
    }
}
```

### 4. Component.ts Használat

```typescript
// Component.ts
public async generateReport(reportCode: string, params: any): Promise<Blob> {
    return this.configService.getCrystalReportsService()
        .generateReport(reportCode, params);
}
```

---

## Tesztelés

### Unit Tesztek

**ODataQueryEngine tesztelése:**

```typescript
// wms/webapp/test/unit/mock/ODataQueryEngine.test.ts
import ODataQueryEngine from "../../../mock/services/ODataQueryEngine";

describe("ODataQueryEngine", () => {

    let engine: ODataQueryEngine;

    beforeEach(() => {
        engine = new ODataQueryEngine();
    });

    test("applyFilter with 'eq' operator", () => {
        const data = [
            { WarehouseCode: "WH01", Name: "Main" },
            { WarehouseCode: "WH02", Name: "Secondary" }
        ];

        const result = engine.applyFilter(data, "WarehouseCode eq 'WH01'");

        expect(result).toHaveLength(1);
        expect(result[0].WarehouseCode).toBe("WH01");
    });

    test("applyFilter with 'and' operator", () => {
        const data = [
            { WarehouseCode: "WH01", EnableBinLocations: "tYES" },
            { WarehouseCode: "WH02", EnableBinLocations: "tNO" }
        ];

        const result = engine.applyFilter(
            data,
            "WarehouseCode eq 'WH01' and EnableBinLocations eq 'tYES'"
        );

        expect(result).toHaveLength(1);
    });

    test("applyOrderBy ascending", () => {
        const data = [
            { Name: "Charlie" },
            { Name: "Alice" },
            { Name: "Bob" }
        ];

        const result = engine.applyOrderBy(data, "Name asc");

        expect(result[0].Name).toBe("Alice");
        expect(result[1].Name).toBe("Bob");
        expect(result[2].Name).toBe("Charlie");
    });

    test("applyPagination with $top and $skip", () => {
        const data = Array.from({ length: 100 }, (_, i) => ({ id: i }));

        const result = engine.applyPagination(data, 10, 20);

        expect(result).toHaveLength(10);
        expect(result[0].id).toBe(20);
        expect(result[9].id).toBe(29);
    });
});
```

**Futtatás:**

```bash
npm run unit-tests
```

### Integrációs Tesztek

**MockRestService tesztelése:**

```typescript
// wms/webapp/test/integration/MockRestService.test.ts
import MockRestService from "../../../mock/services/MockRestService";

describe("MockRestService Integration", () => {

    let service: MockRestService;

    beforeEach(() => {
        service = new MockRestService({ baseUrl: "/b1s/v2" });
    });

    test("GET /Warehouses returns mock data", async () => {
        const result = await service.requestGET("/Warehouses");

        expect(result["@odata.context"]).toContain("Warehouses");
        expect(result.value).toBeInstanceOf(Array);
        expect(result.value.length).toBeGreaterThan(0);
    });

    test("GET /Warehouses?$filter=WarehouseCode eq 'WH01'", async () => {
        const result = await service.requestGET("/Warehouses?$filter=WarehouseCode eq 'WH01'");

        expect(result.value).toHaveLength(1);
        expect(result.value[0].WarehouseCode).toBe("WH01");
    });

    test("POST /StockTransfers creates new document", async () => {
        const newDoc = {
            FromWarehouse: "WH01",
            ToWarehouse: "WH02",
            StockTransferLines: [
                {
                    ItemCode: "ITEM001",
                    Quantity: 10
                }
            ]
        };

        const result = await service.requestPOST("/StockTransfers", newDoc);

        expect(result.DocEntry).toBeDefined();
        expect(result.FromWarehouse).toBe("WH01");
        expect(result.StockTransferLines).toHaveLength(1);
    });

    test("PATCH /StockTransfers(1) updates document", async () => {
        const updates = {
            Comments: "Updated comment"
        };

        const result = await service.requestPATCH("/StockTransfers(1)", updates);

        expect(result.Comments).toBe("Updated comment");
    });
});
```

### E2E Tesztek (Cypress)

**Teljes user flow tesztelése mock adatokkal:**

```javascript
// cypress/integration/stock-transfer-mock.spec.js
describe('Stock Transfer Flow (Mock Backend)', () => {

    before(() => {
        // Force mock mode
        cy.visit('/?mock=true');
        cy.login('admin', 'password');
    });

    it('should load stock transfer list', () => {
        cy.visit('/#/StockTransfer');

        cy.get('.sapMListItems').should('exist');
        cy.get('.sapMListItems .sapMLIB').should('have.length.greaterThan', 0);
    });

    it('should create new stock transfer', () => {
        cy.visit('/#/StockTransfer');
        cy.get('[data-test="new-button"]').click();

        // Fill form
        cy.get('[data-test="from-warehouse"]').click();
        cy.get('[data-value="WH01"]').click();

        cy.get('[data-test="to-warehouse"]').click();
        cy.get('[data-value="WH02"]').click();

        cy.get('[data-test="add-item"]').click();
        cy.get('[data-test="item-code"]').type('ITEM001');
        cy.get('[data-test="quantity"]').type('10');

        // Save
        cy.get('[data-test="save-button"]').click();

        // Verify success
        cy.get('.sapMMessageToast').should('contain', 'Successfully created');
    });
});
```

---

## Gyakori Fejlesztési Feladatok

### 1. Új Entitás Hozzáadása a Mock Rendszerhez

**Feladat:** Új "ProductionLines" entitás mock támogatása

**Lépések:**

```bash
# 1. Mock adat fájl létrehozása
nano wms/webapp/mock/data/master/productionlines.json
```

```json
{
  "@odata.context": "/b1s/v2/$metadata#U_PRODUCTIONLINES",
  "@odata.count": 5,
  "value": [
    {
      "Code": "LINE01",
      "Name": "Assembly Line 1",
      "U_Capacity": 100,
      "U_Status": "Active"
    }
  ]
}
```

```typescript
// 2. MockDataLoader mappingjében hozzáadás
// wms/webapp/mock/services/MockDataLoader.ts

private entitySetMapping = {
    // ... existing
    'U_PRODUCTIONLINES': 'master/productionlines'
};
```

```typescript
// 3. Használat controller-ben (automatikusan működik)
const result = await this.ownerComponent.getRestService()
    .requestGET("/U_PRODUCTIONLINES");
// → mock adatokat ad vissza
```

### 2. OData Query Tesztelése Mock Módban

**Feladat:** Komplex $filter query működésének ellenőrzése

```typescript
// Browser console-ban
const service = sap.ui.getCore().byId('container-ntt.wms---app')
    .getController().getOwnerComponent().getRestService();

// Tesztelés
const result = await service.requestGET(
    "/Items?$filter=QuantityOnStock gt 10 and ManageSerialNumbers eq 'tYES'&$orderby=ItemCode&$top=20"
);

console.table(result.value);
```

**Debug logging bekapcsolása:**

```typescript
// AppConfig.ts vagy .env
MOCK_DEBUG=true

// Konzolban látható lesz:
[ODataQueryEngine] Parsing filter: QuantityOnStock gt 10 and ManageSerialNumbers eq 'tYES'
[ODataQueryEngine] Applying orderby: ItemCode
[ODataQueryEngine] Applying pagination: top=20, skip=0
[MockRestService] GET /Items → 15 results
```

### 3. In-Memory Módosítások Tesztelése

**Feladat:** POST/PATCH/DELETE műveletek működésének ellenőrzése

```javascript
// Browser console
const service = sap.ui.getCore().byId('container-ntt.wms---app')
    .getController().getOwnerComponent().getRestService();

// 1. Új entitás létrehozása (POST)
const newWarehouse = {
    WarehouseCode: "WH99",
    WarehouseName: "Test Warehouse",
    EnableBinLocations: "tYES"
};

const created = await service.requestPOST("/Warehouses", newWarehouse);
console.log("Created:", created);

// 2. Lekérdezés (GET)
const warehouses = await service.requestGET("/Warehouses");
console.log("Total warehouses:", warehouses.value.length);
// → Tartalmazza az új WH99-et

// 3. Módosítás (PATCH)
const updated = await service.requestPATCH("/Warehouses('WH99')", {
    WarehouseName: "Updated Name"
});
console.log("Updated:", updated);

// 4. Törlés (DELETE)
await service.requestDELETE("/Warehouses('WH99')");

// 5. Ellenőrzés
const warehousesAfter = await service.requestGET("/Warehouses");
console.log("After delete:", warehousesAfter.value.length);
// → Nem tartalmazza a WH99-et

// ⚠️ Figyelem: Oldal refresh után minden változás elveszik!
```

### 4. Hibás Állapot Szimulálása

**Feladat:** 404, 400 hibák kezelésének tesztelése

```typescript
// MockRestService.ts módosítása (fejlesztés alatt)
async requestGET(path: string): Promise<any> {

    // Simulate 404 for non-existent entities
    if (path.includes("('NONEXISTENT')")) {
        throw {
            status: 404,
            message: "Entity not found",
            error: { code: "404", message: { value: "The requested resource was not found" } }
        };
    }

    // Simulate 400 for invalid queries
    if (path.includes("$filter=INVALID")) {
        throw {
            status: 400,
            message: "Bad request",
            error: { code: "400", message: { value: "Invalid OData query" } }
        };
    }

    // Normal processing...
}
```

**Tesztelés:**

```javascript
// Browser console
try {
    await service.requestGET("/Items('NONEXISTENT')");
} catch (error) {
    console.error("Expected error:", error);
    // Error handling UI tesztelése
}
```

---

## Best Practices

### 1. Mock Adatok Struktúra

✅ **DO:**
- Használj realisztikus adatokat (magyar nevek, címek, SAP B1 konvenciók)
- Tartsd be az OData formátumot (`@odata.context`, `value`)
- Biztosítsd a referenciális integritást
- Adj hozzá elegendő variációt (különböző státuszok, típusok)

❌ **DON'T:**
- Ne használj "test1", "test2" típusú adatokat production mock-ban
- Ne hagyj ki kötelező mezőket
- Ne használj inkonzisztens ID-kat (pl. DocEntry vs. Code)

**Példa - Jó mock adat:**

```json
{
  "value": [
    {
      "DocEntry": 1,
      "DocNum": 1,
      "DocDate": "2026-01-15",
      "FromWarehouse": "WH01",
      "ToWarehouse": "WH02",
      "Comments": "Készletáttárolás gyártási igény miatt",
      "U_WMS_STATUS": "O",
      "StockTransferLines": [
        {
          "LineNum": 0,
          "ItemCode": "CIKK-0001",
          "ItemDescription": "Acél alkatrész 10x20cm",
          "Quantity": 50,
          "Price": 1250.00,
          "Currency": "HUF"
        }
      ]
    }
  ]
}
```

### 2. Service Mock Implementáció

✅ **DO:**
- Extendeld az eredeti service osztályt
- Logold a mock műveleteket (MOCK_DEBUG=true esetén)
- Adj vissza konzisztens válaszokat (OData formátum)
- Handle-eld az edge case-eket (empty results, invalid input)

❌ **DON'T:**
- Ne változtasd meg az eredeti service interface-t
- Ne felejts el metódusokat implementálni
- Ne térj el a valódi backend viselkedésétől (ha nem szándékos)

**Példa - Jó mock service:**

```typescript
export default class MockRestService extends RestService {

    async requestGET(path: string): Promise<any> {
        if (AppConfig.get('MOCK_DEBUG')) {
            console.log(`[MockRestService] GET ${path}`);
        }

        // Parse path...
        // Load data...
        // Apply OData query...

        const result = {
            "@odata.context": `${this.baseUrl}/$metadata#${entitySet}`,
            "value": filteredData
        };

        if (AppConfig.get('MOCK_DEBUG')) {
            console.log(`[MockRestService] → ${result.value.length} results`);
        }

        return result;
    }
}
```

### 3. Konfiguráció Kezelés

✅ **DO:**
- Használd az AppConfig-ot központi config forrásként
- Dokumentáld az összes config opciót a .env.example-ban
- Add meg az alapértelmezett értékeket (fallback)
- Teszteld mind a mock, mind a real módot

❌ **DON'T:**
- Ne hardcoded-old a backend URL-eket
- Ne használj globális változókat config tárolásra
- Ne feledkezz meg a backward compatibility-ről

### 4. Tesztelés

✅ **DO:**
- Írj unit teszteket minden mock service-hez
- Teszteld az OData query engine-t különböző scenariókkal
- Használj E2E teszteket a teljes flow ellenőrzésére
- Teszteld a real backend-del is (regressziós tesztek)

❌ **DON'T:**
- Ne tesztelj csak mock módban
- Ne hagyj ki edge case teszteket
- Ne felejts el mock adatokat commitálni a tesztekhez

### 5. Git Workflow

✅ **DO:**
- Commitáld a közös mock adatokat (master/, transactions/, system/)
- .gitignore-old a fejlesztő-specifikus adatokat (custom/)
- Verziókezeld a mock service implementációkat
- Dokumentáld a mock rendszer változásait

❌ **DON'T:**
- Ne commitáld az .env fájlt
- Ne tárolj érzékeny adatokat mock JSON-okban
- Ne felejts el .env.example-t frissíteni új config hozzáadásakor

---

## Troubleshooting

### Mock mód nem aktiválódik

**Tünetek:**
- Valódi backend hívások történnek mock=true esetén is

**Megoldás:**

```typescript
// 1. Ellenőrizd az AppConfig-ot
console.log('Backend mode:', AppConfig.getBackendMode());
// → Kell hogy 'mock' legyen

// 2. Ellenőrizd a window.WMS_CONFIG-ot
console.log('Window config:', window.WMS_CONFIG);
// → { BACKEND_MODE: 'mock', ... }

// 3. Ellenőrizd a ConfigService inicializálást
const component = sap.ui.getCore().byId('container-ntt.wms---app').getController().getOwnerComponent();
console.log('RestService type:', component.getRestService().constructor.name);
// → Kell hogy 'MockRestService' legyen
```

### Mock JSON fájl nem töltődik be

**Tünetek:**
- 404 Not Found hiba a mock JSON fájlokra

**Megoldás:**

```bash
# 1. Ellenőrizd a fájl létezését
ls -la wms/webapp/mock/data/master/warehouses.json

# 2. Ellenőrizd az ui5.yaml konfigurációt
# Kell egy servestatic middleware a /mock path-hoz

# 3. Teszteld a fájl elérését közvetlenül
curl http://localhost:8080/mock/data/master/warehouses.json
# → JSON válasznak kell jönnie
```

### OData query nem működik

**Tünetek:**
- $filter, $orderby nem szűr/rendez

**Megoldás:**

```typescript
// 1. Debuggold az ODataQueryEngine-t
// ODataQueryEngine.ts
console.log('[DEBUG] Filter expression:', filterExpression);
console.log('[DEBUG] Parsed predicate:', predicate);

// 2. Ellenőrizd a támogatott operátorokat
// Csak eq, ne, gt, lt, ge, le, and, or támogatott (MVP-ben)

// 3. Egyszerűsítsd a query-t
// HELYETT: $filter=contains(Name, 'test') and Price gt 1000
// HASZNÁLD: $filter=Price gt 1000
```

### In-memory változások elvesznek

**Tünetek:**
- POST/PATCH után refresh-nél eltűnnek az adatok

**Válasz:**
Ez **szándékos** működés! Mock módban az in-memory változások nem perzisztensek.

**Megoldás (ha mégis szükséges):**

```typescript
// MockDataLoader.ts - localStorage persistence hozzáadása
private saveToLocalStorage(entitySet: string, data: any) {
    localStorage.setItem(`mock_${entitySet}`, JSON.stringify(data));
}

private loadFromLocalStorage(entitySet: string): any | null {
    const stored = localStorage.getItem(`mock_${entitySet}`);
    return stored ? JSON.parse(stored) : null;
}
```

---

## Összefoglalás

Ez az útmutató mindennel ellátott a WMS mock backend használatához és fejlesztéséhez. Ha további kérdésed van:

1. Nézd meg a [Mock Backend Architektúra](./mock-backend-architektura.md) dokumentumot
2. Olvasd el a [Projekt Összefoglalót](./projekt-osszefoglalo.md)
3. Tekintsd meg a forráskódot: `wms/webapp/mock/` és `wms/webapp/config/`

**Következő lépések:**
- [ ] Generáld a mock adatokat: `npm run generate:mock-data`
- [ ] Próbáld ki a mock módot: `npm run start:mock`
- [ ] Hozz létre egy tesztadatot a saját funkcióhoz
- [ ] Írj unit tesztet az új mock service-hez

---

**Utolsó frissítés:** 2026-01-30
**Verzió:** 1.0.0
**Kapcsolat:** WMS Development Team
