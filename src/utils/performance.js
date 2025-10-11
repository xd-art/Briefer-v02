/**
 * Performance utilities for the card editor application
 */

// Debounce function to limit the rate at which a function can fire
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function to limit the rate at which a function can fire
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Function to measure component render time
export const measureRenderTime = (componentName) => {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    return () => {
      const end = performance.now();
      console.log(`${componentName} render time: ${end - start} milliseconds`);
    };
  }
  return () => {};
};

// Function to optimize localStorage operations
export const optimizedLocalStorage = {
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error setting localStorage item:', error);
      return false;
    }
  },
  
  getItem: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting localStorage item:', error);
      return null;
    }
  },
  
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing localStorage item:', error);
      return false;
    }
  }
};

// Function to batch state updates
export const batchUpdates = (updates) => {
  return (setState) => {
    setState(prevState => {
      let newState = { ...prevState };
      updates.forEach(update => {
        if (typeof update === 'function') {
          newState = { ...newState, ...update(newState) };
        } else {
          newState = { ...newState, ...update };
        }
      });
      return newState;
    });
  };
};