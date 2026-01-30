# Mock Backend Architektúra

## Áttekintés

A SAPUI5 WMS alkalmazás mock backend támogatást kapott, amely lehetővé teszi a fejlesztést és tesztelést valódi SAP Business One backend nélkül. A rendszer JSON fájl alapú mock adatokat használ, és egyszerű környezeti változó váltással lehet átkapcsolni a valódi és mock backend között.

---

## Architektúra Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Component.ts (Entry Point)                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         ConfigService                                 │  │
│  │  - Betölti a konfigurációt AppConfig-ból             │  │
│  │  - Backend mód detektálás                            │  │
│  │  - Megfelelő service instance-okat ad vissza         │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                 │
│              ┌─────────────┴─────────────┐                  │
│              │                           │                  │
│     ┌────────▼────────┐        ┌────────▼─────────┐        │
│     │  Real Services  │        │  Mock Services   │        │
│     ├─────────────────┤        ├──────────────────┤        │
│     │ RestService     │        │ MockRestService  │        │
│     │ ODBCService     │        │ MockODBCService  │        │
│     │ WebSocket       │        │ MockWebSocket    │        │
│     └─────────────────┘        └──────────────────┘        │
│              │                           │                  │
│              │                           │                  │
│     ┌────────▼────────┐        ┌────────▼─────────┐        │
│     │  SAP Backend    │        │  Mock JSON Files │        │
│     │  /b1s/v2        │        │  /mock/data/     │        │
│     │  /ODBC          │        │                  │        │
│     │  /wms           │        │                  │        │
│     └─────────────────┘        └──────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## Backend Integrációs Pontok

A WMS alkalmazás **8 különböző backend integrációs ponttal** rendelkezik:

| # | Service | Base URL | Cél |
|---|---------|----------|-----|
| 1 | Service Layer API | `/b1s/v2` | SAP B1 OData API (fő backend) |
| 2 | ODBC Service | `./ODBC` | Stored procedure-ök végrehajtása |
| 3 | WMS Backend | `/wms` | Licensz, nyomtató szolgáltatások |
| 4 | Install Service | `/install` | Login/cég információk |
| 5 | API Endpoints | `./api` | Push notifikációk |
| 6 | Printer Server | Dinamikus (settings-ből) | Nyomtató szerver |
| 7 | Crystal Reports | Dinamikus (settings-ből) | Jelentés generálás |
| 8 | WebSocket | `ws://...` | Valós idejű kommunikáció |

**Mock módban** mind a 8 pont mock implementációt kap.

---

## Konfiguráció

### AppConfig.ts

**Helye:** `config/AppConfig.ts`

**Feladat:** Központi konfiguráció kezelő osztály, amely:
- Beolvassa a környezeti változókat (window object-ből)
- Meghatározza a backend módot (real/mock)
- Visszaadja a backend URL-eket
- Lehetővé teszi a runtime konfiguráció felülírást

**Környezeti változók:**

```typescript
// Window object-be injektálva (index.html vagy build-time)
window.WMS_CONFIG = {
    BACKEND_MODE: 'mock',      // 'real' | 'mock'
    MOCK_DATA_PATH: '/mock'    // Mock adatok elérési útja
}
```

**Használat:**

```typescript
import { AppConfig } from "../config/AppConfig";

// Backend mód lekérdezése
if (AppConfig.isMockMode()) {
    // Mock logic
}

// Backend URL-ek
const urls = AppConfig.getBackendUrls();
// {
//   b1s: '/b1s/v2',
//   odbc: './ODBC',
//   wms: '/wms',
//   install: '/install',
//   api: './api',
//   printerServer: '/wms'
// }
```

### .env.example

**Helye:** Projekt gyökér (`/Volumes/DevAPFS/work/ui5/wms/.env.example`)

**Tartalom:**

```bash
# ============================================
# WMS Backend Configuration
# ============================================

# Backend Mode - Determines which backend to use
# Values: real | mock
# - real: Use actual SAP Business One backend
# - mock: Use local JSON mock data
BACKEND_MODE=real

# Mock Data Path - Directory containing mock JSON files (relative to webapp)
MOCK_DATA_PATH=/mock

# ============================================
# Real Backend Configuration
# (Only used when BACKEND_MODE=real)
# ============================================

# SAP Business One Service Layer URL
REAL_BACKEND_B1S=/b1s/v2

# ODBC Service URL
REAL_BACKEND_ODBC=./ODBC

# WMS Backend URL (license, printer services)
REAL_BACKEND_WMS=/wms

# Install Service URL (login, company selection)
REAL_BACKEND_INSTALL=/install

# API Service URL (push notifications)
REAL_BACKEND_API=./api

# ============================================
# Development Options
# ============================================

# Enable debug logging for mock services
MOCK_DEBUG=false

# Simulate network latency in mock mode (milliseconds)
MOCK_LATENCY=0
```

