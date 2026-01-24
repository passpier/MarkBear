import { useEffect, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import { open, save } from '@tauri-apps/plugin-dialog';
import { Editor } from '@/components/Editor/Editor';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { useDocumentStore } from '@/stores/documentStore';
import { useUIStore } from '@/stores/uiStore';
import { useEditorStore } from '@/stores/editorStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import {
  FileText,
} from 'lucide-react';

function App() {
  const documents = useDocumentStore((state) => state.documents);
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId);
  const saveDocument = useDocumentStore((state) => state.saveDocument);
  const closeDocument = useDocumentStore((state) => state.closeDocument);
  const updateContent = useDocumentStore((state) => state.updateContent);
  const createNewDocument = useDocumentStore((state) => state.createNewDocument);
  const loadDocument = useDocumentStore((state) => state.loadDocument);
  
  const theme = useUIStore((state) => state.theme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const sidebarVisible = useUIStore((state) => state.sidebarVisible);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const hasInitializedDocument = useRef(false);
  const editor = useEditorStore((state) => state.editor);

  // Initialize auto-save
  useAutoSave();

  const activeDocument = documents.find(d => d.id === activeDocumentId);

  // Apply theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Ensure a blank document exists for first launch
  useEffect(() => {
    if (!hasInitializedDocument.current && documents.length === 0 && !activeDocumentId) {
      createNewDocument();
      hasInitializedDocument.current = true;
    }
  }, [documents.length, activeDocumentId, createNewDocument]);

  const handleOpenFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: 'Markdown',
            extensions: ['md', 'markdown'],
          },
        ],
      });

      const filePath = Array.isArray(selected) ? selected[0] : selected;
      if (filePath && typeof filePath === 'string') {
        await loadDocument(filePath);
      }
    } catch (error) {
      console.error('Open file failed:', error);
    }
  };

  const handleSaveAs = async () => {
    if (!activeDocumentId || !activeDocument) return;

    try {
      const filePath = await save({
        defaultPath: 'untitled.md',
        filters: [{
          name: 'Markdown',
          extensions: ['md', 'markdown']
        }]
      });

      if (filePath) {
        // Update document with new path
        updateContent(activeDocumentId, activeDocument.content);
        const doc = { ...activeDocument, path: filePath };
        useDocumentStore.setState((state) => ({
          documents: state.documents.map(d =>
            d.id === activeDocumentId ? doc : d
          )
        }));
        await saveDocument(activeDocumentId);
      }
    } catch (error) {
      console.error('Save as failed:', error);
    }
  };

  const handleManualSave = async () => {
    if (!activeDocumentId || !activeDocument) return;

    if (activeDocument.path) {
      try {
        await saveDocument(activeDocumentId);
      } catch (error) {
        console.error('Save failed:', error);
      }
    } else {
      handleSaveAs();
    }
  };

  const runEditorCommand = (payload: { command: string; level?: number }) => {
    if (!editor) return;

    const chain = editor.chain().focus();
    switch (payload.command) {
      case 'bold':
        chain.toggleBold().run();
        break;
      case 'italic':
        chain.toggleItalic().run();
        break;
      case 'strike':
        chain.toggleStrike().run();
        break;
      case 'inline_code':
        chain.toggleCode().run();
        break;
      case 'paragraph':
        chain.setParagraph().run();
        break;
      case 'heading':
        if (payload.level) {
          chain.toggleHeading({ level: payload.level as 1 | 2 | 3 | 4 | 5 | 6 }).run();
        }
        break;
      case 'bullet_list':
        chain.toggleBulletList().run();
        break;
      case 'ordered_list':
        chain.toggleOrderedList().run();
        break;
      case 'blockquote':
        chain.toggleBlockquote().run();
        break;
      case 'code_block':
        chain.toggleCodeBlock().run();
        break;
      case 'horizontal_rule':
        chain.setHorizontalRule().run();
        break;
      case 'undo':
        editor.commands.undo();
        break;
      case 'redo':
        editor.commands.redo();
        break;
      default:
        break;
    }
  };

  // Native menu events
  useEffect(() => {
    let unlisteners: Array<() => void> = [];

    const setupListeners = async () => {
      try {
        const listeners = await Promise.all([
          listen('menu-new-file', () => {
            createNewDocument();
          }),
          listen('menu-open-file', () => {
            void handleOpenFile();
          }),
          listen('menu-save-file', () => {
            void handleManualSave();
          }),
          listen('menu-save-as', () => {
            void handleSaveAs();
          }),
          listen('menu-close-document', () => {
            if (activeDocumentId) {
              closeDocument(activeDocumentId);
            }
          }),
          listen('menu-toggle-sidebar', () => {
            toggleSidebar();
          }),
          listen('menu-toggle-theme', () => {
            toggleTheme();
          }),
          listen<{ command: string; level?: number }>(
            'menu-editor-command',
            (event) => {
              runEditorCommand(event.payload);
            }
          ),
        ]);
        
        unlisteners = listeners;
      } catch (error) {
        console.error('Failed to setup menu event listeners:', error);
      }
    };

    void setupListeners();

    return () => {
      unlisteners.forEach(unlisten => unlisten());
    };
  }, [editor, activeDocumentId, createNewDocument, closeDocument, toggleSidebar, toggleTheme]);

  return (
    <div className="h-screen flex flex-col">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebarVisible && (
          <div className="w-72 flex-shrink-0">
            <Sidebar />
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeDocumentId ? (
            <>
              <div className="flex-1 overflow-hidden">
                <Editor documentId={activeDocumentId} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">No document open</p>
                <p className="text-sm mt-2">
                  Create a new document or open an existing one
                </p>
                <div className="mt-6 flex items-center justify-center gap-2 text-sm">
                  <span className="inline-block w-0.5 h-5 bg-muted-foreground/70 animate-pulse" />
                  <span>Start writing...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
