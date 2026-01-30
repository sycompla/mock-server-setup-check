# Mock Backend - Telepítési Útmutató

Ez a dokumentum leírja, hogyan telepítsd a WMS Mock Backend rendszert egy új vagy meglévő SAPUI5 projektbe.

---

## 📦 Csomag Tartalma

A `mock-backend-portable.tar.gz` archívum tartalmazza:

```
mock-backend-portable.tar.gz
├── wms/webapp/mock/              # Mock rendszer magja
│   ├── data/                     # Mock JSON adatok
│   │   ├── master/               # Master adatok (users, warehouses, items, stb.)
│   │   ├── transactions/         # Tranzakciós dokumentumok (12 modul)
│   │   ├── system/               # Rendszer konfigurációk (licenses, session)
│   │   └── views/                # Custom OData view-k
│   ├── services/                 # Mock service implementációk
│   │   ├── MockRestService.ts
│   │   ├── MockDataLoader.ts
│   │   ├── ODataQueryEngine.ts
│   │   ├── MockODBCService.ts
│   │   └── MockWebSocketService.ts
│   └── README.md                 # Mock rendszer leírás
│
├── wms/webapp/config/
│   └── AppConfig.ts              # Központi konfiguráció
│
├── .env.example                  # Environment változó sablon
├── .gitignore                    # Frissített gitignore
│
├── docs/                         # Dokumentáció
│   ├── README.md                 # Dokumentáció központ
│   ├── projekt-osszefoglalo.md   # Projekt áttekintés
│   ├── mock-backend-architektura.md
│   └── mock-backend-fejlesztoi-utmutato.md
│
└── scripts/
    └── install-mock-backend.sh   # Automatikus telepítő script
```

**Csomag méret:** ~30 KB (tömörítve)

---

## 🚀 Gyors Telepítés (Automatikus)

### Opció 1: Telepítő Script Használata

```bash
# 1. Archívum kicsomagolása ideiglenes helyre
mkdir /tmp/mock-backend
cd /tmp/mock-backend
tar -xzf /path/to/mock-backend-portable.tar.gz

# 2. Telepítő script futtatása
cd /path/to/your-project
bash /tmp/mock-backend/scripts/install-mock-backend.sh

# 3. Kész! A script átmásolja az összes szükséges fájlt
```

**Mit csinál a script?**
- ✅ Átmásolja a `wms/webapp/mock/` könyvtárat
- ✅ Átmásolja a `wms/webapp/config/` könyvtárat
- ✅ Létrehozza a `.env.example` fájlt
- ✅ Frissíti a `.gitignore` fájlt
- ✅ Átmásolja a dokumentációt
- ✅ Kiírja a következő lépéseket

---

## 🔧 Manuális Telepítés

Ha nem szeretnéd használni a scriptet, manuálisan is telepítheted:

### 1. Archívum Kicsomagolása

```bash
cd /path/to/your-project
tar -xzf /path/to/mock-backend-portable.tar.gz
```

Ez automatikusan a megfelelő helyekre rakja a fájlokat:
- `wms/webapp/mock/`
- `wms/webapp/config/`
- `.env.example`
- `docs/`
- stb.

### 2. .gitignore Frissítése (ha már létezik)

Ha a projekt már rendelkezik `.gitignore` fájllal, add hozzá ezeket a sorokat:

```gitignore
# Environment files
.env
.env.local

# Local UI5 configuration
ui5-local.yaml

# Mock data customizations (optional)
wms/webapp/mock/data/custom/

# Build artifacts
dist-mock/
```

---

## ⚙️ Konfiguráció (Kötelező Lépések)

A mock backend használatához **3 fájlt kell módosítani/létrehozni**:

### 1. ConfigService.ts létrehozása

**Fájl:** `wms/webapp/services/ConfigService.ts`

```typescript
import BaseService from "./BaseService";
import RestService from "../rest/RestService";
import MockRestService from "../mock/services/MockRestService";
import ODBCService from "./ODBCService";
import MockODBCService from "../mock/services/MockODBCService";
import { AppConfig } from "../config/AppConfig";

/**
 * Central configuration and service factory
 */
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
            return new MockRestService({ baseUrl, urlParameters: {} });
        }
        return new RestService({ baseUrl, urlParameters: {} });
    }
}
```

