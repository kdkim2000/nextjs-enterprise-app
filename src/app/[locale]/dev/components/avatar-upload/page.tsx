'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Alert, Grid, Chip } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import AvatarUpload from '@/components/common/AvatarUpload';

export default function AvatarUploadDemoPage() {
  const [avatar1, setAvatar1] = useState<string>('');
  const [avatar2, setAvatar2] = useState<string>('/avatars/default-user.jpg');
  const [avatar3, setAvatar3] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState<string>('');

  const handleAvatarChange = (newUrl: string, label: string) => {
    setUploadSuccess(`${label} uploaded successfully!`);
    setTimeout(() => setUploadSuccess(''), 3000);
  };

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
    setTimeout(() => setError(''), 5000);
  };

  return (
    <PageContainer
      title="Avatar Upload"
      description="User avatar upload with preview and initials fallback"
    >
      <Stack spacing={4}>
        {/* Alerts */}
        {uploadSuccess && (
          <Alert severity="success" onClose={() => setUploadSuccess('')}>
            {uploadSuccess}
          </Alert>
        )}
        {error && (
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload avatar with initials fallback when no image is available
          </Typography>

          <AvatarUpload
            avatarUrl={avatar1}
            name="John Doe"
            onAvatarChange={(url) => {
              setAvatar1(url);
              handleAvatarChange(url, 'Avatar');
            }}
            onError={handleError}
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Current Avatar URL:
            </Typography>
            <Chip
              label={avatar1 || 'No avatar uploaded (showing initials)'}
              size="small"
              color={avatar1 ? 'primary' : 'default'}
            />
          </Box>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              mt: 2,
              fontSize: '0.875rem',
            }}
          >
            {`<AvatarUpload
  avatarUrl={avatarUrl}
  name="John Doe"
  onAvatarChange={(url) => setAvatarUrl(url)}
  onError={(error) => console.error(error)}
/>`}
          </Box>
        </Paper>

        {/* Different Sizes */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Different Sizes
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Customize avatar size using the size prop
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                Small (60px)
              </Typography>
              <AvatarUpload
                avatarUrl={avatar2}
                name="Jane Smith"
                onAvatarChange={(url) => {
                  setAvatar2(url);
                  handleAvatarChange(url, 'Small avatar');
                }}
                onError={handleError}
                size={60}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                Medium (80px - Default)
              </Typography>
              <AvatarUpload
                avatarUrl={avatar2}
                name="Jane Smith"
                onAvatarChange={(url) => {
                  setAvatar2(url);
                  handleAvatarChange(url, 'Medium avatar');
                }}
                onError={handleError}
                size={80}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                Large (120px)
              </Typography>
              <AvatarUpload
                avatarUrl={avatar2}
                name="Jane Smith"
                onAvatarChange={(url) => {
                  setAvatar2(url);
                  handleAvatarChange(url, 'Large avatar');
                }}
                onError={handleError}
                size={120}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Custom Format and Size */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Custom Format and Size Restrictions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Customize accepted file formats and display custom size limits
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                PNG & JPG Only (Max 5MB)
              </Typography>
              <AvatarUpload
                avatarUrl={avatar3}
                name="Bob Wilson"
                onAvatarChange={(url) => {
                  setAvatar3(url);
                  handleAvatarChange(url, 'Custom format avatar');
                }}
                onError={handleError}
                acceptedFormats="image/png,image/jpeg,image/jpg"
                maxSizeText="PNG, JPG only (Max 5MB)"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                All Image Formats (Max 10MB)
              </Typography>
              <AvatarUpload
                avatarUrl={avatar3}
                name="Bob Wilson"
                onAvatarChange={(url) => {
                  setAvatar3(url);
                  handleAvatarChange(url, 'All formats avatar');
                }}
                onError={handleError}
                acceptedFormats="image/*"
                maxSizeText="All image formats (Max 10MB)"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Initials Fallback Examples */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Initials Fallback (No Avatar)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            When no avatar is uploaded, displays user initials
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <AvatarUpload
                avatarUrl=""
                name="Alice Johnson"
                onAvatarChange={(url) => handleAvatarChange(url, 'Alice avatar')}
                onError={handleError}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <AvatarUpload
                avatarUrl=""
                name="Michael Brown"
                onAvatarChange={(url) => handleAvatarChange(url, 'Michael avatar')}
                onError={handleError}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <AvatarUpload
                avatarUrl=""
                name="Sarah Davis"
                onAvatarChange={(url) => handleAvatarChange(url, 'Sarah avatar')}
                onError={handleError}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <AvatarUpload
                avatarUrl=""
                name="Tom Anderson"
                onAvatarChange={(url) => handleAvatarChange(url, 'Tom avatar')}
                onError={handleError}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* API Reference */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            API Reference
          </Typography>
          <Typography variant="body2" component="div">
            <strong>Import:</strong>
            <Box
              component="pre"
              sx={{
                bgcolor: 'grey.100',
                p: 2,
                borderRadius: 1,
                overflow: 'auto',
                mt: 1,
              }}
            >
              {`import AvatarUpload from '@/components/common/AvatarUpload';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>avatarUrl</code>: string - Current avatar URL (optional)</li>
            <li><code>name</code>: string - User name for initials fallback (required)</li>
            <li><code>onAvatarChange</code>: (url: string) =&gt; void - Callback when upload succeeds (required)</li>
            <li><code>onError</code>: (error: string) =&gt; void - Callback when upload fails (optional)</li>
            <li><code>size</code>: number - Avatar size in pixels (default: 80)</li>
            <li><code>acceptedFormats</code>: string - Accepted file MIME types (default: image/jpeg,image/jpg,image/png,image/gif,image/webp)</li>
            <li><code>maxSizeText</code>: string - Display text for size limits (default: &quot;JPG, PNG, GIF, WEBP (Max 10MB)&quot;)</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Key Features:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>File upload with drag-and-drop support</li>
            <li>Image preview before upload</li>
            <li>Initials fallback when no avatar is available</li>
            <li>Loading state with spinner during upload</li>
            <li>Customizable avatar size</li>
            <li>File format and size validation</li>
            <li>Error handling with callback</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Upload Endpoint:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Uses <code>POST /file/upload</code> endpoint</li>
            <li>Sends file as <code>multipart/form-data</code></li>
            <li>Returns file path in response</li>
            <li>Automatically displays using <code>getAvatarUrl()</code> helper</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Common Use Cases:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>User profile settings</li>
            <li>Registration/signup forms</li>
            <li>Admin user management</li>
            <li>Team member profiles</li>
            <li>Social media profile pages</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
