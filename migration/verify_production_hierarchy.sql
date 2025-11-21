-- Verify production division hierarchy
WITH RECURSIVE dept_tree AS (
    -- Start with production division
    SELECT
        id,
        code,
        name_en,
        level,
        parent_id,
        ARRAY[id]::VARCHAR[] as path,
        name_en as path_name
    FROM departments
    WHERE id = 'DEPT-200'

    UNION ALL

    -- Recursively get all children
    SELECT
        d.id,
        d.code,
        d.name_en,
        d.level,
        d.parent_id,
        dt.path || d.id::VARCHAR,
        dt.path_name || ' > ' || d.name_en
    FROM departments d
    INNER JOIN dept_tree dt ON d.parent_id = dt.id
)
SELECT
    REPEAT('  ', level) || name_en as hierarchy,
    level,
    CASE
        WHEN level = 1 THEN '부문'
        WHEN level = 2 THEN '팀'
        WHEN level = 3 THEN '부'
        WHEN level = 4 THEN '과'
        WHEN level = 5 THEN '직'
        WHEN level = 6 THEN '반'
    END as level_name,
    code,
    id
FROM dept_tree
ORDER BY path;
