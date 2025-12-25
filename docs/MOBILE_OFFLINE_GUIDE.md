# 모바일 오프라인 개발 가이드

> 이 문서는 PWA(Progressive Web App) 환경에서 오프라인 기능을 구현하기 위한 개발자 가이드입니다.

## 목차

1. [개요](#1-개요)
2. [오프라인 우선 아키텍처](#2-오프라인-우선-아키텍처)
3. [네트워크 상태 감지](#3-네트워크-상태-감지)
4. [로컬 데이터 저장소](#4-로컬-데이터-저장소)
5. [데이터 동기화 전략](#5-데이터-동기화-전략)
6. [UI/UX 가이드라인](#6-uiux-가이드라인)
7. [구현 패턴 및 예제](#7-구현-패턴-및-예제)
8. [테스트 가이드](#8-테스트-가이드)
9. [체크리스트](#9-체크리스트)

---

## 1. 개요

### 1.1 오프라인 기능이 필요한 이유

모바일 환경에서는 다음과 같은 상황이 빈번하게 발생합니다:

- **불안정한 네트워크**: 지하철, 엘리베이터, 건물 내부 등
- **로밍/데이터 절약**: 해외 출장, 데이터 요금 절약
- **현장 작업**: 공장, 건설현장 등 네트워크가 불안정한 환경
- **배터리 절약**: 네트워크 비활성화로 배터리 절약

### 1.2 오프라인 우선(Offline-First) 접근법

```
┌─────────────────────────────────────────────────────────────┐
│                    오프라인 우선 원칙                          │
├─────────────────────────────────────────────────────────────┤
│  1. 로컬 데이터를 먼저 표시한다 (빠른 응답)                      │
│  2. 백그라운드에서 서버와 동기화한다                             │
│  3. 충돌이 발생하면 명확한 해결 전략을 적용한다                   │
│  4. 사용자에게 현재 상태를 명확히 알린다                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 오프라인 우선 아키텍처

### 2.1 데이터 흐름 구조

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    UI Layer  │────▶│  Cache Layer │────▶│  API Layer   │
│  (컴포넌트)   │◀────│  (IndexedDB) │◀────│  (서버 통신)  │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │    ┌───────────────┴───────────────┐    │
       │    │        Sync Manager           │    │
       │    │   (동기화 큐 & 충돌 해결)        │    │
       │    └───────────────────────────────┘    │
       │                    │                    │
       └────────────────────┴────────────────────┘
                    데이터 흐름
```

### 2.2 핵심 모듈 구성

| 모듈 | 역할 | 위치 |
|------|------|------|
| `useNetworkStatus` | 네트워크 상태 감지 | `src/hooks/useNetworkStatus.ts` |
| `OfflineStorage` | IndexedDB 래퍼 | `src/lib/offline/storage.ts` |
| `SyncManager` | 동기화 큐 관리 | `src/lib/offline/syncManager.ts` |
| `OfflineIndicator` | 오프라인 UI 표시 | `src/components/offline/` |

---

## 3. 네트워크 상태 감지

### 3.1 useNetworkStatus 훅

```typescript
// src/hooks/useNetworkStatus.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: 'wifi' | 'cellular' | '4g' | '3g' | '2g' | 'unknown';
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
  downlink: number; // Mbps
  rtt: number; // Round Trip Time (ms)
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSlowConnection: false,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
  });

  const updateNetworkStatus = useCallback(() => {
    const connection = (navigator as any).connection ||
                       (navigator as any).mozConnection ||
                       (navigator as any).webkitConnection;

    const newStatus: NetworkStatus = {
      isOnline: navigator.onLine,
      isSlowConnection: false,
      connectionType: 'unknown',
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0,
    };

    if (connection) {
      newStatus.connectionType = connection.type || 'unknown';
      newStatus.effectiveType = connection.effectiveType || 'unknown';
      newStatus.downlink = connection.downlink || 0;
      newStatus.rtt = connection.rtt || 0;

      // 느린 연결 판단: 2g 이하 또는 RTT > 500ms
      newStatus.isSlowConnection =
        ['slow-2g', '2g'].includes(newStatus.effectiveType) ||
        newStatus.rtt > 500;
    }

    setStatus(newStatus);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 초기 상태 설정
    updateNetworkStatus();

    // 이벤트 리스너 등록
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, [updateNetworkStatus]);

  return status;
}
```

### 3.2 사용 예시

```typescript
// 컴포넌트에서 사용
function InspectionPage() {
  const { isOnline, isSlowConnection } = useNetworkStatus();

  // 오프라인 시 로컬 데이터만 표시
  if (!isOnline) {
    return <OfflineInspectionView />;
  }

  // 느린 연결 시 경고 표시
  if (isSlowConnection) {
    return (
      <>
        <SlowConnectionBanner />
        <InspectionList />
      </>
    );
  }

  return <InspectionList />;
}
```

---

## 4. 로컬 데이터 저장소

### 4.1 저장소 선택 가이드

| 저장소 | 용량 | 용도 | 장점 | 단점 |
|--------|------|------|------|------|
| **IndexedDB** | 수백 MB~GB | 구조화된 데이터, 파일 | 대용량, 인덱싱 | 복잡한 API |
| **LocalStorage** | 5-10 MB | 간단한 설정, 토큰 | 간편함 | 동기식, 용량 제한 |
| **SessionStorage** | 5-10 MB | 세션 임시 데이터 | 탭별 분리 | 세션 종료 시 삭제 |
| **Cache API** | 수백 MB | 정적 리소스, API 응답 | SW와 연동 | 데이터 검색 불편 |

### 4.2 IndexedDB 래퍼 클래스

```typescript
// src/lib/offline/storage.ts
'use client';

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// 데이터베이스 스키마 정의
interface OfflineDBSchema extends DBSchema {
  // 검사 데이터
  inspections: {
    key: string;
    value: {
      id: string;
      data: any;
      syncStatus: 'synced' | 'pending' | 'conflict';
      localUpdatedAt: number;
      serverUpdatedAt?: number;
    };
    indexes: {
      'by-sync-status': string;
      'by-updated': number;
    };
  };
  // 동기화 큐
  syncQueue: {
    key: number;
    value: {
      id?: number;
      action: 'create' | 'update' | 'delete';
      entity: string;
      entityId: string;
      data: any;
      createdAt: number;
      retryCount: number;
    };
  };
  // 캐시된 마스터 데이터
  masterData: {
    key: string;
    value: {
      type: string;
      data: any[];
      cachedAt: number;
    };
  };
}

const DB_NAME = 'offline-db';
const DB_VERSION = 1;

class OfflineStorage {
  private db: IDBPDatabase<OfflineDBSchema> | null = null;
  private initPromise: Promise<IDBPDatabase<OfflineDBSchema>> | null = null;

  /**
   * 데이터베이스 초기화
   */
  async init(): Promise<IDBPDatabase<OfflineDBSchema>> {
    if (this.db) return this.db;

    if (this.initPromise) return this.initPromise;

    this.initPromise = openDB<OfflineDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // inspections 스토어
        if (!db.objectStoreNames.contains('inspections')) {
          const inspectionStore = db.createObjectStore('inspections', {
            keyPath: 'id'
          });
          inspectionStore.createIndex('by-sync-status', 'syncStatus');
          inspectionStore.createIndex('by-updated', 'localUpdatedAt');
        }

        // syncQueue 스토어
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', {
            keyPath: 'id',
            autoIncrement: true
          });
        }

        // masterData 스토어
        if (!db.objectStoreNames.contains('masterData')) {
          db.createObjectStore('masterData', { keyPath: 'type' });
        }
      },
    });

    this.db = await this.initPromise;
    return this.db;
  }

  /**
   * 검사 데이터 저장
   */
  async saveInspection(id: string, data: any): Promise<void> {
    const db = await this.init();
    await db.put('inspections', {
      id,
      data,
      syncStatus: 'pending',
      localUpdatedAt: Date.now(),
    });
  }

  /**
   * 검사 데이터 조회
   */
  async getInspection(id: string): Promise<any | null> {
    const db = await this.init();
    const record = await db.get('inspections', id);
    return record?.data || null;
  }

  /**
   * 모든 검사 데이터 조회
   */
  async getAllInspections(): Promise<any[]> {
    const db = await this.init();
    const records = await db.getAll('inspections');
    return records.map(r => ({ ...r.data, _syncStatus: r.syncStatus }));
  }

  /**
   * 동기화 대기 중인 데이터 조회
   */
  async getPendingItems(): Promise<any[]> {
    const db = await this.init();
    return db.getAllFromIndex('inspections', 'by-sync-status', 'pending');
  }

  /**
   * 동기화 큐에 작업 추가
   */
  async addToSyncQueue(
    action: 'create' | 'update' | 'delete',
    entity: string,
    entityId: string,
    data?: any
  ): Promise<void> {
    const db = await this.init();
    await db.add('syncQueue', {
      action,
      entity,
      entityId,
      data,
      createdAt: Date.now(),
      retryCount: 0,
    });
  }

  /**
   * 동기화 큐 조회
   */
  async getSyncQueue(): Promise<any[]> {
    const db = await this.init();
    return db.getAll('syncQueue');
  }

  /**
   * 동기화 큐에서 항목 제거
   */
  async removeFromSyncQueue(id: number): Promise<void> {
    const db = await this.init();
    await db.delete('syncQueue', id);
  }

  /**
   * 마스터 데이터 캐싱
   */
  async cacheMasterData(type: string, data: any[]): Promise<void> {
    const db = await this.init();
    await db.put('masterData', {
      type,
      data,
      cachedAt: Date.now(),
    });
  }

  /**
   * 캐시된 마스터 데이터 조회
   */
  async getCachedMasterData(type: string, maxAge?: number): Promise<any[] | null> {
    const db = await this.init();
    const record = await db.get('masterData', type);

    if (!record) return null;

    // maxAge 체크 (기본 24시간)
    const age = Date.now() - record.cachedAt;
    if (maxAge && age > maxAge) return null;

    return record.data;
  }

  /**
   * 모든 데이터 삭제
   */
  async clearAll(): Promise<void> {
    const db = await this.init();
    await Promise.all([
      db.clear('inspections'),
      db.clear('syncQueue'),
      db.clear('masterData'),
    ]);
  }
}

// 싱글톤 인스턴스 내보내기
export const offlineStorage = new OfflineStorage();
```

### 4.3 사용 예시

```typescript
// 데이터 저장
await offlineStorage.saveInspection('INS-001', {
  title: '안전 점검',
  items: [...],
  completedAt: new Date().toISOString(),
});

// 데이터 조회
const inspection = await offlineStorage.getInspection('INS-001');

// 마스터 데이터 캐싱
await offlineStorage.cacheMasterData('templates', templatesFromServer);

// 캐시된 데이터 조회 (1시간 이내)
const templates = await offlineStorage.getCachedMasterData('templates', 60 * 60 * 1000);
```

---

## 5. 데이터 동기화 전략

### 5.1 동기화 매니저

```typescript
// src/lib/offline/syncManager.ts
'use client';

import { offlineStorage } from './storage';

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  conflicts: string[];
}

export interface ConflictResolution {
  entityId: string;
  resolution: 'local' | 'server' | 'merge';
  mergedData?: any;
}

class SyncManager {
  private isSyncing = false;
  private listeners: Set<(status: SyncStatus) => void> = new Set();

  /**
   * 동기화 상태 구독
   */
  subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(status: SyncStatus): void {
    this.listeners.forEach(listener => listener(status));
  }

  /**
   * 전체 동기화 실행
   */
  async sync(): Promise<SyncResult> {
    if (this.isSyncing) {
      return { success: false, synced: 0, failed: 0, conflicts: [] };
    }

    this.isSyncing = true;
    this.notifyListeners({ status: 'syncing', progress: 0 });

    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      conflicts: [],
    };

    try {
      // 동기화 큐 처리
      const queue = await offlineStorage.getSyncQueue();
      const total = queue.length;

      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];

        this.notifyListeners({
          status: 'syncing',
          progress: Math.round((i / total) * 100),
          currentItem: item.entityId,
        });

        try {
          await this.processSyncItem(item);
          await offlineStorage.removeFromSyncQueue(item.id!);
          result.synced++;
        } catch (error: any) {
          if (error.type === 'conflict') {
            result.conflicts.push(item.entityId);
          } else {
            result.failed++;
            // 재시도 횟수 증가
            if (item.retryCount < 3) {
              // 재시도 로직
            }
          }
        }
      }

      this.notifyListeners({ status: 'completed', result });
    } catch (error) {
      result.success = false;
      this.notifyListeners({ status: 'error', error });
    } finally {
      this.isSyncing = false;
    }

    return result;
  }

  /**
   * 개별 동기화 항목 처리
   */
  private async processSyncItem(item: any): Promise<void> {
    const endpoint = `/api/${item.entity}`;

    switch (item.action) {
      case 'create':
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data),
        });
        break;

      case 'update':
        // 충돌 감지
        const serverData = await fetch(`${endpoint}/${item.entityId}`).then(r => r.json());

        if (serverData.updatedAt > item.data.localUpdatedAt) {
          throw { type: 'conflict', serverData, localData: item.data };
        }

        await fetch(`${endpoint}/${item.entityId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data),
        });
        break;

      case 'delete':
        await fetch(`${endpoint}/${item.entityId}`, {
          method: 'DELETE',
        });
        break;
    }
  }

  /**
   * 충돌 해결
   */
  async resolveConflict(resolution: ConflictResolution): Promise<void> {
    const { entityId, resolution: strategy, mergedData } = resolution;

    switch (strategy) {
      case 'local':
        // 로컬 데이터로 서버 덮어쓰기 (강제)
        const localData = await offlineStorage.getInspection(entityId);
        await fetch(`/api/inspections/${entityId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...localData, forceOverwrite: true }),
        });
        break;

      case 'server':
        // 서버 데이터로 로컬 덮어쓰기
        const serverData = await fetch(`/api/inspections/${entityId}`).then(r => r.json());
        await offlineStorage.saveInspection(entityId, serverData);
        break;

      case 'merge':
        // 병합된 데이터 사용
        if (mergedData) {
          await offlineStorage.saveInspection(entityId, mergedData);
          await fetch(`/api/inspections/${entityId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mergedData),
          });
        }
        break;
    }
  }

  /**
   * 온라인 복귀 시 자동 동기화
   */
  setupAutoSync(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      // 온라인 복귀 시 자동 동기화
      setTimeout(() => this.sync(), 1000);
    });

    // Service Worker 백그라운드 동기화 등록
    if ('serviceWorker' in navigator && 'sync' in self.registration) {
      navigator.serviceWorker.ready.then(registration => {
        registration.sync.register('sync-inspections');
      });
    }
  }
}

