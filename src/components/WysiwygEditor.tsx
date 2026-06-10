import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Bold, Italic, Underline, Strikethrough, Code, Quote,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link2, Image, Video,
  Minus, Type, RotateCcw, Smile, Heading1, Heading2, Heading3,
  FileCode, X, Check
} from 'lucide-react';

interface WysiwygEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder: string;
  locale: 'zh' | 'en';
  compact?: boolean;
}

const EMOJIS = ['😊', '😮', '👍', '🔥', '💻', '💡', '💯', '🚀', '👏', '🙌', '🎉', '🧠', '🤖', '🧐', '❤️', '⭐'];

const FONT_SIZES = [
  { label: '12px', value: '1' },
  { label: '14px', value: '2' },
  { label: '16px', value: '3' },
  { label: '18px', value: '4' },
  { label: '24px', value: '5' },
  { label: '32px', value: '6' },
  { label: '48px', value: '7' },
];

const COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#cccccc',
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1', '#a855f7',
];

function htmlToMarkdown(html: string): string {
  let md = html;
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
  md = md.replace(/<(strong|b)[^>]*>(.*?)<\/(strong|b)>/gi, '**$2**');
  md = md.replace(/<(em|i)[^>]*>(.*?)<\/(em|i)>/gi, '*$2*');
  md = md.replace(/<(s|strike|del)[^>]*>(.*?)<\/(s|strike|del)>/gi, '~~$2~~');
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n');
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, c) =>
    c.replace(/<[^>]+>/g, '').split('\n').map((l: string) => '> ' + l.trim()).join('\n') + '\n\n'
  );
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  md = md.replace(/<video[^>]*src="([^"]*)"[^>]*><\/video>/gi, '[视频]($1)');
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<hr\s*\/?>/gi, '---\n\n');
  md = md.replace(/<div[^>]*>(.*?)<\/div>/gi, '$1\n');
  md = md.replace(/<[^>]+>/g, '');
  md = md.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  md = md.replace(/\n{3,}/g, '\n\n');
  return md.trim();
}

function markdownToHtml(md: string): string {
  let html = md;
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
  html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px" />');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  html = html.replace(/^---$/gm, '<hr>');
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  html = '<p>' + html + '</p>';
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>(<h[1-6]>)/g, '$1');
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<pre>)/g, '$1');
  html = html.replace(/(<\/pre>)<\/p>/g, '$1');
  html = html.replace(/<p>(<blockquote>)/g, '$1');
  html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
  html = html.replace(/<p>(<hr>)<\/p>/g, '$1');
  return html;
}

function isHtmlContent(content: string): boolean {
  return /<(p|div|h[1-6]|br|img|a|strong|em|ul|ol|li|pre|code|blockquote|table|span|video)\b[^>]*>/i.test(content);
}

