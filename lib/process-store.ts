// lib/process-store.ts
interface ProcessInfo {
  s3Url: string;
  originalFileName: string;
  method: string;
}

class ProcessingStore {
  private store: Map<string, ProcessInfo>;
  private static instance: ProcessingStore;

  private constructor() {
    this.store = new Map();
  }

  public static getInstance(): ProcessingStore {
    if (!ProcessingStore.instance) {
      ProcessingStore.instance = new ProcessingStore();
    }
    return ProcessingStore.instance;
  }

  public set(processId: string, info: ProcessInfo): void {
    this.store.set(processId, info);
  }

  public get(processId: string): ProcessInfo | undefined {
    return this.store.get(processId);
  }

  public delete(processId: string): void {
    this.store.delete(processId);
  }
}

export const processStore = ProcessingStore.getInstance();
