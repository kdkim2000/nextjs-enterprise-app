'use client';

import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Stack,
  Divider,
  Alert,
  TextField
} from '@mui/material';
import SafeHtmlRenderer from '@/components/common/SafeHtmlRenderer';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/common/PageContainer';

export default function SafeHtmlRendererPage() {
  const [customHtml, setCustomHtml] = useState('<p>Enter your HTML here...</p>');

  const sampleHtml = `
    <h2>Welcome to SafeHtmlRenderer</h2>
    <p>This component <strong>safely renders</strong> HTML content with <em>XSS protection</em>.</p>
    <h3>Features</h3>
    <ul>
      <li>XSS protection via DOMPurify</li>
      <li>Preserves safe HTML formatting</li>
      <li>Styled typography and code blocks</li>
    </ul>
    <blockquote>
      <p>"Security is not a product, but a process." - Bruce Schneier</p>
    </blockquote>
    <p>Here's some <code>inline code</code> and a code block:</p>
    <pre><code>const safe = DOMPurify.sanitize(html);</code></pre>
    <p>Visit <a href="https://example.com">Example.com</a> for more info.</p>
  `;

  const maliciousHtml = `
    <p>Normal text</p>
    <script>alert('XSS Attack!')</script>
    <img src="x" onerror="alert('XSS')">
    <a href="javascript:alert('XSS')">Click me</a>
    <button onclick="alert('XSS')">Don't click</button>
    <iframe src="https://evil.com"></iframe>
    <p onmouseover="alert('XSS')">Hover me</p>
  `;

  const tableHtml = `
    <h3>Data Table Example</h3>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Role</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>John Doe</td>
          <td>Developer</td>
          <td>Active</td>
        </tr>
        <tr>
          <td>Jane Smith</td>
          <td>Designer</td>
          <td>Active</td>
        </tr>
      </tbody>
    </table>
  `;

  return (
    <PageContainer fullHeight={false}>
      <PageHeader useMenu showBreadcrumb />

      <Stack spacing={4}>
        {/* Header */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            SafeHtmlRenderer Component
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Safely render HTML content with XSS protection using DOMPurify.
            Removes dangerous scripts while preserving safe formatting.
          </Typography>
        </Paper>

        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Renders various HTML elements with consistent styling.
          </Typography>

          <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <SafeHtmlRenderer html={sampleHtml} />
          </Box>
        </Paper>

        {/* XSS Protection Demo */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom color="error">
            XSS Protection Demo
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            The following malicious HTML is automatically sanitized. Scripts, event handlers,
            and dangerous elements are removed.
          </Alert>

          <Typography variant="subtitle2" gutterBottom>
            Input (malicious HTML):
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'error.lighter', borderRadius: 1, mb: 2, fontFamily: 'monospace', fontSize: 12 }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{maliciousHtml}</pre>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            Output (sanitized - safe to render):
          </Typography>
          <Box sx={{ p: 2, border: 1, borderColor: 'success.main', borderRadius: 1, bgcolor: 'success.lighter' }}>
            <SafeHtmlRenderer html={maliciousHtml} />
          </Box>

          <Alert severity="success" sx={{ mt: 2 }}>
            All scripts, event handlers, and dangerous elements have been removed!
          </Alert>
        </Paper>

        {/* Table Rendering */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Table Rendering
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Tables are styled automatically with proper borders and hover effects.
          </Typography>

          <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <SafeHtmlRenderer html={tableHtml} />
          </Box>
        </Paper>

        {/* Interactive Demo */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Interactive Demo
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your own HTML to see how it's rendered safely.
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            value={customHtml}
            onChange={(e) => setCustomHtml(e.target.value)}
            placeholder="Enter HTML..."
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle2" gutterBottom>
            Rendered Output:
          </Typography>
          <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <SafeHtmlRenderer html={customHtml} />
          </Box>
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
                <Box component="th" sx={{ p: 1, textAlign: 'left' }}>Required</Box>
                <Box component="th" sx={{ p: 1, textAlign: 'left' }}>Description</Box>
              </Box>
            </Box>
            <Box component="tbody">
              {[
                { prop: 'html', type: 'string', required: 'Yes', desc: 'HTML content to render' },
                { prop: 'className', type: 'string', required: 'No', desc: 'CSS class name' },
                { prop: 'sx', type: 'SxProps', required: 'No', desc: 'MUI sx styling override' },
              ].map((row, index) => (
                <Box component="tr" key={index} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Box component="td" sx={{ p: 1 }}><code>{row.prop}</code></Box>
                  <Box component="td" sx={{ p: 1 }}><code>{row.type}</code></Box>
                  <Box component="td" sx={{ p: 1 }}>{row.required}</Box>
                  <Box component="td" sx={{ p: 1 }}>{row.desc}</Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>

        {/* Security Features */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Security Features
          </Typography>
          <Stack spacing={1}>
            <Alert severity="info" variant="outlined">
              <strong>Allowed Tags:</strong> p, br, span, div, h1-h6, strong, em, ul, ol, li, blockquote, pre, code, a, img, table, etc.
            </Alert>
            <Alert severity="error" variant="outlined">
              <strong>Forbidden Tags:</strong> script, style, iframe, object, embed, form, input, button, textarea, select
            </Alert>
            <Alert severity="warning" variant="outlined">
              <strong>Forbidden Attributes:</strong> onerror, onload, onclick, onmouseover, and all event handlers
            </Alert>
            <Alert severity="success" variant="outlined">
              <strong>Link Security:</strong> All links get <code>rel="noopener noreferrer" target="_blank"</code> automatically
            </Alert>
          </Stack>
        </Paper>

        {/* Usage Example */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Usage Example
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, fontFamily: 'monospace', fontSize: 13 }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`import SafeHtmlRenderer from '@/components/common/SafeHtmlRenderer';

// Render user-generated content safely
<SafeHtmlRenderer
  html={userContent}
  sx={{ maxWidth: 800 }}
/>

// Render post/article content
<SafeHtmlRenderer html={post.content} />

// With custom styling
<SafeHtmlRenderer
  html={markdown}
  className="prose"
  sx={{
    '& h1': { color: 'primary.main' }
  }}
/>`}
            </pre>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
