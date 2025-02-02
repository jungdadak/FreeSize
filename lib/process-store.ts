// lib/process-store.ts
interface ProcessInfo {
  s3Url: string;
  originalFileName: string;
  method: string;
  createdAt: number;
}

class ProcessStore {
  private store: Map<string, ProcessInfo>;
  private readonly EXPIRY_TIME = 1000 * 60 * 60; // 1시간

  constructor() {
    this.store = new Map();
  }

  /**
   * 프로세스 정보 저장
   */
  set(processId: string, info: Omit<ProcessInfo, 'createdAt'>): void {
    console.log(`💾 Storing process info for ID: ${processId}`);
    this.store.set(processId, {
      ...info,
      createdAt: Date.now(),
    });
    this.cleanup();
  }

  /**
   * 프로세스 정보 조회
   */
  get(processId: string): ProcessInfo | undefined {
    console.log(`🔍 Retrieving process info for ID: ${processId}`);
    const info = this.store.get(processId);
    if (!info) {
      console.log(`❌ Process ID not found: ${processId}`);
      return undefined;
    }
    return info;
  }

  /**
   * 프로세스 정보 삭제
   */
  delete(processId: string): boolean {
    console.log(`🗑 Deleting process info for ID: ${processId}`);
    return this.store.delete(processId);
  }

  /**
   * 오래된 프로세스 정보 정리
   */
  private cleanup(): void {
    console.log('🧹 Starting store cleanup...');
    const now = Date.now();
    let cleanupCount = 0;

    for (const [processId, info] of this.store.entries()) {
      if (now - info.createdAt > this.EXPIRY_TIME) {
        this.store.delete(processId);
        cleanupCount++;
      }
    }

    if (cleanupCount > 0) {
      console.log(`🧹 Cleaned up ${cleanupCount} expired processes`);
    }
  }

  /**
   * 현재 저장된 프로세스 수 반환
   */
  get size(): number {
    return this.store.size;
  }

  /**
   * 모든 프로세스 정보 삭제
   */
  clear(): void {
    console.log('🧹 Clearing all process info');
    this.store.clear();
  }

  /**
   * 디버깅용 스토어 상태 출력
   */
  debug(): void {
    console.log('📊 Current store state:');
    console.log(`Total processes: ${this.store.size}`);
    for (const [processId, info] of this.store.entries()) {
      console.log(`- ${processId}: ${info.originalFileName} (${info.method})`);
    }
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const processStore = new ProcessStore();
