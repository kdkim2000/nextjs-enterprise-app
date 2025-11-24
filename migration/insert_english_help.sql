-- Insert English help content for all programs
-- Generated: 2025-11-24

-- 1. PROG-USER-LIST (User Management)
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-en-001',
    'PROG-USER-LIST',
    'User Management Help',
    '<h4>This page allows you to manage all users in the system. You can search, add, edit, and delete users.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "Searching for Users",
            "content": "<p><strong>Quick Search:</strong> Use the search bar at the top to quickly find users by username, name, or email.</p><p><strong>Advanced Search:</strong> Click the filter icon to access advanced search options where you can filter by role, department, and status.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "Adding a New User",
            "content": "<p>1. Click the <strong>Add</strong> button in the toolbar</p><p>2. Fill in the required fields (username, password, name, email)</p><p>3. Select the appropriate role and department</p><p>4. Click <strong>Save</strong> to create the user</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "Editing User Information",
            "content": "<p>1. Find the user in the list</p><p>2. Click the <strong>Edit</strong> icon in the actions column</p><p>3. Update the necessary information</p><p>4. Click <strong>Save</strong> to apply changes</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Deleting Users",
            "content": "<p>1. Select one or more users using the checkboxes</p><p>2. Click the <strong>Delete</strong> button in the toolbar</p><p>3. Confirm the deletion in the dialog that appears</p><p><strong>Note:</strong> You cannot delete your own account.</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "Exporting Data",
            "content": "<p>You can export user data to Excel or PDF format using the export buttons in the toolbar.</p>"
        }
    ]'::jsonb,
    'en',
    'published',
    NOW(),
    NOW()
);

-- 2. PROG-DEPT-MGMT (Department Management)
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-en-002',
    'PROG-DEPT-MGMT',
    'Department Management Help',
    '<h4>Manage the organizational department structure. You can add, edit, delete departments and set up hierarchical structures.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "Understanding Department Structure",
            "content": "<p><strong>Hierarchy:</strong> Departments are organized in a 5-level hierarchy (Company → Division → Team → Department → Section).</p><p><strong>Department Codes:</strong> Each department is identified by a unique code.</p><p><strong>Multi-language Support:</strong> Department names can be managed in Korean, English, Chinese, and Vietnamese.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "Adding a Department",
            "content": "<p>1. Click the <strong>Add</strong> button</p><p>2. Enter the department code and names in each language</p><p>3. Select the parent department (leave empty for top-level department)</p><p>4. Assign a department manager</p><p>5. Click <strong>Save</strong></p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "Editing Department Information",
            "content": "<p>1. Find the department in the list</p><p>2. Click the <strong>Edit</strong> icon</p><p>3. Modify the department information</p><p>4. Click <strong>Save</strong> to apply changes</p><p><strong>Note:</strong> When changing department codes, verify associated user information.</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Deleting Departments",
            "content": "<p>1. Select the department to delete</p><p>2. Click the <strong>Delete</strong> button</p><p>3. Confirm deletion in the dialog</p><p><strong>Warning:</strong> Departments with sub-departments or employees cannot be deleted.</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "Assigning Department Managers",
            "content": "<p>You can assign a manager to each department. Managers have approval authority and management functions for their department.</p>"
        }
    ]'::jsonb,
    'en',
    'published',
    NOW(),
    NOW()
);

-- 3. PROG-MENU-MGMT (Menu Management)
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-en-003',
    'PROG-MENU-MGMT',
    'Menu Management Help',
    '<h4>Manage the system menu structure. You can add, edit, reorder menus and set permissions.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "Menu Structure",
            "content": "<p><strong>Hierarchical Menus:</strong> Menus can be organized up to 3 levels deep.</p><p><strong>Menu Icons:</strong> You can assign Material-UI icons to each menu.</p><p><strong>Multi-language Names:</strong> Menu names can be set in multiple languages.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "Adding a New Menu",
            "content": "<p>1. Click the <strong>Add</strong> button</p><p>2. Enter the menu code and names in each language</p><p>3. Select the parent menu (leave empty for top-level menu)</p><p>4. Enter the menu path (URL)</p><p>5. Select an icon</p><p>6. Specify the display order</p><p>7. Click <strong>Save</strong></p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "Reordering Menus",
            "content": "<p>1. Select the menu to reorder</p><p>2. Click <strong>Edit</strong></p><p>3. Change the display order value</p><p>4. Click <strong>Save</strong></p><p><strong>Tip:</strong> Lower order numbers appear higher in the list.</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Setting Menu Permissions",
            "content": "<p>Menu access permissions can be set in the Role-Menu Mapping menu. Assign menus to specific roles to control access.</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "Disabling Menus",
            "content": "<p>To temporarily hide a menu without deleting it, change the menu status to inactive. Inactive menus will not appear in the user interface.</p>"
        }
    ]'::jsonb,
    'en',
    'published',
    NOW(),
    NOW()
);

