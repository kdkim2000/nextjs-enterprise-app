'use client';

import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Box, IconButton, Tooltip, Typography, Paper, Link } from '@mui/material';
import { ContentCopy, Check } from '@mui/icons-material';

interface MarkdownRendererProps {
  content: string;
  searchTerm?: string;
}

// Code block component with copy functionality
const CodeBlock = memo(function CodeBlock({
  language,
  children
}: {
  language: string;
  children: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ position: 'relative', my: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#2d2d2d',
          px: 2,
          py: 0.5,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8
        }}
      >
        <Typography variant="caption" sx={{ color: 'grey.400', fontFamily: 'monospace' }}>
          {language || 'plaintext'}
        </Typography>
        <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
          <IconButton size="small" onClick={handleCopy} sx={{ color: 'grey.400' }}>
            {copied ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          fontSize: '0.85rem'
        }}
        showLineNumbers={children.split('\n').length > 5}
        wrapLines
        wrapLongLines
      >
        {children}
      </SyntaxHighlighter>
    </Box>
  );
});

// Highlight search term in text
const highlightText = (text: string, searchTerm: string): React.ReactNode => {
  if (!searchTerm || searchTerm.length < 2) return text;

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <Box
        key={i}
        component="mark"
        sx={{
          bgcolor: 'warning.light',
          color: 'warning.contrastText',
          px: 0.25,
          borderRadius: 0.5
        }}
      >
        {part}
      </Box>
    ) : (
      part
    )
  );
};

const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  searchTerm = ''
}: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Code blocks
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const codeString = String(children).replace(/\n$/, '');
          const isInline = !match && !codeString.includes('\n');

          if (isInline) {
            return (
              <Box
                component="code"
                sx={{
                  bgcolor: 'grey.100',
                  color: 'error.main',
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 0.5,
                  fontFamily: 'monospace',
                  fontSize: '0.875em'
                }}
                {...props}
              >
                {highlightText(codeString, searchTerm)}
              </Box>
            );
          }

          return <CodeBlock language={match?.[1] || ''}>{codeString}</CodeBlock>;
        },

        // Headings
        h1: ({ children }) => (
          <Typography variant="h4" fontWeight={700} sx={{ mt: 3, mb: 2 }}>
            {children}
          </Typography>
        ),
        h2: ({ children }) => (
          <Typography variant="h5" fontWeight={600} sx={{ mt: 2.5, mb: 1.5 }}>
            {children}
          </Typography>
        ),
        h3: ({ children }) => (
          <Typography variant="h6" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
            {children}
          </Typography>
        ),
        h4: ({ children }) => (
          <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1.5, mb: 1 }}>
            {children}
          </Typography>
        ),

        // Paragraphs
        p: ({ children }) => (
          <Typography variant="body1" sx={{ my: 1, lineHeight: 1.7 }}>
            {typeof children === 'string' ? highlightText(children, searchTerm) : children}
          </Typography>
        ),

        // Lists
        ul: ({ children }) => (
          <Box component="ul" sx={{ pl: 3, my: 1.5 }}>
            {children}
          </Box>
        ),
        ol: ({ children }) => (
          <Box component="ol" sx={{ pl: 3, my: 1.5 }}>
            {children}
          </Box>
        ),
        li: ({ children }) => (
          <Box component="li" sx={{ mb: 0.5, lineHeight: 1.6 }}>
            {children}
          </Box>
        ),

        // Blockquote
        blockquote: ({ children }) => (
          <Paper
            elevation={0}
            sx={{
              borderLeft: 4,
              borderColor: 'primary.main',
              bgcolor: 'grey.50',
              pl: 2,
              pr: 2,
              py: 1,
              my: 2
            }}
          >
            {children}
          </Paper>
        ),

        // Tables
        table: ({ children }) => (
          <Box sx={{ overflowX: 'auto', my: 2 }}>
            <Box
              component="table"
              sx={{
                width: '100%',
                borderCollapse: 'collapse',
                '& th, & td': {
                  border: 1,
                  borderColor: 'divider',
                  px: 2,
                  py: 1
                },
                '& th': {
                  bgcolor: 'grey.100',
                  fontWeight: 600
                }
              }}
            >
              {children}
            </Box>
          </Box>
        ),

        // Links
        a: ({ href, children }) => (
          <Link href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </Link>
        ),

        // Horizontal rule
        hr: () => <Box sx={{ borderTop: 1, borderColor: 'divider', my: 3 }} />,

        // Strong and emphasis
        strong: ({ children }) => (
          <Box component="strong" sx={{ fontWeight: 600 }}>
            {typeof children === 'string' ? highlightText(children, searchTerm) : children}
          </Box>
        ),
        em: ({ children }) => (
          <Box component="em" sx={{ fontStyle: 'italic' }}>
            {children}
          </Box>
        ),

        // Pre block wrapper
        pre: ({ children }) => <Box>{children}</Box>
      }}
    >
      {content}
    </ReactMarkdown>
  );
});

export default MarkdownRenderer;