### 2. Component.ts módosítása

**Fájl:** `wms/webapp/Component.ts`

#### Import-ok hozzáadása (fájl elején):

```typescript
import ConfigService from "./services/ConfigService";
import { AppConfig } from "./config/AppConfig";
import MockWebSocketService from "./mock/services/MockWebSocketService";
```

#### Property hozzáadása (osztály szintjén):

```typescript
private configService: ConfigService;
```

#### init() metódus módosítása (sor ~120 körül):

```typescript
public async init(): Promise<void> {
    // ConfigService inicializálás ELŐSZÖR
    this.configService = new ConfigService();
    await this.configService.init();
    this.restService = this.configService.getRestService();

    // Eredeti init folytatása
    super.init();
    // ... többi init kód
}
```

#### createODataModel() helper metódus hozzáadása (osztály végén):

```typescript
/**
 * Factory method for creating ODataModel with proper backend URL
 */
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

#### WebSocket inicializálás módosítása (initWebsocket metódusban, sor ~492):

```typescript
private initWebsocket() {
    if (AppConfig.isMockMode()) {
        this.oWebSocket = new MockWebSocketService() as any;
        return;
    }

    // Eredeti WebSocket logika
    let wsUrl = window.location.hostname + ...;
    this.oWebSocket = new WebSocket(_wsProtocol + '://' + wsUrl + "ws");
    // ... többi kód
}
```

#### Ad-hoc RestService példányok cseréje (több helyen):

```typescript
// ELŐTT (sor ~399, 404, 412, 798, 977):
new RestService({ baseUrl: _printerServer }).requestGET("/printers")

// UTÁN:
this.configService.createRestService(_printerServer).requestGET("/printers")
```

### 3. package.json frissítése

**Fájl:** `wms/package.json`

Add hozzá ezeket a scripteket a `"scripts"` szekcióhoz:

```json
{
  "scripts": {
    "start:mock": "fiori run --open \"test/flpSandbox.html?mock=true#nttwms-display\"",
    "generate:mock-data": "node scripts/generateMockData.js"
  }
}
```

---

## 🎯 Első Használat

### 1. Environment Konfiguráció

```bash
# .env fájl létrehozása
cp .env.example .env

# .env fájl szerkesztése
nano .env
```

**.env tartalom mock módhoz:**

```bash
BACKEND_MODE=mock
MOCK_DATA_PATH=/mock
```

### 2. Mock Backend Indítása

```bash
npm run start:mock
```

Vagy alternatívaként URL paraméterrel:

```bash
npm run start
# Majd böngészőben: http://localhost:8080/index.html?mock=true
```

### 3. Bejelentkezés Mock Adatokkal

**Mock felhasználók (users.json):**

| Felhasználó | Jelszó | Jogosultság |
|-------------|--------|-------------|
| `admin` | `password` | Superuser, minden modul |
| `warehouse_user` | `password` | Raktári jogosultságok |

### 4. Ellenőrzés

A böngésző konzolban látni kell:

```
[AppConfig] Backend mode: mock
[MockDataLoader] Loading mock data...
[MockDataLoader] ✓ Loaded 15 files
```

---

## 🧪 Tesztelés

### Alap Funkciók Tesztelése

1. **Login Screen:**
   - Jelentkezz be `admin` / `password` felhasználóval

2. **Dashboard:**
   - Látszanak a WMS modulok
   - Licensz információk helyesek

3. **Stock Transfer:**
   - Nyisd meg: `/#/StockTransfer`
   - Lista betöltődik mock adatokkal
   - Új dokumentum létrehozható

4. **API Calls Ellenőrzése (Browser Console):**

```javascript
// RestService elérése
const component = sap.ui.getCore().byId('container-ntt.wms---app')
    .getController().getOwnerComponent();
const service = component.getRestService();

// Teszt lekérdezés
const warehouses = await service.requestGET("/Warehouses");
console.table(warehouses.value);
// → 3 raktár látható mock adatokból
```

---

## 📚 Dokumentáció

A telepítéssel együtt a következő dokumentumok is elérhetőek a `docs/` mappában:

