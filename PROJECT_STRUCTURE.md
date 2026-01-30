# 📁 Projekt Struktúra

**Dátum:** 2026-01-31  
**Verzió:** 2.0.0 (Átstrukturálva)

---

## 🎯 Változások

**Előző struktúra:**
```
wms/webapp/
  ├── config/
  ├── mock/
  ├── services/
  └── test/
```

**Új struktúra (projekt gyökér):**
```
/
├── config/
├── mock/
├── services/
├── test/
└── tests/
```

**Miért?**
- Egyszerűbb elérési utak
- Könnyebb navigáció
- Tisztább projekt struktúra
- Nincs dupla beágyazás

---

## 📂 Teljes Projekt Struktúra

```
mock-server-setup-check/
│
├── config/                    # Konfigurációs fájlok
│   └── AppConfig.ts           # Backend konfiguráció
│
├── mock/                      # Mock backend implementáció
│   ├── data/                  # JSON mock adatok
│   │   ├── master/            # Master adatok (6 fájl)
│   │   ├── transactions/      # Tranzakciók (11 fájl)
│   │   ├── system/            # Rendszer adatok (4 fájl)
│   │   └── views/             # View-k (1 fájl)
│   └── services/              # Mock service-ek
│       ├── MockDataLoader.ts
│       ├── ODataQueryEngine.ts
│       ├── MockRestService.ts
│       ├── MockODBCService.ts
│       └── MockWebSocketService.ts
│
├── services/                  # Service factory
│   └── ConfigService.ts       # Real/Mock mode váltás
│
├── test/                      # Unit & E2E tesztek
│   ├── unit/mock/             # Jest unit tesztek (3 fájl)
│   └── e2e/                   # Playwright E2E tesztek (2 fájl)
│
├── tests/                     # CURL tesztek
│   └── curl/                  # HTTP tesztek (7 fájl)
│       ├── 01-basic-endpoints.sh
│       ├── 02-odata-queries.sh
│       ├── 03-crud-operations.sh
│       ├── 04-authentication.sh
│       ├── run-all-tests.sh
│       ├── demo.sh
│       └── README.md
│
├── scripts/                   # Utility scriptek
│   ├── validate-mock-data.sh
│   └── install-mock-backend.sh
│
├── docs/                      # Dokumentáció
│   ├── README.md
│   ├── projekt-osszefoglalo.md
│   ├── mock-backend-architektura.md
│   └── mock-backend-fejlesztoi-utmutato.md
│
├── jest.config.js             # Jest konfiguráció
├── playwright.config.ts       # Playwright konfiguráció
├── tsconfig.test.json         # TypeScript teszt konfiguráció
├── package.json               # NPM konfiguráció
├── .env                       # Környezeti változók
├── .env.example               # Példa .env
├── .gitignore                 # Git ignore szabályok
│
└── Documentation Files        # Markdown dokumentáció
    ├── CURL_TEST_COMPLETE.md
    ├── CURL_TEST_SUITE.md
    ├── FINAL_SUMMARY.md
    ├── IMPLEMENTATION_COMPLETE.md
    ├── MOCK_BACKEND_INSTALL.md
    ├── MOCK_BACKEND_QUICK_REFERENCE.md
    ├── PROJECT_STRUCTURE.md (ez a fájl)
    ├── TESTING_SUMMARY.md
    ├── TEST_IMPLEMENTATION_COMPLETE.md
    └── TEST_SCENARIOS.md
```

---

## 🗂️ Fájl Kategóriák

### Mock Backend (29 fájl)
- **Services:** 5 TypeScript fájl
- **Data:** 22 JSON fájl
- **Config:** 2 TypeScript fájl

### Tesztek (73+ teszt)
- **Unit tests:** 3 fájl, 58 teszt
- **E2E tests:** 2 fájl, 15 teszt
- **CURL tests:** 4 script, 61 teszt

### Dokumentáció (13 fájl)
- **Guides:** 4 fájl (docs/)
- **References:** 9 fájl (root)

### Scripts (2 fájl)
- Validation
- Installation

---

## 📋 Elérési Utak Összehasonlítás

| Komponens | Régi útvonal | Új útvonal |
|-----------|-------------|-----------|
| **AppConfig** | `wms/webapp/config/AppConfig.ts` | `config/AppConfig.ts` |
| **Mock Data** | `wms/webapp/mock/data/` | `mock/data/` |
| **Services** | `wms/webapp/mock/services/` | `mock/services/` |
| **ConfigService** | `wms/webapp/services/` | `services/` |
| **Unit Tests** | `wms/webapp/test/unit/` | `test/unit/` |
| **E2E Tests** | `wms/webapp/test/e2e/` | `test/e2e/` |

---

## 🔧 Frissített Konfigurációk

### jest.config.js
```javascript
roots: ['<rootDir>/test']
collectCoverageFrom: ['mock/services/**/*.{ts,tsx}']
```

### playwright.config.ts
```typescript
testDir: './test/e2e'
```

### validate-mock-data.sh
```bash
MOCK_DATA_DIR="mock/data"
```

---

## ✅ Validáció

**JSON adatok:**
```bash
npm run validate:json
# ✅ 22/22 fájl érvényes
```

**Unit tesztek:**
```bash
npm run test:unit
# ✅ 53/53 teszt sikeres
```

**Projekt struktúra:**
```bash
ls -la
# ✅ config/, mock/, services/, test/, tests/ a gyökérben
```

---

## 🚀 Használat

### Importok (régi)
```typescript
import { AppConfig } from "../wms/webapp/config/AppConfig";
import MockDataLoader from "../wms/webapp/mock/services/MockDataLoader";
```

### Importok (új)
```typescript
import { AppConfig } from "./config/AppConfig";
import MockDataLoader from "./mock/services/MockDataLoader";
```

### Fájl elérés
```typescript
// Régi
const dataPath = "/wms/webapp/mock/data/master/users.json";

// Új
const dataPath = "/mock/data/master/users.json";
```

---

## 📊 Statisztika

| Metrika | Érték |
|---------|-------|
| **Összes fájl** | 60+ |
| **Mock fájlok** | 29 |
| **Teszt fájlok** | 9 |
| **Dokumentáció** | 13 |
| **Scripts** | 9 |
| **Konfiguráció** | 6 |

---

## 🎉 Előnyök

✅ **Egyszerűbb útvonalak** - Kevesebb beágyazás
✅ **Gyorsabb navigáció** - Kevesebb mappaszint
✅ **Tisztább struktúra** - Logikus elrendezés
✅ **Könnyebb karbantartás** - Átláthatóbb
✅ **Jobb DX** - Developer Experience javult

---

**Verzió:** 2.0.0  
**Dátum:** 2026-01-31  
**Státusz:** ✅ Complete
