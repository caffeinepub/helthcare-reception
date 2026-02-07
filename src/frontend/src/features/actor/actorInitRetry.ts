/**
 * Retry policy helper for backend actor initialization.
 * Provides exponential backoff with configurable max attempts.
 */

export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export interface RetryState {
  attempt: number;
  nextRetryAt: number | null;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 5,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

export class RetryPolicy {
  private config: RetryConfig;
  private currentAttempt: number = 0;
  private isCancelled: boolean = false;

  constructor(config?: Partial<RetryConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async execute<T>(
    fn: () => Promise<T>,
    onRetry?: (state: RetryState) => void
  ): Promise<T> {
    this.currentAttempt = 0;
    this.isCancelled = false;

    while (this.currentAttempt < this.config.maxAttempts) {
      if (this.isCancelled) {
        throw new Error('Retry cancelled');
      }

      try {
        this.currentAttempt++;
        return await fn();
      } catch (error) {
        const isLastAttempt = this.currentAttempt >= this.config.maxAttempts;
        
        if (isLastAttempt) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.config.initialDelayMs * Math.pow(this.config.backoffMultiplier, this.currentAttempt - 1),
          this.config.maxDelayMs
        );

        const nextRetryAt = Date.now() + delay;

        if (onRetry) {
          onRetry({
            attempt: this.currentAttempt,
            nextRetryAt,
          });
        }

        // Wait before retrying
        await this.sleep(delay);
      }
    }

    throw new Error('Max retry attempts reached');
  }

  cancel() {
    this.isCancelled = true;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const timeout = setTimeout(resolve, ms);
      // Allow cancellation during sleep
      const checkCancellation = setInterval(() => {
        if (this.isCancelled) {
          clearTimeout(timeout);
          clearInterval(checkCancellation);
          resolve();
        }
      }, 100);
    });
  }

  getCurrentAttempt(): number {
    return this.currentAttempt;
  }

  getMaxAttempts(): number {
    return this.config.maxAttempts;
  }
}
