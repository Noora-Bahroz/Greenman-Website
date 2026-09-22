#!/bin/bash

# Document AI PDF Processing Script (Batch Mode for Large PDFs)
# Usage: ./process_pdf_documentai_batch.sh <path_to_pdf>

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

echo "=== Document AI PDF Processing (Batch Mode) ==="
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

# Check if GCS bucket exists, create if needed
BUCKET_NAME="${PROJECT_ID}-documentai"
echo "Checking GCS bucket..."
if ! gcloud storage buckets describe "gs://$BUCKET_NAME" --project="$PROJECT_ID" &>/dev/null; then
    echo "Creating GCS bucket: $BUCKET_NAME"
    gcloud storage buckets create "gs://$BUCKET_NAME" --project="$PROJECT_ID" --location="$REGION"
    echo "✓ Created bucket: $BUCKET_NAME"
else
    echo "✓ Using existing bucket: $BUCKET_NAME"
fi
echo ""

# Upload PDF to GCS
PDF_BASENAME=$(basename "$PDF_FILE")
GCS_INPUT_URI="gs://$BUCKET_NAME/input/$PDF_BASENAME"
GCS_OUTPUT_URI="gs://$BUCKET_NAME/output/"

echo "Uploading PDF to Cloud Storage..."
gcloud storage cp "$PDF_FILE" "$GCS_INPUT_URI" --project="$PROJECT_ID"
echo "✓ Uploaded to: $GCS_INPUT_URI"
echo ""

# Processor details
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

echo "Processing PDF with Document AI (Batch)..."
echo "Processor: $PROCESSOR_PATH"
echo ""

# Create batch process request
BATCH_REQUEST=$(cat <<EOF
{
  "inputDocuments": {
    "gcsPrefix": {
      "gcsUriPrefix": "$GCS_INPUT_URI"
    }
  },
  "documentOutputConfig": {
    "gcsOutputConfig": {
      "gcsUri": "$GCS_OUTPUT_URI"
    }
  }
}
EOF
)

# Save to temp file
BATCH_REQUEST_FILE=$(mktemp)
echo "$BATCH_REQUEST" > "$BATCH_REQUEST_FILE"

echo "Submitting batch processing request..."
BATCH_API_URL="https://$REGION-documentai.googleapis.com/v1/$PROCESSOR_PATH:batchProcess"

BATCH_RESPONSE=$(curl -s -X POST \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d @"$BATCH_REQUEST_FILE" \
    "$BATCH_API_URL")

rm -f "$BATCH_REQUEST_FILE"

# Extract operation name
OPERATION_NAME=$(echo "$BATCH_RESPONSE" | grep -o '"name": "[^"]*"' | head -1 | sed 's/"name": "\([^"]*\)"/\1/')

if [ -z "$OPERATION_NAME" ]; then
    echo "✗ Error: Failed to submit batch request"
    echo "Response: $BATCH_RESPONSE"
    exit 1
fi

echo "✓ Batch operation started: $OPERATION_NAME"
echo ""
echo "Waiting for processing to complete..."

# Poll operation status
MAX_WAIT=600  # 10 minutes
WAIT_TIME=0
POLL_INTERVAL=10

while [ $WAIT_TIME -lt $MAX_WAIT ]; do
    OPERATION_URL="https://$REGION-documentai.googleapis.com/v1/$OPERATION_NAME"
    
    OPERATION_STATUS=$(curl -s -X GET \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        "$OPERATION_URL")
    
    # Check if operation is done
    if echo "$OPERATION_STATUS" | grep -q '"done": true'; then
        echo "✓ Processing complete!"
        
        # Check for errors
        if echo "$OPERATION_STATUS" | grep -q '"error"'; then
            echo "✗ Processing failed:"
            echo "$OPERATION_STATUS" | grep -A20 '"error"'
            exit 1
        fi
        
        break
    fi
    
    echo -n "."
    sleep $POLL_INTERVAL
    WAIT_TIME=$((WAIT_TIME + POLL_INTERVAL))
done

if [ $WAIT_TIME -ge $MAX_WAIT ]; then
    echo ""
    echo "✗ Timeout: Processing took longer than expected"
    echo "Check operation status manually: $OPERATION_NAME"
    exit 1
fi

echo ""
echo "Downloading results from Cloud Storage..."

# List output files
OUTPUT_FILES=$(gcloud storage ls "$GCS_OUTPUT_URI" --project="$PROJECT_ID" 2>/dev/null || echo "")

if [ -z "$OUTPUT_FILES" ]; then
    echo "✗ No output files found in $GCS_OUTPUT_URI"
    exit 1
fi

# Download the first JSON file
FIRST_OUTPUT=$(echo "$OUTPUT_FILES" | grep -E '\.json$' | head -1)
if [ -z "$FIRST_OUTPUT" ]; then
    FIRST_OUTPUT=$(echo "$OUTPUT_FILES" | head -1)
fi

gcloud storage cp "$FIRST_OUTPUT" "$OUTPUT_FILE" --project="$PROJECT_ID"

echo "✓ Document AI processing complete!"
echo ""
echo "════════════════════════════════════════"
echo "✓ SUCCESS"
echo "════════════════════════════════════════"
echo "Output saved to: $OUTPUT_FILE"
echo "Location: $(pwd)/$OUTPUT_FILE"
echo ""

FILE_SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
echo "File size: $FILE_SIZE"
echo ""
echo "GCS locations:"
echo "  Input: $GCS_INPUT_URI"
echo "  Output: $GCS_OUTPUT_URI"
echo ""
