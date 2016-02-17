/* eslint-disable */
const globalObject = typeof window !== 'undefined' ? window : global;
/* eslint-enable */
const requestFrame = (
  globalObject.requestAnimationFrame ||
  ((callback) => setTimeout(callback, 1000 / 60))
);
const cancelFrame = (
  globalObject.cancelAnimationFrame ||
  ((timeoutId) => clearTimeout(timeoutId))
);
let debounceTimer = null;
let elementsWithScrollListeners = [];
function windowHasScrolled() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    for (const elementReference of elementsWithScrollListeners) {
      const { element, listeners } = elementReference;
      if (elementReference.frame) {
        cancelFrame(elementReference.frame);
      }
      elementReference.frame = requestFrame(() => {
        const { offsetWidth, offsetHeight } = element;
        elementReference.oldWidth = offsetWidth;
        elementReference.oldHeight = offsetHeight;
        for (const listener of listeners) {
          listener(offsetWidth, offsetHeight);
        }
      });
    }
  }, 100);
}

function addWindowScrollListener() {
  globalObject.removeEventListener('scroll', windowHasScrolled);
  globalObject.addEventListener('scroll', windowHasScrolled);
}

export function addElementScrollListener(element, callback) {
  if (!element || (element instanceof globalObject.HTMLElement) === false) {
    throw new Error(`element must be HTMLElement, given ${element}`);
  }
  if (typeof callback !== 'function') {
    throw new Error(`callback must be function, given ${callback}`);
  }
  let elementReference = elementsWithScrollListeners.find((item) => item.element === element);
  if (!elementReference) {
    elementReference = { element, listeners: [], frame: null, oldWidth: null, oldHeight: null };
    elementsWithScrollListeners.push(elementReference);
  }
  if (elementReference.listeners.indexOf(callback) !== -1) {
    return false;
  }
  elementReference.listeners.push(callback);
  addWindowScrollListener();
  return true;
}

export function removeElementScrollListener(element, callback) {
  const elementReference = elementsWithScrollListeners.find((item) => item.element === element);
  if (!elementReference) {
    return false;
  }
  const listenerIndex = elementReference.listeners.indexOf(callback);
  if (listenerIndex === -1) {
    return false;
  }
  elementReference.listeners = elementReference.listeners.filter((item) => item !== callback);
  if (elementReference.listeners.length === 0) {
    elementsWithScrollListeners = elementsWithScrollListeners.filter((item) => item !== elementReference);
  }
  return true;
}