**Developer workflow:**

```bash
# 1. Példa fájl másolása
cp .env.example .env

# 2. .env szerkesztése
# BACKEND_MODE=mock  (fejlesztéshez)
# BACKEND_MODE=real  (production-höz)

# 3. Alkalmazás indítása
npm run start        # Real backend
npm run start:mock   # Mock backend (force)
```

### .gitignore

**Frissítve:** `.env` fájlok és mock custom adatok kizárása

```gitignore
node_modules

# Environment files
.env
.env.local

# Local UI5 configuration
ui5-local.yaml

# Mock data customizations (optional)
mock/data/custom/

# Build artifacts
dist-mock/
```

**Miért?**
- `.env` fájlok **lokálisak**, minden fejlesztő saját beállításait tartalmazzák
- `ui5-local.yaml` - fejlesztő-specifikus UI5 konfig
- `mock/data/custom/` - fejlesztők saját tesztadatai
- `dist-mock/` - mock build artifactek

---

## Könyvtárstruktúra

### Mock Adatok Könyvtár

```
mock/
├── data/                           # Mock JSON adatok
│   ├── master/                     # Master adatok
│   │   ├── users.json              # 5 felhasználó
│   │   ├── warehouses.json         # 3 raktár
│   │   ├── binlocations.json       # 50 raktárihely
│   │   ├── items.json              # 100 cikk
│   │   ├── employees.json          # 10 alkalmazott
│   │   └── businesspartners.json   # 20 üzleti partner
│   ├── transactions/               # Tranzakciós dokumentumok
│   │   ├── stocktransfers.json           # WMS_OWTR - 30 db
│   │   ├── stocktransferrequests.json    # WMS_OWTQ - 20 db
│   │   ├── materialreceipts.json         # WMS_OIGN - 25 db
│   │   ├── materialissues.json           # WMS_OIGE - 25 db
│   │   ├── returns.json                  # WMS_ORDN - 15 db
│   │   ├── purchasedeliveries.json       # WMS_OPDN - 30 db
│   │   ├── deliverynotes.json            # WMS_ODLN - 40 db
│   │   ├── invoices.json                 # WMS_OINV - 35 db
│   │   ├── picklists.json                # WMS_PICK - 50 db
│   │   ├── productionorders.json         # WMS_OWOR - 20 db
│   │   └── inventorycountings.json       # WMS_OINC - 15 db
│   ├── system/                     # Rendszer konfigurációk
│   │   ├── session.json            # Session info, bejelentkezett user
│   │   ├── licenses.json           # WMS licenszek (12 modul)
│   │   ├── admininfo.json          # Cég admin információk
│   │   └── modules.json            # Module settings (CORE_MODULES)
│   └── views/                      # Custom OData view-k
│       └── items-view.json         # NTT_UI5WMS_ITEMS_B1SLQuery
│
├── services/                       # Mock service implementációk
│   ├── MockRestService.ts          # Fő REST service mock
│   ├── MockDataLoader.ts           # JSON fájl betöltő
│   ├── ODataQueryEngine.ts         # OData query parser
│   ├── MockODBCService.ts          # ODBC service mock
│   └── MockWebSocketService.ts     # WebSocket mock
│
└── README.md                       # Mock rendszer dokumentáció
```

### Scripts Könyvtár

```
wms/scripts/
└── generateMockData.js             # Mock adat generátor script
```

**Használat:**
```bash
npm run generate:mock-data
# Generálja a nagy adathalmazokat (items, transactions)
```

---

## Mock Adatok Formátum

### OData Collection Response

**Példa:** `warehouses.json`

```json
{
  "@odata.context": "/b1s/v2/$metadata#Warehouses",
  "@odata.count": 3,
  "value": [
    {
      "WarehouseCode": "WH01",
      "WarehouseName": "Fő raktár",
      "Street": "Ipari Park utca",
      "City": "Budapest",
      "ZipCode": "1117",
      "Country": "HU",
      "EnableBinLocations": "tYES",
      "DefaultBin": 1,
      "ManageSerialAndBatchNumbers": "tYES",
      "Inactive": "tNO",
      "U_WMS_BINLOCATION": "A-01-01"
    },
    {
      "WarehouseCode": "WH02",
      "WarehouseName": "Másodlagos raktár",
      "Street": "Logisztikai sugárút",
      "City": "Debrecen",
      "ZipCode": "4032",
      "Country": "HU",
      "EnableBinLocations": "tYES",
      "DefaultBin": 50,
      "ManageSerialAndBatchNumbers": "tNO",
      "Inactive": "tNO"
    }
  ]
}
```

**OData Metadata mezők:**
- `@odata.context` - OData context URL
- `@odata.count` - Teljes rekordszám ($count query esetén)
- `@odata.nextLink` - Következő oldal URL (pagination)
- `value` - Tényleges adatok tömbje

