/* eslint-env browser */
export default function (element) {
  if (!element || (element instanceof window.HTMLElement) === false) {
    throw new Error(`element must be HTMLElement, given ${element}`);
  }

  const elemBoundingRect = element.getBoundingClientRect();
  if (elemBoundingRect.top >= -200 &&
      elemBoundingRect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + 200) {
    return true;
  }

  return false;
}
