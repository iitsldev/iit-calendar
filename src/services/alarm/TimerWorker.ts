
let timer: number | null = null;
let startTime: number = 0;
let durationMs: number = 0;
let intervalMs: number = 0;
let nextIntervalAt: number = 0;
let isStopwatch: boolean = false;

self.onmessage = (e: MessageEvent) => {
  const { type } = e.data;

  if (type === 'start') {
    startTime = Date.now();
    durationMs = e.data.durationMs;
    intervalMs = e.data.intervalMs || 0;
    isStopwatch = !!e.data.isStopwatch;
    const firstIntervalDelayMs = e.data.firstIntervalDelayMs ?? intervalMs;

    // Set the absolute time for the first interval (#1: supports resume offset)
    nextIntervalAt = intervalMs > 0 ? startTime + firstIntervalDelayMs : 0;

    if (timer) clearInterval(timer);
    
    timer = self.setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;

      if (isStopwatch) {
        self.postMessage({ type: 'tick', elapsed, remaining: 0 });

        // Handle interval crossings — while loop catches multiple in one tick (#5)
        if (intervalMs > 0) {
          while (nextIntervalAt > 0 && now >= nextIntervalAt) {
            self.postMessage({ type: 'interval' });
            nextIntervalAt += intervalMs;
          }
        }
      } else {
        const remaining = Math.max(0, durationMs - elapsed);

        self.postMessage({ type: 'tick', remaining, elapsed });

        // Handle interval crossings — while loop catches multiple in one tick (#5)
        if (intervalMs > 0 && remaining > 0) {
          while (nextIntervalAt > 0 && now >= nextIntervalAt) {
            self.postMessage({ type: 'interval' });
            nextIntervalAt += intervalMs;
          }
        }

        if (remaining <= 0) {
          self.postMessage({ type: 'done' });
          if (timer) {
            clearInterval(timer);
            timer = null;
          }
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
