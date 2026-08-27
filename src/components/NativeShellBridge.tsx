import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * The iOS SwiftUI shell posts CustomEvent('mathlift-navigate') when the native
 * tab bar / header wants to change routes inside the WKWebView.
 */
const NativeShellBridge = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const onNavigate = (event: Event) => {
      const path = (event as CustomEvent<{ path?: string }>).detail?.path;
      if (typeof path === 'string' && path.startsWith('/')) {
        navigate(path);
      }
    };
    window.addEventListener('mathlift-navigate', onNavigate as EventListener);
    return () => window.removeEventListener('mathlift-navigate', onNavigate as EventListener);
  }, [navigate]);

  return null;
};

export default NativeShellBridge;
