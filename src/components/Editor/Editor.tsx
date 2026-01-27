import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useEffect, useRef } from 'react';
import { useDocumentStore } from '@/stores/documentStore';
import { useUIStore } from '@/stores/uiStore';
import { useEditorStore } from '@/stores/editorStore';
import { useEditorLayout } from '@/hooks/useEditorLayout';
import { debounce } from '@/lib/utils';

const lowlight = createLowlight(common);

interface EditorProps {
  documentId: string;
}

export function Editor({ documentId }: EditorProps) {
  const documents = useDocumentStore((state) => state.documents);
  const updateContent = useDocumentStore((state) => state.updateContent);
  const fontSize = useUIStore((state) => state.fontSize);
  const fontFamily = useUIStore((state) => state.fontFamily);
  const setEditor = useEditorStore((state) => state.setEditor);
  const containerRef = useRef<HTMLDivElement>(null);
  const layoutMetrics = useEditorLayout(containerRef);

  const document = documents.find(d => d.id === documentId);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        codeBlock: false, // Disable default code block to use lowlight
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'plaintext',
      }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
      Typography,
    ],
    content: document?.content || '',
    editorProps: {
      attributes: {
        class: 'tiptap prose prose-sm sm:prose lg:prose-lg xl:prose-lg focus:outline-none w-full max-w-4xl',
        spellcheck: 'true',
      },
    },
    onUpdate: debounce(({ editor }) => {
      const markdown = editor.storage.markdown.getMarkdown();
      updateContent(documentId, markdown);
    }, 500),
  });

  useEffect(() => {
    setEditor(editor ?? null);
    return () => setEditor(null);
  }, [editor, setEditor]);

  // Update editor content when document changes
  useEffect(() => {
    if (editor && document && editor.storage.markdown.getMarkdown() !== document.content) {
      editor.commands.setContent(document.content);
    }
  }, [document?.content, editor, documentId]);

  // Apply font settings and responsive layout
  useEffect(() => {
    if (editor) {
      const editorElement = editor.view.dom;
      editorElement.style.fontSize = `${fontSize}px`;
      editorElement.style.fontFamily = fontFamily;
      
      // Apply responsive width based on layout metrics
      editorElement.style.maxWidth = `${layoutMetrics.contentWidth}px`;
      editorElement.style.width = '100%';
    }
  }, [fontSize, fontFamily, editor, layoutMetrics.contentWidth]);

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
      className="h-full w-full overflow-auto flex justify-center px-4 py-6"
      data-layout-metrics={JSON.stringify(layoutMetrics)}
    >
      <EditorContent 
        editor={editor} 
        className="h-full"
        style={{
          width: '100%',
          maxWidth: `${layoutMetrics.contentWidth}px`,
        }}
      />
    </div>
  );
}
