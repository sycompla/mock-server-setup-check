# SAPUI5 WMS Projekt Összefoglaló

## 🎯 Mi ez a projekt?

Ez egy **Raktárkezelő Rendszer (WMS)** SAP Business One-hoz készítve, SAPUI5 és TypeScript technológiákkal. Mobile-first megközelítéssel készült, hogy raktári dolgozók könnyen tudják kezelni a készleteket, komissiózást, áruátadást stb.

---

## 📦 Főbb Modulok (Licensz alapján)

A rendszer licensz alapú modulokat használ, amelyeket be/ki lehet kapcsolni:

| Licensz Kód | Modul neve | Funkció |
|-------------|------------|---------|
| **WMS** | Globális licensz | Alaprendszer |
| **WMS_OWTQ** | Készletáttárolási kérelem | Raktárak közötti áthelyezési kérelmek |
| **WMS_OWTR** | Készletáttárolás | Raktárak közötti áthelyezések végrehajtása |
| **WMS_OIGE** | Anyagbevét | Anyag bevételezés (Material Receipt) |
| **WMS_OIGN** | Anyagkiadás | Anyag kiadás (Material Issue) |
| **WMS_ORDN** | Visszáru | Visszáru kezelés |
| **WMS_OPDN** | Áruberérkezés | Beszerzési szállítólevelek (Purchase Delivery Notes) |
| **WMS_ODLN** | Szállítás | Értékesítési szállítólevelek (Delivery/Shipping) |
| **WMS_OINV** | Számla | Számlák kezelése |
| **WMS_PICK** | Komissiózás | Komissiózási listák és folyamatok |
| **WMS_OWOR** | Gyártás készrejelentés | Gyártási rendelések készrejelentése |
| **WMS_OINC** | Leltár | Leltározás és készletszámlálás |

---

## 🛠️ Technológiák

### Frontend Keretrendszer
- **SAPUI5 v1.116.0** - SAP enterprise UI keretrendszer
- **TypeScript 4.6.3** - Típusbiztos JavaScript
- **XML Views** - Deklaratív UI meghatározás
- **sap_horizon téma** - Modern SAP kinézet

### Adatkezelés és Integráció
- **OData v4 Model** - Szerver oldali adatkötés
- **JSON Model** - Kliens oldali adatkötés
- **REST API** - Custom backend kommunikáció
- **WebSocket** - Valós idejű értesítések és frissítések

### Speciális Funkciók
- **Service Worker** - Offline működés támogatás
- **html5-qrcode v2.3.8** - Vonalkód/QR kód szkennelés
- **Barcode Scanner API** - SAP natív szkenner integráció
- **Web Speech API (BÉTA)** - Magyar nyelvű hangvezérlés
- **Crystal Reports** - Jelentésgenerálás

### Fejlesztői Eszközök
- **@ui5/cli v3.6.0** - UI5 parancssori eszközök
- **ESLint + TypeScript ESLint** - Kódminőség ellenőrzés
- **Babel** - JavaScript transzpiláció
- **QUnit + OPA5** - Unit és integrációs tesztek

---

## 📂 Projekt Struktúra

