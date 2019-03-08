import Config, { Action } from './config';

/**
 * Binds keyboard listeners. Returns function to unbind
 * @param cb  Function to call with the action on a keypress
 */
export function bind(cb: (action: Action) => void): () => void {
  const regularizer = (e: KeyboardEvent) => {
    Config.shortcuts.forEach(s => {
      if (
        (s.linux &&
          s.linux.key === e.key &&
          (s.linux.altKey === e.altKey || s.linux.ctrlKey === e.ctrlKey)) ||
        (s.ios && s.ios.key === e.key)
      ) {
        e.preventDefault();
        cb(s.action);
      }
    });
  };

  document.body.addEventListener('keydown', regularizer);

  return () => document.body.removeEventListener('keydown', regularizer);
}