-- 4. PROG-ROLE-MGMT (Role Management)
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-en-004',
    'PROG-ROLE-MGMT',
    'Role Management Help',
    '<h4>Manage system roles. You can add, edit, delete roles and set permissions.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "Understanding the Role System",
            "content": "<p><strong>What are Roles:</strong> Roles define groups of users with similar permissions.</p><p><strong>Role Types:</strong> You can define roles such as System Administrator, Department Manager, General User, etc.</p><p><strong>Permission Inheritance:</strong> You can set up permission inheritance between roles.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "Adding a New Role",
            "content": "<p>1. Click the <strong>Add</strong> button</p><p>2. Enter the role code and name</p><p>3. Write a role description</p><p>4. Specify the role priority</p><p>5. Click <strong>Save</strong></p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "Setting Role Permissions",
            "content": "<p>1. Select a role and click <strong>Edit</strong></p><p>2. Go to the <strong>Permissions</strong> tab</p><p>3. Set menu access permissions (Role-Menu Mapping)</p><p>4. Set program execution permissions (Role-Program Mapping)</p><p>5. Set data access permissions</p><p>6. Click <strong>Save</strong></p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Assigning Users to Roles",
            "content": "<p>You can assign roles to users in the User-Role Mapping menu. Multiple roles can be assigned to a single user.</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "Default Roles",
            "content": "<p>The system has the following default roles:</p><ul><li><strong>SUPER_ADMIN:</strong> Super administrator with all permissions</li><li><strong>ADMIN:</strong> System administration permissions</li><li><strong>USER:</strong> General user permissions</li></ul><p><strong>Warning:</strong> Default roles cannot be deleted.</p>"
        }
    ]'::jsonb,
    'en',
    'published',
    NOW(),
    NOW()
);

-- 5. PROG-CODE-MGMT (Code Management)
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-en-005',
    'PROG-CODE-MGMT',
    'Code Management Help',
    '<h4>Manage common codes used in the system. You can add, edit, and delete code groups and code details.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "Understanding the Code System",
            "content": "<p><strong>Code Types:</strong> Top-level categories that group related codes.</p><p><strong>Codes:</strong> Individual code items belonging to a code type.</p><p><strong>Multi-language Support:</strong> Code names can be managed in multiple languages.</p><p><strong>Usage Examples:</strong> User status (Active, Inactive, Dormant), Department types, Permission levels, etc.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "Managing Code Types",
            "content": "<p>1. Click the <strong>Add</strong> button in the Code Types tab</p><p>2. Enter the code type code (e.g., USER_STATUS)</p><p>3. Enter names and descriptions in each language</p><p>4. Click <strong>Save</strong></p><p><strong>Note:</strong> It is recommended to use uppercase letters and underscores for code type codes.</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "Adding and Editing Codes",
            "content": "<p>1. Click the <strong>Add</strong> button in the code list</p><p>2. Select the code type</p><p>3. Enter the code value</p><p>4. Enter code names in each language</p><p>5. Specify the display order</p><p>6. Select active status</p><p>7. Click <strong>Save</strong></p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Searching and Filtering Codes",
            "content": "<p>1. Search by code type or code name in the top search bar</p><p>2. Click the filter button to filter by active status</p><p>3. Select a code type to view only codes of that type</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "Code Usage Precautions",
            "content": "<p><strong>Code Deletion:</strong> Do not delete codes in use by the system. Instead, deactivate them.</p><p><strong>Code Changes:</strong> Be careful when changing code values as they may affect related data.</p><p><strong>Display Order:</strong> Controls the order displayed in dropdowns, etc.</p>"
        }
    ]'::jsonb,
    'en',
    'published',
    NOW(),
    NOW()
);

