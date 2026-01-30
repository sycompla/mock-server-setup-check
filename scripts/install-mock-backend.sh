#!/bin/bash
#===============================================================================
# Mock Backend Telepítő Script
#
# Ez a script átmásolja a WMS mock backend rendszert egy új projektbe.
#
# Használat:
#   cd /path/to/new-project
#   bash /path/to/install-mock-backend.sh
#
# Vagy ha a script a projekt gyökerében van:
#   bash scripts/install-mock-backend.sh /path/to/target-project
#===============================================================================

set -e  # Exit on error

# Színek a szebb output-hoz
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SOURCE_PROJECT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Target project (paraméterből vagy aktuális könyvtár)
if [ -z "$1" ]; then
    TARGET_PROJECT="$(pwd)"
else
    TARGET_PROJECT="$1"
fi

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Mock Backend Telepítő - WMS Project              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "📦 Forrás projekt: ${YELLOW}$SOURCE_PROJECT${NC}"
echo -e "🎯 Cél projekt:    ${YELLOW}$TARGET_PROJECT${NC}"
echo ""

# Ellenőrzések
if [ ! -d "$SOURCE_PROJECT/wms/webapp/mock" ]; then
    echo -e "${RED}❌ Hiba: Mock könyvtár nem található a forrás projektben!${NC}"
    echo -e "${RED}   Útvonal: $SOURCE_PROJECT/wms/webapp/mock${NC}"
    exit 1
fi

if [ ! -d "$TARGET_PROJECT" ]; then
    echo -e "${RED}❌ Hiba: Cél projekt könyvtár nem létezik!${NC}"
    echo -e "${RED}   Útvonal: $TARGET_PROJECT${NC}"
    exit 1
fi

# Confirmation
echo -e "${YELLOW}⚠️  Ez a művelet átmásolja a mock backend fájlokat.${NC}"
echo -e "${YELLOW}   Meglévő fájlok felülírásra kerülnek!${NC}"
echo ""
read -p "Folytatod? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Telepítés megszakítva.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🚀 Telepítés megkezdése...${NC}"
echo ""

# 1. Mock könyvtár
echo -e "📂 Mock könyvtár másolása..."
mkdir -p "$TARGET_PROJECT/wms/webapp"
cp -r "$SOURCE_PROJECT/wms/webapp/mock" "$TARGET_PROJECT/wms/webapp/"
echo -e "   ${GREEN}✓${NC} Mock könyvtár átmásolva"

# 2. Config könyvtár
echo -e "⚙️  Config könyvtár másolása..."
cp -r "$SOURCE_PROJECT/wms/webapp/config" "$TARGET_PROJECT/wms/webapp/"
echo -e "   ${GREEN}✓${NC} Config könyvtár átmásolva"

# 3. .env.example
echo -e "📝 Konfiguráció fájlok másolása..."
cp "$SOURCE_PROJECT/.env.example" "$TARGET_PROJECT/"
echo -e "   ${GREEN}✓${NC} .env.example átmásolva"

# 4. .gitignore frissítése
if [ -f "$TARGET_PROJECT/.gitignore" ]; then
    echo -e "   ${YELLOW}⚠${NC}  .gitignore már létezik, merge szükséges"

    # Check if mock-related entries already exist
    if ! grep -q "# Mock data customizations" "$TARGET_PROJECT/.gitignore"; then
        echo "" >> "$TARGET_PROJECT/.gitignore"
        echo "# Environment files" >> "$TARGET_PROJECT/.gitignore"
        echo ".env" >> "$TARGET_PROJECT/.gitignore"
        echo ".env.local" >> "$TARGET_PROJECT/.gitignore"
        echo "" >> "$TARGET_PROJECT/.gitignore"
        echo "# Local UI5 configuration" >> "$TARGET_PROJECT/.gitignore"
        echo "ui5-local.yaml" >> "$TARGET_PROJECT/.gitignore"
        echo "" >> "$TARGET_PROJECT/.gitignore"
        echo "# Mock data customizations (optional)" >> "$TARGET_PROJECT/.gitignore"
        echo "wms/webapp/mock/data/custom/" >> "$TARGET_PROJECT/.gitignore"
        echo "" >> "$TARGET_PROJECT/.gitignore"
        echo "# Build artifacts" >> "$TARGET_PROJECT/.gitignore"
        echo "dist-mock/" >> "$TARGET_PROJECT/.gitignore"
        echo -e "   ${GREEN}✓${NC} .gitignore frissítve mock bejegyzésekkel"
    else
        echo -e "   ${GREEN}✓${NC} .gitignore már tartalmazza a mock bejegyzéseket"
    fi
