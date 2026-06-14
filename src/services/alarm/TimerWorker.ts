
let timer: number | null = null;
let startTime: number = 0;
let durationMs: number = 0;
let intervalMs: number = 0;
let lastIntervalIndex: number = 0;

self.onmessage = (e: MessageEvent) => {
  const { type } = e.data;

  if (type === 'start') {
    startTime = Date.now();
    durationMs = e.data.durationMs;
    intervalMs = e.data.intervalMs || 0;
    lastIntervalIndex = 0;

    if (timer) clearInterval(timer);
    
    timer = self.setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const remaining = Math.max(0, durationMs - elapsed);

      self.postMessage({ type: 'tick', remaining });

      if (intervalMs > 0) {
        const currentIntervalIndex = Math.floor(elapsed / intervalMs);
        if (currentIntervalIndex > lastIntervalIndex && remaining > 0) {
          self.postMessage({ type: 'interval' });
          lastIntervalIndex = currentIntervalIndex;
        }
      }

      if (remaining <= 0) {
        self.postMessage({ type: 'done' });
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }
    }, 1000);
  } else if (type === 'stop') {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    self.close();
  }
};