-- 6. PROG-MESSAGE-MGMT (Message Management)
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-en-006',
    'PROG-MESSAGE-MGMT',
    'Message Management Help',
    '<h4>Manage multi-language messages used in the system. You can manage error messages, guide messages, button text, etc.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "Understanding the Message System",
            "content": "<p><strong>Message Keys:</strong> Unique keys that identify messages in the system.</p><p><strong>Multi-language Support:</strong> Each message is managed in Korean, English, Chinese, and Vietnamese.</p><p><strong>Message Categories:</strong> Classified as common, validation, error, success, etc.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "Adding a New Message",
            "content": "<p>1. Click the <strong>Add</strong> button</p><p>2. Enter the message key (e.g., user.login.success)</p><p>3. Select the message category</p><p>4. Enter message content in each language</p><p>5. Click <strong>Save</strong></p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "Searching Messages",
            "content": "<p>1. Search by message key or content in the search bar</p><p>2. Use the category filter to display only messages from a specific category</p><p>3. Switch between language tabs to view messages in each language</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Bulk Editing Messages",
            "content": "<p>You can bulk edit messages using an Excel file:</p><p>1. Click the <strong>Export</strong> button to download current messages to Excel</p><p>2. Edit messages in the Excel file</p><p>3. Click the <strong>Import</strong> button to upload the modified file</p><p>4. Review changes in the preview</p><p>5. Click <strong>Apply</strong></p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "Message Key Naming Convention",
            "content": "<p>It is recommended to follow these rules for message keys:</p><ul><li>Use lowercase letters and dots (.)</li><li>Use module.function.purpose format</li><li>Examples: user.login.error, board.create.success</li></ul>"
        }
    ]'::jsonb,
    'en',
    'published',
    NOW(),
    NOW()
);

-- 7. PROG-HELP-MGMT (Help Management)
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-en-007',
    'PROG-HELP-MGMT',
    'Help Management Help',
    '<h4>Create and manage help content for each program. You can provide structured help consisting of Main Content, Sections, and FAQs.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "Help Structure",
            "content": "<p><strong>Main Content:</strong> Core content describing the main functions of the program.</p><p><strong>Sections:</strong> Detailed explanation sections divided by function.</p><p><strong>FAQs:</strong> List of frequently asked questions and answers.</p><p><strong>Multi-language Support:</strong> Help for each program can be written in multiple languages.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "Creating New Help",
            "content": "<p>1. Click the <strong>Add</strong> button</p><p>2. Select the target program</p><p>3. Select the language (ko, en, zh, vi)</p><p>4. Enter the help title</p><p>5. Write the Main Content (using Rich Text Editor)</p><p>6. Add and write Sections</p><p>7. Add FAQs if needed</p><p>8. Click <strong>Save</strong></p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "Managing Sections",
            "content": "<p>1. Click the <strong>Add Section</strong> button in the help edit screen</p><p>2. Enter the section title</p><p>3. Write section content with the Rich Text Editor</p><p>4. You can change section order with drag and drop</p><p>5. Remove unnecessary sections with the delete button</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Using the Rich Text Editor",
            "content": "<p>The following features are available when writing help:</p><ul><li>Text formatting (bold, italic, underline)</li><li>Heading styles (H1-H6)</li><li>Lists (ordered/unordered)</li><li>Insert links</li><li>Insert images</li><li>Insert tables</li><li>Code blocks</li></ul>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "Help Preview and Publishing",
            "content": "<p>1. Help being written is saved as <strong>Draft</strong> status</p><p>2. Use the <strong>Preview</strong> button to check the actual display format</p><p>3. When content is complete, change status to <strong>Published</strong></p><p>4. Published help can be viewed by users in the corresponding program</p>"
        }
    ]'::jsonb,
    'en',
    'published',
    NOW(),
    NOW()
);

-- 8. PROG-USER-ROLE-MAP (User-Role Mapping)
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-en-008',
    'PROG-USER-ROLE-MAP',
    'User-Role Mapping Help',
    '<h4>Assign and manage roles to users. You can assign multiple roles to a user or remove them.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "Understanding Role Assignment",
            "content": "<p><strong>Multiple Roles:</strong> A user can have multiple roles simultaneously.</p><p><strong>Permission Accumulation:</strong> Permissions from multiple roles are combined and applied.</p><p><strong>Immediate Application:</strong> Role changes are applied immediately without requiring user re-login.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "Assigning Roles to Users",
            "content": "<p>1. Search for or select a user from the list</p><p>2. Click the <strong>Assign Roles</strong> button</p><p>3. Select roles to assign using checkboxes</p><p>4. Click <strong>Save</strong></p><p><strong>Tip:</strong> Use the search function to quickly find roles.</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "Removing Roles",
            "content": "<p>1. Select a user</p><p>2. View the list of currently assigned roles</p><p>3. Uncheck the checkboxes for roles to remove</p><p>4. Click <strong>Save</strong></p><p><strong>Note:</strong> Removing all roles will prevent the user from accessing the system.</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Bulk Role Assignment",
            "content": "<p>You can assign roles to multiple users simultaneously:</p><p>1. Select multiple users using checkboxes</p><p>2. Click the <strong>Bulk Role Assignment</strong> button</p><p>3. Select the roles to assign</p><p>4. Click <strong>Apply</strong></p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "Viewing Users by Role",
            "content": "<p>You can view a list of users with a specific role:</p><p>1. Select the <strong>View by Role</strong> tab</p><p>2. Select the role to view</p><p>3. A list of all users with that role will be displayed</p>"
        }
    ]'::jsonb,
    'en',
    'published',
    NOW(),
    NOW()
);

