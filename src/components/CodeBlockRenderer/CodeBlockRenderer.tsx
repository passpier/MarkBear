import React, { useState, useRef } from 'react';
import { Copy, Check } from 'lucide-react';
import { normalizeLanguage } from '@/lib/codeBlockUtils';
import './CodeBlockRenderer.css';

export interface CodeBlockMetadata {
  language: string;
  filename?: string;
  highlights: number[];
  showLineNumbers?: boolean;
}

interface CodeBlockRendererProps {
  code: string;
  language: string;
  metadata?: CodeBlockMetadata;
  children?: React.ReactNode; // For pre-rendered content from Tiptap
}

export function CodeBlockRenderer({
  code,
  language,
  metadata,
  children,
}: CodeBlockRendererProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);

  const displayLanguage = language || metadata?.language || 'plaintext';
  const filename = metadata?.filename;
  const normalizedLanguage = normalizeLanguage(displayLanguage);

  const handleCopy = async () => {
    try {
      const textToCopy = codeRef.current?.textContent || code;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className={`code-block-container ${filename ? 'with-filename' : ''}`}>
      {filename && <div className="code-filename">{filename}</div>}

      <div className="code-block-wrapper">
        {normalizedLanguage !== 'plaintext' && (
          <div className="language-label" title={`Language: ${normalizedLanguage}`}>
            {normalizedLanguage}
          </div>
        )}

        <button
          className={`copy-button ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          aria-label={copied ? 'Code copied to clipboard' : 'Copy code to clipboard'}
          title="Copy code to clipboard"
          type="button"
        >
          {copied ? (
            <>
              <Check size={14} />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>

        <div className="code-content-wrapper">
          <pre
            ref={codeRef}
            className={`language-${normalizedLanguage} code-block`}
            role="region"
            aria-label={`Code block in ${normalizedLanguage}`}
          >
            {children || code}
          </pre>
        </div>
      </div>
    </div>
  );
}
