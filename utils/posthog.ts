import posthog from 'posthog-js';

/**
 * Manually capture an exception with PostHog.
 * This function can be used to capture errors that might not be automatically captured.
 * 
 * @param error The error object to capture
 * @param additionalProperties Additional properties to include with the exception event
 */
export function captureException(error: Error, additionalProperties?: Record<string, any>): void {
  posthog.captureException(error, additionalProperties);
}

/**
 * Utility function to wrap a function with error tracking.
 * This will automatically capture any exceptions thrown by the wrapped function.
 * 
 * @param fn The function to wrap
 * @param context Optional context information to include with the exception
 * @returns A wrapped function that captures errors
 */
export function withErrorTracking<T extends (...args: any[]) => any>(
  fn: T,
  context?: string | Record<string, any>
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    try {
      return fn(...args);
    } catch (error) {
      if (error instanceof Error) {
        const additionalProps = typeof context === 'string' 
          ? { context } 
          : context;
        
        captureException(error, additionalProps);
      }
      throw error;
    }
  };
} 