```
wms/
├── webapp/
│   ├── Component.ts              # Fő alkalmazás komponens (61.5 KB)
│   ├── manifest.json             # SAP Fiori app konfiguráció
│   ├── index.html                # Belépési pont
│   ├── sw.js                     # Service Worker
│   │
│   ├── controller/               # 24 controller
│   │   ├── Main.controller.ts    # Főoldal/Dashboard
│   │   ├── Login.controller.ts   # Bejelentkezés
│   │   ├── StockTransfer.controller.ts (118 KB)
│   │   ├── StockTransferFromRequest.controller.ts (210 KB)
│   │   ├── InventoryGenExits.controller.ts
│   │   ├── InventoryGenEntries.controller.ts
│   │   ├── PickListDetails.controller.ts
│   │   ├── DeliveryNotes.controller.ts
│   │   └── ... (további 16 controller)
│   │
│   ├── view/                     # XML nézetek (controller-eknek megfelelően)
│   │
│   ├── model/                    # TypeScript interface-ek és modellek
│   │   ├── User.ts               # Felhasználó adatok
│   │   ├── Permission.ts         # Jogosultságok
│   │   ├── License.ts            # Licensz kezelés
│   │   ├── Document.ts           # Dokumentum struktúra
│   │   ├── Items.ts              # Cikk/termék adatok
│   │   ├── Warehouses.ts         # Raktár konfiguráció
│   │   ├── BinLocations.ts       # Helyek kezelése
│   │   ├── StockTransfer.ts      # Készletátvitel dokumentum
│   │   ├── PickList.ts           # Komissiózási lista
│   │   └── ... (további modellek)
│   │
│   ├── m/                        # Custom komponensek és szolgáltatások
│   │   ├── BaseController.ts     # Alap controller közös formázókkal
│   │   ├── BaseDocumentController.ts (197 KB) # Dokumentum feldolgozás
│   │   ├── LogService.ts         # Naplózás
│   │   ├── NotificationService.ts # Értesítések
│   │   ├── CrystalReportsService.ts # Jelentések
│   │   ├── SignaturePad.ts       # Aláírás rögzítés
│   │   ├── UploadSet.ts          # Fájl feltöltés
│   │   └── ... (további szolgáltatások)
│   │
│   ├── speech/                   # Hangfelismerés modul
│   │   └── SpeechAPI.ts          # Magyar hangparancsok
│   │
│   ├── production/               # Gyártási modul
│   │   ├── ProductionOrders.controller.ts
│   │   ├── ProductionOrderDetails.controller.ts
│   │   └── ProductionOrderGenExit.controller.ts
│   │
│   ├── services/                 # Backend szolgáltatások
│   │   ├── RestService.ts        # HTTP kliens CSRF token kezeléssel
│   │   ├── BaseService.ts        # Alap szolgáltatás osztály
│   │   └── ODBCService.ts        # Adatbázis kapcsolat
│   │
│   ├── i18n/                     # Többnyelvűség
│   │   ├── i18n.properties       # Angol
│   │   └── i18n_hu.properties    # Magyar (alapértelmezett)
│   │
│   ├── css/                      # Egyedi stílusok
│   ├── images/                   # UI képek
│   ├── icons/                    # Ikon könyvtár
│   │
│   └── test/                     # Tesztek
│       ├── unit/                 # Unit tesztek
│       ├── integration/          # OPA integrációs tesztek
│       └── flpSandbox.html       # Fiori Launchpad sandbox
│
├── package.json                  # Függőségek és scriptek
├── tsconfig.json                 # TypeScript konfiguráció
├── ui5.yaml                      # UI5 build konfiguráció
├── mta.yaml                      # Multi-target app deployment
└── README.md                     # Projekt dokumentáció
```

**Kulcs statisztikák:**
- 105 TypeScript/XML fájl
- ~6,200 sor kód a core fájlokban
- 24 fő controller különböző WMS modulokhoz
- 22+ route/útvonal a modulokhoz

---

## 💡 Főbb Funkciók

### Készletkezelés
- ✅ Készletáttárolási kérelmek és átadások
- ✅ Anyagbevét (bejövő áruk)
- ✅ Anyagkiadás (kimenő áruk)
- ✅ Leltározás és egyeztetés

### Raktári Műveletek
- ✅ Többraktáros kezelés bin location-ökkel
- ✅ Vonalkód/sorozatszám alapú nyomon követés
- ✅ Batch és sorozatszám kezelés
- ✅ Valós idejű készlet láthatóság

### Dokumentumkezelés
- ✅ Beszerzési szállítólevelek
- ✅ Értékesítési szállítólevelek
- ✅ Visszáru és fordított logisztika
- ✅ Számla kezelés és integráció

### Komissiózás és Teljesítés
- ✅ Komissiózási listák létrehozása és kezelése
- ✅ Vonalkód szkennelés ellenőrzéshez
- ✅ Többsoros dokumentum támogatás

