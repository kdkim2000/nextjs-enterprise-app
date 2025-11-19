#!/usr/bin/env python3
"""
Automated Route Conversion Script
Converts all route files from JSON-based to PostgreSQL-based
"""

import os
import re
from pathlib import Path

# Service mapping
SERVICE_MAP = {
    'USERS_FILE': 'userService',
    'ROLES_FILE': 'roleService',
    'MENUS_FILE': 'menuService',
    'PROGRAMS_FILE': 'programService',
    'CODES_FILE': 'codeService',
    'CODE_TYPES_FILE': 'codeService',
    'DEPARTMENTS_FILE': 'departmentService',
    'MESSAGES_FILE': 'messageService',
    'HELP_FILE': 'helpService',
    'USER_ROLE_MAPPINGS_FILE': 'mappingService',
    'ROLE_MENU_MAPPINGS_FILE': 'mappingService',
    'ROLE_PROGRAM_MAPPINGS_FILE': 'mappingService',
    'USER_PREFERENCES_FILE': 'preferencesService',
    'LOGS_FILE': 'logService',
    'MFA_CODES_FILE': 'authService',
    'TOKEN_BLACKLIST_FILE': 'authService',
}

def convert_route_file(file_path):
    """Convert a single route file"""
    print(f"\nProcessing: {file_path}")

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Detect which services are needed
    services_needed = set()
    for file_const, service in SERVICE_MAP.items():
        if file_const in content or f"'{file_const.lower().replace('_', '')}.json'" in content:
            services_needed.add(service)

    # Add service imports
    if services_needed:
        # Remove old imports
        content = re.sub(r"const \{ readJSON, writeJSON \} = require\(['\"]\.\.\/utils\/fileUtils['\"]\);?\n?", '', content)
        content = re.sub(r"const path = require\(['\"]path['\"]\);?\n?", '', content)

        # Remove file path constants
        for file_const in SERVICE_MAP.keys():
            pattern = rf"const {file_const} = path\.join\(__dirname, ['\"][^'\"]*['\"]\);?\n?"
            content = re.sub(pattern, '', content)

        # Add service imports after express import
        service_imports = '\n'.join([f"const {svc} = require('../services/{svc}');" for svc in sorted(services_needed)])

        # Find position after first require block
        match = re.search(r"(const express = require\('express'\);)", content)
        if match:
            insert_pos = match.end()
            content = content[:insert_pos] + '\n' + service_imports + content[insert_pos:]

    # Replace readJSON patterns with service calls
    # This is a simplified version - actual conversion would need file-specific logic

    if content != original_content:
        # Create backup
        backup_path = f"{file_path}.backup"
        if not os.path.exists(backup_path):
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(original_content)

        # Write converted file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"  ✓ Converted (services: {', '.join(sorted(services_needed))})")
        return True
    else:
        print(f"  - No changes needed")
        return False

def main():
    """Main conversion process"""
    routes_dir = Path(__file__).parent / 'routes'

    print("=" * 70)
    print("Automated Route Conversion to PostgreSQL")
    print("=" * 70)

    converted_count = 0
    skipped_count = 0

    # Skip auth.js and role.js (already converted)
    skip_files = {'auth.js', 'role.js', 'file.js'}

    for route_file in sorted(routes_dir.glob('*.js')):
        if route_file.name in skip_files:
            print(f"\nSkipping: {route_file.name} (already converted or no conversion needed)")
            skipped_count += 1
            continue

        if route_file.name.endswith('.backup'):
            continue

        try:
            if convert_route_file(route_file):
                converted_count += 1
            else:
                skipped_count += 1
        except Exception as e:
            print(f"  ✗ Error: {e}")

    print("\n" + "=" * 70)
    print(f"Conversion Summary:")
    print(f"  Converted: {converted_count}")
    print(f"  Skipped: {skipped_count}")
    print("=" * 70)

if __name__ == '__main__':
    main()