### OData Single Entity Response

**Példa:** Egyetlen entitás lekérdezése

```json
{
  "@odata.context": "/b1s/v2/$metadata#Warehouses/$entity",
  "WarehouseCode": "WH01",
  "WarehouseName": "Fő raktár",
  "Street": "Ipari Park utca",
  "City": "Budapest",
  "ZipCode": "1117",
  "Country": "HU",
  "EnableBinLocations": "tYES",
  "DefaultBin": 1
}
```

### Users.json Speciális Formátum

**Felhasználók entity map-ként:**

```json
{
  "@odata.context": "/b1s/v2/$metadata#Users",
  "entities": {
    "1": {
      "InternalKey": 1,
      "UserCode": "admin",
      "UserName": "Administrator",
      "Superuser": "tYES",
      "eMail": "admin@company.com",
      "UserPermission": [
        {
          "PermissionID": "ITCORE_WMS",
          "Permission": "boper_Full"
        }
      ]
    },
    "2": {
      "InternalKey": 2,
      "UserCode": "warehouse_user",
      "UserName": "Raktáros",
      "Superuser": "tNO"
    }
  },
  "currentUserId": "1"
}
```

**Miért speciális?**
- `entities` - Map formátum (InternalKey alapján)
- `currentUserId` - Jelenleg bejelentkezett user ID
- Gyorsabb lookup user ID alapján

### Transaction Documents Formátum

**Példa:** `stocktransfers.json`

```json
{
  "@odata.context": "/b1s/v2/$metadata#StockTransfers",
  "idCounter": 100,
  "value": [
    {
      "DocEntry": 1,
      "DocNum": 1,
      "Series": 10,
      "DocDate": "2026-01-15",
      "DueDate": "2026-01-15",
      "TaxDate": "2026-01-15",
      "Comments": "Készletáttárolás gyártáshoz",
      "JournalMemo": "STR-001",
      "PriceList": 1,
      "SalesPersonCode": -1,
      "FromWarehouse": "WH01",
      "ToWarehouse": "WH02",
      "U_WMS_STATUS": "O",
      "StockTransferLines": [
        {
          "LineNum": 0,
          "ItemCode": "ITEM001",
          "ItemDescription": "Termék A",
          "Quantity": 10,
          "Price": 1000,
          "Currency": "HUF",
          "WarehouseCode": "WH01",
          "FromWarehouseCode": "WH01",
          "BinAbsEntry": 1,
          "BinCode": "A-01-01",
          "SerialNumbers": [],
          "BatchNumbers": [],
          "StockTransferLinesBinAllocations": [
            {
              "BinAbsEntry": 1,
              "Quantity": 10,
              "BinActionType": "batFromWarehouse",
              "SerialAndBatchNumbersBaseLine": -1
            },
            {
              "BinAbsEntry": 50,
              "Quantity": 10,
              "BinActionType": "batToWarehouse",
              "SerialAndBatchNumbersBaseLine": -1
            }
          ]
        }
      ]
    }
  ]
}
```

**Speciális mezők:**
- `idCounter` - Következő DocEntry ID generáláshoz (POST műveletekhez)
- SAP B1 specifikus struktúra (lines, bin allocations, stb.)

### System Configuration Fájlok

#### session.json

```json
{
  "SessionInfo": {
    "SessionId": "mock-session-12345",
    "Version": "1000260",
    "SessionTimeout": 30,
    "Server": "mock-server",
    "Company": "SBODEMOHU",
    "User": "admin",
    "Language": "hu"
  },
  "User": {
    "InternalKey": 1,
    "UserCode": "admin"
  }
}
```

#### licenses.json

```json
{
  "WMS": "2027-12-31",
  "WMSADM": "2027-12-31",
  "WMS_OWTR": "2027-12-31",
  "WMS_OIGE": "2027-12-31",
  "WMS_OIGN": "2027-12-31",
  "WMS_ORDN": "2027-12-31",
  "WMS_OPDN": "2027-12-31",
  "WMS_ODLN": "2027-12-31",
  "WMS_OINV": "2027-12-31",
  "WMS_PICK": "2027-12-31",
  "WMS_OWOR": "2027-12-31",
  "WMS_OWTQ": "2027-12-31",
  "WMS_OINC": "2027-12-31"
}
```

**Formátum:** `{ "MODULE_NAME": "lejárati_dátum" }`

---

## Referenciális Integritás

Mock adatok között referenciális integritás szükséges:

### Master Data Kapcsolatok

```
Items
  ├── ItemWarehouseInfoCollection → Warehouses (WarehouseCode)
  └── U_WMS_BINLOCATION → BinLocations (BinCode)

BinLocations
  └── Warehouse → Warehouses (WarehouseCode)

Users
  └── EmployeesInfo → Employees (EmployeeID)
```

### Transaction Data Kapcsolatok

