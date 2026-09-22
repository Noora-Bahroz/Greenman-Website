"""
Extract technical data from ALL Strut Channel PDF pages and update JSON catalog
This processes pages 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29
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
            print(f"❌ Page {page_number} does not exist in PDF")
            return None
        
        page = pdf.pages[page_number - 1]  # 0-indexed
        text = page.extract_text()
        
        if not text:
            print(f"❌ Could not extract text from page {page_number}")
            return None
        
        # Extract product identification from title (e.g., "Strut Profile GM412115")
        title_match = re.search(r'Strut Profile (GM[A-Z]?\d+)', text, re.IGNORECASE)
        if not title_match:
            print(f"❌ Could not find product identification on page {page_number}")
            return None
        
        identification = title_match.group(1).upper()
        
        # Try to extract table data first
        tables = page.extract_tables()
        
        properties = None
        for table in tables:
            if not table:
                continue
            
            # Look for the row with the identification
            for row in table:
                if row and identification in str(row[0] or ''):
                    # Parse the values (handling different table formats)
                    try:
                        # Parse each field carefully - "00" for length means 3.6m standard
                        properties = {
                            "identification": identification,
                            "weight_kg_m": float(row[1]) if row[1] and row[1] not in ['—', '', None] else None,
                            "length_mtr": 3.6 if row[2] in ['00', '0', ''] else (float(row[2]) if row[2] and row[2] != '—' else None),
                            "area_mm2": int(row[3]) if row[3] and row[3] not in ['—', '', None] else None,
                            "cd_mm": float(row[4]) if row[4] and row[4] not in ['—', '', None] else None,
                            "iz_mm4": int(row[5]) if row[5] and row[5] not in ['—', '', None] else None,
                            "iy_mm4": int(row[6]) if row[6] and row[6] not in ['—', '', None] else None,
                            "wy_mm3": int(row[7]) if row[7] and row[7] not in ['—', '', None] else None,
                            "wz_mm3": int(row[8]) if row[8] and row[8] not in ['—', '', None] else None,
                        }
                        
                        # Extract size from Type line
                        size_match = re.search(r'Type GM41 (\d+)\s+(\d+\.?\d*)', text)
                        if size_match:
                            properties["size"] = f"41x{size_match.group(1)}x{size_match.group(2)}"
                        else:
                            # Try to find size pattern like "41x21x1.5"
                            size_match2 = re.search(r'(\d+)x(\d+)x(\d+\.?\d*)', text)
                            if size_match2:
                                properties["size"] = size_match2.group(0)
                        
                        return properties
                        
                    except (ValueError, IndexError) as e:
                        continue
        
        # If table extraction failed, try regex pattern matching
        pattern = rf'{identification}\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+)\s+(\d+\.?\d*)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)'
        match = re.search(pattern, text)
        
        if match:
            # "00" in length field means standard 3.6m
            length_val = match.group(2)
            length_parsed = 3.6 if length_val in ['00', '0'] else float(length_val)
            
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
            
            return properties
        
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
            return True
    
    print(f"⚠️  Product {product_id} not found in catalog")
    return False


def process_all_pages():
    """
    Process all odd pages from 3 to 29 (3, 5, 7, 9, ..., 29)
    """
    pdf_path = Path("Product-Catalogues-PDF/Greenman Strut Channel GM41 Series.pdf")
    catalog_path = Path("data/strut-channel-catalog.json")
    
    if not pdf_path.exists():
        print(f"❌ PDF file not found: {pdf_path}")
        return
    
    if not catalog_path.exists():
        print(f"❌ Catalog file not found: {catalog_path}")
        return
    
    print("=" * 70)
    print("Processing all Strut Channel product pages (3, 5, 7, 9, ..., 29)")
    print("=" * 70)
    
    # Pages to process: 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29
    pages_to_process = list(range(3, 30, 2))
    
    results = {
        'success': [],
        'failed': []
    }
    
    # Load catalog once
    with open(catalog_path, 'r', encoding='utf-8') as f:
        catalog = json.load(f)
    
    for page_num in pages_to_process:
        print(f"\n📄 Processing page {page_num}...")
        
        properties = extract_product_data_from_page(pdf_path, page_num)
        
        if properties:
            identification = properties['identification']
            product_id = f"strut-profile-{identification.lower()}"
            
            # Find and update product
            updated = False
            for product in catalog['category']['products']:
                if product['id'] == product_id:
                    product['properties'].update(properties)
                    updated = True
                    break
            
            if updated:
                print(f"   ✅ {identification}: {properties.get('size', 'N/A')} - Weight: {properties.get('weight_kg_m', 'N/A')} kg/m")
                results['success'].append(identification)
            else:
                print(f"   ⚠️  {identification}: Product not found in catalog")
                results['failed'].append(f"{identification} (not in catalog)")
        else:
            print(f"   ❌ Failed to extract data from page {page_num}")
            results['failed'].append(f"Page {page_num}")
    
    # Write updated catalog back to file
    print("\n💾 Saving updated catalog...")
    with open(catalog_path, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, indent=2)
    
    # Print summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"✅ Successfully processed: {len(results['success'])} products")
    if results['success']:
        print(f"   {', '.join(results['success'])}")
    
    if results['failed']:
        print(f"\n❌ Failed: {len(results['failed'])} items")
        print(f"   {', '.join(results['failed'])}")
    
    print("\n✨ Done!")


if __name__ == "__main__":
    response = input("This will process pages 3-29 and update the catalog JSON. Continue? (y/n): ")
    if response.lower() == 'y':
        process_all_pages()
    else:
        print("Cancelled.")
