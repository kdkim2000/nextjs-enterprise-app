'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogContent,
  CircularProgress,
} from '@mui/material';
import {
  PhotoCamera as CameraIcon,
  Cameraswitch as SwitchCameraIcon,
  Close as CloseIcon,
  FlashOn as FlashOnIcon,
  FlashOff as FlashOffIcon,
  Check as ConfirmIcon,
  Refresh as RetakeIcon,
} from '@mui/icons-material';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export interface PhotoCaptureProps {
  open: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
  locale?: string;
}

export default function PhotoCapture({
  open,
  onClose,
  onCapture,
  locale = 'ko',
}: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Start camera
  const startCamera = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Check flash support
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.() as any;
      if (capabilities?.torch) {
        // Flash is supported
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to start camera:', err);
      setError(
        getLocalizedValue(
          {
            en: 'Failed to access camera. Please check permissions.',
            ko: '카메라 접근에 실패했습니다. 권한을 확인해주세요.',
            zh: '无法访问相机。请检查权限。',
            vi: 'Không thể truy cập camera. Vui lòng kiểm tra quyền.',
          },
          locale
        )
      );
      setLoading(false);
    }
  }, [facingMode, locale]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  }, []);

  // Toggle flash
  const toggleFlash = useCallback(async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      try {
        await track.applyConstraints({
          advanced: [{ torch: !flashEnabled } as any],
        });
        setFlashEnabled(!flashEnabled);
      } catch (err) {
        console.error('Flash not supported:', err);
      }
    }
  }, [flashEnabled]);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror for front camera
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0);

        const imageData = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(imageData);
      }
    }
  }, [facingMode]);

  // Confirm photo
  const confirmPhoto = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  }, [capturedImage, onCapture, onClose]);

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
  }, []);

  // Handle close
  const handleClose = useCallback(() => {
    stopCamera();
    setCapturedImage(null);
    onClose();
  }, [stopCamera, onClose]);

  // Start camera when dialog opens
  useEffect(() => {
    if (open && !capturedImage) {
      startCamera();
    }
    return () => {
      if (!open) {
        stopCamera();
      }
    };
  }, [open, capturedImage, startCamera, stopCamera]);

  // Restart camera when facing mode changes
  useEffect(() => {
    if (open && !capturedImage) {
      startCamera();
    }
  }, [facingMode]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen
      PaperProps={{
        sx: {
          bgcolor: 'black',
        },
      }}
    >
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            pt: 'calc(env(safe-area-inset-top) + 16px)',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)',
          }}
        >
          <IconButton onClick={handleClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" sx={{ color: 'white' }}>
            {getLocalizedValue({ en: 'Take Photo', ko: '사진 촬영', zh: '拍照', vi: 'Chụp ảnh' }, locale)}
          </Typography>
          <Box sx={{ width: 40 }} />
        </Box>

        {/* Camera View / Captured Image */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {loading && (
            <CircularProgress sx={{ color: 'white' }} />
          )}

          {error && (
            <Typography color="error" align="center" sx={{ px: 2 }}>
              {error}
            </Typography>
          )}

          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                display: loading || error ? 'none' : 'block',
              }}
            />
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </Box>

        {/* Controls */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4,
            p: 3,
            pb: 'calc(env(safe-area-inset-bottom) + 24px)',
            background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
          }}
        >
          {capturedImage ? (
            <>
              <Button
                variant="outlined"
                size="large"
                startIcon={<RetakeIcon />}
                onClick={retakePhoto}
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  px: 3,
                  py: 1.5,
                }}
              >
                {getLocalizedValue({ en: 'Retake', ko: '다시 촬영', zh: '重拍', vi: 'Chụp lại' }, locale)}
              </Button>
              <Button
                variant="contained"
                size="large"
                color="success"
                startIcon={<ConfirmIcon />}
                onClick={confirmPhoto}
                sx={{
                  px: 3,
                  py: 1.5,
                }}
              >
                {getLocalizedValue({ en: 'Use Photo', ko: '사용', zh: '使用', vi: 'Sử dụng' }, locale)}
              </Button>
            </>
          ) : (
            <>
              <IconButton
                onClick={toggleFlash}
                sx={{ color: flashEnabled ? 'warning.main' : 'white' }}
                disabled={loading || !!error}
              >
                {flashEnabled ? <FlashOnIcon /> : <FlashOffIcon />}
              </IconButton>

              <IconButton
                onClick={capturePhoto}
                disabled={loading || !!error}
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: 'white',
                  '&:hover': { bgcolor: 'grey.200' },
                  '&:disabled': { bgcolor: 'grey.500' },
                }}
              >
                <CameraIcon sx={{ fontSize: 36, color: 'black' }} />
              </IconButton>

              <IconButton
                onClick={toggleCamera}
                sx={{ color: 'white' }}
                disabled={loading || !!error}
              >
                <SwitchCameraIcon />
              </IconButton>
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