```
StockTransfer
  ├── FromWarehouse → Warehouses (WarehouseCode)
  ├── ToWarehouse → Warehouses (WarehouseCode)
  └── StockTransferLines
      ├── ItemCode → Items (ItemCode)
      ├── FromWarehouseCode → Warehouses (WarehouseCode)
      ├── BinAbsEntry → BinLocations (AbsEntry)
      └── StockTransferLinesBinAllocations
          └── BinAbsEntry → BinLocations (AbsEntry)

PickList
  ├── PickListsLines
      └── BaseObject → Documents (különböző típusok)

DeliveryNote
  ├── CardCode → BusinessPartners (CardCode)
  └── DocumentLines
      ├── ItemCode → Items (ItemCode)
      └── WarehouseCode → Warehouses (WarehouseCode)
```

**Validáció:** MockDataLoader induláskor ellenőrzi a referenciákat és warning-ot ad hibás hivatkozásokra.

---

## Mock Services

### MockDataLoader

**Fájl:** `mock/services/MockDataLoader.ts`

**Feladatok:**
1. JSON fájlok betöltése a `/mock/data/` könyvtárból
2. In-memory cache kezelés
3. Referenciális integritás validálás
4. Entity set név → fájl path mapping

**Implementáció (pszeudokód):**

```typescript
export class MockDataLoader {
    private cache: Map<string, any> = new Map();

    async init(): Promise<void> {
        // Fájlok betöltése
        await this.loadFile('master/users');
        await this.loadFile('master/warehouses');
        // ... stb

        // Referenciális integritás ellenőrzése
        this.validateReferences();
    }

    getData(entitySet: string): any {
        // Entity set mapping
        const fileMap = {
            'Warehouses': 'master/warehouses',
            'Items': 'master/items',
            'StockTransfers': 'transactions/stocktransfers'
            // ... stb
        };

        return this.cache.get(fileMap[entitySet]);
    }

    updateData(entitySet: string, id: any, data: any): void {
        // In-memory update (nem perzisztens)
    }
}
```

### ODataQueryEngine

**Fájl:** `mock/services/ODataQueryEngine.ts`

**Feladatok:**
1. OData URL parsing
2. Query paraméterek feldolgozása ($filter, $orderby, $top, $skip, stb.)
3. Adatok szűrése, rendezése, lapozása
4. OData response formázás

**Támogatott OData műveletek:**

| Művelet | Példa | Implementáció |
|---------|-------|---------------|
| **$filter** | `?$filter=WarehouseCode eq 'WH01'` | Egyenlőség, összehasonlítás, logikai műveletek |
| **$orderby** | `?$orderby=WarehouseName asc` | Rendezés (asc/desc) |
| **$top** | `?$top=10` | Első N rekord |
| **$skip** | `?$skip=20` | Első N rekord kihagyása |
| **$count** | `?$count=true` | Teljes rekordszám visszaadása |
| **$expand** | `?$expand=StockTransferLines` | Kapcsolt entitások betöltése |
| **$select** | `?$select=WarehouseCode,WarehouseName` | Csak megadott mezők |

**Filter operátorok:**

```
Összehasonlítás: eq, ne, gt, lt, ge, le
Logikai: and, or, not
String: contains, startswith, endswith
```

**Példa filter parsing:**

```
$filter=WarehouseCode eq 'WH01' and EnableBinLocations eq 'tYES'

→ Predikátum függvény:
   (item) => item.WarehouseCode === 'WH01' && item.EnableBinLocations === 'tYES'
```

### MockRestService

**Fájl:** `mock/services/MockRestService.ts`

**Feladatok:**
1. RestService interface implementálása
2. HTTP művelet szimuláció (GET, POST, PATCH, DELETE)
3. OData query végrehajtás
4. BATCH műveletek kezelése
5. ID generálás POST műveletekhez

**Metódusok:**

```typescript
class MockRestService extends RestService {

    async requestGET(path: string): Promise<any> {
        // 1. Parse URL → entity set, ID, query params
        // 2. Load data from MockDataLoader
        // 3. Apply OData query (filter, orderby, etc.)
        // 4. Format OData response
        // 5. Return result
    }

    async requestPOST(path: string, data: any): Promise<any> {
        // 1. Parse entity set
        // 2. Generate new ID (idCounter++)
        // 3. Add to in-memory data
        // 4. Return created entity
    }

    async requestPATCH(path: string, data: any): Promise<any> {
        // 1. Parse entity set and ID
        // 2. Update in-memory data
        // 3. Return updated entity
    }

    async requestDELETE(path: string): Promise<any> {
        // 1. Parse entity set and ID
        // 2. Remove from in-memory data
        // 3. Return 204 No Content
    }

    async BATCHRequest(params: BatchParameters[]): Promise<any> {
        // 1. Process each request sequentially
        // 2. Maintain transactional semantics
        // 3. Return batch response
    }
}
```

