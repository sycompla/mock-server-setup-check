#!/bin/bash

# Mock Data Validation Script
# Validates all JSON files in the mock data directory

echo "================================================"
echo "Mock Backend Data Validation"
echo "================================================"
echo ""

MOCK_DATA_DIR="wms/webapp/mock/data"
TOTAL_FILES=0
VALID_FILES=0
INVALID_FILES=0

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ Error: jq is not installed"
    echo "   Install with: brew install jq"
    exit 1
fi

echo "📁 Scanning directory: $MOCK_DATA_DIR"
echo ""

# Find all JSON files
for file in $(find "$MOCK_DATA_DIR" -name "*.json"); do
    TOTAL_FILES=$((TOTAL_FILES + 1))

    # Get relative path
    REL_PATH=${file#$MOCK_DATA_DIR/}

    # Validate JSON syntax
    if cat "$file" | jq . > /dev/null 2>&1; then
        echo "✅ $REL_PATH"
        VALID_FILES=$((VALID_FILES + 1))
    else
        echo "❌ $REL_PATH - INVALID JSON"
        INVALID_FILES=$((INVALID_FILES + 1))
    fi
done

echo ""
echo "================================================"
echo "SUMMARY"
echo "================================================"
echo "Total files:   $TOTAL_FILES"
echo "Valid files:   $VALID_FILES"
echo "Invalid files: $INVALID_FILES"
echo ""

if [ $INVALID_FILES -eq 0 ]; then
    echo "✅ All JSON files are valid!"
    exit 0
else
    echo "❌ Found $INVALID_FILES invalid JSON file(s)"
    exit 1
fi