-- 9. PROG-ROLE-MENU-MAP (Role-Menu Mapping)
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-en-009',
    'PROG-ROLE-MENU-MAP',
    'Role-Menu Mapping Help',
    '<h4>Set which menus each role can access. You can control menu visibility and access permissions by role.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "Menu Access Control",
            "content": "<p><strong>Role-based Menus:</strong> Users can only see menus assigned to their roles.</p><p><strong>Hierarchical Structure:</strong> You must have parent menu permission to access sub-menus.</p><p><strong>Dynamic Menus:</strong> Menus are dynamically configured based on user roles.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "Assigning Menus to Roles",
            "content": "<p>1. Select a role</p><p>2. An available menu tree will be displayed</p><p>3. Select menus using checkboxes</p><p>4. To also select sub-menus, click the parent menu</p><p>5. Click <strong>Save</strong></p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "Copying Menu Permissions",
            "content": "<p>You can copy menu permissions from an existing role to another role:</p><p>1. Select the source role</p><p>2. Click the <strong>Copy Permissions</strong> button</p><p>3. Select the target role</p><p>4. Click <strong>Copy</strong></p><p><strong>Note:</strong> Existing permissions will be overwritten.</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Viewing Roles by Menu",
            "content": "<p>You can check the list of roles that can access a specific menu:</p><p>1. Select the <strong>View by Menu</strong> tab</p><p>2. Select the menu to view</p><p>3. All roles that can access that menu will be displayed</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "Testing Permissions",
            "content": "<p>You can test the menu permissions you have set:</p><p>1. Click the <strong>Test Permissions</strong> button</p><p>2. Select a user to test</p><p>3. The menu structure that user can see will be displayed in preview</p>"
        }
    ]'::jsonb,
    'en',
    'published',
    NOW(),
    NOW()
);

-- 10. PROG-PROGRAM-MGMT (Program Management)
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-en-010',
    'PROG-PROGRAM-MGMT',
    'Program Management Help',
    '<h4>Register and manage programs (screens) used in the system. You can set permissions and properties for each program.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "Program Concept",
            "content": "<p><strong>What are Programs:</strong> Each functional screen of the system is managed as a program unit.</p><p><strong>Program Codes:</strong> Each program is identified by a unique code.</p><p><strong>Program Permissions:</strong> You can set program execution permissions by role.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "Registering a New Program",
            "content": "<p>1. Click the <strong>Add</strong> button</p><p>2. Enter the program code (e.g., PROG-USER-001)</p><p>3. Enter program names and descriptions in each language</p><p>4. Select the program category</p><p>5. Select the program type (menu, popup, batch, etc.)</p><p>6. Enter the program path (URL)</p><p>7. Click <strong>Save</strong></p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "Setting Program Permissions",
            "content": "<p>You can set detailed permissions for each program in JSON format:</p><p>1. Select a program and click <strong>Edit</strong></p><p>2. Go to the <strong>Permissions</strong> tab</p><p>3. Write permission JSON (e.g., {\"read\": true, \"write\": false})</p><p>4. Click <strong>Save</strong></p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Program Categories",
            "content": "<p>Programs can be classified into the following categories:</p><ul><li><strong>System Management:</strong> System management programs like users, roles, menus</li><li><strong>Business:</strong> Programs for actual business operations</li><li><strong>Reports:</strong> Data inquiry and report programs</li><li><strong>Settings:</strong> Various configuration programs</li></ul>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "Program Status Management",
            "content": "<p>Programs are managed with the following statuses:</p><ul><li><strong>Development:</strong> Program in development</li><li><strong>Active:</strong> Program available to users</li><li><strong>Inactive:</strong> Temporarily disabled program</li><li><strong>Deprecated:</strong> Program no longer in use</li></ul>"
        }
    ]'::jsonb,
    'en',
    'published',
    NOW(),
    NOW()
);

