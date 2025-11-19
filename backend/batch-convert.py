#!/usr/bin/env python3
"""
Batch convert all remaining route files to PostgreSQL
"""
import os
import re

# File mappings: filename -> (service_name, has_auth)
FILES_TO_CONVERT = {
    'help.js': ('helpService', False),
    'message.js': ('messageService', True),
    'code.js': ('codeService', True),
    'codeType.js': ('codeService', True),
    'userSettings.js': ('preferencesService', True),
}

def backup_and_convert(filename, service_name, has_auth):
    filepath = f'routes/{filename}'
    backup_path = f'{filepath}.backup'
    new_path = f'{filepath}.NEW'

    print(f'\nProcessing {filename}...')

    # Read original
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Backup
    if not os.path.exists(backup_path):
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'  ✓ Backup created')

    # Remove old imports
    content = re.sub(r"const path = require\(['\"]path['\"]\);?\n?", '', content)
    content = re.sub(r"const \{ readJSON, writeJSON \} = require\(['\"]\.\.\/utils\/fileUtils['\"]\);?\n?", '', content)

    # Remove data file constants
    content = re.sub(r"const [A-Z_]+_FILE = path\.join\(__dirname, [^;]+;?\n?", '', content)

    # Add service import after express
    if service_name not in content:
        service_import = f"const {service_name} = require('../services/{service_name}');\n"
        content = re.sub(
            r"(const express = require\(['\"]express['\"]\);)",
            f"\\1\n{service_import}",
            content
        )

    # Add uuid if needed
    if 'uuidv4' not in content:
        content = re.sub(
            r"(const express = require\(['\"]express['\"]\);)",
            "\\1\nconst { v4: uuidv4 } = require('uuid');",
            content
        )

    print(f'  ✓ Imports updated')

    # Write to .NEW file
    with open(new_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f'  ✓ Created {new_path}')
    print(f'  ⚠  Manual review needed for service method calls')

    return True

def main():
    os.chdir(os.path.dirname(__file__))

    print('='*70)
    print('Batch Route Conversion to PostgreSQL')
    print('='*70)

    success = 0
    for filename, (service, has_auth) in FILES_TO_CONVERT.items():
        try:
            if backup_and_convert(filename, service, has_auth):
                success += 1
        except Exception as e:
            print(f'  ✗ Error: {e}')

    print('\n' + '='*70)
    print(f'Converted {success}/{len(FILES_TO_CONVERT)} files')
    print('='*70)
    print('\nNote: .NEW files created with updated imports.')
    print('Manual conversion of readJSON/writeJSON still needed.')
    print('Apply with: cp routes/file.js.NEW routes/file.js\n')

if __name__ == '__main__':
    main()
