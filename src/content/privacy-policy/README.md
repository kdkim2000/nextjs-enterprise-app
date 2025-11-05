# Privacy Policy Content Management

This directory contains the privacy policy content in JSON format for easy maintenance and version control.

## Structure

```
privacy-policy/
├── README.md       # This file - Instructions for managing content
├── en.json         # English version
└── ko.json         # Korean version
```

## How to Update Privacy Policy

### 1. Edit the JSON Files

To update the privacy policy, simply edit the appropriate JSON file (`en.json` for English, `ko.json` for Korean).

**No code changes required!**

### 2. JSON Structure

```json
{
  "version": "1.0",              // Version number for tracking
  "effectiveDate": "2024-01-01", // ISO date format
  "title": "Privacy Policy",     // Page title
  "lastUpdated": "Last Updated: January 2024",
  "sections": [
    {
      "id": "introduction",      // Unique section ID
      "title": "1. Introduction", // Section heading
      "content": [               // Array of paragraphs
        "First paragraph...",
        "Second paragraph..."
      ]
    }
  ],
  "footer": {
    "message": "Thank you message"
  }
}
```

### 3. Adding a New Section

To add a new section, add an object to the `sections` array:

```json
{
  "id": "new-section",
  "title": "14. New Section",
  "content": [
    "Your content here..."
  ]
}
```

### 4. Editing Existing Content

Simply find the section you want to edit and modify the `content` array:

```json
{
  "id": "contact",
  "title": "13. Contact Us",
  "content": [
    "Updated email: newemail@example.com",
    "Updated address: New Address"
  ]
}
```

### 5. Version Control

When making significant changes:

1. Update the `version` field (e.g., "1.0" → "1.1" or "2.0")
2. Update the `effectiveDate` field
3. Update the `lastUpdated` field

### 6. Multi-language Support

To add a new language:

1. Create a new file: `{language-code}.json` (e.g., `ja.json` for Japanese)
2. Copy the structure from `en.json`
3. Translate all content
4. The system will automatically detect and use the file

## Tips for Maintaining Content

### Formatting
- Use `•` for bullet points in content
- Each paragraph should be a separate string in the content array
- Keep formatting consistent across languages

### Testing
After updating the JSON files:
1. Navigate to the Privacy Policy page
2. Switch between languages to verify both versions
3. Check that all sections display correctly

### Backup
- Always keep a backup before making major changes
- Consider using version control (Git) to track changes

## Common Updates

### Update Contact Information
Edit the `contact` section in both `en.json` and `ko.json`:

```json
{
  "id": "contact",
  "title": "13. Contact Us",
  "content": [
    "Updated contact info here..."
  ]
}
```

### Update Last Modified Date
Change the `lastUpdated` field:

```json
"lastUpdated": "Last Updated: February 2024"
```

### Add New Legal Requirements
Add new sections as needed to comply with regulations like GDPR, CCPA, etc.

## Questions?

If you need help updating the privacy policy content, contact the development team.