export interface SyncStatus {
  status: 'idle' | 'syncing' | 'completed' | 'error';
  progress?: number;
  currentItem?: string;
  result?: SyncResult;
  error?: any;
}

export const syncManager = new SyncManager();
```

### 5.2 충돌 해결 전략

```
┌─────────────────────────────────────────────────────────────┐
│                    충돌 해결 전략                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Last-Write-Wins (기본)                                  │
│     - 가장 최근 수정 시간을 가진 데이터가 우선               │
│     - 간단하지만 데이터 손실 가능성 있음                     │
│                                                             │
│  2. Client-Wins (오프라인 우선)                              │
│     - 로컬 변경사항을 항상 우선시                            │
│     - 현장 작업 데이터가 중요한 경우 적합                    │
│                                                             │
│  3. Server-Wins (서버 우선)                                  │
│     - 서버 데이터를 항상 우선시                              │
│     - 중앙 관리가 중요한 경우 적합                           │
│                                                             │
│  4. Manual Merge (수동 병합)                                 │
│     - 사용자가 직접 충돌 해결                                │
│     - 복잡하지만 데이터 손실 최소화                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 동기화 훅

```typescript
// src/hooks/useSyncStatus.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { syncManager, SyncStatus, SyncResult } from '@/lib/offline/syncManager';
import { offlineStorage } from '@/lib/offline/storage';
import { useNetworkStatus } from './useNetworkStatus';

export interface UseSyncStatusResult {
  syncStatus: SyncStatus;
  pendingCount: number;
  lastSyncAt: Date | null;
  sync: () => Promise<SyncResult>;
  isSyncing: boolean;
}

export function useSyncStatus(): UseSyncStatusResult {
  const { isOnline } = useNetworkStatus();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ status: 'idle' });
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

  // 동기화 상태 구독
  useEffect(() => {
    const unsubscribe = syncManager.subscribe(setSyncStatus);
    return unsubscribe;
  }, []);

  // 대기 중인 항목 수 업데이트
  useEffect(() => {
    const updatePendingCount = async () => {
      const queue = await offlineStorage.getSyncQueue();
      setPendingCount(queue.length);
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000);
    return () => clearInterval(interval);
  }, []);

  // 동기화 실행
  const sync = useCallback(async (): Promise<SyncResult> => {
    if (!isOnline) {
      return { success: false, synced: 0, failed: 0, conflicts: [] };
    }

    const result = await syncManager.sync();
    if (result.success) {
      setLastSyncAt(new Date());
    }
    return result;
  }, [isOnline]);

  return {
    syncStatus,
    pendingCount,
    lastSyncAt,
    sync,
    isSyncing: syncStatus.status === 'syncing',
  };
}
```

