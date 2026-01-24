import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useEffect } from 'react';
import { useDocumentStore } from '@/stores/documentStore';
import { useUIStore } from '@/stores/uiStore';
import { useEditorStore } from '@/stores/editorStore';
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
        class: 'tiptap prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none',
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

  // Apply font settings
  useEffect(() => {
    if (editor) {
      const editorElement = editor.view.dom;
      editorElement.style.fontSize = `${fontSize}px`;
      editorElement.style.fontFamily = fontFamily;
    }
  }, [fontSize, fontFamily, editor]);

  if (!document) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No document selected
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <EditorContent editor={editor} className="h-full" />
    </div>
  );
}
