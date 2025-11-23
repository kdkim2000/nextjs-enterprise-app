/**
 * RichTextEditor Component
 *
 * A feature-rich WYSIWYG editor built with Tiptap for creating and editing
 * formatted content with HTML/Markdown support.
 *
 * Features:
 * - Text formatting (bold, italic, underline, strikethrough)
 * - Headings (h1-h6)
 * - Lists (bulleted, numbered)
 * - Text alignment (left, center, right, justify)
 * - Blockquotes and code blocks
 * - Links and images
 * - Tables
 * - Undo/Redo
 *
 * @example
 * ```tsx
 * <RichTextEditor
 *   value={content}
 *   onChange={setContent}
 *   placeholder="Write your content here..."
 *   minHeight={300}
 * />
 * ```
 */

'use client';

import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import {
  Box,
  Paper,
  IconButton,
  Divider,
  Tooltip,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatStrikethrough,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  Undo,
  Redo,
  FormatClear
} from '@mui/icons-material';

/**
 * Props for the RichTextEditor component
 */
export interface RichTextEditorProps {
  /** Current HTML content value */
  value: string;
  /** Callback fired when content changes */
  onChange: (value: string) => void;
  /** Placeholder text shown when editor is empty */
  placeholder?: string;
  /** Minimum height of the editor content area (default: 200) */
  minHeight?: number | string;
  /** Maximum height of the editor content area (default: 600) */
  maxHeight?: number | string;
  /** If true, editor is disabled and read-only */
  disabled?: boolean;
  /** If true, editor shows error styling */
  error?: boolean;
  /** Helper text displayed below the editor */
  helperText?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write something...',
  minHeight = 200,
  maxHeight = 600,
  disabled = false,
  error = false,
  helperText
}) => {
  const theme = useTheme();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'code-block'
          }
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image'
        }
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'editor-table'
        }
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Underline,
      Placeholder.configure({
        placeholder
      })
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    }
  });

  /**
   * Handle link insertion/editing
   * Prompts user for URL and adds/updates link at current selection
   */
  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  /**
   * Handle image insertion
   * Prompts user for image URL and inserts image at cursor position
   */
  const addImage = useCallback(() => {
    if (!editor) return;

    const url = window.prompt('Image URL');

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  /**
   * Toolbar button component with tooltip and active state
   */
  const MenuButton = ({
    onClick,
    isActive = false,
    disabled = false,
    icon,
    tooltip
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    icon: React.ReactNode;
    tooltip: string;
  }) => (
    <Tooltip title={tooltip}>
      <span>
        <IconButton
          size="small"
          onClick={onClick}
          disabled={disabled}
          sx={{
            color: isActive ? 'primary.main' : 'text.secondary',
            backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
            '&:hover': {
              backgroundColor: isActive
                ? alpha(theme.palette.primary.main, 0.2)
                : alpha(theme.palette.action.hover, 0.04)
            }
          }}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );

  return (
    <Box>
      <Paper
        variant="outlined"
        sx={{
          borderColor: error ? 'error.main' : 'divider',
          borderRadius: 1,
          overflow: 'hidden'
        }}
      >
        {/* Toolbar */}
        <Box
          sx={{
            p: 1,
            backgroundColor: 'background.default',
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Stack direction="row" spacing={0.5} flexWrap="wrap" alignItems="center">
            {/* === Text Formatting === */}
            <MenuButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              icon={<FormatBold fontSize="small" />}
              tooltip="Bold (Ctrl+B)"
            />
            <MenuButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              icon={<FormatItalic fontSize="small" />}
              tooltip="Italic (Ctrl+I)"
            />
            <MenuButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              icon={<FormatUnderlined fontSize="small" />}
              tooltip="Underline (Ctrl+U)"
            />
            <MenuButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              icon={<FormatStrikethrough fontSize="small" />}
              tooltip="Strikethrough"
            />

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* === Lists === */}
            <MenuButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              icon={<FormatListBulleted fontSize="small" />}
              tooltip="Bullet List"
            />
            <MenuButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              icon={<FormatListNumbered fontSize="small" />}
              tooltip="Numbered List"
            />

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* === Text Alignment === */}
            <MenuButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
              icon={<FormatAlignLeft fontSize="small" />}
              tooltip="Align Left"
            />
            <MenuButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })}
              icon={<FormatAlignCenter fontSize="small" />}
              tooltip="Align Center"
            />
            <MenuButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
              icon={<FormatAlignRight fontSize="small" />}
              tooltip="Align Right"
            />
            <MenuButton
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              isActive={editor.isActive({ textAlign: 'justify' })}
              icon={<FormatAlignJustify fontSize="small" />}
              tooltip="Justify"
            />

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* === Blockquote & Code === */}
            <MenuButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              icon={<FormatQuote fontSize="small" />}
              tooltip="Quote"
            />
            <MenuButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive('codeBlock')}
              icon={<Code fontSize="small" />}
              tooltip="Code Block"
            />

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* === Links & Images === */}
            <MenuButton
              onClick={setLink}
              isActive={editor.isActive('link')}
              icon={<LinkIcon fontSize="small" />}
              tooltip="Insert Link"
            />
            <MenuButton
              onClick={addImage}
              icon={<ImageIcon fontSize="small" />}
              tooltip="Insert Image"
            />

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* === History === */}
            <MenuButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              icon={<Undo fontSize="small" />}
              tooltip="Undo (Ctrl+Z)"
            />
            <MenuButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              icon={<Redo fontSize="small" />}
              tooltip="Redo (Ctrl+Y)"
            />

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* === Clear Formatting === */}
            <MenuButton
              onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
              icon={<FormatClear fontSize="small" />}
              tooltip="Clear Formatting"
            />
          </Stack>
        </Box>

        {/* Editor Content */}
        <Box
          sx={{
            p: 2,
            minHeight,
            maxHeight,
            overflowY: 'auto',
            '& .ProseMirror': {
              outline: 'none',
              minHeight: typeof minHeight === 'number' ? minHeight - 32 : 'auto',
              '& p.is-editor-empty:first-child::before': {
                color: 'text.disabled',
                content: 'attr(data-placeholder)',
                float: 'left',
                height: 0,
                pointerEvents: 'none'
              },
              '& h1': {
                fontSize: '2rem',
                fontWeight: 600,
                marginTop: theme.spacing(2),
                marginBottom: theme.spacing(1)
              },
              '& h2': {
                fontSize: '1.5rem',
                fontWeight: 600,
                marginTop: theme.spacing(1.5),
                marginBottom: theme.spacing(1)
              },
              '& h3': {
                fontSize: '1.25rem',
                fontWeight: 600,
                marginTop: theme.spacing(1),
                marginBottom: theme.spacing(0.5)
              },
              '& h4': {
                fontSize: '1.125rem',
                fontWeight: 600,
                marginTop: theme.spacing(0.75),
                marginBottom: theme.spacing(0.5)
              },
              '& h5, & h6': {
                fontSize: '1rem',
                fontWeight: 600,
                marginTop: theme.spacing(0.5),
                marginBottom: theme.spacing(0.5)
              },
              '& p': {
                marginTop: theme.spacing(0.5),
                marginBottom: theme.spacing(0.5)
              },
              '& ul, & ol': {
                paddingLeft: theme.spacing(3),
                marginTop: theme.spacing(0.5),
                marginBottom: theme.spacing(0.5)
              },
              '& blockquote': {
                borderLeft: `3px solid ${theme.palette.primary.main}`,
                paddingLeft: theme.spacing(2),
                marginLeft: 0,
                marginRight: 0,
                fontStyle: 'italic',
                color: theme.palette.text.secondary
              },
              '& pre': {
                backgroundColor: alpha(theme.palette.grey[500], 0.1),
                borderRadius: theme.shape.borderRadius,
                padding: theme.spacing(1.5),
                overflowX: 'auto',
                '& code': {
                  backgroundColor: 'transparent',
                  padding: 0
                }
              },
              '& code': {
                backgroundColor: alpha(theme.palette.grey[500], 0.15),
                borderRadius: theme.shape.borderRadius / 2,
                padding: theme.spacing(0.25, 0.5),
                fontFamily: 'monospace',
                fontSize: '0.875em'
              },
              '& .editor-image': {
                maxWidth: '100%',
                height: 'auto',
                borderRadius: theme.shape.borderRadius,
                margin: theme.spacing(1, 0)
              },
              '& a': {
                color: theme.palette.primary.main,
                textDecoration: 'underline',
                '&:hover': {
                  textDecoration: 'none'
                }
              },
              // Table styles
              '& .editor-table': {
                borderCollapse: 'collapse',
                margin: theme.spacing(1.5, 0),
                width: '100%',
                border: `1px solid ${theme.palette.divider}`,
                '& td, & th': {
                  border: `1px solid ${theme.palette.divider}`,
                  padding: theme.spacing(1),
                  minWidth: '100px',
                  verticalAlign: 'top'
                },
                '& th': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  fontWeight: 600,
                  textAlign: 'left'
                }
              }
            }
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Paper>

      {/* Helper Text */}
      {helperText && (
        <Box
          sx={{
            mt: 0.5,
            px: 1.75,
            fontSize: '0.75rem',
            color: error ? 'error.main' : 'text.secondary'
          }}
        >
          {helperText}
        </Box>
      )}
    </Box>
  );
};

export default RichTextEditor;
