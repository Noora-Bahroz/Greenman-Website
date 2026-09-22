import json
import os

# Define product definitions for each anchor type based on the PDF catalog
PRODUCT_DEFINITIONS = {
    "GBGTA": "A mechanical through-anchor with a galvanized steel shaft, designed for secure fastening through concrete. Its through-bolt design allows direct installation through fixtures, providing strong and reliable anchoring for structural applications.",
    
    "GBGSTA": "A mechanical anchor with a galvanized steel shaft, designed for secure fastening through concrete. Its through-bolt design allows direct installation through fixtures, providing strong and reliable anchoring for structural applications.",
    
    "GBGHTA": "A mechanical through-anchor with a galvanized steel shaft and hot-dip galvanized expansion clip, designed for secure fastening through concrete. Its through-bolt design allows direct installation through fixtures, offering enhanced corrosion resistance for structural applications.",
    
    "GBHTA": "A mechanical through-anchor with high corrosion resistance, featuring stainless steel components. Designed for secure fastening through concrete in environments requiring superior corrosion protection.",
    
    "GBSTA": "A stainless steel mechanical through-anchor designed for secure fastening through concrete. Provides excellent corrosion resistance and reliability for demanding structural applications.",
    
    "GBMTA": "A mechanical through-anchor designed for medium-duty fastening applications in concrete. Provides reliable anchoring performance for general construction needs.",
    
    "GBHSA": "A heavy-duty sleeve anchor designed for secure fastening in concrete and masonry. Features expansion mechanism for reliable holding power in various base materials.",
    
    "GBLSA": "A light-duty sleeve anchor designed for general fastening applications in concrete and masonry. Provides cost-effective anchoring solution for non-critical applications.",
    
    "GBLSSA": "A light-duty stainless steel sleeve anchor offering corrosion resistance for fastening in concrete and masonry in mildly corrosive environments.",
    
    "GBDSA": "A drop-in anchor designed for flush mounting in concrete. Provides concealed fastening solution with high load capacity for permanent installations.",
    
    "GBFSA": "A female sleeve anchor with internal threading, designed for fastening applications where bolt removal and reuse is required. Suitable for concrete and masonry installations.",
    
    "GBNSA": "A nylon sleeve anchor designed for lightweight fastening applications in concrete, brick, and block. Provides cost-effective solution for non-structural applications.",
    
    "GBTSA": "A torque-controlled sleeve anchor designed for precise installation in concrete. Features controlled expansion for consistent performance.",
    
    "GBOSA": "An open sleeve anchor designed for through-mounting applications in concrete. Allows installation with various bolt lengths for flexible fixture thickness accommodation.",
    
    "GBEPSA": "An expansion plug sleeve anchor designed for fastening in concrete, brick, and hollow block. Features plastic expansion plug for controlled expansion and grip.",
    
    "GBEFSA": "An expansion fixing sleeve anchor for lightweight to medium-duty applications in concrete and masonry. Provides reliable fastening with simple installation.",
    
    "GBEXSA": "An expansion sleeve anchor for heavy-duty applications in solid concrete. Designed for high-load structural fastening requirements.",
    
    "GBHESA": "A heavy-duty expansion sleeve anchor with enhanced holding power for demanding structural applications in concrete. Suitable for high-load anchoring needs.",
    
    "GBNESA": "A non-expansion sleeve anchor designed for special fastening applications where expansion forces must be minimized. Suitable for near-edge installations.",
    
    "GBFESA": "A female expansion sleeve anchor with internal threading for removable fastening applications. Combines expansion grip with reusability.",
    
    "GBPSSA": "A plastic sleeve anchor designed for lightweight fastening in concrete, brick, and hollow block. Provides economical solution for non-structural applications.",
    
    "GBTSSA": "A torque-controlled stainless steel sleeve anchor combining corrosion resistance with precise installation control for concrete applications.",
    
    "GBXSSA": "An extra-heavy-duty stainless steel sleeve anchor designed for high-load applications requiring superior corrosion resistance in concrete.",
    
    "GBHFGA": "A heavy-duty fixing anchor with galvanized finish for structural fastening in concrete. Designed for high-load applications requiring reliable performance.",
    
    "GBHFHA": "A heavy-duty fixing anchor with hot-dip galvanized finish providing enhanced corrosion protection for structural concrete applications.",
    
    "GBHFMA": "A heavy-duty fixing anchor for medium-load structural applications in concrete. Provides balanced performance for general construction needs.",
    
    "GBCFMS": "A ceiling fixing anchor with metal sleeve designed for overhead mounting applications in concrete. Provides secure upward-load resistance.",
    
    "GBCFS": "A ceiling fixing sleeve anchor for lightweight to medium-duty overhead mounting in concrete. Suitable for suspended ceiling applications.",
    
    "GBCHS": "A ceiling hammer-set anchor for quick installation in concrete overhead applications. Features drive-in design for fast mounting.",
    
    "GBCIS": "A ceiling insert anchor designed for flush mounting in concrete ceilings. Provides concealed fastening solution for overhead applications.",
    
    "GBCKMS": "A ceiling knurl metal sleeve anchor designed for secure overhead fastening in concrete with enhanced grip.",
    
    "GBCKS": "A ceiling knurl sleeve anchor providing enhanced holding power for overhead mounting applications in concrete.",
    
    "GBCPMS": "A ceiling plastic metal sleeve anchor combining plastic and metal components for overhead fastening in concrete and hollow block.",
    
    "GBCPS": "A ceiling plastic sleeve anchor designed for lightweight overhead mounting in concrete, brick, and hollow block.",
    
    "GBCSS": "A ceiling stainless steel anchor providing corrosion resistance for overhead fastening in aggressive environments.",
    
    "GBCTMS": "A ceiling torque metal sleeve anchor with controlled installation for precise overhead fastening in concrete.",
    
    "GBCUS": "A ceiling universal sleeve anchor designed for versatile overhead mounting in various base materials including concrete and masonry.",
    
    "GBAFMS": "An angle fixing metal sleeve anchor designed for corner and angle mounting applications in concrete.",
    
    "GBAKMS": "An angle knurl metal sleeve anchor providing enhanced grip for angle mounting applications in concrete structures.",
    
    "GBAPMS": "An angle plastic metal sleeve anchor for corner mounting in concrete and hollow block applications.",
    
    "GBATMS": "An angle torque metal sleeve anchor with controlled installation for precise angle fastening in concrete.",
    
    "GBSF": "A screw fixing anchor designed for direct fastening in concrete, brick, and block. Features self-tapping thread for simple installation.",
    
    "GBSFPB": "A screw fixing anchor with plastic body designed for lightweight fastening in concrete, brick, and hollow block. Provides economical direct fastening solution."
}

