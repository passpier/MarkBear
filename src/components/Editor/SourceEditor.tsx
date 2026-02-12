import { useEffect, useRef } from 'react';
import { useDocumentStore } from '@/stores/documentStore';
import { useUIStore } from '@/stores/uiStore';
import { useEditorLayout } from '@/hooks/useEditorLayout';

interface SourceEditorProps {
  documentId: string;
}

export const SourceEditor = ({ documentId }: SourceEditorProps) => {
  const documents = useDocumentStore((state) => state.documents);
  const updateContent = useDocumentStore((state) => state.updateContent);
  const fontSize = useUIStore((state) => state.fontSize);
  const fontFamily = useUIStore((state) => state.fontFamily);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const layoutMetrics = useEditorLayout(containerRef);

  const document = documents.find((d) => d.id === documentId);

  useEffect(() => {
    if (textareaRef.current && document) {
      textareaRef.current.value = document.content;
    }
  }, [documentId]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateContent(documentId, e.target.value);
  };

  if (!document) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No document selected
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden flex justify-center px-4 py-6"
    >
      <textarea
        ref={textareaRef}
        className="h-full w-full resize-none bg-transparent focus:outline-none leading-relaxed"
        style={{
          fontSize: `${fontSize}px`,
          fontFamily: fontFamily.includes('mono') ? fontFamily : `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
          maxWidth: `${layoutMetrics.contentWidth}px`,
        }}
        onChange={handleChange}
        spellCheck={false}
        placeholder="Type your markdown here..."
      />
    </div>
  );
};
