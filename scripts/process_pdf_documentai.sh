#!/bin/bash

# Document AI PDF Processing Script
# Usage: ./process_pdf_documentai.sh <path_to_pdf>

set -e  # Exit on error

# Check if PDF path is provided
if [ -z "$1" ]; then
    echo "Error: Please provide a PDF file path"
    echo "Usage: $0 <path_to_pdf>"
    exit 1
fi

PDF_FILE="$1"
OUTPUT_FILE="output.json"

# Check if file exists
if [ ! -f "$PDF_FILE" ]; then
    echo "Error: File '$PDF_FILE' not found"
    exit 1
fi

echo "=== Document AI PDF Processing ==="
echo "PDF File: $PDF_FILE"
echo ""

# Get active project
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo "Error: No active GCP project found. Please run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi
echo "Project: $PROJECT_ID"

# Get region or default to 'us'
REGION=$(gcloud config get-value compute/region 2>/dev/null)
if [ -z "$REGION" ]; then
    REGION="us"
    echo "Region: $REGION (default)"
else
    echo "Region: $REGION"
fi
echo ""

# Processor details - Using OCR_PROCESSOR with imageless mode for up to 30 pages
PROCESSOR_TYPE="OCR_PROCESSOR"
PROCESSOR_NAME="CatalogParser"
PROCESSOR_ID=""

echo "Checking for existing Document AI processor..."

# Get access token
ACCESS_TOKEN=$(gcloud auth application-default print-access-token 2>/dev/null || gcloud auth print-access-token)

# List processors using REST API
LIST_URL="https://$REGION-documentai.googleapis.com/v1/projects/$PROJECT_ID/locations/$REGION/processors"

PROCESSORS_JSON=$(curl -s -X GET \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    "$LIST_URL")

# Parse JSON to find processor named CatalogParser
PROCESSOR_ID=$(echo "$PROCESSORS_JSON" | grep -B5 -A5 "\"displayName\": \"$PROCESSOR_NAME\"" | grep -o "\"name\": \"[^\"]*\"" | head -1 | sed 's/.*processors\/\([^"\/]*\).*/\1/')

if [ -z "$PROCESSOR_ID" ]; then
    echo "Processor 'CatalogParser' not found. Creating..."
    
    # Create processor using REST API
    CREATE_URL="https://$REGION-documentai.googleapis.com/v1/projects/$PROJECT_ID/locations/$REGION/processors"
    CREATE_BODY=$(cat <<EOF
{
  "displayName": "$PROCESSOR_NAME",
  "type": "$PROCESSOR_TYPE"
}
EOF
)
    
    CREATE_OUTPUT=$(curl -s -X POST \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$CREATE_BODY" \
        "$CREATE_URL")
    
    # Extract processor ID from creation output
    PROCESSOR_ID=$(echo "$CREATE_OUTPUT" | grep -o "\"name\": \"[^\"]*\"" | head -1 | sed 's/.*processors\/\([^"\/]*\).*/\1/')
    
    if [ -z "$PROCESSOR_ID" ]; then
        echo "Error: Failed to create processor"
        echo "Response: $CREATE_OUTPUT"
        exit 1
    fi
    
    echo "✓ Created processor: $PROCESSOR_ID"
else
    echo "✓ Found existing processor: $PROCESSOR_ID"
fi
echo ""

# Build processor path
PROCESSOR_PATH="projects/$PROJECT_ID/locations/$REGION/processors/$PROCESSOR_ID"

echo "Processing PDF with Document AI..."
echo "Processor: $PROCESSOR_PATH"
echo ""

# Encode PDF to base64
echo "Encoding PDF to base64..."
PDF_BASE64=$(base64 -w 0 "$PDF_FILE" 2>/dev/null || base64 "$PDF_FILE" | tr -d '\n')

# Create request JSON in a temporary file with imageless mode for up to 30 pages
REQUEST_FILE=$(mktemp)
cat > "$REQUEST_FILE" <<EOF
{
  "rawDocument": {
    "content": "$PDF_BASE64",
    "mimeType": "application/pdf"
  },
  "processOptions": {
    "ocrConfig": {
      "enableImageQualityScores": false,
      "enableSymbol": true,
      "computeStyleInfo": false,
      "disableCharacterBoxesDetection": true
    }
  },
  "imagelessMode": true,
  "skipHumanReview": true
}
EOF

echo "Calling Document AI API..."
API_URL="https://$REGION-documentai.googleapis.com/v1/$PROCESSOR_PATH:process"

HTTP_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d @"$REQUEST_FILE" \
    "$API_URL")

# Clean up temp file
rm -f "$REQUEST_FILE"

# Extract HTTP status code (last line)
HTTP_CODE=$(echo "$HTTP_RESPONSE" | tail -n1)
# Extract response body (everything except last line)
RESPONSE_BODY=$(echo "$HTTP_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    # Save response to output file
    echo "$RESPONSE_BODY" > "$OUTPUT_FILE"
    
    echo "✓ Document AI processing complete!"
    echo ""
    echo "════════════════════════════════════════"
    echo "✓ SUCCESS"
    echo "════════════════════════════════════════"
    echo "Output saved to: $OUTPUT_FILE"
    echo "Location: $(pwd)/$OUTPUT_FILE"
    echo ""
    
    # Extract some info from response
    PAGE_COUNT=$(echo "$RESPONSE_BODY" | grep -o '"pages":\s*\[' | wc -l)
    if [ "$PAGE_COUNT" -gt 0 ]; then
        echo "Pages processed: Check the JSON for details"
    fi
    
    FILE_SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
    echo "File size: $FILE_SIZE"
    echo ""
else
    echo "✗ Error: API request failed with HTTP code $HTTP_CODE"
    echo "Response:"
    echo "$RESPONSE_BODY"
    exit 1
fi