-- 11. PROG-LOGS (System Logs)
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-en-011',
    'PROG-LOGS',
    'System Logs Help',
    '<h4>View and analyze logs recording all system activities. You can track user activities, errors, and system events.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "Log Types",
            "content": "<p><strong>Access Logs:</strong> User login and logout records</p><p><strong>Activity Logs:</strong> User program execution and data change records</p><p><strong>Error Logs:</strong> System error records</p><p><strong>System Logs:</strong> System events and batch job records</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "Viewing Logs",
            "content": "<p>1. Select the date range to query</p><p>2. Select the log type (all, access, activity, error, system)</p><p>3. Filter by user, program, or keyword if needed</p><p>4. Click the <strong>Search</strong> button</p><p><strong>Tip:</strong> Narrow the date range for faster queries on large logs.</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "Viewing Log Details",
            "content": "<p>1. Click on the log to view in the log list</p><p>2. Log details are displayed:</p><ul><li>Occurrence time</li><li>User information</li><li>Program information</li><li>Action details</li><li>Before/after data (if available)</li><li>Error message (if available)</li></ul>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Exporting Logs",
            "content": "<p>You can export queried logs to an Excel file:</p><p>1. Query the logs</p><p>2. Click the <strong>Export</strong> button</p><p>3. Select the file format (Excel, CSV)</p><p>4. Download</p><p><strong>Limit:</strong> You can export up to 10,000 records at a time.</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "Log Retention Policy",
            "content": "<p><strong>Retention Period:</strong> Logs are retained for 90 days by default.</p><p><strong>Auto-deletion:</strong> Logs past the retention period are automatically deleted.</p><p><strong>Backup:</strong> It is recommended to back up important logs separately.</p><p><strong>Compliance:</strong> Logs related to personal information are managed according to relevant regulations.</p>"
        }
    ]'::jsonb,
    'en',
    'published',
    NOW(),
    NOW()
);

-- 12. PROG-SALES-RPT (Sales Report)
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-en-012',
    'PROG-SALES-RPT',
    'Sales Report Help',
    '<h4>View and analyze sales data from various perspectives. You can check sales status by period, product, and region.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "Report Overview",
            "content": "<p><strong>Sales Status:</strong> Shows a summary of overall sales performance.</p><p><strong>Trend Analysis:</strong> Visualizes sales trends with time series charts.</p><p><strong>Comparative Analysis:</strong> Provides comparative analysis such as year-over-year and month-over-month.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "Sales by Period",
            "content": "<p>1. Select the query period (day, week, month, quarter, year)</p><p>2. Specify start and end dates</p><p>3. Click the <strong>Search</strong> button</p><p>4. Sales amount, quantity, and count by period are displayed</p><p>5. Change chart type (bar, line, pie) for various visualizations</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "Sales Analysis by Product",
            "content": "<p>1. Select the <strong>By Product</strong> tab</p><p>2. Set the query period</p><p>3. Select product category (optional)</p><p>4. Click the <strong>Search</strong> button</p><p>5. Product sales rankings, revenue share, etc. are displayed</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Viewing Detailed Data",
            "content": "<p>You can view detailed transaction history by clicking on specific items in the summary data:</p><p>1. Click on an item in the chart or table</p><p>2. A detailed transaction list for that item appears in a popup</p><p>3. You can export the transaction history to Excel</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "Exporting and Printing Reports",
            "content": "<p><strong>Excel Export:</strong> Click the <strong>Export</strong> button to download data to an Excel file.</p><p><strong>PDF Output:</strong> Click the <strong>PDF</strong> button to save or print the report as PDF.</p><p><strong>Email:</strong> Click the <strong>Share</strong> button to send the report via email.</p>"
        }
    ]'::jsonb,
    'en',
    'published',
    NOW(),
    NOW()
);

-- 13. PROG-DASHBOARD (Dashboard)
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-en-013',
    'PROG-DASHBOARD',
    'Dashboard Help',
    '<h4>A dashboard where you can see key indicators and status of the system at a glance. Provides real-time data and summary statistics.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "Dashboard Components",
            "content": "<p><strong>KPI Cards:</strong> Displays key performance indicators in card format.</p><p><strong>Charts:</strong> Visualizes data with various charts.</p><p><strong>Recent Activity:</strong> Shows recent system activity and notifications.</p><p><strong>Quick Links:</strong> Quick access to frequently used functions.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "Managing Dashboard Widgets",
            "content": "<p>You can customize dashboard widgets:</p><p>1. Click the <strong>Edit</strong> button in the top right</p><p>2. Drag widgets to change their position</p><p>3. You can resize widgets</p><p>4. Remove unnecessary widgets with the X button</p><p>5. Add new widgets with the <strong>Add Widget</strong> button</p><p>6. Click <strong>Save</strong> to save the layout</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "Data Filtering",
            "content": "<p>You can filter dashboard data:</p><p>1. Use the filter options at the top</p><p>2. Select a period (today, this week, this month, custom)</p><p>3. Select a department or team</p><p>4. Click <strong>Apply</strong> to update the dashboard according to selected filters</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Real-time Data Updates",
            "content": "<p><strong>Auto-refresh:</strong> Dashboard data is automatically updated every 5 minutes.</p><p><strong>Manual Refresh:</strong> Click the <strong>Refresh</strong> button to immediately load the latest data.</p><p><strong>Real-time Notifications:</strong> You can receive real-time notifications when important events occur.</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "Sharing Dashboard",
            "content": "<p>You can share dashboard settings with other users:</p><p>1. Click the <strong>Share</strong> button</p><p>2. Select users or teams to share with</p><p>3. Select read-only or editable permissions</p><p>4. Click <strong>Share</strong></p>"
        }
    ]'::jsonb,
    'en',
    'published',
    NOW(),
    NOW()
);

