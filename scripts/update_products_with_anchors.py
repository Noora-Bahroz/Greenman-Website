"""
Script to update products.json with anchor products from anchor-catalog.json
"""

import json
from pathlib import Path

def update_products_json():
    # Load anchor catalog
    with open('data/anchor-catalog.json', 'r', encoding='utf-8') as f:
        anchor_catalog = json.load(f)
    
    # Load main products file
    with open('data/products.json', 'r', encoding='utf-8') as f:
        products_data = json.load(f)
    
    # Convert anchor products to the format expected by products.json
    # We'll create one main "Metal Anchors" product entry with all variants in technical table
    anchor_products_for_json = []
    
    # Group products by product type (first part of code before size)
    product_groups = {}
    for product in anchor_catalog['category']['products']:
        # Extract base product type (e.g., GBGTA from GBGTA06070)
        code = product['code']
        # Find where the size part starts (numbers after letters)
        base_code = ''.join([c for c in code if not c.isdigit()])
        
        if base_code not in product_groups:
            product_groups[base_code] = {
                'title': product['description'],
                'code_prefix': base_code,
                'specifications': product['specifications'],
                'variants': []
            }
        
        product_groups[base_code]['variants'].append(product)
    
    # Create product entries for each group
    for base_code, group in product_groups.items():
        # Take first variant for main product info
        first_variant = group['variants'][0]
        
        # Build technical table from all variants
        technical_table = []
        for idx, variant in enumerate(group['variants'], 1):
            params = variant['installation_parameters']
            table_row = {
                'Sr#': str(idx),
                'Product Code': params['product_code'],
                'Size': params['size'],
                'Pack Size (pcs)': params['pack_size'],
                'Drill Ø (mm)': params['drill_diameter'],
                'Drill Hole Depth (mm)': params['drill_hole_depth'],
                'Max. Fixture Thickness (mm)': params['max_fixture_thickness'],
                'eff. Anchorage depth (mm)': params['eff_anchorage_depth'],
                'Installation Torque (Nm)': params['installation_torque_nm'],
                'Tensile Load (kN)': params['tensile_load_kn'],
                'Shear Load (kN)': params['shear_load_kn']
            }
            technical_table.append(table_row)
        
        product_entry = {
            'id': f'anchor-{base_code.lower()}',
            'title': group['title'],
            'subtitle': base_code,
            'description': f"{group['title']} provides reliable anchoring solutions for concrete and masonry applications.",
            'images': first_variant['images'],
            'specifications': first_variant['specifications'],
            'technicalData': {},
            'technicalTable': technical_table
        }
        
        anchor_products_for_json.append(product_entry)
    
    # Find and update the anchors category in products.json
    for category in products_data['categories']:
        if category['id'] == 'anchors' or category['id'] == 'metal-anchors':
            category['id'] = 'metal-anchors'
            category['name'] = 'Metal Anchors'
            category['badge'] = 'Anchors Collection'
            category['catalogPdf'] = 'Product-Catalogues-PDF/Anchors rev1.pdf'
            category['products'] = anchor_products_for_json
            break
    else:
        # If anchors category doesn't exist, add it
        products_data['categories'].append({
            'id': 'metal-anchors',
            'name': 'Metal Anchors',
            'badge': 'Anchors Collection',
            'catalogPdf': 'Product-Catalogues-PDF/Anchors rev1.pdf',
            'products': anchor_products_for_json
        })
    
    # Save updated products.json
    with open('data/products.json', 'w', encoding='utf-8') as f:
        json.dump(products_data, f, indent=2, ensure_ascii=False)
    
    print(f"{'='*60}")
    print(f"Updated products.json with {len(anchor_products_for_json)} anchor product types")
    print(f"Total variants: {sum(len(p['technicalTable']) for p in anchor_products_for_json)}")
    print(f"{'='*60}")

if __name__ == "__main__":
    update_products_json()
