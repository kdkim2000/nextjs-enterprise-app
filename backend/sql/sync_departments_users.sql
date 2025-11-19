-- Sync departments and users data

-- Step 1: Update users' department to match actual department IDs
UPDATE users SET department = 'DEPT-131' WHERE department = 'IT' OR username IN ('admin', 'jonathan.turner');
UPDATE users SET department = 'DEPT-121' WHERE department = 'Finance' OR username IN ('donna.robinson', 'eric.mitchell');
UPDATE users SET department = 'DEPT-111' WHERE department = 'HR' OR username IN ('jonathan.evans', 'donna.stewart');
UPDATE users SET department = 'DEPT-311' WHERE department = 'Sales' OR username IN ('charles.brown', 'richard.martin', 'melissa.sanchez');
UPDATE users SET department = 'DEPT-330' WHERE department = 'Marketing' OR username IN ('emily.clark');
UPDATE users SET department = 'DEPT-133' WHERE department = 'Legal' OR username IN ('jessica.phillips', 'sandra.martin', 'barbara.williams');
UPDATE users SET department = 'DEPT-140' WHERE department = 'Admin' OR username IN ('kathleen.garcia');
UPDATE users SET department = 'DEPT-240' WHERE department = 'Operations' OR username IN ('dorothy.gomez', 'elizabeth.scott');
UPDATE users SET department = 'DEPT-340' WHERE department = 'Support' OR username IN ('dorothy.lewis', 'linda.moore');
UPDATE users SET department = 'DEPT-420' WHERE department = 'Engineering' OR username IN ('richard.campbell');
UPDATE users SET department = 'DEPT-420' WHERE department = 'Product' OR username IN ('timothy.green');

-- Step 2: Assign managers to departments (using actual user IDs)
-- Management Division
UPDATE departments SET manager_id = 'user-00118' WHERE id = 'DEPT-100'; -- kathleen.garcia for Management Division
UPDATE departments SET manager_id = 'user-00117' WHERE id = 'DEPT-110'; -- jonathan.evans for HR Team
UPDATE departments SET manager_id = 'user-00115' WHERE id = 'DEPT-120'; -- donna.robinson for Finance Team
UPDATE departments SET manager_id = 'user-001' WHERE id = 'DEPT-130'; -- admin for IT Team
UPDATE departments SET manager_id = 'user-00118' WHERE id = 'DEPT-140'; -- kathleen.garcia for General Affairs Team

-- Production Division
UPDATE departments SET manager_id = 'user-00121' WHERE id = 'DEPT-200'; -- dorothy.gomez for Production Division
UPDATE departments SET manager_id = 'user-00121' WHERE id = 'DEPT-210'; -- dorothy.gomez for Plant 1
UPDATE departments SET manager_id = 'user-00125' WHERE id = 'DEPT-220'; -- elizabeth.scott for Plant 2
UPDATE departments SET manager_id = 'user-00125' WHERE id = 'DEPT-230'; -- elizabeth.scott for QC Team
UPDATE departments SET manager_id = 'user-00121' WHERE id = 'DEPT-240'; -- dorothy.gomez for SCM Team

-- Sales Division
UPDATE departments SET manager_id = 'user-00122' WHERE id = 'DEPT-300'; -- charles.brown for Sales Division
UPDATE departments SET manager_id = 'user-00122' WHERE id = 'DEPT-310'; -- charles.brown for Domestic Sales Team
UPDATE departments SET manager_id = 'user-00129' WHERE id = 'DEPT-320'; -- richard.martin for International Sales Team
UPDATE departments SET manager_id = 'user-00123' WHERE id = 'DEPT-330'; -- emily.clark for Marketing Team
UPDATE departments SET manager_id = 'user-00128' WHERE id = 'DEPT-340'; -- dorothy.lewis for Customer Service Team