---

## 6. UI/UX 가이드라인

### 6.1 오프라인 인디케이터

```typescript
// src/components/offline/OfflineIndicator.tsx
'use client';

import React from 'react';
import { Box, Chip, Badge, Tooltip, IconButton } from '@mui/material';
import {
  CloudOff as OfflineIcon,
  CloudDone as OnlineIcon,
  Sync as SyncIcon,
  CloudQueue as PendingIcon,
} from '@mui/icons-material';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useSyncStatus } from '@/hooks/useSyncStatus';

export default function OfflineIndicator() {
  const { isOnline, isSlowConnection } = useNetworkStatus();
  const { pendingCount, isSyncing, sync } = useSyncStatus();

  if (isOnline && pendingCount === 0 && !isSlowConnection) {
    return null; // 정상 상태에서는 표시 안 함
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* 오프라인 상태 표시 */}
      {!isOnline && (
        <Chip
          icon={<OfflineIcon />}
          label="오프라인"
          color="warning"
          size="small"
          variant="outlined"
        />
      )}

      {/* 느린 연결 표시 */}
      {isOnline && isSlowConnection && (
        <Chip
          icon={<CloudQueue />}
          label="느린 연결"
          color="info"
          size="small"
          variant="outlined"
        />
      )}

      {/* 동기화 대기 항목 */}
      {pendingCount > 0 && (
        <Tooltip title={`${pendingCount}개 항목 동기화 대기 중`}>
          <Badge badgeContent={pendingCount} color="warning">
            <IconButton
              size="small"
              onClick={() => sync()}
              disabled={!isOnline || isSyncing}
            >
              <SyncIcon
                sx={{
                  animation: isSyncing ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              />
            </IconButton>
          </Badge>
        </Tooltip>
      )}
    </Box>
  );
}
```

