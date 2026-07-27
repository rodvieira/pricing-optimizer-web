"use client";

import { Check, Copy } from "lucide-react";
import { Highlight } from "prism-react-renderer";
import { useState } from "react";
import { cn } from "../lib/cn";
import { codePreviewTheme } from "./prism-theme";

export interface CodePreviewProps {
  readonly code: string;
  /** Any Prism language name/alias — this repo only ever passes tsx, html, or json. */
  readonly language: string;
  readonly title: string;
  readonly maxHeight?: number;
  readonly className?: string;
}

/**
 * Owned replacement for Astryx's CodeBlock, over prism-react-renderer.
 * shadcn/ui ships no code-preview primitive, and this repo's own palette
 * (via codePreviewTheme) is the whole point — see research.md Clarification
 * 1 for why a bundled preset (or dropping highlighting entirely) was
 * rejected. Reimplements the four props the one real caller
 * (export-dialog.tsx) used from Astryx: a title bar, a copy button, line
 * numbers, and a height cap with the code scrolling inside its own
 * container rather than the page.
 */
export function CodePreview({
  code,
  language,
  title,
  maxHeight = 420,
  className,
}: CodePreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={cn("overflow-hidden rounded-lg border border-border", className)}>
      <div className="flex items-center justify-between border-border border-b bg-card px-3 py-2">
        <span className="font-mono text-secondary text-xs">{title}</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy code"}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 font-medium text-secondary text-xs hover:bg-muted hover:text-primary"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <Highlight theme={codePreviewTheme} code={code.trimEnd()} language={language}>
        {({ className: highlightClassName, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={cn(
              highlightClassName,
              "overflow-auto p-3 font-mono text-xs leading-relaxed",
            )}
            style={{ ...style, maxHeight }}
          >
            {tokens.map((line, lineIndex) => {
              const lineProps = getLineProps({ line });
              return (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: token lines have no stable identity of their own.
                  key={lineIndex}
                  {...lineProps}
                  className={cn(lineProps.className, "table-row")}
                >
                  <span className="table-cell select-none pr-4 text-right text-secondary opacity-60">
                    {lineIndex + 1}
                  </span>
                  <span className="table-cell">
                    {line.map((token, tokenIndex) => {
                      const tokenProps = getTokenProps({ token });
                      // biome-ignore lint/suspicious/noArrayIndexKey: tokens have no stable identity of their own.
                      return <span key={tokenIndex} {...tokenProps} />;
                    })}
                  </span>
                </div>
              );
            })}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
