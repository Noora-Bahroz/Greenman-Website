"""
Update anchor product images with actual file paths from assets/Anchors
"""

import json
from pathlib import Path

def update_anchor_images():
    # Load anchor catalog
    with open('data/anchor-catalog.json', 'r', encoding='utf-8') as f:
        anchor_catalog = json.load(f)
    
    # Update image paths for each product
    updated_count = 0
    for product in anchor_catalog['category']['products']:
        # Extract base code from product code (e.g., GBGTA from GBGTA06070)
        code = product['code']
        base_code = ''.join([c for c in code if not c.isdigit()])
        
        # Check if images exist for this base code
        image_3d = f"assets/Anchors/3d/{base_code}.png"
        image_drawing = f"assets/Anchors/Drawing/{base_code}.png"
        
        # Verify files exist
        if Path(image_3d).exists() and Path(image_drawing).exists():
            product['images'] = [image_3d, image_drawing]
            updated_count += 1
        else:
            print(f"Warning: Images not found for {base_code}")
    
    # Save updated anchor catalog
    with open('data/anchor-catalog.json', 'w', encoding='utf-8') as f:
        json.dump(anchor_catalog, f, indent=2, ensure_ascii=False)
    
    print(f"{'='*60}")
    print(f"Updated {updated_count} products with actual image paths")
    print(f"{'='*60}")
    
    # Now update products.json
    with open('data/products.json', 'r', encoding='utf-8') as f:
        products_data = json.load(f)
    
    # Find metal-anchors category and update images
    for category in products_data['categories']:
        if category['id'] == 'metal-anchors':
            for product in category['products']:
                # Extract base code from subtitle (e.g., GBGTA)
                base_code = product.get('subtitle', '')
                if base_code:
                    image_3d = f"assets/Anchors/3d/{base_code}.png"
                    image_drawing = f"assets/Anchors/Drawing/{base_code}.png"
                    
                    if Path(image_3d).exists() and Path(image_drawing).exists():
                        product['images'] = [image_3d, image_drawing]
            break
    
    # Save updated products.json
    with open('data/products.json', 'w', encoding='utf-8') as f:
        json.dump(products_data, f, indent=2, ensure_ascii=False)
    
    print(f"Updated products.json with actual image paths")
    print(f"{'='*60}")

if __name__ == "__main__":
    update_anchor_images()
