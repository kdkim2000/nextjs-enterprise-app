'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Grid,
  Switch,
  FormControlLabel,
  Button,
  Chip,
  Alert,
  AlertTitle,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  CloudOff,
  CloudDone,
  CloudSync,
  Download,
  Refresh,
} from '@mui/icons-material';
import PageContainer from '@/components/common/PageContainer';
import PageHeader from '@/components/common/PageHeader';
import {
  SyncStatusIndicator,
  OfflineStatusBar,
  DownloadOfflineButton,
  SyncDetailPanel,
} from '@/components/offline';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export default function OfflineSyncDemoPage() {
  const [showPanel, setShowPanel] = useState(false);
  const networkStatus = useNetworkStatus();

  return (
    <PageContainer>
      <PageHeader useMenu showBreadcrumb />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Offline & Sync Components
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Components for managing offline mode and data synchronization.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          오프라인 모드와 데이터 동기화를 관리하기 위한 컴포넌트입니다.
        </Typography>
      </Box>

      <Stack spacing={4}>
        {/* Current Network Status */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Current Network Status (useNetworkStatus)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            실시간 네트워크 상태를 감지하는 훅입니다. Chrome DevTools에서 Network 탭의 Offline 체크박스로 테스트할 수 있습니다.
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Chip
              icon={networkStatus.isOnline ? <CloudDone /> : <CloudOff />}
              label={networkStatus.isOnline ? 'Online' : 'Offline'}
              color={networkStatus.isOnline ? 'success' : 'warning'}
            />
            <Chip
              label={`Connection: ${networkStatus.effectiveType}`}
              variant="outlined"
            />
            <Chip
              label={`Slow: ${networkStatus.isSlowConnection ? 'Yes' : 'No'}`}
              color={networkStatus.isSlowConnection ? 'warning' : 'default'}
              variant="outlined"
            />
            {networkStatus.rtt > 0 && (
              <Chip label={`RTT: ${networkStatus.rtt}ms`} variant="outlined" />
            )}
            {networkStatus.downlink > 0 && (
              <Chip label={`Downlink: ${networkStatus.downlink} Mbps`} variant="outlined" />
            )}
          </Box>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
            }}
          >
            {`import { useNetworkStatus } from '@/hooks/useNetworkStatus';

function MyComponent() {
  const { isOnline, isSlowConnection, effectiveType, rtt, downlink } = useNetworkStatus();

  if (!isOnline) {
    return <OfflineView />;
  }

  if (isSlowConnection) {
    return <LowBandwidthMode />;
  }

  return <NormalView />;
}`}
          </Box>
        </Paper>

        {/* SyncStatusIndicator */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            SyncStatusIndicator
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            헤더나 툴바에 배치하여 동기화 상태를 아이콘으로 표시합니다. 클릭 시 상세 패널을 열 수 있습니다.
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <SyncStatusIndicator size="small" locale="ko" />
              <Typography variant="caption" display="block">
                Small
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <SyncStatusIndicator size="medium" locale="ko" />
              <Typography variant="caption" display="block">
                Medium
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <SyncStatusIndicator
                size="large"
                locale="ko"
                onClick={() => setShowPanel(true)}
              />
              <Typography variant="caption" display="block">
                Large (Clickable)
              </Typography>
            </Box>
          </Box>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
            }}
          >
            {`import { SyncStatusIndicator } from '@/components/offline';

// 헤더에 배치
<AppBar>
  <Toolbar>
    <Typography>My App</Typography>
    <Box sx={{ flexGrow: 1 }} />
    <SyncStatusIndicator
      onClick={() => setShowPanel(true)}
      locale="ko"
    />
  </Toolbar>
</AppBar>`}
          </Box>
        </Paper>

        {/* OfflineStatusBar */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            OfflineStatusBar
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            페이지 상단에 배치하여 오프라인 상태, 동기화 진행, 실패 항목을 배너로 표시합니다.
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            실제 동작을 보려면 Chrome DevTools → Network → Offline 체크박스를 활성화하세요.
          </Alert>

          <Box sx={{ mb: 3, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
            <OfflineStatusBar locale="ko" showProgress />
          </Box>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
            }}
          >
            {`import { OfflineStatusBar } from '@/components/offline';

// 페이지 레이아웃에 배치
function Layout({ children }) {
  return (
    <>
      <AppBar>...</AppBar>
      <OfflineStatusBar locale="ko" showProgress />
      <main>{children}</main>
    </>
  );
}`}
          </Box>
        </Paper>

        {/* DownloadOfflineButton */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            DownloadOfflineButton
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            특정 데이터를 오프라인 사용을 위해 로컬에 다운로드합니다.
          </Typography>

          <Alert severity="warning" sx={{ mb: 2 }}>
            이 데모는 실제 API 호출 없이 UI만 표시합니다. 실제 사용 시 유효한 inspectionId를 전달해야 합니다.
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            {/* isDownloaded=true로 설정하여 API 호출 방지 (데모용) */}
            <DownloadOfflineButton
              inspectionId="demo-inspection-1"
              locale="ko"
              variant="button"
              isDownloaded={true}
            />
            <DownloadOfflineButton
              inspectionId="demo-inspection-2"
              locale="ko"
              variant="icon"
              isDownloaded={true}
            />
          </Box>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
            }}
          >
            {`import { DownloadOfflineButton } from '@/components/offline';

// 버튼 형태로 사용
<DownloadOfflineButton
  inspectionId={inspection.id}
  locale="ko"
  variant="button"
  onDownloaded={() => {
    showMessage('오프라인 사용 준비 완료');
  }}
/>

// 아이콘 버튼 형태로 사용
<DownloadOfflineButton
  inspectionId={inspection.id}
  locale="ko"
  variant="icon"
/>`}
          </Box>
        </Paper>

        {/* SyncDetailPanel */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            SyncDetailPanel
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            동기화 상세 정보를 보여주는 슬라이드 패널입니다. 대기 중/실패 항목 목록과 액션을 제공합니다.
          </Typography>

          <Button
            variant="contained"
            onClick={() => setShowPanel(true)}
            startIcon={<CloudSync />}
          >
            동기화 패널 열기
          </Button>

          <SyncDetailPanel
            open={showPanel}
            onClose={() => setShowPanel(false)}
            locale="ko"
          />

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
              mt: 3,
            }}
          >
            {`import { SyncDetailPanel } from '@/components/offline';

const [showPanel, setShowPanel] = useState(false);

// SyncStatusIndicator 클릭 시 패널 열기
<SyncStatusIndicator onClick={() => setShowPanel(true)} />

<SyncDetailPanel
  open={showPanel}
  onClose={() => setShowPanel(false)}
  locale="ko"
/>`}
          </Box>
        </Paper>

        {/* Hook & Storage Reference */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Hooks & Storage
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            useNetworkStatus
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            네트워크 상태를 실시간으로 감지합니다. Network Information API를 활용합니다.
          </Typography>

          <TableContainer sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Property</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><code>isOnline</code></TableCell>
                  <TableCell>boolean</TableCell>
                  <TableCell>현재 온라인 여부</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>isSlowConnection</code></TableCell>
                  <TableCell>boolean</TableCell>
                  <TableCell>느린 연결 여부 (2g 이하 또는 RTT {'>'} 500ms)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>connectionType</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell>연결 유형 (wifi, cellular, etc.)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>effectiveType</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell>효과적 연결 유형 (slow-2g, 2g, 3g, 4g)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>downlink</code></TableCell>
                  <TableCell>number</TableCell>
                  <TableCell>다운링크 속도 (Mbps)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>rtt</code></TableCell>
                  <TableCell>number</TableCell>
                  <TableCell>Round Trip Time (ms)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            useSyncStatus
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            동기화 서비스와 연동하여 동기화 상태 및 작업을 관리합니다.
          </Typography>

          <TableContainer sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Property/Method</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><code>status</code></TableCell>
                  <TableCell>SyncStatus</TableCell>
                  <TableCell>현재 동기화 상태 객체</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>progress</code></TableCell>
                  <TableCell>SyncProgress</TableCell>
                  <TableCell>동기화 진행률 (total, completed, failed)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>hasPending</code></TableCell>
                  <TableCell>boolean</TableCell>
                  <TableCell>대기 중인 항목 존재 여부</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>hasFailed</code></TableCell>
                  <TableCell>boolean</TableCell>
                  <TableCell>실패한 항목 존재 여부</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>sync()</code></TableCell>
                  <TableCell>function</TableCell>
                  <TableCell>수동 동기화 실행</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>retryFailed()</code></TableCell>
                  <TableCell>function</TableCell>
                  <TableCell>실패한 항목 재시도</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>clearFailed()</code></TableCell>
                  <TableCell>function</TableCell>
                  <TableCell>실패한 항목 삭제</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>downloadForOffline(id)</code></TableCell>
                  <TableCell>function</TableCell>
                  <TableCell>오프라인용 데이터 다운로드</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Storage Modules
          </Typography>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
            }}
          >
            {`// Inspection 전용 스토어 (기존)
import { inspectionStore } from '@/lib/offline';

await inspectionStore.saveInspection(inspection);
const inspections = await inspectionStore.getAllInspections();
const results = await inspectionStore.getResultsByInspection(id);

// 범용 스토어 (신규)
import { offlineStorage } from '@/lib/offline';

await offlineStorage.saveEntity('orders', 'ORD-001', orderData);
await offlineStorage.addToSyncQueue('create', 'orders', 'ORD-001', orderData);
await offlineStorage.cacheMasterData('products', productList, 60 * 60 * 1000);`}
          </Box>
        </Paper>

        {/* Best Practices */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Best Practices
          </Typography>

          <Stack spacing={2}>
            <Alert severity="success">
              <AlertTitle>오프라인 우선 원칙</AlertTitle>
              항상 로컬 데이터를 먼저 표시하고, 백그라운드에서 서버와 동기화합니다.
            </Alert>

            <Alert severity="info">
              <AlertTitle>명확한 상태 표시</AlertTitle>
              사용자가 현재 온라인/오프라인 상태와 동기화 대기 항목 수를 항상 알 수 있도록 합니다.
            </Alert>

            <Alert severity="warning">
              <AlertTitle>충돌 해결 전략</AlertTitle>
              동시 편집으로 인한 충돌 발생 시 명확한 해결 옵션을 제공합니다. (Local wins, Server wins, Manual merge)
            </Alert>

            <Alert severity="info">
              <AlertTitle>테스트 방법</AlertTitle>
              Chrome DevTools → Network 탭 → Offline 체크박스로 오프라인 상태를 시뮬레이션할 수 있습니다.
            </Alert>
          </Stack>
        </Paper>

        {/* API Reference */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Component Props Reference
          </Typography>

          <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>
            SyncStatusIndicatorProps
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li><code>onClick</code>?: () =&gt; void - 클릭 핸들러</li>
            <li><code>locale</code>?: string - 로케일 (기본: 'ko')</li>
            <li><code>showBadge</code>?: boolean - 배지 표시 여부 (기본: true)</li>
            <li><code>size</code>?: 'small' | 'medium' | 'large' - 크기</li>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            OfflineStatusBarProps
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li><code>locale</code>?: string - 로케일</li>
            <li><code>showProgress</code>?: boolean - 진행률 표시 여부 (기본: true)</li>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            DownloadOfflineButtonProps
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li><code>inspectionId</code>: string - 다운로드할 검사 ID</li>
            <li><code>locale</code>?: string - 로케일</li>
            <li><code>variant</code>?: 'button' | 'icon' - 버튼 형태 (기본: 'button')</li>
            <li><code>isDownloaded</code>?: boolean - 이미 다운로드 완료 여부</li>
            <li><code>onDownloaded</code>?: () =&gt; void - 다운로드 완료 콜백</li>
            <li><code>onError</code>?: (error: Error) =&gt; void - 에러 콜백</li>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            SyncDetailPanelProps
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li><code>open</code>: boolean - 패널 열림 상태</li>
            <li><code>onClose</code>: () =&gt; void - 닫기 핸들러</li>
            <li><code>locale</code>?: string - 로케일</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