else
    cp "$SOURCE_PROJECT/.gitignore" "$TARGET_PROJECT/"
    echo -e "   ${GREEN}✓${NC} .gitignore átmásolva"
fi

# 5. Dokumentáció
echo -e "📚 Dokumentáció másolása..."
mkdir -p "$TARGET_PROJECT/docs"
cp "$SOURCE_PROJECT/docs/mock-backend-architektura.md" "$TARGET_PROJECT/docs/" 2>/dev/null || echo -e "   ${YELLOW}⚠${NC}  mock-backend-architektura.md nem található"
cp "$SOURCE_PROJECT/docs/mock-backend-fejlesztoi-utmutato.md" "$TARGET_PROJECT/docs/" 2>/dev/null || echo -e "   ${YELLOW}⚠${NC}  mock-backend-fejlesztoi-utmutato.md nem található"
if [ -f "$SOURCE_PROJECT/docs/projekt-osszefoglalo.md" ]; then
    cp "$SOURCE_PROJECT/docs/projekt-osszefoglalo.md" "$TARGET_PROJECT/docs/"
fi
echo -e "   ${GREEN}✓${NC} Dokumentáció átmásolva (amennyiben elérhető)"

# 6. Scripts könyvtár (opcionális)
if [ -d "$SOURCE_PROJECT/scripts" ]; then
    echo -e "🔧 Scripts könyvtár másolása..."
    mkdir -p "$TARGET_PROJECT/scripts"
    if [ -f "$SOURCE_PROJECT/scripts/generateMockData.js" ]; then
        cp "$SOURCE_PROJECT/scripts/generateMockData.js" "$TARGET_PROJECT/scripts/"
        echo -e "   ${GREEN}✓${NC} generateMockData.js átmásolva"
    fi
fi

echo ""
echo -e "${GREEN}✅ Mock Backend alapok telepítve!${NC}"
echo ""

# Következő lépések megjelenítése
echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║              📋 KÖVETKEZŐ LÉPÉSEK                          ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "A mock backend használatához még ${YELLOW}3 fájlt${NC} kell módosítani:"
echo ""
echo -e "${GREEN}1.${NC} ConfigService.ts létrehozása"
echo -e "   Fájl: ${YELLOW}wms/webapp/services/ConfigService.ts${NC}"
echo -e "   Minta: docs/mock-backend-architektura.md → ConfigService szekció"
echo ""
echo -e "${GREEN}2.${NC} Component.ts módosítása"
echo -e "   Fájl: ${YELLOW}wms/webapp/Component.ts${NC}"
echo -e "   Változtatások:"
echo -e "     - Import ConfigService és AppConfig"
echo -e "     - init() metódusban ConfigService inicializálás"
echo -e "     - createODataModel() helper metódus hozzáadása"
echo -e "   Részletek: docs/mock-backend-architektura.md → Component.ts Módosítások"
echo ""
echo -e "${GREEN}3.${NC} package.json frissítése"
echo -e "   Fájl: ${YELLOW}wms/package.json${NC}"
echo -e "   Új scriptek:"
echo -e "     \"start:mock\": \"fiori run --open \\\"test/flpSandbox.html?mock=true#...\\\"\"\"
echo -e "     \"generate:mock-data\": \"node scripts/generateMockData.js\""
echo ""
echo -e "${GREEN}4.${NC} Environment konfiguráció"
echo -e "   Parancs: ${YELLOW}cp .env.example .env${NC}"
echo -e "   Szerkeszd a .env fájlt: ${YELLOW}BACKEND_MODE=mock${NC}"
echo ""
echo -e "${GREEN}5.${NC} Tesztelés"
echo -e "   Parancs: ${YELLOW}npm run start:mock${NC}"
echo ""
echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║              📖 DOKUMENTÁCIÓ                               ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Teljes útmutató:"
echo -e "  ${YELLOW}docs/mock-backend-architektura.md${NC}"
echo -e "  ${YELLOW}docs/mock-backend-fejlesztoi-utmutato.md${NC}"
echo ""
echo -e "Gyors referencia:"
echo -e "  ${YELLOW}docs/README.md${NC}"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Mock Backend telepítés befejezve! 🎉${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