### 6.2 오프라인 배너

```typescript
// src/components/offline/OfflineBanner.tsx
'use client';

import React from 'react';
import { Alert, AlertTitle, Box, Button, LinearProgress } from '@mui/material';
import { CloudOff, Refresh } from '@mui/icons-material';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useSyncStatus } from '@/hooks/useSyncStatus';

export default function OfflineBanner() {
  const { isOnline } = useNetworkStatus();
  const { pendingCount, isSyncing, sync, syncStatus } = useSyncStatus();

  if (isOnline && pendingCount === 0) return null;

  return (
    <Alert
      severity={isOnline ? 'info' : 'warning'}
      icon={<CloudOff />}
      action={
        isOnline && pendingCount > 0 && (
          <Button
            color="inherit"
            size="small"
            startIcon={<Refresh />}
            onClick={() => sync()}
            disabled={isSyncing}
          >
            동기화
          </Button>
        )
      }
      sx={{ mb: 2 }}
    >
      <AlertTitle>
        {isOnline ? '동기화 필요' : '오프라인 모드'}
      </AlertTitle>

      {!isOnline && (
        '현재 오프라인 상태입니다. 데이터는 로컬에 저장되며, 온라인 복귀 시 자동으로 동기화됩니다.'
      )}

      {isOnline && pendingCount > 0 && (
        `${pendingCount}개의 변경사항이 동기화 대기 중입니다.`
      )}

      {isSyncing && (
        <Box sx={{ mt: 1 }}>
          <LinearProgress
            variant="determinate"
            value={syncStatus.progress || 0}
          />
        </Box>
      )}
    </Alert>
  );
}
```