-- 14. PROG-SETTINGS (User Settings)
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-en-014',
    'PROG-SETTINGS',
    'User Settings Help',
    '<h4>Manage personal preferences. You can change language, theme, notifications and other personal settings.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "Basic Settings",
            "content": "<p><strong>Language Settings:</strong> You can select the system display language from Korean, English, Chinese, and Vietnamese.</p><p><strong>Time Zone:</strong> Set date and time display format.</p><p><strong>Home Screen:</strong> Set the screen to be displayed first after login.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "Theme Settings",
            "content": "<p>1. Select the <strong>Theme</strong> tab</p><p>2. Select light mode or dark mode</p><p>3. Select the primary color theme (blue, green, purple, etc.)</p><p>4. Adjust font size (small, medium, large)</p><p>5. Click <strong>Save</strong></p><p><strong>Preview:</strong> You can preview changes before saving.</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "Notification Settings",
            "content": "<p>1. Select the <strong>Notifications</strong> tab</p><p>2. Select notification types you want to receive:</p><ul><li>System notifications</li><li>Message notifications</li><li>Board notifications</li><li>Approval request notifications</li></ul><p>3. Select notification methods (screen, email)</p><p>4. Click <strong>Save</strong></p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Security Settings",
            "content": "<p>1. Select the <strong>Security</strong> tab</p><p>2. You can change your password</p><p>3. Enable/disable two-factor authentication (OTP)</p><p>4. View and manage active sessions</p><p>5. Check login history</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "Data Management",
            "content": "<p><strong>Export Personal Data:</strong> You can download your personal data.</p><p><strong>Clear Cache:</strong> Clear browser cache to resolve issues.</p><p><strong>Reset Settings:</strong> Restore all settings to default values.</p>"
        }
    ]'::jsonb,
    'en',
    'published',
    NOW(),
    NOW()
);

-- 15. PROG-COMPONENTS (Component Library)
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-en-015',
    'PROG-COMPONENTS',
    'Component Library Help',
    '<h4>View and test UI components available in the system. Reference material for developers.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "Component Categories",
            "content": "<p><strong>Input Components:</strong> TextField, Select, DatePicker, Checkbox, Radio, etc.</p><p><strong>Display Components:</strong> Card, Table, DataGrid, Chart, etc.</p><p><strong>Navigation:</strong> Menu, Breadcrumb, Tabs, Stepper, etc.</p><p><strong>Feedback:</strong> Alert, Dialog, Snackbar, Progress, etc.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "Component Preview",
            "content": "<p>1. Select a component category from the left menu</p><p>2. Click a component from the component list</p><p>3. View various states and variations of the component</p><p>4. Change property values to see results in real-time</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "Code Examples",
            "content": "<p>You can view usage example code for each component:</p><p>1. Select the <strong>View Code</strong> tab on the component page</p><p>2. React code examples are displayed</p><p>3. Click the <strong>Copy</strong> button to copy the code</p><p>4. Paste and use in your project</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Properties and API",
            "content": "<p><strong>Props:</strong> View a list of all properties the component can receive and their descriptions.</p><p><strong>Default Values:</strong> Check default values for each property.</p><p><strong>Types:</strong> View TypeScript type definitions.</p><p><strong>Events:</strong> View events triggered by the component.</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "Accessibility Guide",
            "content": "<p>Provides accessibility guidelines for each component:</p><ul><li>Keyboard navigation support</li><li>Screen reader compatibility</li><li>ARIA attribute usage</li><li>Color contrast guide</li></ul>"
        }
    ]'::jsonb,
    'en',
    'published',
    NOW(),
    NOW()
);

