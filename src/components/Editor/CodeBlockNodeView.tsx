import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import mermaid from 'mermaid';
import { useEffect, useRef, useState } from 'react';
import { normalizeLanguage } from '@/lib/codeBlockUtils';

let mermaidInitialized = false;

export function CodeBlockNodeView({ node }: NodeViewProps) {
  const language = normalizeLanguage(node.attrs.language || '');
  const isMermaid = language === 'mermaid';
  const code = node.textContent ?? '';
  const renderIdRef = useRef(`mermaid-${Math.random().toString(36).slice(2)}`);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    if (!isMermaid) return;

    if (!mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'neutral',
      });
      mermaidInitialized = true;
    }
  }, [isMermaid]);

  useEffect(() => {
    if (!isMermaid) return;

    const trimmed = code.trim();
    if (trimmed.length === 0) {
      setSvg(null);
      setError(null);
      return;
    }

    let cancelled = false;
    const render = async () => {
      setIsRendering(true);
      try {
        const { svg: rendered } = await mermaid.render(renderIdRef.current, trimmed);
        if (!cancelled) {
          setSvg(rendered);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setSvg(null);
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
        }
      } finally {
        if (!cancelled) {
          setIsRendering(false);
        }
      }
    };

    void render();
    return () => {
      cancelled = true;
    };
  }, [code, isMermaid]);

  if (!isMermaid) {
    return (
      <NodeViewWrapper className="tiptap-codeblock">
        <pre className={`language-${language}`}>
          <NodeViewContent as="code" />
        </pre>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="tiptap-codeblock tiptap-codeblock-mermaid">
      <div className="mermaid-preview" contentEditable={false}>
        {isRendering && <div className="mermaid-status">Rendering diagram...</div>}
        {!isRendering && error && (
          <div className="mermaid-error">
            <strong>Mermaid error:</strong> {error}
          </div>
        )}
        {!isRendering && !error && svg && (
          <div
            className="mermaid-svg"
            // Mermaid returns sanitized SVG when securityLevel is strict.
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
      </div>
      <pre className="language-mermaid mermaid-source">
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
}