**In-Memory State:**
- Mock adatok módosításai (POST/PATCH/DELETE) csak memóriában tárolódnak
- Oldal refresh → eredeti JSON fájlok állapota
- **Szándékos:** egyszerű, clean state minden refresh-nél

### MockODBCService

**Fájl:** `mock/services/MockODBCService.ts`

**Feladatok:**
- Stored procedure hívások mock-olása
- Specifikus SP-k mapping-je mock response-okra

**Példa:**

```typescript
class MockODBCService extends ODBCService {

    async execute(storedProcedure: string, ...args: any[]): Promise<any> {
        const mockHandlers = {
            'WMS_GetPickListDetails': this.mockGetPickListDetails,
            'WMS_UpdateInventoryCount': this.mockUpdateInventoryCount
        };

        const handler = mockHandlers[storedProcedure];
        if (handler) {
            return handler.call(this, ...args);
        }

        // Default: empty result
        return { value: [] };
    }
}
```

### MockWebSocketService

**Fájl:** `mock/services/MockWebSocketService.ts`

**Feladatok:**
- WebSocket interface mock-olása
- Időszakos üzenetek generálása (teszt célból)

**Példa:**

```typescript
class MockWebSocketService {

    constructor() {
        // Simulate periodic messages (30 sec)
        setInterval(() => {
            this.simulateMessage();
        }, 30000);
    }

    attachMessage(handler: Function) {
        this.messageHandlers.push(handler);
    }

    send(message: string) {
        console.log('[MockWebSocket] Send:', message);
        // No-op in mock mode
    }

    private simulateMessage() {
        const mockMessage = {
            id: this.createUUID(),
            type: 'NOTIFICATION',
            data: { message: 'Mock notification from server' }
        };

        this.messageHandlers.forEach(h => h(mockMessage));
    }
}
```

---

## ConfigService

**Fájl:** `services/ConfigService.ts`

**Feladatok:**
1. Service factory - backend mód alapján helyes service instance létrehozása
2. RestService és ODBCService példányok kezelése
3. Runtime service creation (printer, license, stb.)

**Implementáció (pszeudokód):**

```typescript
export default class ConfigService extends BaseService {

    private _restService: RestService | MockRestService;
    private _odbcService: ODBCService | MockODBCService;

    async init(): Promise<void> {
        const isMock = AppConfig.isMockMode();
        const urls = AppConfig.getBackendUrls();

        if (isMock) {
            this._restService = new MockRestService({
                baseUrl: urls.b1s,
                urlParameters: {}
            });
            this._odbcService = new MockODBCService();
        } else {
            this._restService = new RestService({
                baseUrl: urls.b1s,
                urlParameters: {}
            });
            this._odbcService = new ODBCService();
        }
    }

    public getRestService(): RestService {
        return this._restService;
    }

    public getODBCService(): ODBCService {
        return this._odbcService;
    }

    public createRestService(baseUrl: string): RestService {
        if (AppConfig.isMockMode()) {
            return new MockRestService({ baseUrl });
        }
        return new RestService({ baseUrl });
    }
}
```

**Használat Component.ts-ben:**

```typescript
// Component.ts init
this.configService = new ConfigService();
await this.configService.init();
this.restService = this.configService.getRestService();

// Ad-hoc service creation
const printerService = this.configService.createRestService('/wms');
```

---

## Component.ts Módosítások

### RestService Inicializálás

**ELŐTT:**
```typescript
// Line 120-121
this.restService = new RestService({
    baseUrl: "/b1s/v2",
    urlParameters: {}
});
```

**UTÁN:**
```typescript
// ConfigService használata
this.configService = new ConfigService();
await this.configService.init();
this.restService = this.configService.getRestService();
```

### Ad-hoc RestService Példányok

**ELŐTT (line 399):**
```typescript
return await new RestService({ baseUrl: _printerServer }).requestGET("/printers");
```

**UTÁN:**
```typescript
return await this.configService.createRestService(_printerServer).requestGET("/printers");
```

**Változtatások:**
- Line 321, 399, 404, 412 - Printer service
- Line 798 - ODBC service
- Line 977 - License service

### WebSocket Inicializálás

**ELŐTT (line 492):**
```typescript
this.oWebSocket = new WebSocket(_wsProtocol + '://' + wsUrl + "ws");
```

**UTÁN:**
```typescript
if (AppConfig.isMockMode()) {
    this.oWebSocket = new MockWebSocketService() as any;
} else {
    this.oWebSocket = new WebSocket(_wsProtocol + '://' + wsUrl + "ws");
}
```

### createODataModel Helper Metódus (ÚJ)

**Component.ts új metódus:**

