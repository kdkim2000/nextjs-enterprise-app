'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Chip, Alert } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import QuickSearchBar from '@/components/common/QuickSearchBar';

export default function QuickSearchDemoPage() {
  const [searchValue1, setSearchValue1] = useState('');
  const [searchValue2, setSearchValue2] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<string>('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterCount, setFilterCount] = useState(2);

  const handleSearch1 = () => {
    setSearchResult(`Searching for: "${searchValue1}"`);
  };

  const handleSearch2 = () => {
    setSearching(true);
    setSearchResult(`Searching for: "${searchValue2}"...`);

    // Simulate async search
    setTimeout(() => {
      setSearching(false);
      setSearchResult(`Found 12 results for: "${searchValue2}"`);
    }, 1500);
  };

  return (
    <PageContainer
      title="Quick Search Bar"
      description="Simple search bar with instant results"
    >
      <Stack spacing={4}>
        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Simple search with clear button
          </Typography>

          <QuickSearchBar
            searchValue={searchValue1}
            onSearchChange={setSearchValue1}
            onSearch={handleSearch1}
            onClear={() => {
              setSearchValue1('');
              setSearchResult('');
            }}
            placeholder="Search products..."
            showAdvancedButton={false}
          />

          {searchResult && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {searchResult}
            </Alert>
          )}
        </Paper>

        {/* With Advanced Filter Button */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            With Advanced Filter Button
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Includes advanced filter button with badge count
          </Typography>

          <QuickSearchBar
            searchValue={searchValue2}
            onSearchChange={setSearchValue2}
            onSearch={handleSearch2}
            onClear={() => {
              setSearchValue2('');
              setSearchResult('');
            }}
            onAdvancedFilterClick={() => setFilterOpen(!filterOpen)}
            placeholder="Search users, orders, products..."
            searching={searching}
            activeFilterCount={filterCount}
            showAdvancedButton={true}
          />

          {filterOpen && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Advanced Filters
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                <Chip
                  label="Category: Electronics"
                  size="small"
                  color="primary"
                  onDelete={() => setFilterCount(filterCount - 1)}
                />
                <Chip
                  label="Status: Active"
                  size="small"
                  color="primary"
                  onDelete={() => setFilterCount(filterCount - 1)}
                />
              </Stack>
            </Box>
          )}

          {searchResult && !searching && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {searchResult}
            </Alert>
          )}
        </Paper>

        {/* With Loading State */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Search States
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Shows different states: idle, searching, disabled
          </Typography>

          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                Normal State:
              </Typography>
              <QuickSearchBar
                searchValue=""
                onSearchChange={() => {}}
                onSearch={() => {}}
                onClear={() => {}}
                placeholder="Ready to search..."
                showAdvancedButton={false}
              />
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                Searching State:
              </Typography>
              <QuickSearchBar
                searchValue="test query"
                onSearchChange={() => {}}
                onSearch={() => {}}
                onClear={() => {}}
                placeholder="Searching..."
                searching={true}
                showAdvancedButton={false}
              />
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                Disabled State:
              </Typography>
              <QuickSearchBar
                searchValue=""
                onSearchChange={() => {}}
                onSearch={() => {}}
                onClear={() => {}}
                placeholder="Search disabled"
                disabled={true}
                showAdvancedButton={false}
              />
            </Box>
          </Stack>
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
              {`import QuickSearchBar from '@/components/common/QuickSearchBar';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>searchValue</code>: string - Current search value</li>
            <li><code>onSearchChange</code>: (value: string) =&gt; void - Search input change handler</li>
            <li><code>onSearch</code>: () =&gt; void - Search button click handler</li>
            <li><code>onClear</code>: () =&gt; void - Clear button click handler</li>
            <li><code>onAdvancedFilterClick</code>: () =&gt; void - Advanced filter button click (optional)</li>
            <li><code>placeholder</code>: string - Input placeholder (optional)</li>
            <li><code>searching</code>: boolean - Shows loading state (default: false)</li>
            <li><code>disabled</code>: boolean - Disables all inputs (default: false)</li>
            <li><code>activeFilterCount</code>: number - Badge count on filter button (default: 0)</li>
            <li><code>showAdvancedButton</code>: boolean - Shows advanced filter button (default: true)</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Key Features:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Search icon with visual feedback</li>
            <li>Clear button appears when text is entered</li>
            <li>Enter key support for quick search</li>
            <li>Loading spinner during search</li>
            <li>Optional advanced filter button with badge</li>
            <li>Disabled state support</li>
            <li>Tooltip hints on buttons</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Common Use Cases:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Quick search in data tables</li>
            <li>Search bars in list views</li>
            <li>Filter interfaces with advanced options</li>
            <li>Product/user search forms</li>
            <li>Document or content search</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
