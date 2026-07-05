# Data Import Guide - LocalPages.ph

This guide outlines how to import directory data (Categories, Regions, Provinces, Cities) into the LocalPages.ph platform using the Admin Data Import module.

## Supported Formats
- **CSV**: Comma-separated values (first row should be header).
- **JSON**: Structured JSON arrays of objects.

## Required Columns

### Categories
- `name` (Required)
- `slug` (Optional, auto-generated if missing)
- `description` (Optional)

### Subcategories
- `name` (Required)
- `slug` (Optional, auto-generated if missing)
- `categorySlug` (Required, must match an existing category slug)

### Regions
- `name` (Required)
- `slug` (Optional, auto-generated if missing)

### Provinces
- `name` (Required)
- `slug` (Optional, auto-generated if missing)
- `regionSlug` (Required, must match an existing region slug)

### Cities/Municipalities
- `name` (Required)
- `slug` (Optional, auto-generated if missing)
- `provinceSlug` (Required, must match an existing province slug)
- `type` (Optional, 'city' or 'municipality')

## Workflow
1. Navigate to **Admin** > **System** > **Data Import**.
2. Select the **Import Type** (e.g., Categories, Cities).
3. Upload your file (CSV or JSON).
4. Click **Preview** to review the data and check for validation errors.
5. Review the validation results.
6. Click **Confirm Import** to apply changes.

## Slug-based Duplicate Prevention
The system uses the `slug` field to identify existing records.
- If a record with the same slug exists, it will be updated (Name/Description/Parents).
- If a record with a new slug is provided, it will be created as a new entry.
- **Note**: Ensure slugs are unique and follow a consistent URL-friendly format (e.g., "my-category").

## Example CSV Format
```csv
name,slug,description
Food & Dining,food-and-dining,Restaurant and cafe directory
```

## Example JSON Format
```json
[
  {
    "name": "Food & Dining",
    "slug": "food-and-dining",
    "description": "Restaurant and cafe directory"
  }
]
```

## Limitations
- **Barangays**: Support is currently a placeholder; do not include in bulk uploads yet.
- **Large Files**: For very large datasets (thousands of rows), splitting files into smaller batches is recommended.
