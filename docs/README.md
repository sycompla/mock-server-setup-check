# WMS Dokumentáció

Üdvözöllek a SAPUI5 WMS (Warehouse Management System) dokumentációjában!

---

## 📚 Elérhető Dokumentumok

### 1. [Projekt Összefoglaló](./projekt-osszefoglalo.md)
**Célcsoport:** Új csapattagok, projekt áttekintés

**Tartalom:**
- Mi ez a projekt?
- Főbb modulok és licenszek (12 WMS modul)
- Technológiai stack (SAPUI5, TypeScript, OData, WebSocket)
- Projekt struktúra és fájlrendszer
- Főbb funkciók kategóriánként
- NPM scriptek és developer workflow

**Mikor olvasd:**
- Csatlakozás a projekthez
- Projekt architektúra megértéséhez
- Gyors referencia a modulokhoz

---

### 2. [Mock Backend Architektúra](./mock-backend-architektura.md)
**Célcsoport:** Fejlesztők, architect-ek

**Tartalom:**
- Mock backend rendszer teljes architektúrája
- Backend integrációs pontok (8 különböző service)
- Konfiguráció (AppConfig, .env, ConfigService)
- Mock adatok struktúrája és formátumai
- Mock service-ek részletes leírása (MockRestService, ODataQueryEngine, stb.)
- Component.ts és Controller refaktorálás
- Teljesítmény, korlátozások, hibaelhárítás

**Mikor olvasd:**
- Mock backend használata előtt
- Új mock service implementálásához
- Architektúra döntések megértéséhez
- Problémák debug-olásához

---

### 3. [Mock Backend - Fejlesztői Útmutató](./mock-backend-fejlesztoi-utmutato.md)
**Célcsoport:** Fejlesztők (gyakorlati útmutató)

**Tartalom:**
- Gyors kezdés (environment setup, mock adatok generálása)
- Konfiguráció részletesen (.env, runtime config, URL paraméterek)
- Mock adatok kezelése (új entitások, JSON formátumok, generálás)
- Development workflow-k (frontend-first fejlesztés, bug reprodukálás, team collaboration)
- Új mock service hozzáadása (step-by-step)
- Tesztelés (unit, integration, E2E)
- Gyakori fejlesztési feladatok
- Best practices és troubleshooting

**Mikor olvasd:**
- Mock backend használatának megkezdésekor
- Új mock adat/service létrehozásához
- Development workflow kérdéseknél
- Problémák megoldásához (FAQ rész)

---

## 🚀 Gyors Kezdés

### Először Csatlakozol a Projekthez?

1. **Olvasd el:** [Projekt Összefoglaló](./projekt-osszefoglalo.md)
   - Megismered a projekt célját és felépítését
   - Megérted a 12 WMS modult
   - Látod a technológiai stack-et

2. **Telepítés:**
   ```bash
   cd /Volumes/DevAPFS/work/ui5/wms/wms
   npm install
   npm run start
   ```

3. **Következő lépések:**
   - Olvasd el a [Mock Backend - Fejlesztői Útmutató](./mock-backend-fejlesztoi-utmutato.md) Gyors Kezdés szekcióját
   - Próbáld ki a mock backend-et: `npm run start:mock`

---

### Mock Backend Használat?

1. **Gyors indítás:**
   ```bash
   cp .env.example .env
   # Szerkeszd: BACKEND_MODE=mock
   npm run start:mock
   ```

2. **Olvasd el:**
   - [Mock Backend - Fejlesztői Útmutató](./mock-backend-fejlesztoi-utmutato.md) → Teljes gyakorlati tudás
   - [Mock Backend Architektúra](./mock-backend-architektura.md) → Háttér architektúra megértéséhez

---

### Új Funkció Fejlesztése?

1. **Tervezés:** Nézd meg a releváns modult a [Projekt Összefoglaló](./projekt-osszefoglalo.md)-ban

2. **Mock adatok:** Hozz létre mock adatokat
   - [Mock Backend - Fejlesztői Útmutató](./mock-backend-fejlesztoi-utmutato.md) → "Új Mock Adat Hozzáadása" szekció

3. **Fejlesztés:** Mock módban dolgozz
   ```bash
   BACKEND_MODE=mock npm run start:mock
   ```

4. **Tesztelés:** Real backend-del teszteld
   ```bash
   BACKEND_MODE=real npm run start
   ```

---

## 🗂️ Dokumentum Térkép

```
docs/
├── README.md                              # Ez a fájl - Navigáció
├── projekt-osszefoglalo.md                # Projekt overview
├── mock-backend-architektura.md           # Mock rendszer architektúra
└── mock-backend-fejlesztoi-utmutato.md    # Gyakorlati fejlesztői guide
```

---

## 📋 Témák Indexelése

