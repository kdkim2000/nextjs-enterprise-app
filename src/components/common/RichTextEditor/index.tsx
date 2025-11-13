'use client';

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import {
  Box,
  Paper,
  IconButton,
  Divider,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Select,
  MenuItem,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatStrikethrough,
  FormatListBulleted,
  FormatListNumbered,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  TableChart as TableIcon,
  Undo,
  Redo,
  FormatQuote,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  HorizontalRule as HRIcon,
  Add as AddIcon,
  Remove as RemoveIcon
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
  const [headingLevel, setHeadingLevel] = useState<number>(0);
  const [tableMenuAnchor, setTableMenuAnchor] = useState<HTMLElement | null>(null);
  const [linkDialog, setLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageDialog, setImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
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

  useEffect(() => {
    if (editor) {
      // Update heading level
      for (let level = 1; level <= 6; level++) {
        if (editor.isActive('heading', { level })) {
          setHeadingLevel(level);
          return;
        }
      }
      setHeadingLevel(0);
    }
  }, [editor?.state]);

  if (!editor) {
    return null;
  }

  const handleHeadingChange = (level: number) => {
    if (level === 0) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run();
    }
    setHeadingLevel(level);
  };

  const handleAddLink = () => {
    setLinkUrl('');
    setLinkDialog(true);
  };

  const handleLinkSubmit = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    }
    setLinkDialog(false);
    setLinkUrl('');
  };

  const handleRemoveLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const handleAddImage = () => {
    setImageUrl('');
    setImageDialog(true);
  };

  const handleImageSubmit = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
    }
    setImageDialog(false);
    setImageUrl('');
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    setTableMenuAnchor(null);
  };

  return (
    <Paper elevation={2} sx={{ height, display: 'flex', flexDirection: 'column' }}>
      {isEditorMode && (
        <>
          <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider', overflowX: 'auto' }}>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} alignItems="center">
              {/* Heading Selector */}
              <Select
                size="small"
                value={headingLevel}
                onChange={(e) => handleHeadingChange(Number(e.target.value))}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value={0}>Paragraph</MenuItem>
                <MenuItem value={1}>Heading 1</MenuItem>
                <MenuItem value={2}>Heading 2</MenuItem>
                <MenuItem value={3}>Heading 3</MenuItem>
                <MenuItem value={4}>Heading 4</MenuItem>
                <MenuItem value={5}>Heading 5</MenuItem>
                <MenuItem value={6}>Heading 6</MenuItem>
              </Select>

              <Divider orientation="vertical" flexItem />

              {/* Text Formatting */}
              <ToggleButtonGroup size="small" value="">
                <ToggleButton
                  value="bold"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  selected={editor.isActive('bold')}
                >
                  <Tooltip title="Bold (Ctrl+B)">
                    <FormatBold fontSize="small" />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton
                  value="italic"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  selected={editor.isActive('italic')}
                >
                  <Tooltip title="Italic (Ctrl+I)">
                    <FormatItalic fontSize="small" />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton
                  value="underline"
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  selected={editor.isActive('underline')}
                >
                  <Tooltip title="Underline (Ctrl+U)">
                    <FormatUnderlined fontSize="small" />
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
                  <Tooltip title="Inline Code">
                    <Code fontSize="small" />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>

              <Divider orientation="vertical" flexItem />

              {/* Text Alignment */}
              <ToggleButtonGroup size="small" value="">
                <ToggleButton
                  value="left"
                  onClick={() => editor.chain().focus().setTextAlign('left').run()}
                  selected={editor.isActive({ textAlign: 'left' })}
                >
                  <Tooltip title="Align Left">
                    <FormatAlignLeft fontSize="small" />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton
                  value="center"
                  onClick={() => editor.chain().focus().setTextAlign('center').run()}
                  selected={editor.isActive({ textAlign: 'center' })}
                >
                  <Tooltip title="Align Center">
                    <FormatAlignCenter fontSize="small" />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton
                  value="right"
                  onClick={() => editor.chain().focus().setTextAlign('right').run()}
                  selected={editor.isActive({ textAlign: 'right' })}
                >
                  <Tooltip title="Align Right">
                    <FormatAlignRight fontSize="small" />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton
                  value="justify"
                  onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                  selected={editor.isActive({ textAlign: 'justify' })}
                >
                  <Tooltip title="Justify">
                    <FormatAlignJustify fontSize="small" />
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
                  <Tooltip title="Numbered List">
                    <FormatListNumbered fontSize="small" />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton
                  value="blockquote"
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  selected={editor.isActive('blockquote')}
                >
                  <Tooltip title="Blockquote">
                    <FormatQuote fontSize="small" />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>

              <Divider orientation="vertical" flexItem />

              {/* Insert */}
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Add Link">
                  <IconButton size="small" onClick={handleAddLink}>
                    <LinkIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Add Image">
                  <IconButton size="small" onClick={handleAddImage}>
                    <ImageIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Insert Table">
                  <IconButton size="small" onClick={(e) => setTableMenuAnchor(e.currentTarget)}>
                    <TableIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Code Block">
                  <IconButton
                    size="small"
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  >
                    <Code fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Horizontal Rule">
                  <IconButton
                    size="small"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                  >
                    <HRIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>

              <Divider orientation="vertical" flexItem />

              {/* Undo/Redo */}
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Undo (Ctrl+Z)">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => editor.chain().focus().undo().run()}
                      disabled={!editor.can().undo()}
                    >
                      <Undo fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Redo (Ctrl+Y)">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => editor.chain().focus().redo().run()}
                      disabled={!editor.can().redo()}
                    >
                      <Redo fontSize="small" />
                    </IconButton>
                  </span>
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

      {/* Table Menu */}
      <Menu
        open={Boolean(tableMenuAnchor)}
        anchorEl={tableMenuAnchor}
        onClose={() => setTableMenuAnchor(null)}
      >
        <MenuItem onClick={insertTable}>
          <TableIcon fontSize="small" sx={{ mr: 1 }} />
          Insert Table
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { editor.chain().focus().addRowBefore().run(); setTableMenuAnchor(null); }}>
          <AddIcon fontSize="small" sx={{ mr: 1 }} />
          Add Row Above
        </MenuItem>
        <MenuItem onClick={() => { editor.chain().focus().addRowAfter().run(); setTableMenuAnchor(null); }}>
          <AddIcon fontSize="small" sx={{ mr: 1 }} />
          Add Row Below
        </MenuItem>
        <MenuItem onClick={() => { editor.chain().focus().deleteRow().run(); setTableMenuAnchor(null); }}>
          <RemoveIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Row
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { editor.chain().focus().addColumnBefore().run(); setTableMenuAnchor(null); }}>
          <AddIcon fontSize="small" sx={{ mr: 1 }} />
          Add Column Before
        </MenuItem>
        <MenuItem onClick={() => { editor.chain().focus().addColumnAfter().run(); setTableMenuAnchor(null); }}>
          <AddIcon fontSize="small" sx={{ mr: 1 }} />
          Add Column After
        </MenuItem>
        <MenuItem onClick={() => { editor.chain().focus().deleteColumn().run(); setTableMenuAnchor(null); }}>
          <RemoveIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Column
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { editor.chain().focus().deleteTable().run(); setTableMenuAnchor(null); }}>
          <RemoveIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Table
        </MenuItem>
      </Menu>

      {/* Link Dialog */}
      <Dialog open={linkDialog} onClose={() => setLinkDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Insert Link</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="URL"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          {editor.isActive('link') && (
            <Button onClick={handleRemoveLink} color="error">
              Remove Link
            </Button>
          )}
          <Button onClick={() => setLinkDialog(false)}>Cancel</Button>
          <Button onClick={handleLinkSubmit} variant="contained">
            Insert
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={imageDialog} onClose={() => setImageDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Insert Image</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialog(false)}>Cancel</Button>
          <Button onClick={handleImageSubmit} variant="contained">
            Insert
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
