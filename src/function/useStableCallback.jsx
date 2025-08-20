import { useCallback, useLayoutEffect, useRef } from "react";

/**
 * Crée une fonction stable entre les rendus, toujours à jour.
 * Inspiré de : https://thoughtspile.github.io/2021/04/07/better-usecallback/
 *
 * @param {Function} callback - La fonction à stabiliser
 * @returns {Function} Une version stable et toujours à jour du callback
 */
export function useStableCallback(callback) {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  const wrappedCallback = function (...args) {
    return callbackRef.current.apply(this, args);
  };

  return useCallback(wrappedCallback, []);
}
