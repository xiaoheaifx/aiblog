import React from 'react';

/**
 * Super lightweight but high-fidelity Markdown parser that emits styled JSX nodes.
 * This guarantees gorgeous, secure markup without heavy external engine conflicts in React 19.
 */
export function renderStyledMarkdown(markdownText: string) {
  if (!markdownText) return null;

  const lines = markdownText.split('\n');
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeBlockLang = '';

  return (
    <div className="space-y-4">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        // 1. Code Block starts or ends
        if (trimmed.startsWith('```')) {
          if (inCodeBlock) {
            inCodeBlock = false;
            const fullCode = codeBlockLines.join('\n');
            codeBlockLines = [];
            return (
              <pre key={`code-${index}`} className="font-mono text-[11px] sm:text-xs bg-slate-950 text-slate-100 p-4 rounded-xl overflow-x-auto border border-slate-850 my-4 shadow-inner relative">
                <span className="absolute right-3 top-2 text-[9px] uppercase tracking-wider font-bold text-slate-500 font-sans">
                  {codeBlockLang || 'code'}
                </span>
                <code>{fullCode}</code>
              </pre>
            );
          } else {
            inCodeBlock = true;
            codeBlockLang = trimmed.slice(3) || 'javascript';
            return null;
          }
        }

        if (inCodeBlock) {
          codeBlockLines.push(line);
          return null;
        }

        // 2. Headers: ## / ### or h1-h4
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={index} className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight pt-5 pb-1 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
              <span className="w-1.5 h-4.5 bg-sky-500 rounded-sm" />
              <span>{trimmed.slice(3)}</span>
            </h3>
          );
        }
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={index} className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight pt-3">
              <span>{trimmed.slice(4)}</span>
            </h4>
          );
        }

        // 3. Horizontal Rule
        if (trimmed === '---') {
          return <hr key={index} className="border-t border-slate-200 dark:border-slate-800 my-6" />;
        }

        // 4. Blockquotes
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote key={index} className="border-l-4 border-slate-300 dark:border-slate-700 pl-4 py-1 italic text-slate-600 dark:text-slate-400 my-3 font-medium bg-slate-50 dark:bg-slate-950/40 rounded-r-lg">
              {trimmed.slice(2)}
            </blockquote>
          );
        }

        // 5. Bullet Lists
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <ul key={index} className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-350 space-y-1">
              <li>{parseInlineElements(trimmed.slice(2))}</li>
            </ul>
          );
        }

        // 6. Numbered Lists
        if (/^\d+\.\s/.test(trimmed)) {
          const content = trimmed.replace(/^\d+\.\s/, '');
          return (
            <ol key={index} className="list-decimal pl-5 text-sm text-slate-600 dark:text-slate-350 space-y-1">
              <li>{parseInlineElements(content)}</li>
            </ol>
          );
        }

        // 7. Table handling - very basic markdown style
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
          if (trimmed.includes('---')) return null; // Skip divisor line
          const cells = trimmed.split('|').map(c => c.trim()).filter((_, i, a) => i > 0 && i < a.length - 1);
          const isHeader = index > 0 && lines[index - 1] === '' || index === 0;
          return (
            <div key={index} className="overflow-x-auto my-2">
              <table className="w-full text-slate-700 dark:text-slate-300 text-xs text-left border-collapse">
                <tbody>
                  <tr className={isHeader ? 'bg-slate-100 dark:bg-slate-850 font-bold' : ''}>
                    {cells.map((cell, idx) => (
                      <td key={idx} className="border border-slate-200 dark:border-slate-800 px-3 py-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          );
        }

        // 8. Plain Paragraph with inline formatting parsed
        if (trimmed === '') return <div key={index} className="h-2" />;

        return (
          <p key={index} className="text-sm leading-relaxed text-slate-600 dark:text-slate-350">
            {parseInlineElements(line)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Handles bold (**text**), inline code (`code`), or key features highlighting.
 */
function parseInlineElements(text: string) {
  // Let's do regex replacements to handle bold and inline code safely
  const boldRegex = /\*\*(.*?)\*\*/g;
  const inlineCodeRegex = /`(.*?)`/g;

  let parts: any[] = [text];

  // Helper inside helper to replace tokens with JSX
  // 1. Process Bold tokens
  let newParts: any[] = [];
  parts.forEach(part => {
    if (typeof part !== 'string') {
      newParts.push(part);
      return;
    }
    const splits = part.split(boldRegex);
    splits.forEach((split, idx) => {
      if (idx % 2 === 1) {
        newParts.push(<strong key={`b-${idx}`} className="font-extrabold text-slate-900 dark:text-white">{split}</strong>);
      } else {
        newParts.push(split);
      }
    });
  });
  parts = newParts;

  // 2. Process Inline Code tokens
  newParts = [];
  parts.forEach(part => {
    if (typeof part !== 'string') {
      newParts.push(part);
      return;
    }
    const splits = part.split(inlineCodeRegex);
    splits.forEach((split, idx) => {
      if (idx % 2 === 1) {
        newParts.push(
          <code key={`code-${idx}`} className="px-1.5 py-0.5 rounded font-mono text-xs text-pink-600 bg-slate-100 dark:text-pink-400 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            {split}
          </code>
        );
      } else {
        newParts.push(split);
      }
    });
  });
  parts = newParts;

  return <>{parts}</>;
}
