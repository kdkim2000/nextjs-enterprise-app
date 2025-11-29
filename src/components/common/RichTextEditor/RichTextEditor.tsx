/**
 * RichTextEditor Component
 *
 * A feature-rich WYSIWYG editor built with Tiptap for creating and editing
 * formatted content with HTML/Markdown support.
 *
 * Features:
 * - Text formatting (bold, italic, underline, strikethrough)
 * - Headings (h1-h6) with dropdown selector
 * - Lists (bulleted, numbered, task/checkbox)
 * - Text alignment (left, center, right, justify)
 * - Text color and highlight
 * - Blockquotes and code blocks with language selection
 * - Links with dialog UI
 * - Images (URL, file upload, paste, drag & drop)
 * - Tables with full controls
 * - Horizontal rule
 * - Indent/Outdent
 * - Markdown input shortcuts
 * - Floating bubble menu
 * - Character/word count
 * - Undo/Redo
 */

'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
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
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import CharacterCount from '@tiptap/extension-character-count';
import Typography from '@tiptap/extension-typography';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
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
  CircularProgress,
  Select,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Popover,
  Typography as MuiTypography
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
  InsertLink,
  HorizontalRule,
  FormatIndentIncrease,
  FormatIndentDecrease,
  CheckBox,
  TableChart,
  AddBox,
  DeleteOutline,
  FormatColorText,
  Highlight as HighlightIcon,
  LinkOff
} from '@mui/icons-material';
import axiosInstance from '@/lib/axios';

// Create lowlight instance with common languages
const lowlight = createLowlight(common);

// Predefined colors for text and highlight
const TEXT_COLORS = [
  { name: 'Default', value: '' },
  { name: 'Red', value: '#e53935' },
  { name: 'Orange', value: '#fb8c00' },
  { name: 'Yellow', value: '#fdd835' },
  { name: 'Green', value: '#43a047' },
  { name: 'Blue', value: '#1e88e5' },
  { name: 'Purple', value: '#8e24aa' },
  { name: 'Gray', value: '#757575' }
];

const HIGHLIGHT_COLORS = [
  { name: 'None', value: '' },
  { name: 'Yellow', value: '#fff59d' },
  { name: 'Green', value: '#c8e6c9' },
  { name: 'Blue', value: '#bbdefb' },
  { name: 'Pink', value: '#f8bbd9' },
  { name: 'Orange', value: '#ffe0b2' },
  { name: 'Purple', value: '#e1bee7' }
];

