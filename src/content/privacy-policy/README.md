# Privacy Policy Content Management with Version Control

This directory contains the privacy policy content in JSON format with version management for easy maintenance, tracking, and compliance.

## Structure

```
privacy-policy/
├── README.md           # This file - Instructions for managing content
├── en-versions.json    # English versions (current + history)
├── ko-versions.json    # Korean versions (current + history)
├── zh-versions.json    # Chinese versions (current + history)
└── vi-versions.json    # Vietnamese versions (current + history)
```

## Version Management System

Each language file contains multiple versions of the privacy policy:
- **Latest version**: Automatically displayed to users by default
- **Historical versions**: Users can view previous versions for transparency

## How to Update Privacy Policy

### 1. Edit the JSON Version Files

To update the privacy policy, edit the appropriate `-versions.json` file:
- `en-versions.json` for English
- `ko-versions.json` for Korean
- `zh-versions.json` for Chinese
- `vi-versions.json` for Vietnamese

**No code changes required!**

### 2. JSON Structure

```json
{
  "currentVersion": "2.0",  // Points to the latest version
  "versions": [
    {
      "version": "2.0",                    // Version number
      "effectiveDate": "2025-01-15",       // When this version takes effect
      "title": "Privacy Policy",           // Page title
      "lastUpdated": "Last Updated: ...",  // Display text
      "isLatest": true,                    // Mark as current version
      "sections": [
        {
          "id": "introduction",            // Unique section ID
          "title": "1. Introduction",      // Section heading
          "content": [                     // Array of paragraphs
            "First paragraph...",
            "Second paragraph..."
          ]
        }
      ],
      "footer": {
        "message": "Thank you message"
      }
    },
    {
      "version": "1.0",                    // Previous version
      "effectiveDate": "2024-01-01",
      // ... same structure
      "isLatest": false                    // Not the current version
    }
  ]
}
```

### 3. Creating a New Version

When you need to update the privacy policy:

1. **Copy the latest version** object in the `versions` array
2. **Update the new version**:
   - Increment `version` (e.g., "2.0" → "2.1" or "3.0")
   - Update `effectiveDate` to the new date
   - Update `lastUpdated` text
   - Set `isLatest: true`
   - Modify the `content` as needed
3. **Update the old version**:
   - Set its `isLatest: false`
4. **Update `currentVersion`** at the top level to match the new version
5. **Keep old versions** for transparency and compliance

Example:
```json
{
  "currentVersion": "2.1",  // Updated
  "versions": [
    {
      "version": "2.1",     // New version
      "isLatest": true,
      // ... new content
    },
    {
      "version": "2.0",     // Previous version
      "isLatest": false,    // Changed to false
      // ... old content preserved
    }
  ]
}
```

### 4. Adding a New Section

To add a new section to the latest version:

```json
{
  "id": "new-section",
  "title": "15. New Section",
  "content": [
    "Your content here...",
    "Additional paragraphs..."
  ]
}
```

### 5. Editing Existing Content

Find the section in the latest version and modify the `content` array:

```json
{
  "id": "contact",
  "title": "14. Contact Us",
  "content": [
    "Updated email: newemail@example.com",
    "Updated address: New Address"
  ]
}
```

### 6. Multi-language Support

Current supported languages:
- 🇺🇸 **English** (en)
- 🇰🇷 **Korean** (ko)
- 🇨🇳 **Chinese** (zh)
- 🇻🇳 **Vietnamese** (vi)

To add a new language:
1. Create `{language-code}-versions.json` (e.g., `ja-versions.json`)
2. Copy the structure from `en-versions.json`
3. Translate all content
4. Update `src/app/[locale]/privacy-policy/page.tsx` to import the new file

## Tips for Maintaining Content

### Formatting
- Use `•` for bullet points in content
- Each paragraph should be a separate string in the content array
- Keep formatting consistent across languages
- **Avoid using special quotation marks** in content - use standard ASCII quotes (' and ")
  - ❌ Bad: `"我们"` (Chinese quotes)
  - ✅ Good: `'我们'` (Standard quotes)

### Version Best Practices
- **Major updates** (2.0, 3.0): Significant policy changes, new regulations
- **Minor updates** (2.1, 2.2): Small clarifications, contact info changes
- **Always preserve** old versions for legal compliance
- **Update effectiveDate** to match when the policy takes effect

### Testing
After updating the JSON files:
1. Navigate to the Privacy Policy page
2. Use the version selector to switch between versions
3. Switch between languages to verify all versions
4. Check that all sections display correctly
5. Verify the "Latest" badge appears on the current version

### Backup
- Always keep a backup before making major changes
- Use version control (Git) to track all changes
- Old versions in the file serve as built-in backups

## Common Updates

### Update Contact Information
Edit the `contact` section in the **latest version** of all language files:

```json
{
  "id": "contact",
  "title": "14. Contact Us",
  "content": [
    "Email: newemail@example.com",
    "Address: Updated Address",
    "Phone: +1 (555) 123-4567"
  ]
}
```

### Add New Legal Requirements
When adding new sections (e.g., for GDPR, CCPA):
1. Create a new version as described above
2. Add new sections to the latest version
3. Keep old versions unchanged for historical record

### Update Effective Date
Always update `effectiveDate` when creating a new version:
```json
"effectiveDate": "2025-02-01"  // ISO date format
```

## User Experience

### Version Selection
Users can:
- View the latest privacy policy by default
- Select previous versions from the dropdown menu
- See which version is the latest with a badge
- View version effective dates and last updated information

### Version History
All previous versions are accessible through:
- Dropdown selector in the page header
- Clear labeling of version numbers and dates
- "Latest" badge on the current version

## Questions?

If you need help updating the privacy policy content or have questions about version management, contact the development team.

## Technical Notes

- Version files are imported directly in the Next.js page component
- No backend API required for content updates
- Automatic language detection based on user's locale
- Version selection persists during the page session