### 6.3 데이터 상태 표시

```typescript
// 동기화 상태별 아이콘/배지 표시
function DataStatusBadge({ status }: { status: 'synced' | 'pending' | 'conflict' }) {
  const config = {
    synced: { color: 'success', icon: <CheckCircle />, label: '동기화됨' },
    pending: { color: 'warning', icon: <Schedule />, label: '대기 중' },
    conflict: { color: 'error', icon: <Warning />, label: '충돌' },
  };

  const { color, icon, label } = config[status];

  return (
    <Tooltip title={label}>
      <Chip
        icon={icon}
        label={label}
        color={color as any}
        size="small"
        variant="outlined"
      />
    </Tooltip>
  );
}
```

### 6.4 UX 원칙

```
┌─────────────────────────────────────────────────────────────┐
│                    오프라인 UX 원칙                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✓ 명확한 상태 표시                                          │
│    - 현재 온라인/오프라인 상태를 항상 표시                    │
│    - 동기화 대기 항목 수 표시                                │
│    - 마지막 동기화 시간 표시                                 │
│                                                             │
│  ✓ 즉각적인 피드백                                          │
│    - 오프라인 저장 성공 메시지                               │
│    - 동기화 진행률 표시                                      │
│    - 충돌 발생 시 명확한 알림                                │
│                                                             │
│  ✓ 일관된 동작                                              │
│    - 온/오프라인 동일한 워크플로우                           │
│    - 데이터 입력 방식 동일 유지                              │
│    - 예측 가능한 동기화 동작                                 │
│                                                             │
│  ✓ 사용자 제어                                              │
│    - 수동 동기화 옵션 제공                                   │
│    - 충돌 해결 선택권 부여                                   │
│    - 오프라인 데이터 삭제 기능                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. 구현 패턴 및 예제

### 7.1 오프라인 지원 CRUD 훅

```typescript
// src/hooks/useOfflineInspection.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { offlineStorage } from '@/lib/offline/storage';
import { inspectionApi } from '@/lib/api/inspection';