export default function WysiwygEditor({ value, onChange, placeholder, locale, compact = false }: WysiwygEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'wysiwyg' | 'markdown'>('wysiwyg');
  const [markdownText, setMarkdownText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageWidth, setImageWidth] = useState('100%');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoWidth, setVideoWidth] = useState('100%');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [resizing, setResizing] = useState(false);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (mode === 'wysiwyg' && editorRef.current && !initializedRef.current) {
      if (value && editorRef.current.innerHTML !== value) {
        const html = isHtmlContent(value) ? value : markdownToHtml(value);
        editorRef.current.innerHTML = html;
      }
      initializedRef.current = true;
    }
  }, [mode]);

  useEffect(() => {
    if (mode === 'wysiwyg' && editorRef.current && value !== editorRef.current.innerHTML) {
      if (!value || value === '') {
        editorRef.current.innerHTML = '';
      }
    }
  }, [value, mode]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const format = useCallback((command: string, argument: string = '') => {
    document.execCommand(command, false, argument);
    handleInput();
    if (editorRef.current) editorRef.current.focus();
  }, [handleInput]);

  const insertHtml = useCallback((html: string) => {
    document.execCommand('insertHTML', false, html);
    handleInput();
    if (editorRef.current) editorRef.current.focus();
  }, [handleInput]);

  const handleSwitchToMarkdown = () => {
    const html = editorRef.current?.innerHTML || value;
    const md = htmlToMarkdown(html);
    setMarkdownText(md);
    setMode('markdown');
    setSelectedElement(null);
  };

  const handleSwitchToWysiwyg = () => {
    const html = markdownToHtml(markdownText);
    if (editorRef.current) {
      editorRef.current.innerHTML = html;
      onChange(html);
    }
    setMode('wysiwyg');
  };

  const handleInsertImage = () => {
    if (!imageUrl.trim()) return;
    const w = imageWidth || '100%';
    const imgHtml = `<img src="${imageUrl}" style="max-width:100%;width:${w};border-radius:8px;display:block;margin:8px auto" alt="image" />`;
    insertHtml(imgHtml);
    setShowImageDialog(false);
    setImageUrl('');
    setImageWidth('100%');
  };

  const handleInsertVideo = () => {
    if (!videoUrl.trim()) return;
    const w = videoWidth || '100%';
    const videoHtml = `<video src="${videoUrl}" style="max-width:100%;width:${w};border-radius:8px;display:block;margin:8px auto" controls></video>`;
    insertHtml(videoHtml);
    setShowVideoDialog(false);
    setVideoUrl('');
    setVideoWidth('100%');
  };

  const handleInsertLink = () => {
    if (!linkUrl.trim()) return;
    const text = linkText || linkUrl;
    const linkHtml = `<a href="${linkUrl}" target="_blank" style="color:#3b82f6;text-decoration:underline">${text}</a>`;
    insertHtml(linkHtml);
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  };

  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG' || target.tagName === 'VIDEO') {
      setSelectedElement(target);
      (document as any).selection?.empty();
    } else {
      setSelectedElement(null);
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedElement) return;
    setResizing(true);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = selectedElement.offsetWidth;
  };

  useEffect(() => {
    if (!resizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!selectedElement) return;
      const delta = e.clientX - resizeStartX.current;
      const newWidth = Math.max(50, resizeStartWidth.current + delta);
      selectedElement.style.width = `${newWidth}px`;
      handleInput();
    };
    const handleMouseUp = () => setResizing(false);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, selectedElement, handleInput]);

  const setElementSize = (size: string) => {
    if (!selectedElement) return;
    selectedElement.style.width = size;
    handleInput();
  };

  const deleteSelectedElement = () => {
    if (!selectedElement) return;
    selectedElement.remove();
    setSelectedElement(null);
    handleInput();
  };

  const insertEmoji = (emoji: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertText', false, emoji);
      handleInput();
    }
    setShowEmojis(false);
  };

  const ToolbarButton = ({ onClick, title, active, children }: {
    onClick: () => void; title: string; active?: boolean; children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors cursor-pointer ${
        active
          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
          : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
      }`}
    >
      {children}
    </button>
  );

  const Separator = () => <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />;

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/30 bg-white dark:bg-slate-900 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-700">
        {!compact && (
          <>
            <ToolbarButton onClick={() => format('formatBlock', '<h1>')} title={locale === 'zh' ? '标题1' : 'Heading 1'}>
              <Heading1 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => format('formatBlock', '<h2>')} title={locale === 'zh' ? '标题2' : 'Heading 2'}>
              <Heading2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => format('formatBlock', '<h3>')} title={locale === 'zh' ? '标题3' : 'Heading 3'}>
              <Heading3 className="w-4 h-4" />
            </ToolbarButton>
            <Separator />
          </>
        )}

        <ToolbarButton onClick={() => format('bold')} title={locale === 'zh' ? '加粗' : 'Bold'}>
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => format('italic')} title={locale === 'zh' ? '斜体' : 'Italic'}>
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => format('underline')} title={locale === 'zh' ? '下划线' : 'Underline'}>
          <Underline className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => format('strikeThrough')} title={locale === 'zh' ? '删除线' : 'Strikethrough'}>
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        <Separator />

        {!compact && (
          <>
            <div className="relative">
              <ToolbarButton
                onClick={() => { setShowFontMenu(!showFontMenu); setShowColorMenu(false); }}
                title={locale === 'zh' ? '字体大小' : 'Font Size'}
              >
                <Type className="w-4 h-4" />
              </ToolbarButton>
              {showFontMenu && (
                <div className="absolute z-20 top-full mt-1 left-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 min-w-[100px]">
                  {FONT_SIZES.map(fs => (
                    <button
                      key={fs.value}
                      type="button"
                      onClick={() => { format('fontSize', fs.value); setShowFontMenu(false); }}
                      className="block w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      style={{ fontSize: fs.label }}
                    >
                      {fs.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <ToolbarButton
                onClick={() => { setShowColorMenu(!showColorMenu); setShowFontMenu(false); }}
                title={locale === 'zh' ? '文字颜色' : 'Text Color'}
              >
                <div className="w-4 h-4 rounded border border-slate-300 dark:border-slate-600" style={{ backgroundColor: '#3b82f6' }} />
              </ToolbarButton>
              {showColorMenu && (
                <div className="absolute z-20 top-full mt-1 left-0 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl grid grid-cols-5 gap-1 w-36">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => { format('foreColor', color); setShowColorMenu(false); }}
                      className="w-6 h-6 rounded border border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform cursor-pointer"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            </div>
            <Separator />

            <ToolbarButton onClick={() => format('justifyLeft')} title={locale === 'zh' ? '左对齐' : 'Align Left'}>
              <AlignLeft className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => format('justifyCenter')} title={locale === 'zh' ? '居中' : 'Align Center'}>
              <AlignCenter className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => format('justifyRight')} title={locale === 'zh' ? '右对齐' : 'Align Right'}>
              <AlignRight className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => format('justifyFull')} title={locale === 'zh' ? '两端对齐' : 'Justify'}>
              <AlignJustify className="w-4 h-4" />
            </ToolbarButton>
            <Separator />

            <ToolbarButton onClick={() => format('insertUnorderedList')} title={locale === 'zh' ? '无序列表' : 'Bullet List'}>
              <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => format('insertOrderedList')} title={locale === 'zh' ? '有序列表' : 'Numbered List'}>
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
            <Separator />

            <ToolbarButton onClick={() => format('formatBlock', '<blockquote>')} title={locale === 'zh' ? '引用' : 'Quote'}>
              <Quote className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => insertHtml('<pre style="background:#1e293b;color:#e2e8f0;padding:16px;border-radius:8px;overflow-x:auto;font-family:monospace;font-size:13px;margin:8px 0"><code>// code here\n</code></pre><p><br></p>')}
              title={locale === 'zh' ? '代码块' : 'Code Block'}
            >
              <FileCode className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => insertHtml('<hr style="border:none;border-top:1px solid #cbd5e1;margin:16px 0">')} title={locale === 'zh' ? '分割线' : 'Horizontal Rule'}>
              <Minus className="w-4 h-4" />
            </ToolbarButton>
            <Separator />
          </>
        )}

        <ToolbarButton onClick={() => setShowLinkDialog(true)} title={locale === 'zh' ? '插入链接' : 'Insert Link'}>
          <Link2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => setShowImageDialog(true)} title={locale === 'zh' ? '插入图片' : 'Insert Image'}>
          <Image className="w-4 h-4 text-emerald-500" />
        </ToolbarButton>
        {!compact && (
          <ToolbarButton onClick={() => setShowVideoDialog(true)} title={locale === 'zh' ? '插入视频' : 'Insert Video'}>
            <Video className="w-4 h-4 text-sky-500" />
          </ToolbarButton>
        )}
        <Separator />

        <div className="relative">
          <ToolbarButton onClick={() => setShowEmojis(!showEmojis)} title={locale === 'zh' ? '表情' : 'Emoji'}>
            <Smile className="w-4 h-4" />
          </ToolbarButton>
          {showEmojis && (
            <div className="absolute z-20 top-full mt-1 left-0 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl grid grid-cols-8 gap-1 w-44">
              {EMOJIS.map(emoji => (
                <button key={emoji} type="button" onClick={() => insertEmoji(emoji)} className="p-1 text-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-base cursor-pointer">
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <ToolbarButton onClick={() => format('removeFormat')} title={locale === 'zh' ? '清除格式' : 'Clear Format'}>
          <RotateCcw className="w-4 h-4" />
        </ToolbarButton>

        {!compact && (
          <>
            <Separator />
            <div className="flex items-center gap-0.5 ml-auto bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => { if (mode === 'markdown') handleSwitchToWysiwyg(); }}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                  mode === 'wysiwyg' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                {locale === 'zh' ? '所见即所得' : 'Rich Text'}
              </button>
              <button
                type="button"
                onClick={() => { if (mode === 'wysiwyg') handleSwitchToMarkdown(); }}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                  mode === 'markdown' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                Markdown
              </button>
            </div>
          </>
        )}
      </div>

      {/* Insert Image Dialog */}
      {showImageDialog && (
        <div className="p-3 bg-blue-50/50 dark:bg-slate-950/60 border-b border-blue-200 dark:border-slate-700 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-slate-700 dark:text-slate-300">🖼️ {locale === 'zh' ? '插入图片' : 'Insert Image'}</span>
            <button type="button" onClick={() => setShowImageDialog(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="md:col-span-2">
              <input type="text" placeholder="https://example.com/image.png" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
            </div>
            <div>
              <input type="text" placeholder={locale === 'zh' ? '宽度 如 100% 或 400px' : 'Width e.g. 100% or 400px'} value={imageWidth} onChange={e => setImageWidth(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
            </div>
          </div>
          {imageUrl && (
            <div className="bg-white dark:bg-slate-900 rounded-lg p-2 border border-slate-200 dark:border-slate-700">
              <img src={imageUrl} alt="preview" className="max-w-full max-h-48 rounded mx-auto" onError={e => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
          <button type="button" onClick={handleInsertImage} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> {locale === 'zh' ? '插入' : 'Insert'}
          </button>
        </div>
      )}

      {/* Insert Video Dialog */}
      {showVideoDialog && (
        <div className="p-3 bg-blue-50/50 dark:bg-slate-950/60 border-b border-blue-200 dark:border-slate-700 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-slate-700 dark:text-slate-300">🎥 {locale === 'zh' ? '插入视频' : 'Insert Video'}</span>
            <button type="button" onClick={() => setShowVideoDialog(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="md:col-span-2">
              <input type="text" placeholder="https://example.com/video.mp4" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
            </div>
            <div>
              <input type="text" placeholder={locale === 'zh' ? '宽度 如 100% 或 400px' : 'Width e.g. 100% or 400px'} value={videoWidth} onChange={e => setVideoWidth(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
            </div>
          </div>
          {videoUrl && (
            <div className="bg-white dark:bg-slate-900 rounded-lg p-2 border border-slate-200 dark:border-slate-700">
              <video src={videoUrl} controls className="max-w-full max-h-48 rounded mx-auto" onError={e => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
          <button type="button" onClick={handleInsertVideo} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> {locale === 'zh' ? '插入' : 'Insert'}
          </button>
        </div>
      )}

      {/* Insert Link Dialog */}
      {showLinkDialog && (
        <div className="p-3 bg-blue-50/50 dark:bg-slate-950/60 border-b border-blue-200 dark:border-slate-700 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-slate-700 dark:text-slate-300">🔗 {locale === 'zh' ? '插入链接' : 'Insert Link'}</span>
            <button type="button" onClick={() => setShowLinkDialog(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input type="text" placeholder="https://example.com" value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
            <input type="text" placeholder={locale === 'zh' ? '显示文字（可选）' : 'Display text (optional)'} value={linkText} onChange={e => setLinkText(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
          </div>
          <button type="button" onClick={handleInsertLink} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> {locale === 'zh' ? '插入' : 'Insert'}
          </button>
        </div>
      )}

      {/* Selected Element Resize Toolbar */}
      {selectedElement && mode === 'wysiwyg' && (
        <div className="p-2 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/40 flex items-center gap-2 flex-wrap animate-fadeIn">
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
            {selectedElement.tagName === 'IMG' ? '🖼️' : '🎥'} {locale === 'zh' ? '调整大小' : 'Resize'}:
          </span>
          {['25%', '50%', '75%', '100%'].map(size => (
            <button key={size} type="button" onClick={() => setElementSize(size)}
              className="text-[11px] font-bold px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300 cursor-pointer">
              {size}
            </button>
          ))}
          <span className="text-slate-400 text-xs">|</span>
          <span className="text-[11px] text-slate-500 font-mono">{selectedElement.offsetWidth}px</span>
          <span className="text-slate-400 text-xs">|</span>
          <button type="button" onMouseDown={handleResizeMouseDown}
            className="text-[11px] font-bold px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 cursor-pointer">
            {locale === 'zh' ? '🖱️ 拖拽调整' : '🖱️ Drag resize'}
          </button>
          <button type="button" onClick={deleteSelectedElement}
            className="text-[11px] font-bold px-2 py-1 rounded bg-rose-100 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 cursor-pointer ml-auto">
            {locale === 'zh' ? '删除' : 'Delete'}
          </button>
        </div>
      )}

      {/* Editor Area */}
      {mode === 'wysiwyg' ? (
        <div className="relative">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onClick={handleEditorClick}
            className="outline-none min-h-[200px] p-4 text-slate-800 dark:text-slate-200 text-sm leading-relaxed prose dark:prose-invert max-w-none focus:outline-none"
            style={{ wordBreak: 'break-word' }}
          />
          {(!value || value === '' || value === '<br>') && (
            <div className="absolute top-4 left-4 right-4 pointer-events-none text-slate-400 dark:text-slate-600 text-sm select-none">
              {placeholder}
            </div>
          )}
        </div>
      ) : (
        <textarea
          value={markdownText}
          onChange={e => setMarkdownText(e.target.value)}
          className="w-full min-h-[200px] p-4 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm font-mono outline-none resize-y border-0 leading-relaxed"
          placeholder={locale === 'zh' ? '在这里使用 Markdown 语法编写...' : 'Write in Markdown syntax here...'}
        />
      )}
    </div>
  );
}