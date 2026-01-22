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
        "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm",
        "hover:bg-accent transition-colors text-left",
        isActive && "bg-accent font-medium"
      )}
      title={file.path}
    >
      {file.is_directory ? (
        <Folder className="w-4 h-4 flex-shrink-0 text-blue-500" />
      ) : (
        <File className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
      )}
      <span className="truncate">{file.name}</span>
    </button>
  );
}
