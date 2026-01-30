# Mock Backend - Gyors Referencia Kártya

1-oldalas gyors segédlet a WMS Mock Backend használatához.

---

## 🚀 Telepítés (3 perc)

```bash
# 1. Archívum kicsomagolása
tar -xzf mock-backend-portable.tar.gz

# 2. Telepítő futtatása
bash scripts/install-mock-backend.sh

# 3. Fájlok módosítása (lásd lentebb)
```

---

## ⚙️ Szükséges Módosítások

### 1. ConfigService.ts (új fájl)
`services/ConfigService.ts` → Lásd `MOCK_BACKEND_INSTALL.md`

### 2. Component.ts
```typescript
// Import
import ConfigService from "./services/ConfigService";
import { AppConfig } from "./config/AppConfig";

// Property
private configService: ConfigService;

// init() - sor ~120
this.configService = new ConfigService();
await this.configService.init();
this.restService = this.configService.getRestService();

// createODataModel() - új metódus
public createODataModel(serviceType: 'b1s' | 'view'): ODataModel {
    const urls = AppConfig.getBackendUrls();
    return new ODataModel({
        serviceUrl: serviceType === 'view' ? urls.b1s + '/view.svc/' : urls.b1s + '/',
        groupId: "$direct", synchronizationMode: "None", operationMode: "Server"
    });
}
```

### 3. package.json
```json
"scripts": {
    "start:mock": "fiori run --open \"test/flpSandbox.html?mock=true#...\"",
    "generate:mock-data": "node scripts/generateMockData.js"
}
```

---

## 🎯 Használat

### Indítás Mock Módban
```bash
cp .env.example .env
echo "BACKEND_MODE=mock" > .env
npm run start:mock
```

### Backend Váltás
```bash
# .env fájlban
BACKEND_MODE=mock   # Mock backend
BACKEND_MODE=real   # Valódi backend
```

### URL Paraméterrel
```
http://localhost:8080/index.html?mock=true   # Mock
http://localhost:8080/index.html?mock=false  # Real
```

---

## 👤 Mock Felhasználók

| User | Password | Jogosultság |
|------|----------|-------------|
| `admin` | `password` | Superuser |
| `warehouse_user` | `password` | Raktáros |

---

## 📁 Mock Adatok Helye

```
mock/data/
├── master/              # users, warehouses, items, stb.
├── transactions/        # 12 modul dokumentumai
├── system/              # licenses, session, modules
└── views/               # Custom OData view-k
```

---

## 🔧 Gyakori Parancsok

```bash
# Mock adatok generálása
npm run generate:mock-data

# Indítás (real)
npm run start

# Indítás (mock)
npm run start:mock

# Build (mock verzió)
npm run build:mock
```

---

## 🧪 Tesztelés (Browser Console)

```javascript
// RestService elérése
const c = sap.ui.getCore().byId('container-ntt.wms---app')
    .getController().getOwnerComponent();
const svc = c.getRestService();

// Mock adatok lekérdezése
await svc.requestGET("/Warehouses");
await svc.requestGET("/Items?$top=10");
await svc.requestGET("/StockTransfers");

// Backend mód ellenőrzése
console.log('Mock mode:', window.WMS_CONFIG.BACKEND_MODE);
```

---

## 🛠️ Gyors Hibaelhárítás

| Probléma | Megoldás |
|----------|----------|
| `Cannot find module './config/AppConfig'` | `ls config/AppConfig.ts` |
| `MockDataLoader: Failed to load` | `ls mock/data/master/` |
| Backend mode: real (mock helyett) | `.env`-ben `BACKEND_MODE=mock` |
| RestService undefined | `ConfigService` nincs inicializálva |

---

## 📚 Dokumentáció

| Dokumentum | Mire jó? |
|------------|----------|
| `MOCK_BACKEND_INSTALL.md` | **Telepítés** |
| `docs/mock-backend-fejlesztoi-utmutato.md` | **Gyakorlati használat** |
| `docs/mock-backend-architektura.md` | **Architektúra** |
| `docs/README.md` | **Navigáció** |

---

## 📦 Csomag Struktúra

```
mock-backend-portable.tar.gz (34 KB)
├── mock/              # Mock rendszer
├── config/            # AppConfig.ts
├── .env.example                  # Környezeti változók
├── .gitignore                    # Frissített
├── docs/                         # Dokumentáció (4 fájl)
├── scripts/install-mock-backend.sh
└── MOCK_BACKEND_INSTALL.md       # Telepítési útmutató
```

---

## ✅ Telepítési Checklist

- [ ] Archívum kicsomagolva
- [ ] `ConfigService.ts` létrehozva
- [ ] `Component.ts` módosítva
- [ ] `package.json` frissítve
- [ ] `.env` fájl létrehozva
- [ ] `BACKEND_MODE=mock` beállítva
- [ ] `npm run start:mock` működik
- [ ] Login sikeres (`admin`/`password`)

---

## 🎯 Következő Lépések

1. ✅ Telepítés befejezése
2. 📖 Olvasd el: `docs/mock-backend-fejlesztoi-utmutato.md`
3. 🧪 Teszteld a WMS modulokat
4. 🔧 Hozz létre saját mock adatokat
5. 🚀 Kezdd el a fejlesztést!

---

**Gyors segítség:** `docs/mock-backend-fejlesztoi-utmutato.md` → Troubleshooting

**Verzió:** 1.0.0 | **Dátum:** 2026-01-30
