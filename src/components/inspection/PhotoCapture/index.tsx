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
  Alert,
} from '@mui/material';
import {
  PhotoCamera as CameraIcon,
  Cameraswitch as SwitchCameraIcon,
  Close as CloseIcon,
  FlashOn as FlashOnIcon,
  FlashOff as FlashOffIcon,
  Check as ConfirmIcon,
  Refresh as RetakeIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  FileUpload as FileUploadIcon,
} from '@mui/icons-material';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

// Check if we're in a secure context (HTTPS or localhost)
const isSecureContext = (): boolean => {
  if (typeof window === 'undefined') return false;

  // window.isSecureContext is the standard way to check
  if (typeof window.isSecureContext === 'boolean') {
    return window.isSecureContext;
  }

  // Fallback: check URL
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;

  return (
    protocol === 'https:' ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]'
  );
};

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'permission' | 'notfound' | 'inuse' | 'notsupported' | 'insecure' | 'unknown'>('unknown');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null);
  const [useFileInput, setUseFileInput] = useState(false);

  // Check secure context on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const secure = isSecureContext();
      if (!secure) {
        setUseFileInput(true);
        setLoading(false);
      }
    }
  }, []);

  // Handle file input change (fallback method)
  const handleFileInputChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCapturedImage(reader.result);
        }
      };
      reader.onerror = () => {
        setError(getLocalizedValue({
          en: 'Failed to read the image file.',
          ko: '이미지 파일을 읽는데 실패했습니다.',
          zh: '读取图片文件失败。',
          vi: 'Không thể đọc tệp hình ảnh.',
        }, locale));
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File read error:', err);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [locale]);

  // Check camera permission status
  const checkPermission = useCallback(async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setPermissionState(result.state);
        return result.state;
      }
    } catch (err) {
      console.log('Permission API not supported, will try direct access');
    }
    return null;
  }, []);

  // Request camera permission explicitly
  const requestPermission = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to get user media to trigger permission prompt
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      // Immediately stop - we just wanted permission
      stream.getTracks().forEach(track => track.stop());
      setPermissionState('granted');
      // Now start the actual camera
      startCamera();
    } catch (err: any) {
      console.error('Permission request failed:', err);
      handleCameraError(err);
    }
  }, []);

  // Handle camera errors with specific messages
  const handleCameraError = useCallback((err: any) => {
    // Use console.warn for expected errors (no camera found), console.error for unexpected ones
    const isExpectedError = err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError';
    if (isExpectedError) {
      console.warn('Camera not available:', err.name, err.message);
    } else {
      console.error('Camera error:', err.name, err.message);
    }

    let errorMessage: Record<string, string>;
    let type: typeof errorType = 'unknown';

    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      type = 'permission';
      errorMessage = {
        en: 'Camera permission denied. Please allow camera access in your browser settings.',
        ko: '카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 접근을 허용해주세요.',
        zh: '相机权限被拒绝。请在浏览器设置中允许相机访问。',
        vi: 'Quyền camera bị từ chối. Vui lòng cho phép truy cập camera trong cài đặt trình duyệt.',
      };
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      // Automatically switch to file input mode when no camera found
      setUseFileInput(true);
      setLoading(false);
      return; // Don't show error, just switch to file input
    } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      type = 'inuse';
      errorMessage = {
        en: 'Camera is in use by another application. Please close other apps using the camera.',
        ko: '카메라가 다른 앱에서 사용 중입니다. 카메라를 사용하는 다른 앱을 종료해주세요.',
        zh: '相机正被其他应用程序使用。请关闭使用相机的其他应用。',
        vi: 'Camera đang được ứng dụng khác sử dụng. Vui lòng đóng các ứng dụng khác đang dùng camera.',
      };
    } else if (err.name === 'OverconstrainedError') {
      type = 'notfound';
      errorMessage = {
        en: 'Camera constraints not satisfied. Trying with default settings...',
        ko: '카메라 설정을 만족할 수 없습니다. 기본 설정으로 시도합니다...',
        zh: '相机约束不满足。正在尝试默认设置...',
        vi: 'Không đáp ứng được ràng buộc camera. Đang thử với cài đặt mặc định...',
      };
    } else if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      type = 'notsupported';
      errorMessage = {
        en: 'Camera not supported in this browser. Please use a modern browser.',
        ko: '이 브라우저에서는 카메라를 지원하지 않습니다. 최신 브라우저를 사용해주세요.',
        zh: '此浏览器不支持相机。请使用现代浏览器。',
        vi: 'Trình duyệt này không hỗ trợ camera. Vui lòng sử dụng trình duyệt hiện đại.',
      };
    } else {
      type = 'unknown';
      errorMessage = {
        en: `Failed to access camera: ${err.message || 'Unknown error'}`,
        ko: `카메라 접근에 실패했습니다: ${err.message || '알 수 없는 오류'}`,
        zh: `无法访问相机: ${err.message || '未知错误'}`,
        vi: `Không thể truy cập camera: ${err.message || 'Lỗi không xác định'}`,
      };
    }

    setErrorType(type);
    setError(getLocalizedValue(errorMessage, locale));
    setLoading(false);
  }, [locale]);

  // Start camera
  const startCamera = useCallback(async () => {
    // If using file input mode, don't try to start camera
    if (useFileInput) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Check secure context first
    if (!isSecureContext()) {
      setUseFileInput(true);
      setLoading(false);
      return;
    }

    // Check browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      handleCameraError({ name: 'NotSupportedError', message: 'getUserMedia not supported' });
      return;
    }

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

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (constraintError: any) {
        // If constraints fail, try with simpler constraints
        if (constraintError.name === 'OverconstrainedError') {
          console.log('Trying with simpler constraints...');
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } else {
          throw constraintError;
        }
      }

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
      setPermissionState('granted');
    } catch (err: any) {
      handleCameraError(err);
    }
  }, [facingMode, handleCameraError]);

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
            <Box sx={{ px: 3, textAlign: 'center', maxWidth: 400 }}>
              <VideocamOffIcon sx={{ fontSize: 64, color: 'grey.500', mb: 2 }} />
              <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
                {error}
              </Alert>

              {errorType === 'permission' && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="grey.400" sx={{ mb: 1 }}>
                    {getLocalizedValue({
                      en: 'To allow camera access:',
                      ko: '카메라 접근을 허용하려면:',
                      zh: '要允许相机访问：',
                      vi: 'Để cho phép truy cập camera:',
                    }, locale)}
                  </Typography>
                  <Typography variant="caption" color="grey.500" component="div">
                    {getLocalizedValue({
                      en: '1. Click the camera icon in the address bar\n2. Select "Allow" for camera\n3. Refresh or click retry',
                      ko: '1. 주소창의 카메라 아이콘을 클릭하세요\n2. 카메라 "허용"을 선택하세요\n3. 새로고침하거나 재시도를 클릭하세요',
                      zh: '1. 点击地址栏中的相机图标\n2. 选择相机"允许"\n3. 刷新或点击重试',
                      vi: '1. Nhấp vào biểu tượng camera trong thanh địa chỉ\n2. Chọn "Cho phép" cho camera\n3. Làm mới hoặc nhấp thử lại',
                    }, locale)}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                {errorType === 'permission' && (
                  <Button
                    variant="contained"
                    startIcon={<VideocamIcon />}
                    onClick={requestPermission}
                    sx={{ mt: 1 }}
                  >
                    {getLocalizedValue({
                      en: 'Request Permission',
                      ko: '권한 요청',
                      zh: '请求权限',
                      vi: 'Yêu cầu quyền',
                    }, locale)}
                  </Button>
                )}
                {errorType !== 'notfound' && (
                  <Button
                    variant="outlined"
                    startIcon={<RetakeIcon />}
                    onClick={startCamera}
                    sx={{ mt: 1, color: 'white', borderColor: 'grey.500' }}
                  >
                    {getLocalizedValue({
                      en: 'Retry',
                      ko: '재시도',
                      zh: '重试',
                      vi: 'Thử lại',
                    }, locale)}
                  </Button>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<FileUploadIcon />}
                  onClick={() => {
                    setUseFileInput(true);
                    setError(null);
                  }}
                  sx={{ mt: 1 }}
                >
                  {getLocalizedValue({
                    en: 'Select from Gallery',
                    ko: '갤러리에서 선택',
                    zh: '从相册选择',
                    vi: 'Chọn từ thư viện',
                  }, locale)}
                </Button>
              </Box>
            </Box>
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
          ) : useFileInput ? (
            /* File input fallback for non-secure contexts (HTTP) */
            <Box sx={{ px: 3, textAlign: 'center', maxWidth: 400 }}>
              <CameraIcon sx={{ fontSize: 80, color: 'grey.500', mb: 3 }} />
              <Typography variant="body1" color="grey.300" sx={{ mb: 2 }}>
                {getLocalizedValue({
                  en: 'Tap the button below to take a photo or select from gallery',
                  ko: '아래 버튼을 눌러 사진을 촬영하거나 갤러리에서 선택하세요',
                  zh: '点击下方按钮拍照或从相册选择',
                  vi: 'Nhấn nút bên dưới để chụp ảnh hoặc chọn từ thư viện',
                }, locale)}
              </Typography>
              <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                {getLocalizedValue({
                  en: 'For direct camera access, please use HTTPS.',
                  ko: '카메라 직접 접근을 위해서는 HTTPS를 사용해주세요.',
                  zh: '要直接访问相机，请使用 HTTPS。',
                  vi: 'Để truy cập camera trực tiếp, vui lòng sử dụng HTTPS.',
                }, locale)}
              </Alert>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
              />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CameraIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ py: 2, px: 4 }}
                >
                  {getLocalizedValue({
                    en: 'Take Photo',
                    ko: '사진 촬영',
                    zh: '拍照',
                    vi: 'Chụp ảnh',
                  }, locale)}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<FileUploadIcon />}
                  onClick={() => {
                    // Remove capture attribute to allow gallery selection
                    if (fileInputRef.current) {
                      fileInputRef.current.removeAttribute('capture');
                      fileInputRef.current.click();
                      // Restore capture attribute after a short delay
                      setTimeout(() => {
                        fileInputRef.current?.setAttribute('capture', 'environment');
                      }, 100);
                    }
                  }}
                  sx={{ py: 2, px: 4, color: 'white', borderColor: 'grey.500' }}
                >
                  {getLocalizedValue({
                    en: 'From Gallery',
                    ko: '갤러리에서',
                    zh: '从相册',
                    vi: 'Từ thư viện',
                  }, locale)}
                </Button>
              </Box>
            </Box>
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
            display: capturedImage || !useFileInput ? 'flex' : 'none',
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
          ) : !useFileInput ? (
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
          ) : null}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
