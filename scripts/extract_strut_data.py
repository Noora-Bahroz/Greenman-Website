"""
Extract technical data from Strut Channel PDF and update JSON catalog
This script extracts Weight, Area, Centroid dist CD, Moment of Inertia, and Resistant Module values

PDF Table Structure:
Identification | Weight [kg/m] | Length [m] | Area [mm²] | Centroid dist CD [mm] |
Moment of Inertia mm⁴ Z-AXIS | Moment of Inertia mm⁴ Y-AXIS |
Resistant Module mm³ Z-AXIS | Resistant Module mm³ Y-AXIS
"""

import json
import re
import pdfplumber
from pathlib import Path

def extract_product_data_from_page(pdf_path, page_number):
    """
    Extract technical data from a single PDF page
    Returns a dictionary with the product identification and properties
    """
    with pdfplumber.open(pdf_path) as pdf:
        if page_number > len(pdf.pages):
            print(f"Page {page_number} does not exist in PDF")
            return None
        
        page = pdf.pages[page_number - 1]  # 0-indexed
        text = page.extract_text()
        
        if not text:
            print(f"Could not extract text from page {page_number}")
            return None
        
        print(f"\n--- Extracted text from page {page_number} ---")
        print(text[:500])  # Print first 500 chars for debugging
        print("--- End of excerpt ---\n")
        
        # Extract product identification from title (e.g., "Strut Profile GM412115")
        title_match = re.search(r'Strut Profile (GM[A-Z]?\d+)', text, re.IGNORECASE)
        if not title_match:
            print(f"Could not find product identification on page {page_number}")
            return None
        
        identification = title_match.group(1).upper()
        print(f"Found identification: {identification}")
        
        # Extract the properties table
        # Looking for pattern like: GM412115 | 1.19 | 00 | 142 | 8.06 | 30895 | 9456 | 1738 | 742
        # The table headers are: Identification | Weight [kg/m] | Length [m] | Area [mm2] | Centroid dist CD [mm] | 
        #                        Moment of Inertia mm4 Z-AXIS | Moment of Inertia mm4 Y-AXIS | 
        #                        Resistant Module mm3 Z-AXIS | Resistant Module mm3 Y-AXIS
        
        # Try to extract table data
        tables = page.extract_tables()
        
        properties = None
        for table in tables:
            if not table:
                continue
            
            # Look for the row with the identification
            for row in table:
                if row and identification in str(row[0] or ''):
                    print(f"Found data row: {row}")
                    
                    # Parse the values (handling different table formats)
                    try:
                        # PDF table order: Identification | Weight [kg/m] | Length [m] | Area [mm2] | 
                        # Centroid dist CD [mm] | Moment of Inertia Z-AXIS | Moment of Inertia Y-AXIS |
                        # Resistant Module Z-AXIS | Resistant Module Y-AXIS
                        properties = {
                            "identification": identification,
                            "weight_kg_m": float(row[1]) if row[1] and row[1] not in ['—', '', None] else None,
                            "length_mtr": float(row[2]) if row[2] and row[2] not in ['—', '', '00', None] else None,
                            "area_mm2": int(row[3]) if row[3] and row[3] not in ['—', '', None] else None,
                            "cd_mm": float(row[4]) if row[4] and row[4] not in ['—', '', None] else None,
                            "iz_mm4": int(row[5]) if row[5] and row[5] not in ['—', '', None] else None,
                            "iy_mm4": int(row[6]) if row[6] and row[6] not in ['—', '', None] else None,
                            "wy_mm3": int(row[7]) if row[7] and row[7] not in ['—', '', None] else None,
                            "wz_mm3": int(row[8]) if row[8] and row[8] not in ['—', '', None] else None,
                        }
                        
                        # Extract size from another part of the page
                        size_match = re.search(r'Type GM41 (\d+)\s+(\d+\.?\d*)', text)
                        if size_match:
                            properties["size"] = f"41x{size_match.group(1)}x{size_match.group(2)}"
                        else:
                            # Try to find size pattern like "41x21x1.5"
                            size_match2 = re.search(r'(\d+)x(\d+)x(\d+\.?\d*)', text)
                            if size_match2:
                                properties["size"] = size_match2.group(0)
                        
                        print(f"Extracted properties: {properties}")
                        return properties
                        
                    except (ValueError, IndexError) as e:
                        print(f"Error parsing row data: {e}")
                        continue
        
        # If table extraction failed, try regex pattern matching
        print("Table extraction failed, trying regex pattern matching...")
        
        # Pattern for the data row
        pattern = rf'{identification}\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+)\s+(\d+\.?\d*)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)'
        match = re.search(pattern, text)
        
        if match:
            # Don't assume default length - use what's in PDF or None
            length_val = match.group(2)
            length_parsed = None if length_val in ['00', '0', ''] else float(length_val)
            
            properties = {
                "identification": identification,
                "weight_kg_m": float(match.group(1)),
                "length_mtr": length_parsed,
                "area_mm2": int(match.group(3)),
                "cd_mm": float(match.group(4)),
                "iz_mm4": int(match.group(5)),
                "iy_mm4": int(match.group(6)),
                "wy_mm3": int(match.group(7)),
                "wz_mm3": int(match.group(8)),
            }
            
            # Extract size
            size_match = re.search(r'Type GM41 (\d+)\s+(\d+\.?\d*)', text)
            if size_match:
                properties["size"] = f"41x{size_match.group(1)}x{size_match.group(2)}"
            
            print(f"Extracted properties via regex: {properties}")
            return properties
        
        print(f"Could not extract properties from page {page_number}")
        return None


def update_catalog_json(catalog_path, identification, properties):
    """
    Update the catalog JSON file with new properties
    """
    with open(catalog_path, 'r', encoding='utf-8') as f:
        catalog = json.load(f)
    
    # Find the product by identification
    product_id = f"strut-profile-{identification.lower()}"
    
    for product in catalog['category']['products']:
        if product['id'] == product_id:
            # Update properties
            product['properties'].update(properties)
            print(f"✅ Updated product {product_id}")
            
            # Write back to file
            with open(catalog_path, 'w', encoding='utf-8') as f:
                json.dump(catalog, f, indent=2)
            
            return True
    
    print(f"❌ Product {product_id} not found in catalog")
    return False


def test_single_page():
    """
    Test extraction on a single page (page 3 = GM412115)
    """
    pdf_path = Path("Product-Catalogues-PDF/Greenman Strut Channel GM41 Series.pdf")
    catalog_path = Path("data/strut-channel-catalog.json")
    
    if not pdf_path.exists():
        print(f"❌ PDF file not found: {pdf_path}")
        return
    
    if not catalog_path.exists():
        print(f"❌ Catalog file not found: {catalog_path}")
        return
    
    print("Testing data extraction from page 3 (GM412115)...")
    
    # Extract data from page 3
    properties = extract_product_data_from_page(pdf_path, 3)
    
    if properties:
        print(f"\n✅ Successfully extracted data:")
        print(json.dumps(properties, indent=2))
        
        # Ask user if they want to update the JSON
        response = input("\nDo you want to update the catalog JSON? (y/n): ")
        if response.lower() == 'y':
            update_catalog_json(catalog_path, properties['identification'], properties)
    else:
        print("\n❌ Failed to extract data from page 3")


if __name__ == "__main__":
    print("=" * 60)
    print("Strut Channel Data Extractor - Test Mode")
    print("=" * 60)
    test_single_page()
