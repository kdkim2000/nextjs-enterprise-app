'use client';

import React, { useMemo } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { Box, useTheme, alpha } from '@mui/material';

export interface SafeHtmlRendererProps {
  html: string;
  className?: string;
  sx?: any;
}

/**
 * SafeHtmlRenderer - Safely render HTML content with XSS protection
 *
 * Uses DOMPurify to sanitize HTML and prevent JavaScript execution
 * while preserving safe HTML formatting, styles, and markdown rendering.
 *
 * Features:
 * - XSS protection via DOMPurify
 * - Removes all JavaScript (inline scripts, event handlers, etc.)
 * - Preserves safe HTML tags and attributes
 * - Styled rendering for headings, lists, code blocks, etc.
 */
const SafeHtmlRenderer: React.FC<SafeHtmlRendererProps> = ({ html, className, sx }) => {
  const theme = useTheme();

  // Sanitize HTML with DOMPurify
  const sanitizedHtml = useMemo(() => {
    if (!html) return '';

    // Configure DOMPurify for maximum security
    const config = {
      // Allowed tags
      ALLOWED_TAGS: [
        'p', 'br', 'span', 'div',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins', 'mark',
        'ul', 'ol', 'li',
        'blockquote', 'pre', 'code',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'hr',
        'sub', 'sup'
      ],
      // Allowed attributes
      ALLOWED_ATTR: [
        'href', 'target', 'rel',
        'src', 'alt', 'title', 'width', 'height',
        'class', 'style',
        'align', 'colspan', 'rowspan'
      ],
      // Allowed URI schemes
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      // Force target="_blank" for all links
      ADD_ATTR: ['target'],
      // Remove all data attributes
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
      // Forbid script-like tags
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
      // Keep safe HTML entities
      KEEP_CONTENT: true,
      // Return a DocumentFragment
      RETURN_DOM_FRAGMENT: false,
      RETURN_DOM: false
    };

    // Sanitize and return
    const clean = DOMPurify.sanitize(html, config);

    // Additional security: ensure all links have rel="noopener noreferrer"
    return clean.replace(/<a\s/g, '<a rel="noopener noreferrer" target="_blank" ');
  }, [html]);

  return (
    <Box
      className={className}
      sx={{
        // Typography
        fontFamily: theme.typography.fontFamily,
        fontSize: theme.typography.body1.fontSize,
        lineHeight: theme.typography.body1.lineHeight,
        color: theme.palette.text.primary,
        wordWrap: 'break-word',
        overflowWrap: 'break-word',

        // Headings
        '& h1': {
          fontSize: '2rem',
          fontWeight: 600,
          marginTop: theme.spacing(3),
          marginBottom: theme.spacing(1.5),
          color: theme.palette.text.primary,
          lineHeight: 1.2
        },
        '& h2': {
          fontSize: '1.5rem',
          fontWeight: 600,
          marginTop: theme.spacing(2.5),
          marginBottom: theme.spacing(1.25),
          color: theme.palette.text.primary,
          lineHeight: 1.3
        },
        '& h3': {
          fontSize: '1.25rem',
          fontWeight: 600,
          marginTop: theme.spacing(2),
          marginBottom: theme.spacing(1),
          color: theme.palette.text.primary,
          lineHeight: 1.4
        },
        '& h4': {
          fontSize: '1.125rem',
          fontWeight: 600,
          marginTop: theme.spacing(1.5),
          marginBottom: theme.spacing(0.75),
          color: theme.palette.text.primary,
          lineHeight: 1.5
        },
        '& h5, & h6': {
          fontSize: '1rem',
          fontWeight: 600,
          marginTop: theme.spacing(1),
          marginBottom: theme.spacing(0.5),
          color: theme.palette.text.primary
        },

        // Paragraphs
        '& p': {
          marginTop: theme.spacing(0.75),
          marginBottom: theme.spacing(0.75),
          '&:first-of-type': {
            marginTop: 0
          },
          '&:last-of-type': {
            marginBottom: 0
          }
        },

        // Lists
        '& ul, & ol': {
          paddingLeft: theme.spacing(3),
          marginTop: theme.spacing(1),
          marginBottom: theme.spacing(1),
          '& li': {
            marginTop: theme.spacing(0.5),
            marginBottom: theme.spacing(0.5)
          }
        },

        // Blockquote
        '& blockquote': {
          borderLeft: `4px solid ${theme.palette.primary.main}`,
          paddingLeft: theme.spacing(2),
          marginLeft: 0,
          marginRight: 0,
          marginTop: theme.spacing(1.5),
          marginBottom: theme.spacing(1.5),
          fontStyle: 'italic',
          color: theme.palette.text.secondary,
          '& p': {
            margin: theme.spacing(0.5, 0)
          }
        },

        // Code blocks
        '& pre': {
          backgroundColor: alpha(theme.palette.grey[500], 0.08),
          border: `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
          borderRadius: theme.shape.borderRadius,
          padding: theme.spacing(2),
          marginTop: theme.spacing(1.5),
          marginBottom: theme.spacing(1.5),
          overflowX: 'auto',
          fontSize: '0.875rem',
          lineHeight: 1.6,
          '& code': {
            backgroundColor: 'transparent',
            padding: 0,
            border: 'none',
            fontSize: 'inherit',
            color: theme.palette.text.primary
          }
        },

        // Inline code
        '& code': {
          backgroundColor: alpha(theme.palette.grey[500], 0.12),
          border: `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
          borderRadius: theme.shape.borderRadius / 2,
          padding: theme.spacing(0.25, 0.75),
          fontFamily: '"Consolas", "Monaco", "Courier New", monospace',
          fontSize: '0.875em',
          color: theme.palette.error.dark,
          whiteSpace: 'pre-wrap'
        },

        // Links
        '& a': {
          color: theme.palette.primary.main,
          textDecoration: 'underline',
          '&:hover': {
            color: theme.palette.primary.dark,
            textDecoration: 'none'
          },
          '&:visited': {
            color: theme.palette.primary.dark
          }
        },

        // Images
        '& img': {
          maxWidth: '100%',
          height: 'auto',
          borderRadius: theme.shape.borderRadius,
          margin: theme.spacing(1.5, 0),
          display: 'block'
        },

        // Tables
        '& table': {
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: theme.spacing(2),
          marginBottom: theme.spacing(2),
          border: `1px solid ${theme.palette.divider}`
        },
        '& th, & td': {
          padding: theme.spacing(1, 1.5),
          border: `1px solid ${theme.palette.divider}`,
          textAlign: 'left'
        },
        '& th': {
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
          fontWeight: 600,
          color: theme.palette.text.primary
        },
        '& tbody tr:hover': {
          backgroundColor: alpha(theme.palette.action.hover, 0.04)
        },

        // Horizontal rule
        '& hr': {
          border: 'none',
          borderTop: `1px solid ${theme.palette.divider}`,
          marginTop: theme.spacing(2),
          marginBottom: theme.spacing(2)
        },

        // Text formatting
        '& strong, & b': {
          fontWeight: 600
        },
        '& em, & i': {
          fontStyle: 'italic'
        },
        '& u': {
          textDecoration: 'underline'
        },
        '& s, & del': {
          textDecoration: 'line-through'
        },
        '& mark': {
          backgroundColor: alpha(theme.palette.warning.main, 0.3),
          padding: theme.spacing(0, 0.5)
        },

        ...sx
      }}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default SafeHtmlRenderer;
