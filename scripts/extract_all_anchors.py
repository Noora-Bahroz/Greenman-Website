"""
Extract all anchor products from the PDF
Each page has 1 product with same layout:
- Product title and code
- 2 images (3D and drawing)
- Specification table
- Product definition text
- Installation parameters table with varying rows
"""

import json
import re
import pdfplumber
from pathlib import Path

def clean_text(text):
    """Clean and normalize text"""
    if not text:
        return ""
    return text.strip().replace('\n', ' ').replace('  ', ' ')

def extract_product_code_from_title(text):
    """Extract product code from title like 'GreenBolt G2 Through Anchor - GBGTA'"""
    # Look for pattern: text followed by dash followed by GB code
    match = re.search(r'(.+?)\s*[-–]\s*(GB[A-Z]+)', text, re.IGNORECASE)
    if match:
        product_name = clean_text(match.group(1))
        product_code = match.group(2).upper()
        return product_name, product_code
    return None, None

def extract_specifications(text):
    """Extract specification fields from text"""
    specs = {}
    
    # Material
    if match := re.search(r'Material[:\s]+([^\n]+)', text, re.IGNORECASE):
        specs['material'] = clean_text(match.group(1))
    
    # Surface
    if match := re.search(r'Surface[:\s]+([^\n]+)', text, re.IGNORECASE):
        specs['surface'] = clean_text(match.group(1))
    
    # Corrosion
    if match := re.search(r'Corrosion[:\s]+([^\n]+)', text, re.IGNORECASE):
        specs['corrosion'] = clean_text(match.group(1))
    
    # Drilling Method
    if match := re.search(r'Drilling\s+Method[:\s]+([^\n]+)', text, re.IGNORECASE):
        specs['drillingMethod'] = clean_text(match.group(1))
    
    # Base Material
    if match := re.search(r'Base\s+Material[:\s]+([^\n]+)', text, re.IGNORECASE):
        specs['baseMaterial'] = clean_text(match.group(1))
    
    # Type of Fastening
    if match := re.search(r'Type\s+of\s+Fastening[:\s]+([^\n]+)', text, re.IGNORECASE):
        specs['typeOfFastening'] = clean_text(match.group(1))
    
    # Reusability
    if match := re.search(r'Reusability[:\s]+([^\n]+)', text, re.IGNORECASE):
        specs['reusability'] = clean_text(match.group(1))
    
    return specs

def extract_product_definition(text):
    """Extract product definition paragraph"""
    # The "Product Definition" heading is an image, not text
    # Look for the description paragraph that appears after specifications and before "Installation Parameters"
    
    # Pattern 1: Text between last specification line and "Installation" keyword
    match = re.search(r'(?:Reusability|Type of Fastening|Base Material).+?\n+(.+?)(?=Installation|Product Code|Size|Pack Size|$)', text, re.IGNORECASE | re.DOTALL)
    if match:
        description = clean_text(match.group(1))
        # Filter out table headers and short lines
        if len(description) > 50 and 'Product Code' not in description and 'Drill' not in description:
            return description
    
    # Pattern 2: Look for sentences with common description keywords
    sentences = re.findall(r'[A-Z][^.!?]*(?:anchor|fastening|expansion|designed|ideal|suitable|provides|delivers)[^.!?]*[.!?]', text, re.IGNORECASE)
    if sentences:
        # Combine sentences that look like product descriptions
        description = ' '.join(sentences[:3])  # Take first 3 matching sentences
        if len(description) > 50:
            return clean_text(description)
    
    return ""

def parse_numeric(value):
    """Parse numeric value from string"""
    if not value or value in ['—', '-', '', 'N/A', 'NA']:
        return None
    
    # Clean and extract number
    clean = re.sub(r'[^\d.]', '', str(value))
    if not clean:
        return None
    
    try:
        return float(clean) if '.' in clean else int(clean)
    except:
        return None