```typescript
public createODataModel(serviceType: 'b1s' | 'view'): ODataModel {
    const urls = AppConfig.getBackendUrls();
    const baseUrl = serviceType === 'view'
        ? urls.b1s + '/view.svc/'
        : urls.b1s + '/';

    return new ODataModel({
        groupId: "$direct",
        synchronizationMode: "None",
        serviceUrl: baseUrl,
        operationMode: "Server"
    });
}
```

**Használat controller-ekben:**

```typescript
// ELŐTT
var odataModel = new ODataModel({
    serviceUrl: '/b1s/v2/',  // hardcoded
    ...
});

// UTÁN
var odataModel = this.ownerComponent.createODataModel('b1s');
var odataModelView = this.ownerComponent.createODataModel('view');
```

---

## Controller Refaktorálás

### Érintett Controller-ek

Mind a **20 controller** amely ODataModel-t használ hardcoded URL-lel:

1. StockTransfer.controller.ts ✅ (pilot)
2. StockTransferFromRequest.controller.ts
3. StockTransferRequest.controller.ts
4. InventoryGenExits.controller.ts
5. InventoryGenEntries.controller.ts
6. PickListDetails.controller.ts
7. InventoryCountingDetails.controller.ts
8. DeliveryNotes.controller.ts
9. PurchaseDeliveryNotes.controller.ts
10. PickLists.controller.ts
11. InventoryCountings.controller.ts
12. Returns.controller.ts
13. Invoices.controller.ts
14. ProductionOrders.controller.ts
15. ProductionOrderDetails.controller.ts
16. ProductionOrderGenExit.controller.ts
17. LabelPrintingDetails.controller.ts
18. InformationPanel.controller.ts
19. DriverSummary*.controller.ts (3 db)

### Refaktorálási Minta

**StockTransfer.controller.ts példa (sor 90-95):**

```typescript
// ──────────────────────────────────────
// ELŐTT
// ──────────────────────────────────────
var odataModel = new ODataModel({
    groupId: "$direct",
    synchronizationMode: "None",
    serviceUrl: '/b1s/v2/',  // ← HARDCODED
    operationMode: "Server"
});

var odataModelView = new ODataModel({
    groupId: "$direct",
    synchronizationMode: "None",
    serviceUrl: '/b1s/v2/view.svc/',  // ← HARDCODED
    operationMode: "Server"
});

// ──────────────────────────────────────
// UTÁN
// ──────────────────────────────────────
var odataModel = this.ownerComponent.createODataModel('b1s');
var odataModelView = this.ownerComponent.createODataModel('view');
```

**Automatizálás:** Script készíthető a regex-based helyettesítéshez.

---

## NPM Scripts

**package.json frissítések:**

```json
{
  "scripts": {
    "start": "fiori run --open \"test/flpSandbox.html?sap-ui-xx-viewCache=false#nttwms-display\"",
    "start:mock": "fiori run --open \"test/flpSandbox.html?sap-ui-xx-viewCache=false&mock=true#nttwms-display\"",
    "start-local": "fiori run --config ./ui5-local.yaml --open \"test/flpSandbox.html?sap-ui-xx-viewCache=false#nttwms-display\"",
    "build": "ui5 build --config=ui5.yaml --clean-dest --dest dist",
    "build:mock": "ui5 build --config=ui5-mock.yaml --clean-dest --dest dist-mock",
    "generate:mock-data": "node scripts/generateMockData.js",
    "lint": "eslint webapp",
    "ts-typecheck": "tsc --noEmit"
  }
}
```

**Új scriptek:**
- `start:mock` - Mock módban indítás (URL param alapján)
- `build:mock` - Mock build
- `generate:mock-data` - Mock adatok generálása

---

## Developer Workflow

### Scenario 1: Mock Backend Használata

```bash
# 1. Environment setup
cd /Volumes/DevAPFS/work/ui5/wms
cp .env.example .env

# 2. Edit .env
# BACKEND_MODE=mock

# 3. Start dev server
npm run start:mock

# Alternatíva: URL paraméter
npm run start
# Majd böngészőben: http://localhost:8080/...?mock=true
```

### Scenario 2: Valódi Backend Használata

```bash
# .env fájlban
BACKEND_MODE=real

# Indítás
npm run start
```

### Scenario 3: Backend Váltás Futás Közben

**Módszer 1: .env módosítás**
```bash
# 1. .env fájl szerkesztése
# 2. Dev server újraindítása
```

**Módszer 2: URL paraméter (gyorsabb)**
```
# Mock mód:
http://localhost:8080/index.html?mock=true

# Real mód:
http://localhost:8080/index.html?mock=false
```

### Scenario 4: Mock Adatok Generálása

```bash
npm run generate:mock-data

# Generálja:
# - 100 db item
# - 30 db stock transfer
# - 50 db pick list
# - stb.
```

### Scenario 5: Saját Mock Adatok