-- 16. PROG-THEME-DEMO (Theme System Demo)
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-en-016',
    'PROG-THEME-DEMO',
    'Theme System Demo Help',
    '<h4>View and test the system theme and styling system. Preview colors, typography, spacing, etc.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "Theme System",
            "content": "<p><strong>Base Themes:</strong> Supports light mode and dark mode.</p><p><strong>Color Palette:</strong> Defines Primary, Secondary, Error, Warning, Info, Success colors.</p><p><strong>Customization:</strong> You can customize the theme to match your organizations brand.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "Color Palette",
            "content": "<p>1. Select the <strong>Colors</strong> tab</p><p>2. View each color category:</p><ul><li>Primary: Main brand color</li><li>Secondary: Secondary color</li><li>Error: Error display color</li><li>Warning: Warning color</li><li>Info: Information color</li><li>Success: Success color</li></ul><p>3. View various shades of each color</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "Typography",
            "content": "<p><strong>Fonts:</strong> View the default fonts used in the system.</p><p><strong>Font Sizes:</strong> View sizes of h1~h6, body1, body2, caption, etc.</p><p><strong>Font Weights:</strong> View weights like light, regular, medium, bold.</p><p><strong>Line Height:</strong> Check line heights for each text style.</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Spacing and Layout",
            "content": "<p><strong>Spacing:</strong> Uses 8px-based spacing system (8, 16, 24, 32, 40px, etc.).</p><p><strong>Grid:</strong> View 12-column grid system.</p><p><strong>Breakpoints:</strong> View breakpoints for responsive design (xs, sm, md, lg, xl).</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "Applying Themes",
            "content": "<p>How to apply a custom theme:</p><p>1. Modify theme settings in the theme.ts file</p><p>2. Customize colors, fonts, spacing, etc.</p><p>3. Wrap the application with ThemeProvider</p><p>4. Save changes and restart the application</p>"
        }
    ]'::jsonb,
    'en',
    'published',
    NOW(),
    NOW()
);

-- 17. PROG-REACT-STUDY (React Study Group)
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-en-017',
    'PROG-REACT-STUDY',
    'React Study Group Help',
    '<h4>A space for sharing React development learning materials, example code, and best practices.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "React Study Group Introduction",
            "content": "<p><strong>Purpose:</strong> Learn and share React and related technology stacks.</p><p><strong>Audience:</strong> All developers interested in React development</p><p><strong>Activities:</strong> Code reviews, sharing learning materials, technical discussions</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "Learning Materials",
            "content": "<p>You can view various React learning materials:</p><ul><li>React official documentation</li><li>TypeScript guide</li><li>Next.js tutorials</li><li>State management (Zustand, Redux)</li><li>Styling (Emotion, Tailwind CSS)</li><li>Testing (Jest, React Testing Library)</li></ul>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "Code Examples",
            "content": "<p>Provides example code for frequently used patterns in practice:</p><p>1. Select the <strong>Examples</strong> tab</p><p>2. Find examples by category (Hooks, Forms, API integration, etc.)</p><p>3. View and run example code</p><p>4. Copy code and apply to your project</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Best Practices",
            "content": "<p>React development rules and best practices followed in the project:</p><ul><li>Component design principles</li><li>File and folder structure</li><li>Naming conventions</li><li>State management strategy</li><li>Performance optimization techniques</li><li>Accessibility considerations</li></ul>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "Discussion and Q&A",
            "content": "<p>You can share and discuss problems or questions encountered during development:</p><p>1. Select the <strong>Discussion</strong> tab</p><p>2. Click the <strong>New Discussion</strong> button</p><p>3. Write title and content</p><p>4. You can attach code or images</p><p>5. View answers and opinions from other developers</p>"
        }
    ]'::jsonb,
    'en',
    'published',
    NOW(),
    NOW()
);

-- 18. PROG-BOARD-TYPE (Board Type Management)
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-en-018',
    'PROG-BOARD-TYPE',
    'Board Type Management Help',
    '<h4>Create and manage board types to be used in the system. You can set up various boards such as announcements, free boards, Q&A, etc.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "Understanding Board Types",
            "content": "<p><strong>Board Types:</strong> Define the purpose of boards such as announcements, general boards, Q&A, galleries, etc.</p><p><strong>Permission Settings:</strong> You can set read, write, comment, and attachment permissions for each board.</p><p><strong>Multi-language Support:</strong> Board names can be managed in multiple languages.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "Adding a New Board Type",
            "content": "<p>1. Click the <strong>Add</strong> button</p><p>2. Enter the board code (e.g., NOTICE, FREE)</p><p>3. Enter board names in each language</p><p>4. Select the board type</p><p>5. Write a board description</p><p>6. Set default permissions</p><p>7. Click <strong>Save</strong></p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "Board Settings",
            "content": "<p>You can configure various options for each board:</p><ul><li><strong>Allow Comments:</strong> Whether comment writing is allowed</li><li><strong>Attachments:</strong> Whether file attachments are allowed and maximum size</li><li><strong>Anonymous Posts:</strong> Whether anonymous posts are allowed</li><li><strong>Secret Posts:</strong> Whether secret posts are allowed</li><li><strong>Editor Type:</strong> Plain text or Rich Text Editor</li></ul>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Board Permission Management",
            "content": "<p>1. Select a board and click the <strong>Permissions</strong> tab</p><p>2. Set permissions by role:</p><ul><li>View list</li><li>View details</li><li>Write posts</li><li>Edit posts</li><li>Delete posts</li><li>Write comments</li></ul><p>3. Click <strong>Save</strong></p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "Board Order and Display",
            "content": "<p><strong>Display Order:</strong> Specifies the order displayed in the board list.</p><p><strong>Enable/Disable:</strong> You can temporarily hide or show boards.</p><p><strong>Icon Settings:</strong> You can select an icon representing the board.</p>"
        }
    ]'::jsonb,
    'en',
    'published',
    NOW(),
    NOW()
);