-- R&D Division
UPDATE departments SET manager_id = 'user-00131' WHERE id = 'DEPT-400'; -- richard.campbell for R&D Division
UPDATE departments SET manager_id = 'user-00131' WHERE id = 'DEPT-410'; -- richard.campbell for Design Team
UPDATE departments SET manager_id = 'user-00120' WHERE id = 'DEPT-420'; -- timothy.green for Development Team
UPDATE departments SET manager_id = 'user-00120' WHERE id = 'DEPT-430'; -- timothy.green for Testing Team

-- Level 3 Departments (부)
UPDATE departments SET manager_id = 'user-00117' WHERE id = 'DEPT-111'; -- jonathan.evans for Recruitment
UPDATE departments SET manager_id = 'user-00119' WHERE id = 'DEPT-112'; -- donna.stewart for Training
UPDATE departments SET manager_id = 'user-00117' WHERE id = 'DEPT-113'; -- jonathan.evans for Compensation

UPDATE departments SET manager_id = 'user-00115' WHERE id = 'DEPT-121'; -- donna.robinson for Accounting
UPDATE departments SET manager_id = 'user-00124' WHERE id = 'DEPT-122'; -- eric.mitchell for Budget
UPDATE departments SET manager_id = 'user-00124' WHERE id = 'DEPT-123'; -- eric.mitchell for Audit

UPDATE departments SET manager_id = 'user-001' WHERE id = 'DEPT-131'; -- admin for Infrastructure
UPDATE departments SET manager_id = 'user-00127' WHERE id = 'DEPT-132'; -- jonathan.turner for Application
UPDATE departments SET manager_id = 'user-001' WHERE id = 'DEPT-133'; -- admin for Security

UPDATE departments SET manager_id = 'user-00122' WHERE id = 'DEPT-311'; -- charles.brown for Seoul Sales
UPDATE departments SET manager_id = 'user-00132' WHERE id = 'DEPT-312'; -- melissa.sanchez for Busan Sales
UPDATE departments SET manager_id = 'user-00122' WHERE id = 'DEPT-313'; -- charles.brown for Regional Sales

UPDATE departments SET manager_id = 'user-00129' WHERE id = 'DEPT-321'; -- richard.martin for Asia Sales
UPDATE departments SET manager_id = 'user-00129' WHERE id = 'DEPT-322'; -- richard.martin for Europe Sales
UPDATE departments SET manager_id = 'user-00129' WHERE id = 'DEPT-323'; -- richard.martin for Americas Sales

-- Level 4 Departments (과)
UPDATE departments SET manager_id = 'user-00117' WHERE id = 'DEPT-1111'; -- jonathan.evans for Experienced Hire Section
UPDATE departments SET manager_id = 'user-00119' WHERE id = 'DEPT-1112'; -- donna.stewart for New Graduate Section

UPDATE departments SET manager_id = 'user-00115' WHERE id = 'DEPT-1211'; -- donna.robinson for AR Section
UPDATE departments SET manager_id = 'user-00124' WHERE id = 'DEPT-1212'; -- eric.mitchell for AP Section
UPDATE departments SET manager_id = 'user-00115' WHERE id = 'DEPT-1213'; -- donna.robinson for GL Section

UPDATE departments SET manager_id = 'user-001' WHERE id = 'DEPT-1311'; -- admin for Network Section
UPDATE departments SET manager_id = 'user-00127' WHERE id = 'DEPT-1312'; -- jonathan.turner for Server Section
UPDATE departments SET manager_id = 'user-00127' WHERE id = 'DEPT-1313'; -- jonathan.turner for Database Section

UPDATE departments SET manager_id = 'user-00122' WHERE id = 'DEPT-3111'; -- charles.brown for Seoul Section 1
UPDATE departments SET manager_id = 'user-00122' WHERE id = 'DEPT-3112'; -- charles.brown for Seoul Section 2
UPDATE departments SET manager_id = 'user-00132' WHERE id = 'DEPT-3113'; -- melissa.sanchez for Seoul Section 3
