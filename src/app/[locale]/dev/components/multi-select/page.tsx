'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Chip, Grid } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import MultiSelect from '@/components/common/MultiSelect';

export default function MultiSelectDemoPage() {
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['electronics', 'clothing']);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const httpMethods = [
    { value: 'GET', label: 'GET' },
    { value: 'POST', label: 'POST' },
    { value: 'PUT', label: 'PUT' },
    { value: 'PATCH', label: 'PATCH' },
    { value: 'DELETE', label: 'DELETE' }
  ];

  const categories = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'books', label: 'Books' },
    { value: 'food', label: 'Food & Beverages' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports & Outdoors' }
  ];

  const skills = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'react', label: 'React' },
    { value: 'nodejs', label: 'Node.js' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'sql', label: 'SQL' },
    { value: 'docker', label: 'Docker' }
  ];

  const countries = [
    { value: 'us', label: 'United States' },
    { value: 'kr', label: 'South Korea' },
    { value: 'jp', label: 'Japan' },
    { value: 'cn', label: 'China' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
    { value: 'ca', label: 'Canada' }
  ];

  return (
    <PageContainer
      title="Multi Select"
      description="Multiple selection dropdown with search and chips"
    >
      <Stack spacing={4}>
        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select multiple items with checkboxes (defaults to "All" when none selected)
          </Typography>

          <MultiSelect
            label="HTTP Methods"
            value={selectedMethods}
            onChange={setSelectedMethods}
            options={httpMethods}
            allLabel="All Methods"
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected Methods:
            </Typography>
            {selectedMethods.length === 0 ? (
              <Chip label="All Methods (none selected = all)" color="default" />
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {selectedMethods.map((method) => (
                  <Chip key={method} label={method} color="primary" />
                ))}
              </Stack>
            )}
          </Box>
        </Paper>

        {/* With Default Values */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            With Default Values
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Pre-selected items displayed as chips
          </Typography>

          <MultiSelect
            label="Product Categories"
            value={selectedCategories}
            onChange={setSelectedCategories}
            options={categories}
            allLabel="All Categories"
            helperText="Select categories to filter products"
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected Categories:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {selectedCategories.map((category) => {
                const cat = categories.find((c) => c.value === category);
                return (
                  <Chip key={category} label={cat?.label} color="primary" variant="outlined" />
                );
              })}
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {selectedCategories.length} out of {categories.length} categories selected
            </Typography>
          </Box>
        </Paper>

        {/* Multiple Instances */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Multiple Multi-Select Components
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Use multiple multi-select components for different filters
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <MultiSelect
                label="Skills"
                value={selectedSkills}
                onChange={setSelectedSkills}
                options={skills}
                allLabel="All Skills"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MultiSelect
                label="Countries"
                value={selectedCountries}
                onChange={setSelectedCountries}
                options={countries}
                allLabel="All Countries"
                size="small"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Filter Summary:
            </Typography>
            <Stack spacing={1}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Skills:
                </Typography>
                {selectedSkills.length === 0 ? (
                  <Chip label="All Skills" size="small" sx={{ ml: 1 }} />
                ) : (
                  <Box sx={{ display: 'inline-flex', gap: 0.5, ml: 1, flexWrap: 'wrap' }}>
                    {selectedSkills.map((skill) => {
                      const s = skills.find((sk) => sk.value === skill);
                      return <Chip key={skill} label={s?.label} size="small" color="primary" />;
                    })}
                  </Box>
                )}
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Countries:
                </Typography>
                {selectedCountries.length === 0 ? (
                  <Chip label="All Countries" size="small" sx={{ ml: 1 }} />
                ) : (
                  <Box sx={{ display: 'inline-flex', gap: 0.5, ml: 1, flexWrap: 'wrap' }}>
                    {selectedCountries.map((country) => {
                      const c = countries.find((co) => co.value === country);
                      return <Chip key={country} label={c?.label} size="small" color="primary" />;
                    })}
                  </Box>
                )}
              </Box>
            </Stack>
          </Box>
        </Paper>

        {/* API Reference */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            API Reference
          </Typography>
          <Typography variant="body2" component="div">
            <strong>Import:</strong>
            <Box
              component="pre"
              sx={{
                bgcolor: 'grey.100',
                p: 2,
                borderRadius: 1,
                overflow: 'auto',
                mt: 1,
              }}
            >
              {`import MultiSelect from '@/components/common/MultiSelect';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>label</code>: string - Label for the select field</li>
            <li><code>value</code>: string[] - Array of selected values</li>
            <li><code>onChange</code>: (values: string[]) =&gt; void - Change handler</li>
            <li><code>options</code>: MultiSelectOption[] - Array of {`{ value: string, label: string }`}</li>
            <li><code>allLabel</code>: string - Label for "All" option (default: "All")</li>
            <li><code>placeholder</code>: string - Placeholder text (optional)</li>
            <li><code>disabled</code>: boolean - Disabled state (optional)</li>
            <li><code>helperText</code>: string - Helper text (optional)</li>
            <li><code>fullWidth</code>: boolean - Full width (default: true)</li>
            <li><code>size</code>: 'small' | 'medium' - Size variant (default: 'small')</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Key Features:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Google-style modern design with smooth animations</li>
            <li>Checkboxes for clear selection state</li>
            <li>Selected items displayed as chips with delete option</li>
            <li>"All" option when no items selected (empty array = all)</li>
            <li>Hover effects and focus states for better UX</li>
            <li>Supports custom labels for all options</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Common Use Cases:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Filter panels with multiple criteria</li>
            <li>Tag/category selection in forms</li>
            <li>Permission/role assignment</li>
            <li>Multi-criteria search filters</li>
            <li>Settings with multiple options</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