-- 19. PROG-BOARD-USER (Board)
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-en-019',
    'PROG-BOARD-USER',
    'Board Help',
    '<h4>Write and view posts on the board. Provides various functions such as comments, likes, and file attachments.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "Viewing Posts",
            "content": "<p><strong>List View:</strong> View title, author, date, and view count in the board list.</p><p><strong>Search:</strong> You can search posts by title, content, or author.</p><p><strong>Sort:</strong> You can sort by latest, view count, or likes.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "Writing a Post",
            "content": "<p>1. Click the <strong>Write</strong> button on the board</p><p>2. Enter the title</p><p>3. Write content with the Rich Text Editor:</p><ul><li>Apply text formatting</li><li>Insert images</li><li>Insert links</li><li>Insert tables</li></ul><p>4. Attach files if needed</p><p>5. Select a category (if available)</p><p>6. Click <strong>Submit</strong></p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "Viewing Post Details",
            "content": "<p>1. Click the post title to go to the detail screen</p><p>2. View post content, attachments, and comments</p><p>3. Click the <strong>Like</strong> button to show appreciation</p><p>4. You can navigate to previous/next posts</p><p>5. If its your post, <strong>Edit</strong> and <strong>Delete</strong> buttons are displayed</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Writing Comments",
            "content": "<p>1. Write content in the comment input field at the bottom of the post</p><p>2. Click <strong>Submit</strong></p><p>3. To write a reply, click the <strong>Reply</strong> button</p><p>4. You can edit and delete your own comments</p><p>5. You can like comments as well</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "File Attachments",
            "content": "<p><strong>Upload:</strong> Click the <strong>Attach File</strong> button when writing a post to upload files.</p><p><strong>Limits:</strong> File size and format limits depend on board settings.</p><p><strong>Download:</strong> Click the attachment name to download.</p><p><strong>Preview:</strong> Image files are displayed as previews in the body.</p>"
        }
    ]'::jsonb,
    'en',
    'published',
    NOW(),
    NOW()
);

-- 20. PROG-POST-ADMIN (Post Management)
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-en-020',
    'PROG-POST-ADMIN',
    'Post Management Help',
    '<h4>Centrally manage posts from all boards. You can delete inappropriate posts, set announcements, view statistics, etc.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "Integrated Post Management",
            "content": "<p><strong>View All Posts:</strong> View posts from all boards in one screen.</p><p><strong>Filtering:</strong> Filter by board, author, period, and status.</p><p><strong>Search:</strong> Integrated search by title, content, and author.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "Post Management Functions",
            "content": "<p>Administrators can perform the following tasks:</p><p>1. <strong>Set Announcement:</strong> Designate important posts as announcements</p><p>2. <strong>Delete Posts:</strong> Delete inappropriate posts</p><p>3. <strong>Move Posts:</strong> Move posts to other boards</p><p>4. <strong>Suspend Posts:</strong> Temporarily hide posts</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "Bulk Management",
            "content": "<p>You can select multiple posts and perform bulk operations:</p><p>1. Select posts with checkboxes</p><p>2. Click the <strong>Bulk Actions</strong> dropdown</p><p>3. Select an action (delete, move, set announcement, etc.)</p><p>4. After confirmation, click <strong>Execute</strong></p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Board Statistics",
            "content": "<p>You can view various statistics in the <strong>Statistics</strong> tab:</p><ul><li>Number of posts by board</li><li>Post trends by period</li><li>TOP 10 popular posts</li><li>TOP 10 active users</li><li>Comment statistics</li></ul><p>Statistics are visualized with charts and tables.</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "Managing Reported Posts",
            "content": "<p>Manage posts reported by users:</p><p>1. Select the <strong>Report Management</strong> tab</p><p>2. View the list of reported posts</p><p>3. Review report content and reasons</p><p>4. Take appropriate action (delete, warn, dismiss report)</p><p>5. Record action results</p>"
        }
    ]'::jsonb,
    'en',
    'published',
    NOW(),
    NOW()
);