def extract_table_data(tables, text):
    """Extract variants from installation parameters table using both table extraction and text parsing"""
    variants = []
    
    # APPROACH 1: Try pdfplumber tables first
    if tables and len(tables) > 0:
        # Process ALL tables - pdfplumber splits the table into many small tables
        for idx, table in enumerate(tables):
            if not table or len(table) == 0:
                continue
            
            # Process each row in each table
            for row_idx, row in enumerate(table):
                if not row or len(row) < 10:
                    continue
                
                product_code = str(row[0]).strip() if row[0] else ''
                
                # Skip header rows and non-product rows
                if not product_code or 'Product' in product_code or 'Code' in product_code or not product_code.startswith('GB'):
                    continue
                
                # Clean product code (remove spaces)
                product_code = product_code.replace(' ', '')
                
                variant = {
                    'productCode': product_code,
                    'size': str(row[1]).strip() if len(row) > 1 and row[1] else '',
                    'packSize': parse_numeric(row[2]) if len(row) > 2 else None,
                    'drillDiameter': parse_numeric(row[3]) if len(row) > 3 else None,
                    'drillHoleDepth': parse_numeric(row[4]) if len(row) > 4 else None,
                    'maxFixtureThickness': parse_numeric(row[5]) if len(row) > 5 else None,
                    'effAnchorageDepth': parse_numeric(row[6]) if len(row) > 6 else None,
                    'installationTorque': parse_numeric(row[7]) if len(row) > 7 else None,
                    'tensileLoadKN': parse_numeric(row[8]) if len(row) > 8 else None,
                    'shearLoadKN': parse_numeric(row[9]) if len(row) > 9 else None
                }
                variants.append(variant)
    
    # APPROACH 2: Parse from raw text to catch missing rows
    # Look for product code patterns in text (e.g., GBGTA0660, GBLSA08C)
    lines = text.split('\n')
    for line in lines:
        # Match pattern: GBXXXX#### followed by size and numbers (allow - for missing values)
        match = re.search(r'(GB[A-Z0-9]+)\s+(M\d+\s*[xX×]\s*\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+([-\d.]+)\s+(\d+)\s+([\d.]+)\s+([\d.]+)\s+([-\d.]+)', line)
        if match:
            product_code = match.group(1).replace(' ', '')
            
            # Check if already exists
            if any(v['productCode'] == product_code for v in variants):
                continue
            
            variant = {
                'productCode': product_code,
                'size': match.group(2).strip(),
                'packSize': parse_numeric(match.group(3)),
                'drillDiameter': parse_numeric(match.group(4)),
                'drillHoleDepth': parse_numeric(match.group(5)),
                'maxFixtureThickness': parse_numeric(match.group(6)),
                'effAnchorageDepth': parse_numeric(match.group(7)),
                'installationTorque': parse_numeric(match.group(8)),
                'tensileLoadKN': parse_numeric(match.group(9)),
                'shearLoadKN': parse_numeric(match.group(10))
            }
            variants.append(variant)
    
    return variants
    
    return variants
    
    return variants

def extract_product_from_page(pdf, page_num):
    """Extract product data from a single page"""
    print(f"\n{'='*60}")
    print(f"Processing page {page_num}")
    print(f"{'='*60}")
    
    try:
        page = pdf.pages[page_num - 1]
        text = page.extract_text()
    except Exception as e:
        print(f"ERROR: Could not extract text from page {page_num}: {e}")
        return None
    
    if not text:
        print(f"WARNING: No text extracted from page {page_num}")
        return None
    
    # Extract product name and code
    product_name, product_code = extract_product_code_from_title(text)
    
    if not product_code:
        print(f"  Could not find product code on page {page_num}")
        return None
    
    print(f"OK Product: {product_name}")
    print(f"OK Code: {product_code}")
    
    # Extract specifications
    specs = extract_specifications(text)
    print(f"OK Specifications: {len(specs)} fields")
    
    # Extract product definition
    description = extract_product_definition(text)
    print(f"OK Description: {len(description)} chars")
    
    # Extract tables with error handling
    try:
        tables = page.extract_tables()
        variants = extract_table_data(tables, text)
    except Exception as e:
        print(f"WARNING: Table extraction error: {e}")
        variants = []
    
    print(f"OK Variants: {len(variants)} found")
    
    # Add image paths
    images = {
        '3d': f'assets/Anchors/3d/{product_code}.png',
        'drawing': f'assets/Anchors/Drawing/{product_code}.png'
    }
    
    product = {
        'productCode': product_code,
        'name': product_name,
        'description': description,
        'specifications': specs,
        'images': images,
        'variants': variants
    }
    
    return product

def main():
    pdf_path = Path(r"C:\Users\ghani\Desktop\Projects\Greenmann\Product-Catalogues-PDF\Anchors rev1.pdf")
    output_path = Path(r"C:\Users\ghani\Desktop\Projects\Greenmann\data\anchor-catalog.json")
    
    if not pdf_path.exists():
        print(f"ERROR: PDF not found: {pdf_path}")
        return
    
    print(f"Opening PDF: {pdf_path}")
    
    all_products = []
    
    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        print(f"Total pages: {total_pages}")
        
        # Process all 45 pages (1 product per page)
        for page_num in range(1, min(46, total_pages + 1)):
            try:
                product = extract_product_from_page(pdf, page_num)
                
                if product:
                    all_products.append(product)
                    print(f"SUCCESS: Added {product['productCode']}")
                else:
                    print(f"WARNING: Skipped page {page_num}")
            except Exception as e:
                print(f"ERROR on page {page_num}: {e}")
                continue
    
    # Save to JSON
    output_data = {
        'products': all_products
    }
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*60}")
    print(f"SUCCESS! Saved {len(all_products)} products to: {output_path}")
    print(f"{'='*60}")
    
    # Summary
    print("\nProduct Summary:")
    for product in all_products:
        print(f"  - {product['productCode']}: {len(product['variants'])} variants")

if __name__ == '__main__':
    main()