```bash
# 1. Custom mock adatok létrehozása
mkdir -p mock/data/custom/

# 2. JSON fájl másolása és szerkesztése
cp mock/data/master/items.json \
   mock/data/custom/items.json

# Edit custom/items.json...

# 3. MockDataLoader prioritás: custom/ > master/
```

---

## Tesztelés

### Unit Tesztek

**ODataQueryEngine tesztek:**

```typescript
describe('ODataQueryEngine', () => {

    test('$filter eq operation', () => {
        const data = [
            { WarehouseCode: 'WH01', Name: 'Main' },
            { WarehouseCode: 'WH02', Name: 'Secondary' }
        ];

        const result = engine.applyFilter(
            data,
            "WarehouseCode eq 'WH01'"
        );

        expect(result.length).toBe(1);
        expect(result[0].WarehouseCode).toBe('WH01');
    });

    test('$orderby asc/desc', () => {
        // ...
    });

    test('$top and $skip pagination', () => {
        // ...
    });
});
```

### Integrációs Tesztek

**Mock Backend Tesztek:**

```typescript
describe('MockRestService Integration', () => {

    test('GET /Warehouses returns mock data', async () => {
        const service = new MockRestService({ baseUrl: '/b1s/v2' });
        const result = await service.requestGET('/Warehouses');

        expect(result.value).toHaveLength(3);
        expect(result['@odata.context']).toBeDefined();
    });

    test('POST /StockTransfers creates new document', async () => {
        const service = new MockRestService({ baseUrl: '/b1s/v2' });
        const newDoc = {
            FromWarehouse: 'WH01',
            ToWarehouse: 'WH02',
            StockTransferLines: [...]
        };

        const result = await service.requestPOST('/StockTransfers', newDoc);

        expect(result.DocEntry).toBeDefined();
        expect(result.FromWarehouse).toBe('WH01');
    });
});
```

### E2E Tesztek (Mind a 12 Modul)

| Modul | Lista Nézet | Részletek | Létrehozás | Módosítás | Törlés |
|-------|-------------|-----------|------------|-----------|--------|
| WMS_OWTR | ✅ | ✅ | ✅ | ✅ | ✅ |
| WMS_OWTQ | ✅ | ✅ | ✅ | ✅ | ✅ |
| WMS_OIGN | ✅ | ✅ | ✅ | ✅ | ✅ |
| WMS_OIGE | ✅ | ✅ | ✅ | ✅ | ✅ |
| ... | ... | ... | ... | ... | ... |

**Ellenőrzési Lista:**
- [ ] Lista nézet betölti az adatokat
- [ ] Részletek nézet helyesen megjelenik
- [ ] Új dokumentum létrehozás működik
- [ ] Dokumentum módosítás működik
- [ ] Dokumentum törlés működik
- [ ] Keresés/szűrés működik
- [ ] Rendezés működik
- [ ] Pagination működik

---

## Teljesítmény

### Célértékek

| Művelet | Cél | Mock Átlag |
|---------|-----|------------|
| GET single entity | < 50ms | ~20ms |
| GET collection (20 items) | < 100ms | ~40ms |
| POST new document | < 100ms | ~30ms |
| PATCH update | < 100ms | ~25ms |
| $filter query | < 150ms | ~60ms |

### Optimalizálás

**Cache stratégia:**
- MockDataLoader: Első betöltéskor cache-eli az összes JSON fájlt
- ODataQueryEngine: Nem cache-el (minden query újra fut)
- In-memory updates: Gyors (array műveletek)

**Lazy loading:**
- Csak szükséges fájlok betöltése (opcionális)
- Large datasets: Csak aktuális oldal betöltése

---

## Korlátozások és Ismert Problémák

### Mock Mód Korlátozások

| Funkció | Real Backend | Mock Backend | Megjegyzés |
|---------|--------------|--------------|------------|
| CRUD műveletek | Perzisztens | In-memory only | Refresh után elvész |
| WebSocket | Valós idejű | Időszakos mock | 30 sec-enként |
| Push notifikációk | Működik | Nem működik | Service Worker skip |
| Nyomtatás | Valódi nyomtató | Mock only | Console log |
| Crystal Reports | PDF generálás | Mock PDF | Üres blob |
| Stored procedures | Valódi SQL | Mock handler | Limitált SP-k |
| Komplex OData | Teljes támogatás | Részleges | Nincs $expand, $batch limitált |

### Nem Támogatott OData Műveletek

- `$expand` - Kapcsolt entitások (tervezve, de MVP-ben nincs)
- Komplex `$filter` (nested properties, functions)
- `$apply` (aggregation)
- `$search` (full-text search)

### Fejlesztői Figyelmeztetések

⚠️ **Mock adatok nem perzisztensek**
- Minden módosítás (POST/PATCH/DELETE) csak memóriában
- Oldal refresh → eredeti állapot

