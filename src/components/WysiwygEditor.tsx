import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, Underline, Code, Quote, RefreshCw, Smile } from 'lucide-react';

interface WysiwygEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder: string;
  locale: 'zh' | 'en';
}

const EMOJIS = ['😊', '😮', '👍', '🔥', '💻', '💡', '💯', '🚀', '👏', '🙌', '🎉', '🧠', '🤖', '🧐'];

export default function WysiwygEditor({ value, onChange, placeholder, locale }: WysiwygEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showEmojis, setShowEmojis] = useState(false);

  // Synchronize initial value once if internal editor is empty
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      // Avoid setting innerHTML unnecessarily to prevent losing cursor position
      if (value === '') {
        editorRef.current.innerHTML = '';
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const format = (command: string, argument: string = '') => {
    document.execCommand(command, false, argument);
    handleInput();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const insertEmoji = (emoji: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertText', false, emoji);
      handleInput();
    }
    setShowEmojis(false);
  };

  const clearFormatting = () => {
    format('removeFormat');
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-sky-500/50 bg-white dark:bg-slate-900 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => format('bold')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          title={locale === 'zh' ? '加粗' : 'Bold'}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => format('italic')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          title={locale === 'zh' ? '斜体' : 'Italic'}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => format('underline')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          title={locale === 'zh' ? '下划线' : 'Underline'}
        >
          <Underline className="w-4 h-4" />
        </button>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
        
        <button
          type="button"
          onClick={() => format('insertHTML', '<pre class="inline-code bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400"><code>' + document.getSelection()?.toString() + '</code></pre>')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          title={locale === 'zh' ? '行内代码' : 'Inline Code'}
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => format('insertHTML', '<blockquote class="border-l-4 border-slate-300 dark:border-slate-700 pl-3 italic text-slate-600 dark:text-slate-400 my-2">' + document.getSelection()?.toString() + '</blockquote>')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          title={locale === 'zh' ? '引用块' : 'Quote'}
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojis(!showEmojis)}
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors flex items-center"
            title={locale === 'zh' ? '表情符号' : 'Emojis'}
          >
            <Smile className="w-4 h-4" />
          </button>
          
          {showEmojis && (
            <div className="absolute z-10 top-full mt-1 left-0 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl grid grid-cols-7 gap-1 w-48">
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="p-1 text-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all text-base"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={clearFormatting}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors ml-auto"
          title={locale === 'zh' ? '清除格式' : 'Clear Style'}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Space */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="outline-none min-h-[140px] p-4 text-slate-800 dark:text-slate-200 text-sm leading-relaxed prose dark:prose-invert max-w-none"
          style={{ wordBreak: 'break-word' }}
        />
        {value === '' && (
          <div className="absolute top-4 left-4 right-4 pointer-events-none text-slate-400 dark:text-slate-600 text-sm select-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