1. **README.md** - Dokumentáció központ, navigáció
2. **projekt-osszefoglalo.md** - WMS projekt áttekintés, 12 modul leírása
3. **mock-backend-architektura.md** - Teljes architektúra, 8 backend service
4. **mock-backend-fejlesztoi-utmutato.md** - Gyakorlati fejlesztői guide

**Javasolt olvasási sorrend:**
1. `docs/README.md` → Gyors áttekintés
2. `docs/mock-backend-fejlesztoi-utmutato.md` → Gyakorlati használat
3. `docs/mock-backend-architektura.md` → Mélyebb megértés

---

## 🔄 Backend Váltás

### Mock → Real

```bash
# 1. .env szerkesztése
BACKEND_MODE=real

# 2. Újraindítás
npm run start
```

### Real → Mock

```bash
# 1. .env szerkesztése
BACKEND_MODE=mock

# 2. Újraindítás
npm run start:mock
```

### Gyors Váltás (URL Paraméter)

Futás közben is válthatsz URL paraméterrel:

```
Mock:  http://localhost:8080/index.html?mock=true
Real:  http://localhost:8080/index.html?mock=false
```

---

## 🛠️ Hibaelhárítás

### "Cannot find module './config/AppConfig'"

**Ok:** AppConfig.ts nincs a megfelelő helyen

**Megoldás:**

```bash
# Ellenőrzés
ls wms/webapp/config/AppConfig.ts

# Ha hiányzik, csomagold ki újra az archívumot
```

### "MockDataLoader: Failed to load JSON"

**Ok:** Mock JSON fájlok nem érhetőek el

**Megoldás:**

```bash
# Ellenőrzés
ls wms/webapp/mock/data/master/
ls wms/webapp/mock/data/system/

# Fájloknak léteznie kell
```

### "Backend mode: real" mock módban

**Ok:** .env fájl nincs megfelelően beállítva vagy AppConfig nem olvassa

**Megoldás:**

```bash
# 1. Ellenőrizd a .env fájlt
cat .env
# → BACKEND_MODE=mock

# 2. Browser console-ban
console.log(window.WMS_CONFIG);
// → { BACKEND_MODE: 'mock', ... }
```

### További segítség

Nézd meg a teljes hibaelhárítási útmutatót:
- `docs/mock-backend-architektura.md` → Hibaelhárítás szekció
- `docs/mock-backend-fejlesztoi-utmutato.md` → Troubleshooting szekció

---

## 📋 Telepítési Checklist

Használd ezt a checklistet a telepítés ellenőrzéséhez:

- [ ] Archívum kicsomagolva
- [ ] `wms/webapp/mock/` mappa létezik
- [ ] `wms/webapp/config/AppConfig.ts` létezik
- [ ] `.env.example` létezik
- [ ] `.gitignore` frissítve
- [ ] `ConfigService.ts` létrehozva (`wms/webapp/services/`)
- [ ] `Component.ts` módosítva (import, init, createODataModel)
- [ ] `package.json` frissítve (scriptek)
- [ ] `.env` fájl létrehozva (`cp .env.example .env`)
- [ ] `.env`-ben `BACKEND_MODE=mock`
- [ ] `npm run start:mock` sikeresen fut
- [ ] Bejelentkezés működik (`admin` / `password`)
- [ ] Mock adatok betöltődnek (console log)
- [ ] Dokumentáció elérhető (`docs/` mappa)

---

## 🎉 Gratulálunk!

Ha eljutottál idáig, a Mock Backend sikeresen telepítve van! 🚀

**Következő lépések:**

1. Olvasd el a [Fejlesztői Útmutatót](docs/mock-backend-fejlesztoi-utmutato.md)
2. Nézd meg a [Mock Adatok](wms/webapp/mock/data/) struktúráját
3. Próbálj ki különböző WMS modulokat
4. Hozz létre saját mock adatokat

**Kérdések?**
- Dokumentáció: `docs/README.md`
- Architektúra: `docs/mock-backend-architektura.md`
- Gyakorlati guide: `docs/mock-backend-fejlesztoi-utmutato.md`

---

**Verzió:** 1.0.0
**Utolsó frissítés:** 2026-01-30
**Kompatibilitás:** SAPUI5 1.116.0+, TypeScript 4.6+
