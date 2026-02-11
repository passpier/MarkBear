import { useEffect, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { useUIStore } from '@/stores/uiStore';

/**
 * Initializes the OS platform early.
 * This hook should be called at the very top of the App component.
 */
export function usePlatformInitialization() {
  const setOsPlatform = useUIStore((state) => state.setOsPlatform);
  const initStartedRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization in strict mode
    if (initStartedRef.current) return;
    initStartedRef.current = true;

    let isActive = true;
    let unlistenInit: (() => void) | undefined;

    const initPlatform = async () => {
      try {
        // 1. Immediately try to fetch platform from Rust command (fastest)
        invoke<string>('get_os_platform')
          .then((platform) => {
            if (!isActive) return;
            console.log('📱 Platform detected (invoke):', platform);
            if (platform === 'macos' || platform === 'windows' || platform === 'gnome') {
              setOsPlatform(platform);
            } else {
              setOsPlatform('gnome'); // Default fallback
            }
          })
          .catch((err) => console.warn('Failed to invoke get_os_platform:', err));

        // 2. Also listen for the event as a backup (in case of race wins)
        unlistenInit = await listen<string>('init-platform', (event) => {
          if (!isActive) return;
          const detectedPlatform = event.payload as 'macos' | 'windows' | 'gnome' | 'unknown';
          console.log('🎉 init-platform event received:', detectedPlatform);
          
          if (detectedPlatform !== 'unknown') {
            setOsPlatform(detectedPlatform);
          }
        });
      } catch (error) {
        console.warn('Failed to setup platform initialization:', error);
      }
    };

    void initPlatform();

    return () => {
      isActive = false;
      unlistenInit?.();
    };
  }, [setOsPlatform]);
}