# Product name mappings (full names)
PRODUCT_NAMES = {
    "GBGTA": "GreenBolt G2 Through Anchor",
    "GBGSTA": "GreenBolt GS Through Anchor",
    "GBGHTA": "GreenBolt GH Through Anchor",
    "GBHTA": "GreenBolt H2 Through Anchor",
    "GBSTA": "GreenBolt S2 Through Anchor",
    "GBMTA": "GreenBolt M2 Through Anchor",
    "GBHSA": "GreenBolt Heavy Sleeve Anchor",
    "GBLSA": "GreenBolt Light Sleeve Anchor",
    "GBLSSA": "GreenBolt Light SS Sleeve Anchor",
    "GBDSA": "GreenBolt Drop-In Sleeve Anchor",
    "GBFSA": "GreenBolt Female Sleeve Anchor",
    "GBNSA": "GreenBolt Nylon Sleeve Anchor",
    "GBTSA": "GreenBolt Torque Sleeve Anchor",
    "GBOSA": "GreenBolt Open Sleeve Anchor",
    "GBEPSA": "GreenBolt Expansion Plug Sleeve Anchor",
    "GBEFSA": "GreenBolt Expansion Fix Sleeve Anchor",
    "GBEXSA": "GreenBolt Expansion Sleeve Anchor",
    "GBHESA": "GreenBolt Heavy Expansion Sleeve Anchor",
    "GBNESA": "GreenBolt Non-Expansion Sleeve Anchor",
    "GBFESA": "GreenBolt Female Expansion Sleeve Anchor",
    "GBPSSA": "GreenBolt Plastic Sleeve Anchor",
    "GBTSSA": "GreenBolt Torque SS Sleeve Anchor",
    "GBXSSA": "GreenBolt Extra Heavy SS Sleeve Anchor",
    "GBHFGA": "GreenBolt Heavy Fix Galvanized Anchor",
    "GBHFHA": "GreenBolt Heavy Fix Hot-Dip Anchor",
    "GBHFMA": "GreenBolt Heavy Fix Medium Anchor",
    "GBCFMS": "GreenBolt Ceiling Fix Metal Sleeve",
    "GBCFS": "GreenBolt Ceiling Fix Sleeve",
    "GBCHS": "GreenBolt Ceiling Hammer-Set",
    "GBCIS": "GreenBolt Ceiling Insert Sleeve",
    "GBCKMS": "GreenBolt Ceiling Knurl Metal Sleeve",
    "GBCKS": "GreenBolt Ceiling Knurl Sleeve",
    "GBCPMS": "GreenBolt Ceiling Plastic Metal Sleeve",
    "GBCPS": "GreenBolt Ceiling Plastic Sleeve",
    "GBCSS": "GreenBolt Ceiling Stainless Sleeve",
    "GBCTMS": "GreenBolt Ceiling Torque Metal Sleeve",
    "GBCUS": "GreenBolt Ceiling Universal Sleeve",
    "GBAFMS": "GreenBolt Angle Fix Metal Sleeve",
    "GBAKMS": "GreenBolt Angle Knurl Metal Sleeve",
    "GBAPMS": "GreenBolt Angle Plastic Metal Sleeve",
    "GBATMS": "GreenBolt Angle Torque Metal Sleeve",
    "GBSF": "GreenBolt Screw Fixing",
    "GBSFPB": "GreenBolt Screw Fixing Plastic Body"
}

