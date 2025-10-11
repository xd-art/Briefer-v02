import { useEffect, useRef } from 'react';

/**
 * Custom hook for performance monitoring
 */
export const usePerformance = (componentName) => {
  const renderStartTime = useRef(null);
  
  // Measure render time
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      renderStartTime.current = performance.now();
      
      return () => {
        if (renderStartTime.current) {
          const renderTime = performance.now() - renderStartTime.current;
          console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
        }
      };
    }
  }, [componentName]);
  
  // Measure function execution time
  const measureFunction = (func, functionName) => {
    return (...args) => {
      if (process.env.NODE_ENV === 'development') {
        const start = performance.now();
        const result = func(...args);
        const end = performance.now();
        console.log(`${functionName} execution time: ${end - start}ms`);
        return result;
      }
      return func(...args);
    };
  };
  
  // Track component updates
  const trackUpdate = (updateName) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} updated: ${updateName}`);
    }
  };
  
  return {
    measureFunction,
    trackUpdate
  };
};