interface UseOfflineInspectionOptions {
  enableAutoSync?: boolean;
}

export function useOfflineInspection(options: UseOfflineInspectionOptions = {}) {
  const { enableAutoSync = true } = options;
  const { isOnline } = useNetworkStatus();
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 데이터 로드 (로컬 우선)
  const loadInspections = useCallback(async () => {
    setLoading(true);

    try {
      // 1. 먼저 로컬 데이터 로드 (빠른 응답)
      const localData = await offlineStorage.getAllInspections();
      setInspections(localData);

      // 2. 온라인이면 서버 데이터와 병합
      if (isOnline) {
        try {
          const serverData = await inspectionApi.getAll();

          // 서버 데이터와 로컬 데이터 병합
          const merged = mergeInspections(localData, serverData);
          setInspections(merged);

          // 로컬 캐시 업데이트
          for (const item of serverData) {
            await offlineStorage.saveInspection(item.id, item);
          }
        } catch (error) {
          console.warn('서버 동기화 실패, 로컬 데이터 사용:', error);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  // 검사 저장 (오프라인 지원)
  const saveInspection = useCallback(async (data: any) => {
    const id = data.id || `local-${Date.now()}`;
    const timestamp = Date.now();

    const inspectionData = {
      ...data,
      id,
      localUpdatedAt: timestamp,
      isLocalOnly: !isOnline || !data.id,
    };

    // 1. 항상 로컬에 먼저 저장
    await offlineStorage.saveInspection(id, inspectionData);

    // 2. 동기화 큐에 추가
    await offlineStorage.addToSyncQueue(
      data.id ? 'update' : 'create',
      'inspections',
      id,
      inspectionData
    );

    // 3. 온라인이면 즉시 서버 동기화 시도
    if (isOnline) {
      try {
        const serverResult = data.id
          ? await inspectionApi.update(id, inspectionData)
          : await inspectionApi.create(inspectionData);

        // 서버 응답으로 로컬 데이터 업데이트
        await offlineStorage.saveInspection(serverResult.id, {
          ...serverResult,
          syncStatus: 'synced',
        });

        // 동기화 큐에서 제거
        const queue = await offlineStorage.getSyncQueue();
        const queueItem = queue.find(q => q.entityId === id);
        if (queueItem?.id) {
          await offlineStorage.removeFromSyncQueue(queueItem.id);
        }

        return serverResult;
      } catch (error) {
        console.warn('서버 저장 실패, 나중에 동기화됩니다:', error);
      }
    }

    // 로컬 상태 업데이트
    setInspections(prev => {
      const index = prev.findIndex(i => i.id === id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = inspectionData;
        return updated;
      }
      return [...prev, inspectionData];
    });

    return inspectionData;
  }, [isOnline]);

  // 검사 삭제 (오프라인 지원)
  const deleteInspection = useCallback(async (id: string) => {
    // 동기화 큐에 삭제 작업 추가
    await offlineStorage.addToSyncQueue('delete', 'inspections', id);

    // 로컬에서 삭제 (또는 삭제 마크)
    // 실제로는 soft delete를 권장

    // 온라인이면 즉시 서버에서 삭제 시도
    if (isOnline) {
      try {
        await inspectionApi.delete(id);
      } catch (error) {
        console.warn('서버 삭제 실패, 나중에 동기화됩니다:', error);
      }
    }

    setInspections(prev => prev.filter(i => i.id !== id));
  }, [isOnline]);

  // 초기 로드
  useEffect(() => {
    loadInspections();
  }, [loadInspections]);

  // 온라인 복귀 시 자동 새로고침
  useEffect(() => {
    if (isOnline && enableAutoSync) {
      loadInspections();
    }
  }, [isOnline, enableAutoSync, loadInspections]);

  return {
    inspections,
    loading,
    saveInspection,
    deleteInspection,
    refresh: loadInspections,
    isOnline,
  };
}

// 병합 유틸리티
function mergeInspections(local: any[], server: any[]): any[] {
  const merged = new Map<string, any>();

  // 서버 데이터 기준
  for (const item of server) {
    merged.set(item.id, { ...item, _syncStatus: 'synced' });
  }

  // 로컬 전용 데이터 추가
  for (const item of local) {
    if (item.id.startsWith('local-') || item._syncStatus === 'pending') {
      merged.set(item.id, item);
    }
  }

  return Array.from(merged.values());
}
```

### 7.2 오프라인 폼 컴포넌트

```typescript
// src/components/inspection/OfflineInspectionForm.tsx
'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Save, CloudOff, CloudDone } from '@mui/icons-material';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useOfflineInspection } from '@/hooks/useOfflineInspection';

interface OfflineInspectionFormProps {
  initialData?: any;
  onSave?: (data: any) => void;
}

export default function OfflineInspectionForm({
  initialData,
  onSave,
}: OfflineInspectionFormProps) {
  const { isOnline } = useNetworkStatus();
  const { saveInspection } = useOfflineInspection();
  const [formData, setFormData] = useState(initialData || {});
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<'success' | 'offline' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveResult(null);

    try {
      const result = await saveInspection(formData);
      setSaveResult(isOnline ? 'success' : 'offline');
      onSave?.(result);
    } catch (error) {
      console.error('저장 실패:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* 오프라인 알림 */}
      {!isOnline && (
        <Alert severity="info" icon={<CloudOff />} sx={{ mb: 2 }}>
          오프라인 상태입니다. 데이터는 로컬에 저장되며, 온라인 복귀 시 자동 동기화됩니다.
        </Alert>
      )}

      {/* 저장 결과 메시지 */}
      {saveResult === 'success' && (
        <Alert severity="success" icon={<CloudDone />} sx={{ mb: 2 }}>
          서버에 저장되었습니다.
        </Alert>
      )}
      {saveResult === 'offline' && (
        <Alert severity="warning" icon={<CloudOff />} sx={{ mb: 2 }}>
          로컬에 저장되었습니다. 온라인 복귀 시 자동 동기화됩니다.
        </Alert>
      )}

      {/* 폼 필드 */}
      <TextField
        label="제목"
        value={formData.title || ''}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        fullWidth
        required
        sx={{ mb: 2 }}
      />

      <TextField
        label="설명"
        value={formData.description || ''}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        fullWidth
        multiline
        rows={3}
        sx={{ mb: 2 }}
      />

      {/* 저장 버튼 */}
      <Button
        type="submit"
        variant="contained"
        disabled={saving}
        startIcon={saving ? <CircularProgress size={20} /> : <Save />}
      >
        {saving ? '저장 중...' : isOnline ? '저장' : '로컬에 저장'}
      </Button>
    </Box>
  );
}
```

### 7.3 Service Worker 설정

```typescript
// public/sw.js
const CACHE_NAME = 'offline-cache-v1';
const OFFLINE_URLS = [
  '/',
  '/offline',
  '/manifest.json',
];

// 설치 시 기본 리소스 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  // API 요청은 네트워크 우선
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // 성공 시 캐시에 저장
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // 실패 시 캐시에서 반환
          return caches.match(event.request);
        })
    );
    return;
  }

  // 정적 리소스는 캐시 우선
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// 백그라운드 동기화
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-inspections') {
    event.waitUntil(syncInspections());
  }
});