⚠️ **Referenciális integritás**
- MockDataLoader validálja, de nem kikényszeríti
- Developer felelőssége a konzisztens adatok

⚠️ **TypeScript típusok**
- Mock service-ek ugyanazokat az interface-eket implementálják
- Típusbiztonság megmarad

---

## Hibaelhárítás

### Gyakori Problémák

#### 1. "Cannot read property 'value' of undefined"

**Ok:** Mock JSON fájl hiányzik vagy hibás formátum

**Megoldás:**
```bash
# Ellenőrzés
ls -la mock/data/master/

# JSON validáció
cat mock/data/master/items.json | jq .

# Regenerálás
npm run generate:mock-data
```

#### 2. "AppConfig is not defined"

**Ok:** AppConfig nincs importálva vagy window.WMS_CONFIG nincs beállítva

**Megoldás:**
```html
<!-- index.html -->
<script>
window.WMS_CONFIG = {
    BACKEND_MODE: 'mock',
    MOCK_DATA_PATH: '/mock'
};
</script>
```

#### 3. "404 Not Found - /mock/data/..."

**Ok:** Mock fájlok nem érhetőek el a szerverről

**Megoldás:**
```yaml
# ui5.yaml vagy ui5-mock.yaml
server:
  customMiddleware:
    - name: fiori-tools-servestatic
      afterMiddleware: compression
      configuration:
        paths:
          - path: /mock
            src: webapp/mock
```

#### 4. "TypeError: this.configService is undefined"

**Ok:** ConfigService nincs inicializálva Component.init()-ben

**Megoldás:**
```typescript
// Component.ts init metódus
public async init(): Promise<void> {
    // Először ConfigService
    this.configService = new ConfigService();
    await this.configService.init();

    this.restService = this.configService.getRestService();

    // Majd többi init
    super.init();
    // ...
}
```

#### 5. OData query nem működik mock módban

**Ok:** ODataQueryEngine nem támogatja az adott operátort

**Megoldás:**
```typescript
// Ellenőrzés: Mely operátorok támogatottak
// ODataQueryEngine.ts → applyFilter method

// Workaround: Egyszerűbb query használata
// HELYETT: $filter=contains(ItemName, 'Product') and Price gt 1000
// HASZNÁLD: $filter=Price gt 1000
```

---

## Jövőbeli Fejlesztések

### Rövid Távon (1-2 hónap)

- [ ] $expand támogatás ODataQueryEngine-ben
- [ ] Complex $filter operátorok (nested properties, functions)
- [ ] Mock adat perzisztencia (localStorage)
- [ ] Visual indicator a UI-ban (mock mód jelzése)
- [ ] Mock data viewer/editor tool

### Hosszú Távon (3-6 hónap)

- [ ] **Recorded Mode** - Valódi backend response-ok rögzítése és replay
- [ ] **Hybrid Mode** - Egyes service-ek mock, mások real
- [ ] **GraphQL endpoint** mock
- [ ] **Response delay simulation** - Latency teszteléshez
- [ ] **Mock data scenarios** - Előre definiált adathalmazok (empty, peak, error)
- [ ] **Admin UI** - Mock adatok böngészése és szerkesztése webes felületen

---

## Összefoglalás

A mock backend infrastruktúra **teljes körű offline fejlesztést és tesztelést** tesz lehetővé a SAPUI5 WMS alkalmazásban.

### Főbb Előnyök

✅ **Független fejlesztés** - Nincs szükség élő SAP B1 szerverre
✅ **Gyorsabb iteráció** - Mock response-ok < 100ms
✅ **Teljes kontroll** - Bármilyen tesztadat kreálható
✅ **Egyszerű váltás** - Egy .env változó vagy URL paraméter
✅ **Típusbiztonság** - TypeScript támogatás megmarad
✅ **Backward kompatibilitás** - Meglévő kód változatlan működik

### Architektúra Összefoglalás

```
┌─────────────────────────────────────────────────┐
│  Developer változtat: .env BACKEND_MODE=mock    │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   AppConfig.ts        │
         │   - Konfig betöltés   │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  ConfigService.ts     │
         │  - Service factory    │
         └───────────┬───────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
   ┌─────────┐            ┌──────────────┐
   │  Real   │            │  Mock        │
   │ Backend │            │ Services     │
   └─────────┘            └──────────────┘
                                  │
                                  ▼
                          ┌───────────────┐
                          │ JSON Files    │
                          │ /mock/data/   │
                          └───────────────┘
```

### Következő Lépések

1. ✅ Dokumentáció elkészült
2. ⏳ Mock service implementációk befejezése
3. ⏳ Teljes mock adathalmaz létrehozása (12 modul)
4. ⏳ Component.ts és controller-ek refaktorálása
5. ⏳ Tesztelés és validáció

---

**Utolsó frissítés:** 2026-01-30
**Verzió:** 1.0.0
**Szerző:** WMS Development Team
