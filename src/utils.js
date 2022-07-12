export function debouncer(callback, wait) {
    let timeout = 1000;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        callback.apply(this, args);
      }, wait);
    };
  }
  