### Gyártás Integráció
- ✅ Gyártási rendelések készrejelentése
- ✅ Gyártásból történő bevét
- ✅ Anyagfelhasználás nyomon követés

### Jelentések és Követés
- ✅ Sofőr összesítők
- ✅ Szállítás követés
- ✅ Valós idejű értesítések
- ✅ Címke nyomtatás szállításokhoz

---

## 🎨 Felhasználói Felület Jellemzők

- **Reszponzív Design** - Asztali, tablet és mobil eszközökön egyaránt működik
- **Offline Képesség** - Service worker biztosítja az offline munkát szinkronizálással
- **Vonalkód Szkennelés** - Integrált QR/vonalkód olvasás
- **Hangparancsok (Béta)** - Speech API kihangosítás nélküli használathoz (magyarul)
  - Parancsok: "kiadó raktár", "fogadó raktár", "cikk", "vonalkód", "sarzs", "sorozatszám", "új sor", "mennyiség", "mentés", "kész/vége"
- **Valós idejű Értesítések** - WebSocket alapú figyelmeztetések
- **Keresés és Szűrés** - Fejlett value help dialógusok
- **Többnyelvűség** - Magyar és angol
- **Egyedi Szkriptek** - Bővíthető custom scriptekkel
- **Felhasználói Jogosultságok** - Modul szintű hozzáférés kontroll
- **Aláírás Rögzítés** - Szállítás megerősítéshez
- **Nyomtató Integráció** - Címke és dokumentum nyomtatás

---

## 🔌 Integrációs Pontok

- **SAP Business One Backend** - OData API integráció
- **Custom REST Services** - Backend API kommunikáció
- **WebSocket Server** - Valós idejű frissítések
- **Adatbázis Réteg** - ODBC szolgáltatások komplex lekérdezésekhez

---

## 🔑 Kulcs Üzleti Logika

- **Licensz Validáció** - Szabályozza mely modulokhoz férhetnek hozzá a felhasználók
- **Jogosultság Kezelés** - Finomhangolt felhasználói jogosultságok modulonként
- **Raktár Konfiguráció** - Többraktáros támogatás bin location-ökkel
- **Vonalkód Feldolgozás** - Komplex vonalkód elemzés mező kinyeréssel
- **Session Kezelés** - Felhasználói munkamenetek és hitelesítés
- **Hibakezelés** - Átfogó hibaüzenetek és naplózás

---

## 🚀 NPM Scriptek

```bash
npm start                 # Dev szerver indítása SAP Fiori preview-val
npm run start-local       # Lokális fejlesztés
npm run build             # Production build
npm run lint              # ESLint elemzés
npm run ts-typecheck      # TypeScript validáció
npm run unit-tests        # Unit tesztek futtatása
npm run int-tests         # Integrációs tesztek futtatása
npm run deploy            # Deploy SAP BTP-re
npm run build:mta         # Multi-target app build
```

---

## 📋 Összefoglalás Új Csapattagoknak

Ez egy **production-ready SAPUI5 alkalmazás** raktári dolgozók számára készítve, hogy mobil eszközökön kezeljék a készletet és teljesítsék a megrendeléseket. Az architektúra követi az SAP Component-Controller-View mintát, erős TypeScript használattal a típusbiztonság érdekében.

### Jól strukturált kódbázis:
- ✅ Tiszta separation of concerns (controller = logika, view = UI, model = adat)
- ✅ Központi Component app-szintű szolgáltatásokhoz
- ✅ Kiterjedt üzleti logika a BaseDocumentController-ben
- ✅ REST és OData integráció backend kommunikációhoz
- ✅ Átfogó i18n támogatás (magyar elsődleges)
- ✅ Tesztelési infrastruktúra unit és integrációs tesztekhez

A projekt aktívan karbantartott, modern fejlesztési gyakorlatokat használ (TypeScript, ESLint), és támogatja a SAP BTP-re történő deployment-et.

---

**Generálva:** 2026-01-30
**SAPUI5 verzió:** 1.116.0
**Generator:** @sap/generator-fiori-freestyle v1.9.0
**Licensz:** Lásd a projekt README.md fájlt
