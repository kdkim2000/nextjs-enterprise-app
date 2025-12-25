'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogContent,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Check as ConfirmIcon,
  Refresh as ClearIcon,
  Undo as UndoIcon,
} from '@mui/icons-material';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export interface SignaturePadProps {
  open: boolean;
  onClose: () => void;
  onSave: (signatureData: string) => void;
  locale?: string;
  lineColor?: string;
  lineWidth?: number;
}

interface Point {
  x: number;
  y: number;
}

export default function SignaturePad({
  open,
  onClose,
  onSave,
  locale = 'ko',
  lineColor = '#000000',
  lineWidth = 3,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const lastPointRef = useRef<Point | null>(null);

  // Initialize canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineWidth;

      // Fill white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, rect.width, rect.height);
    }

    setHasSignature(false);
    setHistory([]);
  }, [lineColor, lineWidth]);

  // Get touch/mouse position
  const getPosition = useCallback((e: React.TouchEvent | React.MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  // Save current state to history
  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-10), imageData]); // Keep last 10 states
  }, []);

  // Start drawing
  const handleStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    saveToHistory();
    setIsDrawing(true);
    lastPointRef.current = getPosition(e);
  }, [getPosition, saveToHistory]);

  // Draw
  const handleMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !lastPointRef.current) return;

    const currentPoint = getPosition(e);

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();

    lastPointRef.current = currentPoint;
    setHasSignature(true);
  }, [isDrawing, getPosition]);

  // Stop drawing
  const handleEnd = useCallback(() => {
    setIsDrawing(false);
    lastPointRef.current = null;
  }, []);

  // Clear signature
  const handleClear = useCallback(() => {
    initCanvas();
  }, [initCanvas]);

  // Undo last stroke
  const handleUndo = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || history.length === 0) return;

    const lastState = history[history.length - 1];
    ctx.putImageData(lastState, 0, 0);
    setHistory((prev) => prev.slice(0, -1));

    // Check if canvas is empty (all white)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const isEmpty = imageData.data.every((val, i) => i % 4 === 3 || val === 255);
    setHasSignature(!isEmpty);
  }, [history]);

  // Save signature
  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    const signatureData = canvas.toDataURL('image/png');
    onSave(signatureData);
    onClose();
  }, [hasSignature, onSave, onClose]);

  // Handle close
  const handleClose = useCallback(() => {
    setHasSignature(false);
    setHistory([]);
    onClose();
  }, [onClose]);

  // Initialize on open
  useEffect(() => {
    if (open) {
      // Delay to ensure container is rendered
      setTimeout(initCanvas, 100);
    }
  }, [open, initCanvas]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (open) {
        initCanvas();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [open, initCanvas]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
        },
      }}
    >
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            pt: 'calc(env(safe-area-inset-top) + 16px)',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6">
            {getLocalizedValue({ en: 'Sign Here', ko: '서명', zh: '签名', vi: 'Ký tên' }, locale)}
          </Typography>
          <Box sx={{ width: 40 }} />
        </Box>

        {/* Instructions */}
        <Box sx={{ px: 2, py: 1, bgcolor: 'grey.50' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            {getLocalizedValue(
              {
                en: 'Use your finger or stylus to sign in the box below',
                ko: '아래 박스에 손가락이나 펜으로 서명하세요',
                zh: '在下面的框中用手指或触控笔签名',
                vi: 'Sử dụng ngón tay hoặc bút cảm ứng để ký trong ô bên dưới',
              },
              locale
            )}
          </Typography>
        </Box>

        {/* Canvas Container */}
        <Box
          ref={containerRef}
          sx={{
            flex: 1,
            m: 2,
            border: 2,
            borderColor: 'grey.300',
            borderRadius: 2,
            overflow: 'hidden',
            touchAction: 'none',
            bgcolor: 'white',
          }}
        >
          <canvas
            ref={canvasRef}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            style={{
              display: 'block',
              cursor: 'crosshair',
            }}
          />
        </Box>

        {/* Controls */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            p: 2,
            pb: 'calc(env(safe-area-inset-bottom) + 16px)',
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Button
            variant="outlined"
            startIcon={<UndoIcon />}
            onClick={handleUndo}
            disabled={history.length === 0}
          >
            {getLocalizedValue({ en: 'Undo', ko: '실행취소', zh: '撤销', vi: 'Hoàn tác' }, locale)}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<ClearIcon />}
            onClick={handleClear}
            disabled={!hasSignature}
          >
            {getLocalizedValue({ en: 'Clear', ko: '지우기', zh: '清除', vi: 'Xóa' }, locale)}
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<ConfirmIcon />}
            onClick={handleSave}
            disabled={!hasSignature}
          >
            {getLocalizedValue({ en: 'Confirm', ko: '확인', zh: '确认', vi: 'Xác nhận' }, locale)}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