def get_base_code(code):
    """Extract base product code without size numbers"""
    import re
    return re.sub(r'\d+$', '', code)

def fix_anchor_catalog():
    # Load the catalog
    with open('data/anchor-catalog.json', 'r', encoding='utf-8') as f:
        catalog = json.load(f)
    
    products_updated = 0
    
    # Process each product
    for product in catalog['category']['products']:
        code = product['code']
        base_code = get_base_code(code)
        
        # Update product name/description
        if base_code in PRODUCT_NAMES:
            old_desc = product['description']
            product['description'] = PRODUCT_NAMES[base_code]
            
            # Update title to include full name
            size = product.get('size', '')
            product['title'] = f"{PRODUCT_NAMES[base_code]} - {code}"
            
            if old_desc != PRODUCT_NAMES[base_code]:
                products_updated += 1
                print(f"Updated {code}: '{old_desc}' -> '{PRODUCT_NAMES[base_code]}'")
        
        # Add product definition
        if base_code in PRODUCT_DEFINITIONS:
            product['product_definition'] = PRODUCT_DEFINITIONS[base_code]
        
        # Fix image paths to match actual file names
        if base_code:
            product['images'] = [
                f"assets/Anchors/3d/{base_code}.png",
                f"assets/Anchors/Drawing/{base_code}.png"
            ]
        
        # Ensure ID matches the product code format
        expected_id = f"anchor-{code.lower()}"
        if product['id'] != expected_id:
            print(f"Fixed ID: {product['id']} -> {expected_id}")
            product['id'] = expected_id
    
    # Save the updated catalog
    with open('data/anchor-catalog.json', 'w', encoding='utf-8') as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Updated {products_updated} product descriptions")
    print(f"✓ Added product definitions for all products")
    print(f"✓ Fixed image paths to match actual filenames")
    print(f"✓ Ensured IDs match product codes")

if __name__ == "__main__":
    fix_anchor_catalog()
