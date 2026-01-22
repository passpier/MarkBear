import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

export const useRecentFiles = () => {
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial state
    invoke<string[]>('get_recent_files')
      .then(setRecentFiles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const refresh = async () => {
    try {
      const files = await invoke<string[]>('get_recent_files');
      setRecentFiles(files);
    } catch (error) {
      console.error('Failed to refresh recent files:', error);
    }
  };

  return { recentFiles, loading, refresh };
};
