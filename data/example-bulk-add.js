// Example: How to quickly add 20 products to a category

// Template for adding multiple products quickly
const productTemplate = {
  "id": "product-unique-id",
  "title": "Product Title",
  "description": "Brief product description explaining features and benefits.",
  "images": [
    "https://images.unsplash.com/photo-placeholder1",
    "https://images.unsplash.com/photo-placeholder2"
  ],
  "specifications": {
    "Spec Name 1": "Value 1",
    "Spec Name 2": "Value 2",
    "Spec Name 3": "Value 3",
    "Spec Name 4": "Value 4"
  },
  "technicalData": {
    "Material": "Material name",
    "Material type": "Type description",
    "Surface treatment": "Treatment method",
    "Additional info": "Extra technical details"
  }
};

// Quick method to generate multiple products
// Copy this array structure into your category's "products" array in products.json

const bulkProducts = [
  {
    "id": "c-profile-001",
    "title": "C Profile Standard 28x30",
    "description": "Standard C-profile rail for general construction applications.",
    "images": ["img1.jpg", "img2.jpg"],
    "specifications": {
      "Profile Type": "C-profile",
      "Size": "28x30mm",
      "Surface": "Perforated",
      "Connection": "Form-locking"
    },
    "technicalData": {
      "Material": "S250GD",
      "Coating": "Z-275",
      "Thickness": "2.0mm",
      "Load capacity": "Heavy-duty"
    }
  },
  {
    "id": "c-profile-002",
    "title": "C Profile Heavy-Duty 32x40",
    "description": "Heavy-duty C-profile for industrial mounting systems.",
    "images": ["img3.jpg", "img4.jpg"],
    "specifications": {
      "Profile Type": "C-profile HD",
      "Size": "32x40mm",
      "Surface": "Toothed",
      "Connection": "Bolted"
    },
    "technicalData": {
      "Material": "S355J2",
      "Coating": "Z-350",
      "Thickness": "3.0mm",
      "Load capacity": "Extra heavy"
    }
  }
  // Add 18 more products following this pattern...
];

// Tips for efficient bulk addition:
// 1. Use Excel/Google Sheets to organize data
// 2. Use JSON converter tools to convert spreadsheet to JSON
// 3. Use consistent naming: category-name-001, category-name-002, etc.
// 4. Reuse similar images for product families
// 5. Copy-paste and modify instead of typing from scratch

// Excel column structure suggestion:
// | ID | Title | Description | Image1 | Image2 | Spec1_Key | Spec1_Val | Tech1_Key | Tech1_Val |
// Then use online tools like: https://www.convertcsv.com/csv-to-json.htm
