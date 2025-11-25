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
 * - Links and images (URL, file upload, paste, drag & drop)
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

import React, { useCallback, useRef, useState } from 'react';
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
  alpha,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
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
  FormatClear,
  CloudUpload,
  InsertLink
} from '@mui/icons-material';
import axiosInstance from '@/lib/axios';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageMenuAnchor, setImageMenuAnchor] = useState<null | HTMLElement>(null);
  const [uploading, setUploading] = useState(false);

  /**
   * Upload image file to server and return URL
   */
  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      // Use axios directly - it auto-sets Content-Type with boundary for FormData
      const response = await axiosInstance.post('/file/upload', formData);

      // Debug: log full response to understand structure
      console.log('[RichTextEditor] Upload response:', JSON.stringify(response.data, null, 2));

      // Response structure: { success, data: { message, file: { url, path, ... } } }
      if (response.data?.success && response.data?.data?.file) {
        const fileData = response.data.data.file;
        if (fileData?.url) {
          return fileData.url;
        } else if (fileData?.path) {
          // Fallback to path if url is not available
          return fileData.path;
        }
      }
      console.error('Image upload failed:', response.data?.error || 'Unknown error');
      return null;
    } catch (error: any) {
      console.error('Error uploading image:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code,
        stack: error.stack
      });
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

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
      console.log('[RichTextEditor] Generated HTML:', html.substring(0, 200) + (html.length > 200 ? '...' : ''));
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
   * Handle image menu open
   */
  const handleImageMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setImageMenuAnchor(event.currentTarget);
  }, []);

  /**
   * Handle image menu close
   */
  const handleImageMenuClose = useCallback(() => {
    setImageMenuAnchor(null);
  }, []);

  /**
   * Handle image insertion via URL
   */
  const addImageByUrl = useCallback(() => {
    if (!editor) return;
    handleImageMenuClose();

    const url = window.prompt('Image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor, handleImageMenuClose]);

  /**
   * Handle image file selection
   */
  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const url = await uploadImage(file);
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }

    // Clear input for re-selection
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [editor, uploadImage]);

  /**
   * Trigger file input click
   */
  const triggerFileUpload = useCallback(() => {
    handleImageMenuClose();
    fileInputRef.current?.click();
  }, [handleImageMenuClose]);

  /**
   * Handle paste event for images
   */
  const handlePaste = useCallback(async (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items || !editor) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        event.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const url = await uploadImage(file);
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }
        return;
      }
    }
  }, [editor, uploadImage]);

  /**
   * Handle drag over event
   */
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  /**
   * Handle drop event for images
   */
  const handleDrop = useCallback(async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0 || !editor) return;

    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        const url = await uploadImage(file);
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      }
    }
  }, [editor, uploadImage]);

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
    onClick: (event?: React.MouseEvent<HTMLElement>) => void;
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
              onClick={(e) => e && handleImageMenuOpen(e)}
              icon={uploading ? <CircularProgress size={18} /> : <ImageIcon fontSize="small" />}
              tooltip="Insert Image"
              disabled={uploading}
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

        {/* Image Menu */}
        <Menu
          anchorEl={imageMenuAnchor}
          open={Boolean(imageMenuAnchor)}
          onClose={handleImageMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <MenuItem onClick={triggerFileUpload}>
            <ListItemIcon>
              <CloudUpload fontSize="small" />
            </ListItemIcon>
            <ListItemText>Upload Image</ListItemText>
          </MenuItem>
          <MenuItem onClick={addImageByUrl}>
            <ListItemIcon>
              <InsertLink fontSize="small" />
            </ListItemIcon>
            <ListItemText>Insert from URL</ListItemText>
          </MenuItem>
        </Menu>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        {/* Editor Content */}
        <Box
          onPaste={handlePaste}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          sx={{
            p: 2,
            minHeight,
            maxHeight,
            overflowY: 'auto',
            position: 'relative',
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

          {/* Upload overlay */}
          {uploading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                zIndex: 10
              }}
            >
              <Stack alignItems="center" spacing={1}>
                <CircularProgress size={32} />
                <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                  Uploading image...
                </Box>
              </Stack>
            </Box>
          )}
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