async function syncInspections() {
  // IndexedDB에서 대기 중인 항목 가져와서 동기화
  // syncManager와 연동
}
```

---

## 8. 테스트 가이드

### 8.1 오프라인 테스트 방법

#### Chrome DevTools 활용

1. **Network 탭** → `Offline` 체크박스 활성화
2. **Application 탭** → Service Workers → `Offline` 체크
3. **Network 탭** → `Slow 3G` / `Fast 3G` 선택으로 느린 연결 시뮬레이션

#### 테스트 시나리오

```markdown
## 오프라인 테스트 체크리스트

### 기본 동작
- [ ] 오프라인 상태에서 앱 로드 가능
- [ ] 오프라인 상태 표시가 나타남
- [ ] 로컬 데이터가 정상 표시됨

### 데이터 CRUD
- [ ] 오프라인에서 새 데이터 생성 가능
- [ ] 오프라인에서 데이터 수정 가능
- [ ] 오프라인에서 데이터 삭제 가능
- [ ] 저장 시 "로컬 저장" 메시지 표시

### 동기화
- [ ] 온라인 복귀 시 동기화 시작
- [ ] 동기화 진행률 표시
- [ ] 동기화 완료 알림 표시
- [ ] 동기화 후 데이터 일관성 유지

### 충돌 처리
- [ ] 충돌 발생 시 알림 표시
- [ ] 충돌 해결 옵션 제공
- [ ] 충돌 해결 후 정상 동작