### Backend Integráció
- **Architektúra:** [Mock Backend Architektúra](./mock-backend-architektura.md#architektúra-diagram)
- **8 Backend Service:** [Mock Backend Architektúra](./mock-backend-architektura.md#backend-integrációs-pontok)
- **ConfigService:** [Mock Backend Architektúra](./mock-backend-architektura.md#configservice)

### Konfiguráció
- **.env Setup:** [Fejlesztői Útmutató](./mock-backend-fejlesztoi-utmutato.md#konfiguráció)
- **AppConfig.ts:** [Mock Backend Architektúra](./mock-backend-architektura.md#appconfigts)
- **Runtime Config:** [Fejlesztői Útmutató](./mock-backend-fejlesztoi-utmutato.md#runtime-konfiguráció-indexhtml)

### Mock Adatok
- **JSON Formátumok:** [Mock Backend Architektúra](./mock-backend-architektura.md#mock-adatok-formátum)
- **Új Adat Hozzáadása:** [Fejlesztői Útmutató](./mock-backend-fejlesztoi-utmutato.md#új-mock-adat-hozzáadása)
- **Generálás:** [Fejlesztői Útmutató](./mock-backend-fejlesztoi-utmutato.md#2-script-alapú-generálás)

### Mock Services
- **MockRestService:** [Mock Backend Architektúra](./mock-backend-architektura.md#mockrestservice)
- **ODataQueryEngine:** [Mock Backend Architektúra](./mock-backend-architektura.md#odataqueryengine)
- **Új Service Hozzáadása:** [Fejlesztői Útmutató](./mock-backend-fejlesztoi-utmutato.md#új-mock-service-hozzáadása)

### WMS Modulok
- **12 Modul Listája:** [Projekt Összefoglaló](./projekt-osszefoglalo.md#főbb-modulok-licensz-alapján)
- **Modul Funkciók:** [Projekt Összefoglaló](./projekt-osszefoglalo.md#főbb-funkciók)
- **Licensz Kezelés:** [Mock Backend Architektúra](./mock-backend-architektura.md#systemlicensesjson)

### Technológiák
- **SAPUI5/TypeScript:** [Projekt Összefoglaló](./projekt-osszefoglalo.md#technológiák)
- **OData:** [Mock Backend Architektúra](./mock-backend-architektura.md#odata-collection-response)
- **WebSocket:** [Mock Backend Architektúra](./mock-backend-architektura.md#mockwebsocketservice)

### Fejlesztői Workflow
- **Development Scenariók:** [Fejlesztői Útmutató](./mock-backend-fejlesztoi-utmutato.md#development-workflow)
- **Tesztelés:** [Fejlesztői Útmutató](./mock-backend-fejlesztoi-utmutato.md#tesztelés)
- **Best Practices:** [Fejlesztői Útmutató](./mock-backend-fejlesztoi-utmutato.md#best-practices)

### Hibaelhárítás
- **Gyakori Problémák:** [Mock Backend Architektúra](./mock-backend-architektura.md#hibaelhárítás)
- **Troubleshooting:** [Fejlesztői Útmutató](./mock-backend-fejlesztoi-utmutato.md#troubleshooting)
- **Debug Logging:** [Fejlesztői Útmutató](./mock-backend-fejlesztoi-utmutato.md#2-odata-query-tesztelése-mock-módban)

---

## 🛠️ Gyakran Használt Parancsok

```bash
# Telepítés
npm install

# Indítás (real backend)
npm run start

# Indítás (mock backend)
npm run start:mock

# Mock adatok generálása
npm run generate:mock-data

# Build
npm run build

# Build (mock verzió)
npm run build:mock

# Tesztek
npm run unit-tests
npm run int-tests
npm run lint
npm run ts-typecheck
```

---

## 🔗 Hasznos Linkek

### Belső Dokumentáció
- [Projekt README](../README.md) - Projekt gyökér README
- [WMS README](../wms/README.md) - SAPUI5 app README

### Külső Források
- [SAPUI5 Documentation](https://sapui5.hana.ondemand.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [OData V4 Protocol](https://www.odata.org/documentation/)
- [SAP Business One Service Layer](https://help.sap.com/docs/SAP_BUSINESS_ONE_VERSION_FOR_SAP_HANA/68a2e87fb29941b5bf959a184d9c6727/4a0dde4ef73e4ffdae08f871bf61ca3c.html)

---

## 📝 Verziókövetés

| Verzió | Dátum | Változások |
|--------|-------|------------|
| 1.0.0 | 2026-01-30 | Kezdeti dokumentáció (Projekt Összefoglaló, Mock Backend Architektúra, Fejlesztői Útmutató) |

---

## 💬 Kapcsolat és Támogatás

**Kérdések? Problémák?**

1. **Először:** Nézd meg a [Hibaelhárítás](./mock-backend-architektura.md#hibaelhárítás) és [Troubleshooting](./mock-backend-fejlesztoi-utmutato.md#troubleshooting) szekciókat

2. **GitHub Issues:** Nyiss egy issue-t a projektben

3. **Team Chat:** Írj a #wms-dev csatornára

4. **Email:** wms-dev-team@company.com

---

## 🎯 Dokumentáció Roadmap

### Tervezett Dokumentumok

- [ ] **API Referencia** - Részletes API dokumentáció minden service-hez
- [ ] **Deployment Guide** - SAP BTP deployment lépések
- [ ] **Contributing Guide** - Hogyan járulj hozzá a projekthez
- [ ] **Testing Strategy** - Tesztelési stratégia és best practices
- [ ] **Performance Tuning** - Teljesítmény optimalizálás
- [ ] **Security Guide** - Biztonsági irányelvek
- [ ] **Production Checklist** - Production release ellenőrzési lista

### Frissítések

A dokumentáció folyamatosan frissül a projekt fejlődésével. Minden nagyobb változás után ellenőrizd a verzió információkat és changelog-ot.

---

**Utolsó frissítés:** 2026-01-30
**Dokumentáció verzió:** 1.0.0
**Projekt verzió:** 1.0.3
