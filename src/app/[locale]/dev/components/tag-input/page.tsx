'use client';

import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Stack,
  Divider
} from '@mui/material';
import TagInput from '@/components/common/TagInput';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/common/PageContainer';

export default function TagInputPage() {
  const [basicTags, setBasicTags] = useState<string[]>(['React', 'TypeScript']);
  const [suggestedTags, setSuggestedTags] = useState<string[]>(['Frontend']);
  const [limitedTags, setLimitedTags] = useState<string[]>(['Tag1', 'Tag2', 'Tag3']);
  const [errorTags, setErrorTags] = useState<string[]>([]);

  const suggestions = ['JavaScript', 'React', 'Vue', 'Angular', 'Node.js', 'Python', 'TypeScript'];

  return (
    <PageContainer fullHeight={false}>
      <PageHeader useMenu showBreadcrumb />

      <Stack spacing={4}>
        {/* Header */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            TagInput Component
          </Typography>
          <Typography variant="body2" color="text.secondary">
            A tag input component for adding and managing tags with keyboard support,
            suggestions, and validation.
          </Typography>
        </Paper>

        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Type and press Enter to add tags. Click X to remove.
          </Typography>

          <TagInput
            value={basicTags}
            onChange={setBasicTags}
            label="Tags"
            placeholder="Type and press Enter to add tags..."
          />

          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" fontWeight={600}>
              Current Tags: {JSON.stringify(basicTags)}
            </Typography>
          </Box>
        </Paper>

        {/* With Suggestions */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            With Suggestions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Click suggested tags to quickly add them.
          </Typography>

          <TagInput
            value={suggestedTags}
            onChange={setSuggestedTags}
            label="Skills"
            placeholder="Add your skills..."
            suggestions={suggestions}
            helperText="Click suggested tags below or type your own"
          />
        </Paper>

        {/* Limited Tags */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Limited Tags (Max 5)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Maximum number of tags is limited to 5.
          </Typography>

          <TagInput
            value={limitedTags}
            onChange={setLimitedTags}
            label="Categories"
            maxTags={5}
            maxLength={15}
            helperText="Max 5 tags, 15 characters each"
          />
        </Paper>

        {/* Error State */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Error State
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Display error state with helper text.
          </Typography>

          <TagInput
            value={errorTags}
            onChange={setErrorTags}
            label="Required Tags"
            error={errorTags.length === 0}
            helperText={errorTags.length === 0 ? 'At least one tag is required' : undefined}
          />
        </Paper>

        {/* Disabled State */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Disabled State
          </Typography>

          <TagInput
            value={['Locked', 'Tags']}
            onChange={() => {}}
            label="Disabled Tags"
            disabled
          />
        </Paper>

        <Divider />

        {/* Props Reference */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Props Reference
          </Typography>
          <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
            <Box component="thead">
              <Box component="tr" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Box component="th" sx={{ p: 1, textAlign: 'left' }}>Prop</Box>
                <Box component="th" sx={{ p: 1, textAlign: 'left' }}>Type</Box>
                <Box component="th" sx={{ p: 1, textAlign: 'left' }}>Default</Box>
                <Box component="th" sx={{ p: 1, textAlign: 'left' }}>Description</Box>
              </Box>
            </Box>
            <Box component="tbody">
              {[
                { prop: 'value', type: 'string[]', default: '[]', desc: 'Current tags array' },
                { prop: 'onChange', type: '(tags: string[]) => void', default: '-', desc: 'Callback when tags change' },
                { prop: 'label', type: 'string', default: '-', desc: 'Label text' },
                { prop: 'placeholder', type: 'string', default: "'Type and press Enter...'", desc: 'Input placeholder' },
                { prop: 'maxTags', type: 'number', default: '10', desc: 'Maximum number of tags' },
                { prop: 'maxLength', type: 'number', default: '20', desc: 'Max characters per tag' },
                { prop: 'disabled', type: 'boolean', default: 'false', desc: 'Disable input' },
                { prop: 'error', type: 'boolean', default: 'false', desc: 'Error state' },
                { prop: 'helperText', type: 'string', default: '-', desc: 'Helper/error text' },
                { prop: 'suggestions', type: 'string[]', default: '[]', desc: 'Suggested tags to display' },
                { prop: 'allowDuplicates', type: 'boolean', default: 'false', desc: 'Allow duplicate tags' },
              ].map((row, index) => (
                <Box component="tr" key={index} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Box component="td" sx={{ p: 1 }}><code>{row.prop}</code></Box>
                  <Box component="td" sx={{ p: 1 }}><code>{row.type}</code></Box>
                  <Box component="td" sx={{ p: 1 }}>{row.default}</Box>
                  <Box component="td" sx={{ p: 1 }}>{row.desc}</Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>

        {/* Usage Example */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Usage Example
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, fontFamily: 'monospace', fontSize: 13 }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`import TagInput from '@/components/common/TagInput';

const [tags, setTags] = useState<string[]>([]);

<TagInput
  value={tags}
  onChange={setTags}
  label="Tags"
  placeholder="Add tags..."
  maxTags={5}
  suggestions={['Option1', 'Option2']}
/>`}
            </pre>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