### 엣지 케이스
- [ ] 동기화 중 오프라인 전환
- [ ] 대용량 데이터 동기화
- [ ] 장시간 오프라인 후 복귀
- [ ] 여러 기기에서 동시 편집
```

### 8.2 단위 테스트

```typescript
// __tests__/hooks/useNetworkStatus.test.ts
import { renderHook, act } from '@testing-library/react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

describe('useNetworkStatus', () => {
  beforeEach(() => {
    // 온라인 상태로 초기화
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
    });
  });

  it('온라인 상태를 올바르게 반환', () => {
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(true);
  });

  it('오프라인 이벤트에 반응', () => {
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);
  });

  it('온라인 이벤트에 반응', () => {
    Object.defineProperty(navigator, 'onLine', { value: false });
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: true });
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.isOnline).toBe(true);
  });
});
```

---

## 9. 체크리스트

### 9.1 구현 체크리스트

```markdown
## 오프라인 기능 구현 체크리스트

### 필수 구현
- [ ] 네트워크 상태 감지 훅 (`useNetworkStatus`)
- [ ] 로컬 저장소 설정 (`IndexedDB`)
- [ ] 동기화 큐 구현
- [ ] 오프라인 인디케이터 UI
- [ ] 기본 CRUD 오프라인 지원

### 권장 구현
- [ ] 백그라운드 동기화 (Service Worker)
- [ ] 충돌 감지 및 해결
- [ ] 마스터 데이터 캐싱
- [ ] 동기화 진행률 표시
- [ ] 오프라인 전용 페이지

### 선택 구현
- [ ] 이미지/파일 오프라인 캐싱
- [ ] Push 알림 (동기화 완료)
- [ ] 다중 기기 동기화
- [ ] 데이터 압축
```

### 9.2 코드 리뷰 체크리스트

```markdown
## 오프라인 코드 리뷰 체크리스트

### 데이터 처리
- [ ] 모든 API 호출이 오프라인 폴백을 가지는가?
- [ ] 로컬 저장 시 타임스탬프가 기록되는가?
- [ ] 동기화 상태가 적절히 추적되는가?

### 에러 처리
- [ ] 네트워크 오류가 적절히 처리되는가?
- [ ] 사용자에게 명확한 오류 메시지가 표시되는가?
- [ ] 재시도 로직이 구현되어 있는가?

### UX
- [ ] 오프라인 상태가 명확히 표시되는가?
- [ ] 저장 결과(로컬/서버)가 구분되는가?
- [ ] 동기화 진행 상황이 표시되는가?

### 성능
- [ ] 불필요한 동기화가 발생하지 않는가?
- [ ] 대용량 데이터 처리가 최적화되어 있는가?
- [ ] 메모리 누수가 없는가?
```

---

## 참고 자료

- [MDN - IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [MDN - Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Google - Offline Cookbook](https://web.dev/offline-cookbook/)
- [idb - IndexedDB with Promises](https://github.com/jakearchibald/idb)

---

**문서 버전**: 1.0
**최종 수정일**: 2025-12-25
**작성자**: Claude Code