const CODE_LANGUAGES = [
  { name: 'Plain Text', value: '' },
  { name: 'JavaScript', value: 'javascript' },
  { name: 'TypeScript', value: 'typescript' },
  { name: 'Python', value: 'python' },
  { name: 'Java', value: 'java' },
  { name: 'C++', value: 'cpp' },
  { name: 'C#', value: 'csharp' },
  { name: 'Go', value: 'go' },
  { name: 'Rust', value: 'rust' },
  { name: 'SQL', value: 'sql' },
  { name: 'HTML', value: 'html' },
  { name: 'CSS', value: 'css' },
  { name: 'JSON', value: 'json' },
  { name: 'YAML', value: 'yaml' },
  { name: 'Bash', value: 'bash' },
  { name: 'Markdown', value: 'markdown' }
];

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number | string;
  maxHeight?: number | string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  /** Character limit (0 = unlimited) */
  characterLimit?: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write something... (Supports Markdown: # ## ### ** * - [ ] > ```)',
  minHeight = 200,
  maxHeight = 600,
  disabled = false,
  error = false,
  helperText,
  characterLimit = 0
}) => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageMenuAnchor, setImageMenuAnchor] = useState<null | HTMLElement>(null);
  const [tableMenuAnchor, setTableMenuAnchor] = useState<null | HTMLElement>(null);
  const [colorMenuAnchor, setColorMenuAnchor] = useState<null | HTMLElement>(null);
  const [highlightMenuAnchor, setHighlightMenuAnchor] = useState<null | HTMLElement>(null);
  const [uploading, setUploading] = useState(false);

  // Link dialog state
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('files', file);
      formData.append('attachmentTypeCode', 'IMAGE_ONLY');
      formData.append('referenceType', 'editor');

      const response = await axiosInstance.post('/attachment/upload', formData);

      if (response.data?.uploadedFiles && response.data.uploadedFiles.length > 0) {
        const uploadedFile = response.data.uploadedFiles[0];
        const fileUrl = `/api/attachment/file/${uploadedFile.id}/view`;
        return fileUrl;
      }
      console.error('Image upload failed:', response.data?.errors || 'Unknown error');
      return null;
    } catch (error: any) {
      console.error('Error uploading image:', error.message);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        codeBlock: false // Use CodeBlockLowlight instead
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' }
      }),
      Image.configure({
        HTMLAttributes: { class: 'editor-image' }
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: { class: 'editor-table' }
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Placeholder.configure({ placeholder }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      CharacterCount.configure({ limit: characterLimit || undefined }),
      Typography,
      CodeBlockLowlight.configure({ lowlight })
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });

  // Link dialog handlers
  const openLinkDialog = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || '';
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      ''
    );
    setLinkUrl(previousUrl);
    setLinkText(selectedText);
    setLinkDialogOpen(true);
  }, [editor]);

  const handleLinkSubmit = useCallback(() => {
    if (!editor) return;

    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setLinkDialogOpen(false);
    setLinkUrl('');
    setLinkText('');
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setLinkDialogOpen(false);
  }, [editor]);

  // Image handlers
  const handleImageMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setImageMenuAnchor(event.currentTarget);
  }, []);

  const handleImageMenuClose = useCallback(() => {
    setImageMenuAnchor(null);
  }, []);

  const addImageByUrl = useCallback(() => {
    if (!editor) return;
    handleImageMenuClose();
    const url = window.prompt('Image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor, handleImageMenuClose]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const url = await uploadImage(file);
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [editor, uploadImage]);

  const triggerFileUpload = useCallback(() => {
    handleImageMenuClose();
    fileInputRef.current?.click();
  }, [handleImageMenuClose]);

  // Paste and Drop handlers
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

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

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

  // Table handlers
  const handleTableMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setTableMenuAnchor(event.currentTarget);
  }, []);

  const handleTableMenuClose = useCallback(() => {
    setTableMenuAnchor(null);
  }, []);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    handleTableMenuClose();
  }, [editor, handleTableMenuClose]);

  // Color handlers
  const handleColorMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setColorMenuAnchor(event.currentTarget);
  }, []);

  const handleColorMenuClose = useCallback(() => {
    setColorMenuAnchor(null);
  }, []);

  const setTextColor = useCallback((color: string) => {
    if (!editor) return;
    if (color) {
      editor.chain().focus().setColor(color).run();
    } else {
      editor.chain().focus().unsetColor().run();
    }
    handleColorMenuClose();
  }, [editor, handleColorMenuClose]);

  // Highlight handlers
  const handleHighlightMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setHighlightMenuAnchor(event.currentTarget);
  }, []);

  const handleHighlightMenuClose = useCallback(() => {
    setHighlightMenuAnchor(null);
  }, []);

  const setHighlightColor = useCallback((color: string) => {
    if (!editor) return;
    if (color) {
      editor.chain().focus().toggleHighlight({ color }).run();
    } else {
      editor.chain().focus().unsetHighlight().run();
    }
    handleHighlightMenuClose();
  }, [editor, handleHighlightMenuClose]);

  if (!editor) {
    return null;
  }

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

  const characterCount = editor.storage.characterCount;

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
            {/* Heading Selector */}
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select
                value={
                  editor.isActive('heading', { level: 1 }) ? '1' :
                  editor.isActive('heading', { level: 2 }) ? '2' :
                  editor.isActive('heading', { level: 3 }) ? '3' :
                  editor.isActive('heading', { level: 4 }) ? '4' :
                  editor.isActive('heading', { level: 5 }) ? '5' :
                  editor.isActive('heading', { level: 6 }) ? '6' : '0'
                }
                onChange={(e) => {
                  const level = parseInt(e.target.value);
                  if (level === 0) {
                    editor.chain().focus().setParagraph().run();
                  } else {
                    editor.chain().focus().toggleHeading({ level: level as 1|2|3|4|5|6 }).run();
                  }
                }}
                sx={{
                  height: 32,
                  '& .MuiSelect-select': { py: 0.5, fontSize: '0.8rem' }
                }}
              >
                <MenuItem value="0">Normal</MenuItem>
                <MenuItem value="1">Heading 1</MenuItem>
                <MenuItem value="2">Heading 2</MenuItem>
                <MenuItem value="3">Heading 3</MenuItem>
                <MenuItem value="4">Heading 4</MenuItem>
                <MenuItem value="5">Heading 5</MenuItem>
                <MenuItem value="6">Heading 6</MenuItem>
              </Select>
            </FormControl>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* Text Formatting */}
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

            {/* Text Color */}
            <MenuButton
              onClick={(e) => e && handleColorMenuOpen(e)}
              icon={<FormatColorText fontSize="small" />}
              tooltip="Text Color"
            />
            <MenuButton
              onClick={(e) => e && handleHighlightMenuOpen(e)}
              icon={<HighlightIcon fontSize="small" />}
              tooltip="Highlight"
            />

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* Lists */}
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
            <MenuButton
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              isActive={editor.isActive('taskList')}
              icon={<CheckBox fontSize="small" />}
              tooltip="Task List (Checkbox)"
            />

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* Indent */}
            <MenuButton
              onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
              disabled={!editor.can().sinkListItem('listItem')}
              icon={<FormatIndentIncrease fontSize="small" />}
              tooltip="Indent"
            />
            <MenuButton
              onClick={() => editor.chain().focus().liftListItem('listItem').run()}
              disabled={!editor.can().liftListItem('listItem')}
              icon={<FormatIndentDecrease fontSize="small" />}
              tooltip="Outdent"
            />

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* Text Alignment */}
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

            {/* Blockquote & Code */}
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
            <MenuButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              icon={<HorizontalRule fontSize="small" />}
              tooltip="Horizontal Rule"
            />

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* Table */}
            <MenuButton
              onClick={(e) => e && handleTableMenuOpen(e)}
              isActive={editor.isActive('table')}
              icon={<TableChart fontSize="small" />}
              tooltip="Table"
            />

            {/* Links & Images */}
            <MenuButton
              onClick={openLinkDialog}
              isActive={editor.isActive('link')}
              icon={<LinkIcon fontSize="small" />}
              tooltip="Insert Link (Ctrl+K)"
            />
            <MenuButton
              onClick={(e) => e && handleImageMenuOpen(e)}
              icon={uploading ? <CircularProgress size={18} /> : <ImageIcon fontSize="small" />}
              tooltip="Insert Image"
              disabled={uploading}
            />

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* History */}
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

            {/* Clear Formatting */}
            <MenuButton
              onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
              icon={<FormatClear fontSize="small" />}
              tooltip="Clear Formatting"
            />
          </Stack>
        </Box>

        {/* Bubble Menu (Floating toolbar on selection) */}
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
        >
          <Paper
            elevation={8}
            sx={{
              display: 'flex',
              gap: 0.25,
              p: 0.5,
              borderRadius: 1,
              backgroundColor: 'background.paper'
            }}
          >
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleBold().run()}
              sx={{ color: editor.isActive('bold') ? 'primary.main' : 'text.secondary' }}
            >
              <FormatBold fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              sx={{ color: editor.isActive('italic') ? 'primary.main' : 'text.secondary' }}
            >
              <FormatItalic fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              sx={{ color: editor.isActive('underline') ? 'primary.main' : 'text.secondary' }}
            >
              <FormatUnderlined fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              sx={{ color: editor.isActive('strike') ? 'primary.main' : 'text.secondary' }}
            >
              <FormatStrikethrough fontSize="small" />
            </IconButton>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />
            <IconButton
              size="small"
              onClick={openLinkDialog}
              sx={{ color: editor.isActive('link') ? 'primary.main' : 'text.secondary' }}
            >
              <LinkIcon fontSize="small" />
            </IconButton>
            {editor.isActive('link') && (
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().unsetLink().run()}
                sx={{ color: 'error.main' }}
              >
                <LinkOff fontSize="small" />
              </IconButton>
            )}
          </Paper>
        </BubbleMenu>

        {/* Image Menu */}
        <Menu
          anchorEl={imageMenuAnchor}
          open={Boolean(imageMenuAnchor)}
          onClose={handleImageMenuClose}
        >
          <MenuItem onClick={triggerFileUpload}>
            <ListItemIcon><CloudUpload fontSize="small" /></ListItemIcon>
            <ListItemText>Upload Image</ListItemText>
          </MenuItem>
          <MenuItem onClick={addImageByUrl}>
            <ListItemIcon><InsertLink fontSize="small" /></ListItemIcon>
            <ListItemText>Insert from URL</ListItemText>
          </MenuItem>
        </Menu>

        {/* Table Menu */}
        <Menu
          anchorEl={tableMenuAnchor}
          open={Boolean(tableMenuAnchor)}
          onClose={handleTableMenuClose}
        >
          <MenuItem onClick={insertTable}>
            <ListItemIcon><AddBox fontSize="small" /></ListItemIcon>
            <ListItemText>Insert Table (3x3)</ListItemText>
          </MenuItem>
          {editor.isActive('table') && (
            <>
              <Divider />
              <MenuItem onClick={() => { editor.chain().focus().addColumnAfter().run(); handleTableMenuClose(); }}>
                <ListItemText>Add Column After</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { editor.chain().focus().addColumnBefore().run(); handleTableMenuClose(); }}>
                <ListItemText>Add Column Before</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { editor.chain().focus().deleteColumn().run(); handleTableMenuClose(); }}>
                <ListItemIcon><DeleteOutline fontSize="small" /></ListItemIcon>
                <ListItemText>Delete Column</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { editor.chain().focus().addRowAfter().run(); handleTableMenuClose(); }}>
                <ListItemText>Add Row After</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { editor.chain().focus().addRowBefore().run(); handleTableMenuClose(); }}>
                <ListItemText>Add Row Before</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { editor.chain().focus().deleteRow().run(); handleTableMenuClose(); }}>
                <ListItemIcon><DeleteOutline fontSize="small" /></ListItemIcon>
                <ListItemText>Delete Row</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { editor.chain().focus().toggleHeaderRow().run(); handleTableMenuClose(); }}>
                <ListItemText>Toggle Header Row</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { editor.chain().focus().mergeCells().run(); handleTableMenuClose(); }}>
                <ListItemText>Merge Cells</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { editor.chain().focus().splitCell().run(); handleTableMenuClose(); }}>
                <ListItemText>Split Cell</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { editor.chain().focus().deleteTable().run(); handleTableMenuClose(); }}>
                <ListItemIcon><DeleteOutline fontSize="small" color="error" /></ListItemIcon>
                <ListItemText sx={{ color: 'error.main' }}>Delete Table</ListItemText>
              </MenuItem>
            </>
          )}
        </Menu>

        {/* Color Menu */}
        <Popover
          open={Boolean(colorMenuAnchor)}
          anchorEl={colorMenuAnchor}
          onClose={handleColorMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Box sx={{ p: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 160 }}>
            {TEXT_COLORS.map((color) => (
              <Tooltip key={color.name} title={color.name}>
                <IconButton
                  size="small"
                  onClick={() => setTextColor(color.value)}
                  sx={{
                    width: 28,
                    height: 28,
                    backgroundColor: color.value || 'transparent',
                    border: '1px solid',
                    borderColor: color.value ? color.value : 'divider',
                    '&:hover': {
                      backgroundColor: color.value ? alpha(color.value, 0.8) : 'action.hover'
                    }
                  }}
                >
                  {!color.value && <FormatClear sx={{ fontSize: 14 }} />}
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        </Popover>

        {/* Highlight Menu */}
        <Popover
          open={Boolean(highlightMenuAnchor)}
          anchorEl={highlightMenuAnchor}
          onClose={handleHighlightMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Box sx={{ p: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 160 }}>
            {HIGHLIGHT_COLORS.map((color) => (
              <Tooltip key={color.name} title={color.name}>
                <IconButton
                  size="small"
                  onClick={() => setHighlightColor(color.value)}
                  sx={{
                    width: 28,
                    height: 28,
                    backgroundColor: color.value || 'transparent',
                    border: '1px solid',
                    borderColor: color.value ? color.value : 'divider',
                    '&:hover': {
                      backgroundColor: color.value ? alpha(color.value, 0.8) : 'action.hover'
                    }
                  }}
                >
                  {!color.value && <FormatClear sx={{ fontSize: 14 }} />}
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        </Popover>

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
              '& h1': { fontSize: '2rem', fontWeight: 600, mt: 2, mb: 1 },
              '& h2': { fontSize: '1.5rem', fontWeight: 600, mt: 1.5, mb: 1 },
              '& h3': { fontSize: '1.25rem', fontWeight: 600, mt: 1, mb: 0.5 },
              '& h4': { fontSize: '1.125rem', fontWeight: 600, mt: 0.75, mb: 0.5 },
              '& h5, & h6': { fontSize: '1rem', fontWeight: 600, mt: 0.5, mb: 0.5 },
              '& p': { mt: 0.5, mb: 0.5 },
              '& ul, & ol': { pl: 3, mt: 0.5, mb: 0.5 },
              '& ul[data-type="taskList"]': {
                listStyle: 'none',
                pl: 0,
                '& li': {
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  '& > label': {
                    flexShrink: 0,
                    mt: 0.25,
                    '& input[type="checkbox"]': {
                      width: 16,
                      height: 16,
                      cursor: 'pointer'
                    }
                  },
                  '& > div': { flex: 1 }
                }
              },
              '& blockquote': {
                borderLeft: `3px solid ${theme.palette.primary.main}`,
                pl: 2,
                ml: 0,
                mr: 0,
                fontStyle: 'italic',
                color: 'text.secondary'
              },
              '& pre': {
                backgroundColor: alpha(theme.palette.grey[900], 0.9),
                borderRadius: 1,
                p: 2,
                overflowX: 'auto',
                color: '#e0e0e0',
                fontFamily: '"Fira Code", "Consolas", monospace',
                fontSize: '0.875rem',
                '& code': {
                  backgroundColor: 'transparent',
                  padding: 0,
                  color: 'inherit'
                },
                // Syntax highlighting
                '& .hljs-keyword': { color: '#c792ea' },
                '& .hljs-string': { color: '#c3e88d' },
                '& .hljs-number': { color: '#f78c6c' },
                '& .hljs-function': { color: '#82aaff' },
                '& .hljs-comment': { color: '#676e95' },
                '& .hljs-variable': { color: '#f07178' },
                '& .hljs-attr': { color: '#ffcb6b' },
                '& .hljs-tag': { color: '#f07178' },
                '& .hljs-name': { color: '#f07178' },
                '& .hljs-selector-class': { color: '#ffcb6b' },
                '& .hljs-selector-id': { color: '#ffcb6b' },
                '& .hljs-built_in': { color: '#82aaff' },
                '& .hljs-type': { color: '#ffcb6b' },
                '& .hljs-params': { color: '#89ddff' },
                '& .hljs-literal': { color: '#f78c6c' },
                '& .hljs-meta': { color: '#89ddff' },
                '& .hljs-title': { color: '#82aaff' }
              },
              '& code': {
                backgroundColor: alpha(theme.palette.grey[500], 0.15),
                borderRadius: 0.5,
                px: 0.5,
                py: 0.25,
                fontFamily: 'monospace',
                fontSize: '0.875em'
              },
              '& .editor-image': {
                maxWidth: '100%',
                height: 'auto',
                borderRadius: 1,
                my: 1
              },
              '& a': {
                color: 'primary.main',
                textDecoration: 'underline',
                '&:hover': { textDecoration: 'none' }
              },
              '& hr': {
                border: 'none',
                borderTop: `2px solid ${theme.palette.divider}`,
                my: 2
              },
              '& .editor-table': {
                borderCollapse: 'collapse',
                my: 1.5,
                width: '100%',
                border: `1px solid ${theme.palette.divider}`,
                '& td, & th': {
                  border: `1px solid ${theme.palette.divider}`,
                  p: 1,
                  minWidth: 100,
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

        {/* Status Bar */}
        <Box
          sx={{
            px: 2,
            py: 0.75,
            backgroundColor: 'background.default',
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <MuiTypography variant="caption" color="text.secondary">
            Markdown shortcuts: # Heading, **bold**, *italic*, - list, [ ] task, {`>`} quote, ``` code
          </MuiTypography>
          <MuiTypography variant="caption" color="text.secondary">
            {characterCount.characters()} chars / {characterCount.words()} words
            {characterLimit > 0 && ` (max: ${characterLimit})`}
          </MuiTypography>
        </Box>
      </Paper>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Insert Link</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              fullWidth
              autoFocus
            />
            <MuiTypography variant="caption" color="text.secondary">
              Selected text: {linkText || '(no text selected)'}
            </MuiTypography>
          </Stack>
        </DialogContent>
        <DialogActions>
          {editor.isActive('link') && (
            <Button onClick={removeLink} color="error">
              Remove Link
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          <Button onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleLinkSubmit} variant="contained">
            {editor.isActive('link') ? 'Update' : 'Insert'}
          </Button>
        </DialogActions>
      </Dialog>

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
