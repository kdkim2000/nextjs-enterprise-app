'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import {
  Box,
  Paper,
  IconButton,
  Divider,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatStrikethrough,
  FormatListBulleted,
  FormatListNumbered,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  TableChart as TableIcon,
  Undo,
  Redo,
  FormatQuote
} from '@mui/icons-material';
import DOMPurify from 'isomorphic-dompurify';

interface RichTextEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  mode?: 'editor' | 'viewer';
  placeholder?: string;
  height?: number | string;
  editable?: boolean;
}

export default function RichTextEditor({
  content = '',
  onChange,
  mode = 'editor',
  placeholder = 'Start typing...',
  height = 400,
  editable = true
}: RichTextEditorProps) {
  const isEditorMode = mode === 'editor' && editable;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: !isEditorMode,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      Image.configure({
        HTMLAttributes: {
          style: 'max-width: 100%; height: auto;'
        }
      }),
      Table.configure({
        resizable: true
      }),
      TableRow,
      TableHeader,
      TableCell
    ],
    content: content ? DOMPurify.sanitize(content) : '',
    editable: isEditorMode,
    onUpdate: ({ editor }) => {
      if (onChange && isEditorMode) {
        const html = editor.getHTML();
        onChange(DOMPurify.sanitize(html));
      }
    }
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(DOMPurify.sanitize(content || ''));
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditorMode);
    }
  }, [isEditorMode, editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <Paper elevation={2} sx={{ height, display: 'flex', flexDirection: 'column' }}>
      {isEditorMode && (
        <>
          <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
              {/* Text Formatting */}
              <ToggleButtonGroup size="small" value="">
                <ToggleButton
                  value="bold"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  selected={editor.isActive('bold')}
                >
                  <Tooltip title="Bold">
                    <FormatBold fontSize="small" />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton
                  value="italic"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  selected={editor.isActive('italic')}
                >
                  <Tooltip title="Italic">
                    <FormatItalic fontSize="small" />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton
                  value="strike"
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  selected={editor.isActive('strike')}
                >
                  <Tooltip title="Strikethrough">
                    <FormatStrikethrough fontSize="small" />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton
                  value="code"
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  selected={editor.isActive('code')}
                >
                  <Tooltip title="Code">
                    <Code fontSize="small" />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>

              <Divider orientation="vertical" flexItem />

              {/* Lists */}
              <ToggleButtonGroup size="small" value="">
                <ToggleButton
                  value="bulletList"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  selected={editor.isActive('bulletList')}
                >
                  <Tooltip title="Bullet List">
                    <FormatListBulleted fontSize="small" />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton
                  value="orderedList"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  selected={editor.isActive('orderedList')}
                >
                  <Tooltip title="Ordered List">
                    <FormatListNumbered fontSize="small" />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton
                  value="blockquote"
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  selected={editor.isActive('blockquote')}
                >
                  <Tooltip title="Quote">
                    <FormatQuote fontSize="small" />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>

              <Divider orientation="vertical" flexItem />

              {/* Insert */}
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Add Link">
                  <IconButton size="small" onClick={addLink}>
                    <LinkIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Add Image">
                  <IconButton size="small" onClick={addImage}>
                    <ImageIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Insert Table">
                  <IconButton size="small" onClick={insertTable}>
                    <TableIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>

              <Divider orientation="vertical" flexItem />

              {/* Undo/Redo */}
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Undo">
                  <IconButton
                    size="small"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                  >
                    <Undo fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Redo">
                  <IconButton
                    size="small"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                  >
                    <Redo fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Box>
        </>
      )}

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          '& .ProseMirror': {
            outline: 'none',
            minHeight: '100%',
            '& p.is-editor-empty:first-child::before': {
              content: `"${placeholder}"`,
              color: '#adb5bd',
              pointerEvents: 'none',
              height: 0,
              float: 'left'
            },
            '& p': {
              margin: '0.5em 0'
            },
            '& ul, & ol': {
              padding: '0 1rem',
              margin: '0.5em 0'
            },
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              margin: '1em 0 0.5em',
              fontWeight: 600
            },
            '& code': {
              backgroundColor: '#f5f5f5',
              padding: '0.2em 0.4em',
              borderRadius: '3px',
              fontSize: '0.9em'
            },
            '& pre': {
              backgroundColor: '#f5f5f5',
              padding: '1em',
              borderRadius: '5px',
              overflow: 'auto',
              '& code': {
                backgroundColor: 'transparent',
                padding: 0
              }
            },
            '& blockquote': {
              borderLeft: '3px solid #ccc',
              paddingLeft: '1em',
              margin: '1em 0',
              color: '#666'
            },
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '5px',
              margin: '0.5em 0'
            },
            '& table': {
              borderCollapse: 'collapse',
              margin: '1em 0',
              width: '100%',
              overflow: 'hidden',
              tableLayout: 'fixed',
              '& td, & th': {
                border: '1px solid #ddd',
                padding: '8px',
                position: 'relative',
                minWidth: '100px',
                verticalAlign: 'top'
              },
              '& th': {
                backgroundColor: '#f5f5f5',
                fontWeight: 600,
                textAlign: 'left'
              },
              '& .selectedCell': {
                backgroundColor: '#e3f2fd'
              }
            },
            '& a': {
              color: '#1976d2',
              textDecoration: 'underline',
              cursor: 'pointer'
            }
          }
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Paper>
  );
}
