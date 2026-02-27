import { File, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileEntry {
  name: string;
  path: string;
  is_directory: boolean;
}

interface FileItemProps {
  file: FileEntry;
  onClick: () => void;
  isActive?: boolean;
}

export function FileItem({ file, onClick, isActive }: FileItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'sidebar-row w-full text-left',
        isActive && 'sidebar-row-active'
      )}
      title={file.path}
    >
      {file.is_directory ? (
        <Folder className="h-4 w-4 flex-shrink-0 text-sky-600" />
      ) : (
        <File className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
      )}
      <span className="truncate text-sm">{file.name}</span>
    </button>
  );
}
