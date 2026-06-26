// Simple toast notification utility
let _setToasts = null;

export function registerToastSetter(fn) {
  _setToasts = fn;
}

export function showToast(message, type = 'success') {
  if (_setToasts) {
    const id = Date.now();
    _setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      _setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }
}
