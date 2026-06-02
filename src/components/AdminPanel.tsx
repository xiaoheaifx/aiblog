import React, { useState, useRef } from 'react';
import { Post, Comment, UserStats } from '../types';
import { translations } from '../locales';
import { renderStyledMarkdown } from '../utils';
import { 
  X, BarChart2, BookOpen, MessageSquare, Tag, User, 
  Trash2, Edit3, Pin, Plus, Check, CheckCircle2, 
  Settings, ArrowLeft, Image, Sparkles, Eye, EyeOff,
  Video, Type, Bold, Italic, Code, Quote, RefreshCw, Layers
} from 'lucide-react';

interface AdminPanelProps {
  posts: Post[];
  comments: Comment[];
  stats: UserStats;
  locale: 'zh' | 'en';
  onAddPost: (post: Post) => void;
  onUpdatePost: (post: Post) => void;
  onDeletePost: (id: string) => void;
  onDeleteComment: (id: string) => void;
  onToggleHideComment: (id: string) => void;
  onUpdateStats: (stats: UserStats) => void;
  onClose: () => void;
  categories: string[];
  tags: string[];
  onAddCategory: (cat: string) => void;
  onAddTag: (tag: string) => void;
  onDeleteCategory: (cat: string) => void;
  onDeleteTag: (tag: string) => void;
}

export default function AdminPanel({
  posts,
  comments,
  stats,
  locale,
  onAddPost,
  onUpdatePost,
  onDeletePost,
  onDeleteComment,
  onToggleHideComment,
  onUpdateStats,
  onClose,
  categories,
  tags,
  onAddCategory,
  onAddTag,
  onDeleteCategory,
  onDeleteTag,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'posts' | 'comments' | 'tags' | 'profile'>('dashboard');
  
  // Post states
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Custom form inputs for posts (No English duplicate input controls will be rendered in form)
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formCover, setFormCover] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formIsPinned, setFormIsPinned] = useState(false);

  // Editor specific states
  const [editorWriteMode, setEditorWriteMode] = useState<boolean>(true); // true = raw editor, false = visual live compile rendering preview
  const [insertOverlayType, setInsertOverlayType] = useState<'image' | 'video' | 'fontSize' | null>(null);
  
  // Insertion Overlay states
  const [overlayUrl, setOverlayUrl] = useState('');
  const [overlayWidth, setOverlayWidth] = useState('100%');
  const [overlayHeight, setOverlayHeight] = useState('auto');
  const [overlayFontSize, setOverlayFontSize] = useState('16px');

  // Textarea Ref for cursor manipulation
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // New item creators
  const [newCatInput, setNewCatInput] = useState('');
  const [newTagInput, setNewTagInput] = useState('');

  // Stats edit states
  const [editStatsViews, setEditStatsViews] = useState(stats.visitCount);

  // Helper insertion function (at cursor)
  const insertTextAtCursor = (beforeText: string, afterText: string = '') => {
    if (!textareaRef.current) {
      setFormContent(prev => prev + beforeText + afterText);
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;

    const selectedText = currentText.substring(start, end);
    const replacement = beforeText + (selectedText || '') + afterText;

    const newContent = currentText.substring(0, start) + replacement + currentText.substring(end);
    setFormContent(newContent);

    // Refocus and place cursor
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + beforeText.length + selectedText.length + afterText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  const handleInsertImage = () => {
    if (!overlayUrl.trim()) return;
    const imgHtml = `<img src="${overlayUrl}" width="${overlayWidth || '100%'}" height="${overlayHeight || 'auto'}" style="max-width:100%; border-radius:12px; margin: 12px auto; display: block;" alt="Uploaded Image" />`;
    insertTextAtCursor(imgHtml);
    setOverlayUrl('');
    setInsertOverlayType(null);
  };

  const handleInsertVideo = () => {
    if (!overlayUrl.trim()) return;
    const videoHtml = `\n<video src="${overlayUrl}" width="${overlayWidth || '100%'}" controls style="max-width:100%; border-radius:12px; margin: 12px auto; display: block;"></video>\n`;
    insertTextAtCursor(videoHtml);
    setOverlayUrl('');
    setInsertOverlayType(null);
  };

  const handleInsertFontSize = () => {
    insertTextAtCursor(`<span style="font-size: ${overlayFontSize};">`, '</span>');
    setInsertOverlayType(null);
  };

  // Reset form inputs
  const resetForm = () => {
    setFormTitle('');
    setFormCategory(categories[0] || '技术干货');
    setFormTags('');
    setFormCover('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800');
    setFormExcerpt('');
    setFormContent('');
    setFormIsPinned(false);
    setEditingPost(null);
    setIsCreating(false);
    setEditorWriteMode(true);
    setInsertOverlayType(null);
  };

  const startCreating = () => {
    resetForm();
    setIsCreating(true);
  };

  const startEditing = (post: Post) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormCategory(post.category);
    setFormTags(post.tags.join(', '));
    setFormCover(post.coverImage);
    setFormExcerpt(post.excerpt);
    setFormContent(post.content);
    setFormIsPinned(!!post.isPinned);
    setIsCreating(true);
    setEditorWriteMode(true);
    setInsertOverlayType(null);
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formContent) {
      alert(locale === 'zh' ? '标题和内容为必填项！' : 'Title and Content are required!');
      return;
    }

    const tagList = formTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const postData: Post = {
      id: editingPost ? editingPost.id : 'post-' + Date.now(),
      title: formTitle,
      titleEn: formTitle, // Simple automatic synchronization for English schema robustness
      excerpt: formExcerpt || formContent.slice(0, 100) + '...',
      excerptEn: formExcerpt || formContent.slice(0, 100) + '...', 
      content: formContent,
      contentEn: formContent, 
      coverImage: formCover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
      date: editingPost ? editingPost.date : new Date().toISOString().split('T')[0],
      likes: editingPost ? editingPost.likes : 0,
      views: editingPost ? editingPost.views : 0,
      tags: tagList,
      category: formCategory,
      categoryEn: formCategory,
      isPinned: formIsPinned
    };

    if (editingPost) {
      onUpdatePost(postData);
    } else {
      onAddPost(postData);
    }
    resetForm();
  };

  const handleUpdateViews = () => {
    onUpdateStats({
      ...stats,
      visitCount: Number(editStatsViews)
    });
    alert(locale === 'zh' ? '全局真实统计数据保存成功！' : 'Visits metrics modified successfully!');
  };

  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
  const totalViews = posts.reduce((sum, p) => sum + p.views, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-[#070b13]/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-5 overflow-hidden text-slate-800 dark:text-slate-100 font-sans animate-fadeIn">
      <div className="bg-slate-50 dark:bg-slate-900 w-full h-full max-w-7xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden transition-all">
        
        {/* Workspace Controller Top bar (Gemini Style) */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                {locale === 'zh' ? '小何AI分享 · 自主创作控制中心' : 'XiaoHe AI Share · Creator Workspace'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {locale === 'zh' ? '在这里高效管理您的优质创作，定制去重统计，处理公开留言记录' : 'Customize stats baseline, write posts, manage tags and instant commentaries'}
              </p>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 transition-all text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-transparent cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Box */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Navigation Sidebar of Admin Panel */}
          <div className="w-16 sm:w-[220px] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 p-2 sm:p-4 flex flex-col gap-1.5 shrink-0">
            <button
              onClick={() => { setActiveTab('dashboard'); resetForm(); }}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard' 
                  ? 'bg-indigo-600/10 text-indigo-600 dark:bg-sky-600/20 dark:text-sky-400 border border-indigo-205 dark:border-sky-500/30 shadow-sm' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-5 h-5 shrink-0" />
              <span className="hidden sm:inline">{locale === 'zh' ? '数据总览' : 'Data Overview'}</span>
            </button>

            <button
              onClick={() => { setActiveTab('posts'); resetForm(); }}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'posts' 
                  ? 'bg-indigo-600/10 text-indigo-600 dark:bg-sky-600/20 dark:text-sky-400 border border-indigo-205 dark:border-sky-500/30 shadow-sm' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-5 h-5 shrink-0" />
              <span className="hidden sm:inline">{locale === 'zh' ? '文章管理' : 'Publications'}</span>
            </button>

            <button
              onClick={() => { setActiveTab('comments'); resetForm(); }}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'comments' 
                  ? 'bg-indigo-600/10 text-indigo-600 dark:bg-sky-600/20 dark:text-sky-400 border border-indigo-205 dark:border-sky-500/30 shadow-sm' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-5 h-5 shrink-0" />
              <span className="hidden sm:inline">{locale === 'zh' ? '评论管理' : 'Comments'}</span>
            </button>

            <button
              onClick={() => { setActiveTab('tags'); resetForm(); }}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'tags' 
                  ? 'bg-indigo-600/10 text-indigo-600 dark:bg-sky-600/20 dark:text-sky-400 border border-indigo-205 dark:border-sky-500/30 shadow-sm' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Tag className="w-5 h-5 shrink-0" />
              <span className="hidden sm:inline">{locale === 'zh' ? '分类/标签' : 'Categories/Tags'}</span>
            </button>

            <button
              onClick={() => { setActiveTab('profile'); resetForm(); }}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'profile' 
                  ? 'bg-indigo-600/10 text-indigo-600 dark:bg-sky-600/20 dark:text-sky-400 border border-indigo-205 dark:border-sky-500/30 shadow-sm' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Settings className="w-5 h-5 shrink-0" />
              <span className="hidden sm:inline">{locale === 'zh' ? '网站设置' : 'System Settings'}</span>
            </button>
          </div>

          {/* Main workspace scrollable pane */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white dark:bg-slate-900/40">

            {/* TAB 1: DASHBOARD OVERVIEW */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-[11px] font-bold text-slate-400 tracking-wider block uppercase">{locale === 'zh' ? '文章总数' : 'Total Articles'}</span>
                    <strong className="text-xl sm:text-2xl font-black font-mono text-cyan-600 dark:text-cyan-400 block mt-1">{posts.length}</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-[11px] font-bold text-slate-400 tracking-wider block uppercase">{locale === 'zh' ? '真实全站访问量 (IP去重)' : 'Total Visits (Unique)'}</span>
                    <strong className="text-xl sm:text-2xl font-black font-mono text-violet-600 dark:text-violet-400 block mt-1">{stats.visitCount}</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-[11px] font-bold text-slate-400 tracking-wider block uppercase">{locale === 'zh' ? '累积获取点赞' : 'Appreciations'}</span>
                    <strong className="text-xl sm:text-2xl font-black font-mono text-amber-500 block mt-1">{totalLikes}</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-[11px] font-bold text-slate-400 tracking-wider block uppercase">{locale === 'zh' ? '全站独立评论' : 'Comments Count'}</span>
                    <strong className="text-xl sm:text-2xl font-black font-mono text-pink-500 dark:text-pink-400 block mt-1">{comments.length}</strong>
                  </div>
                </div>

                {/* Dashboard Greetings */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-950/60 dark:to-slate-900/50 p-6 rounded-2xl border border-indigo-100 dark:border-slate-800/80 space-y-2">
                  <h3 className="text-xs sm:text-sm font-bold text-indigo-700 dark:text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 fill-current text-indigo-500 dark:text-sky-400" />
                    <span>{locale === 'zh' ? '小何，欢迎进入您的数字工作台' : 'Welcome back to your central console'}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-650 dark:text-slate-300 leading-relaxed font-medium">
                    {locale === 'zh' 
                      ? '本系统已成功应用全周期的“IP及会话级去重统计系统”。每位游客和设备的阅读数量、访问累积都做到了高精度真实处理。您可以毫无顾虑地进行创作、置顶、隐藏留言，所有记录均实时在浏览器内持久存贮。' 
                      : 'High-fidelity state engine for analytics deduplication. Run site operations safely.'}
                  </p>
                </div>

                {/* Recent publications list */}
                <div className="bg-white dark:bg-slate-950/30 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                  <h4 className="text-xs sm:text-sm font-black mb-3 text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-sky-500" />
                    <span>{locale === 'zh' ? '最近发布内容' : 'Recent Publications'}</span>
                  </h4>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {posts.slice(0, 4).map(post => (
                      <div key={post.id} className="py-3 flex justify-between items-center text-xs sm:text-sm">
                        <span className="text-slate-700 dark:text-slate-300 font-bold truncate max-w-[150px] sm:max-w-md">
                          {post.title}
                        </span>
                        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-mono scale-95 origin-right">
                          <span>{post.date}</span>
                          <span className="text-indigo-600 bg-indigo-50 dark:text-cyan-400 dark:bg-cyan-950/40 px-2 py-0.5 rounded-full font-bold">{post.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: POSTS EDITORIAL WORKSPACE */}
            {activeTab === 'posts' && (
              <div className="space-y-4 animate-fadeIn">
                {!isCreating ? (
                  <>
                    <div className="flex justify-between items-center">
                      <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-500" />
                        <span>{locale === 'zh' ? '全站文章档案' : 'Publications Database'}</span>
                      </h3>
                      <button
                        onClick={startCreating}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-550 to-sky-550 hover:brightness-110 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        {locale === 'zh' ? '写新文章' : 'Compose Post'}
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner bg-white dark:bg-transparent">
                      <table className="w-full text-left text-xs sm:text-sm text-slate-705 dark:text-slate-300">
                        <thead className="bg-slate-100 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="px-4 py-3">{locale === 'zh' ? '文章标题' : 'Title'}</th>
                            <th className="px-4 py-3">{locale === 'zh' ? '分类专栏' : 'Category'}</th>
                            <th className="px-4 py-3">{locale === 'zh' ? '发布日期' : 'Date'}</th>
                            <th className="px-4 py-3 text-center">{locale === 'zh' ? '真实阅读/点赞' : 'Metrics'}</th>
                            <th className="px-4 py-3 text-right">{locale === 'zh' ? '管理操作' : 'Action'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                          {posts.map(post => (
                            <tr key={post.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/25 transition-colors">
                              <td className="px-4 py-3.5 max-w-[150px] sm:max-w-md">
                                <div className="flex items-center gap-2">
                                  {post.isPinned && (
                                    <span className="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 p-1 rounded-lg shrink-0 flex items-center justify-center" title="Pinned">
                                      <Pin className="w-3.5 h-3.5 fill-current" />
                                    </span>
                                  )}
                                  <span className="font-extrabold text-slate-900 dark:text-slate-100 block truncate">
                                    {post.title}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full font-bold">
                                  {post.category}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-mono text-slate-500 text-xs">{post.date}</td>
                              <td className="px-4 py-3 text-center font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                                {post.views} / {post.likes}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      const updated = { ...post, isPinned: !post.isPinned };
                                      onUpdatePost(updated);
                                    }}
                                    className={`p-1.5 rounded-lg border border-slate-200 dark:border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${post.isPinned ? 'text-amber-500 bg-amber-50' : 'text-slate-400'}`}
                                    title={locale === 'zh' ? '置顶切换' : 'Toggle pinning'}
                                  >
                                    <Pin className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => startEditing(post)}
                                    className="p-1.5 text-sky-600 dark:text-sky-400 border border-slate-200 dark:border-transparent rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                    title={locale === 'zh' ? '编辑文章' : 'Edit'}
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(locale === 'zh' ? '确定永久删除此文章吗？' : 'Are you sure you want to delete this piece?')) {
                                        onDeletePost(post.id);
                                      }
                                    }}
                                    className="p-1.5 text-rose-500 border border-slate-200 dark:border-transparent rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    title={locale === 'zh' ? '彻底删除' : 'Delete'}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleSavePost} className="space-y-4 bg-white dark:bg-slate-950/20 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-sky-400 cursor-pointer text-xs font-bold mb-2 hover:underline" onClick={resetForm}>
                      <ArrowLeft className="w-4 h-4" />
                      <span>{locale === 'zh' ? '返回文章列表' : 'Back to index'}</span>
                    </div>

                    <h3 className="text-base font-black text-slate-800 dark:text-slate-200">
                      {editingPost ? (locale === 'zh' ? '✏️ 重新编辑文章内容' : 'Edit Post') : (locale === 'zh' ? '📝 撰写新发表的文章' : 'New Article')}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1 font-bold">{locale === 'zh' ? '文章标题 (仅中文标题) *' : 'Article Title *'}</label>
                        <input
                          type="text"
                          required
                          value={formTitle}
                          onChange={e => setFormTitle(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-700 font-bold focus:border-indigo-500 rounded-lg p-2.5 outline-none text-sm text-slate-900 dark:text-white transition-all shadow-inner"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1 font-bold">{locale === 'zh' ? '选择分类专栏 *' : 'Select Category *'}</label>
                        <select
                          value={formCategory}
                          onChange={e => setFormCategory(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-700 focus:border-indigo-500 rounded-lg p-2.5 outline-none text-sm text-slate-900 dark:text-white transition-all font-bold shadow-inner"
                        >
                          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1 font-bold">{locale === 'zh' ? '文章专属标签 (多英文逗号分隔)' : 'Comma-separated Tags'}</label>
                        <input
                          type="text"
                          placeholder="Gemini, LLM, Agents, AI"
                          value={formTags}
                          onChange={e => setFormTags(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-700 focus:border-indigo-500 rounded-lg p-2.5 outline-none text-sm text-slate-900 dark:text-white transition-all shadow-inner"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1 font-bold flex items-center gap-1.5">
                          <Image className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{locale === 'zh' ? '封面图片链接 URL' : 'Cover image URL'}</span>
                        </label>
                        <input
                          type="url"
                          value={formCover}
                          onChange={e => setFormCover(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-700 focus:border-indigo-500 rounded-lg p-2.5 outline-none text-sm text-slate-900 dark:text-white transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1 font-bold">{locale === 'zh' ? '中文要点摘要 (博客首页显示的精炼总结)' : 'Overview Summary'}</label>
                      <textarea
                        rows={2}
                        value={formExcerpt}
                        onChange={e => setFormExcerpt(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-700 focus:border-indigo-500 rounded-lg p-2.5 outline-none text-sm text-slate-900 dark:text-white resize-none transition-all shadow-inner"
                        placeholder={locale === 'zh' ? '输入 100 字左右的文章精华概述...' : 'Introduce a brief summary excerpt...'}
                      />
                    </div>

                    {/* INTERACTIVE COMPONENT: ADVANCED ARTICLE WRITING CONTAINER WITH RICH TOOLBAR AND MODE SWITCHING */}
                    <div className="space-y-2 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950/20 shadow-md">
                      
                      {/* Editor Toolbar Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100 dark:bg-slate-900 px-3 py-2 border-b border-slate-200 dark:border-slate-850">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          
                          {/* Formatting Buttons */}
                          <button
                            type="button"
                            title={locale === 'zh' ? '大标题 H1' : 'Header 1'}
                            onClick={() => insertTextAtCursor('## ')}
                            className="p-1 px-2 text-xs font-black rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-850 border border-slate-200 dark:border-transparent shrink-0 cursor-pointer"
                          >
                            H1
                          </button>
                          <button
                            type="button"
                            title={locale === 'zh' ? '中标题 H2' : 'Header 2'}
                            onClick={() => insertTextAtCursor('### ')}
                            className="p-1 px-2 text-xs font-black rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-850 border border-slate-200 dark:border-transparent shrink-0 cursor-pointer"
                          >
                            H2
                          </button>
                          
                          <div className="h-4.5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                          <button
                            type="button"
                            title={locale === 'zh' ? '加粗字体' : 'Bold text'}
                            onClick={() => insertTextAtCursor('**', '**')}
                            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-850 border border-slate-200 dark:border-transparent shrink-0 cursor-pointer"
                          >
                            <Bold className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title={locale === 'zh' ? '斜体字' : 'Italic text'}
                            onClick={() => insertTextAtCursor('*', '*')}
                            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-850 border border-slate-200 dark:border-transparent shrink-0 cursor-pointer"
                          >
                            <Italic className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title={locale === 'zh' ? '引用文本块' : 'Blockquote'}
                            onClick={() => insertTextAtCursor('\n> ')}
                            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-850 border border-slate-200 dark:border-transparent shrink-0 cursor-pointer"
                          >
                            <Quote className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title={locale === 'zh' ? '代码块' : 'Code Block'}
                            onClick={() => insertTextAtCursor('\n```javascript\n', '\n```\n')}
                            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-850 border border-slate-200 dark:border-transparent shrink-0 cursor-pointer"
                          >
                            <Code className="w-3.5 h-3.5" />
                          </button>

                          <div className="h-4.5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                          {/* Dynamic Overlays triggers */}
                          <button
                            type="button"
                            title={locale === 'zh' ? '调设字体大小' : 'Adjust Font size'}
                            onClick={() => { setInsertOverlayType(insertOverlayType === 'fontSize' ? null : 'fontSize'); setOverlayUrl(''); }}
                            className={`p-1.5 rounded transition-all shrink-0 flex items-center gap-1 text-xs font-bold cursor-pointer bg-white dark:bg-slate-855 border border-slate-200 dark:border-transparent ${insertOverlayType === 'fontSize' ? 'text-indigo-600 bg-indigo-50 ring-1 ring-indigo-350' : 'text-slate-700 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                          >
                            <Type className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">字号</span>
                          </button>

                          <button
                            type="button"
                            title={locale === 'zh' ? '插入图片 (自适应大小调控)' : 'Insert Resizable Image'}
                            onClick={() => { setInsertOverlayType(insertOverlayType === 'image' ? null : 'image'); setOverlayUrl(''); }}
                            className={`p-1.5 rounded transition-all shrink-0 flex items-center gap-1 text-xs font-bold cursor-pointer bg-white dark:bg-slate-855 border border-slate-200 dark:border-transparent ${insertOverlayType === 'image' ? 'text-indigo-600 bg-indigo-50 ring-1 ring-indigo-355' : 'text-slate-700 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                          >
                            <Image className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="hidden sm:inline">图片</span>
                          </button>

                          <button
                            type="button"
                            title={locale === 'zh' ? '插入视频 (自适应大小调控)' : 'Insert Resizable Video'}
                            onClick={() => { setInsertOverlayType(insertOverlayType === 'video' ? null : 'video'); setOverlayUrl(''); }}
                            className={`p-1.5 rounded transition-all shrink-0 flex items-center gap-1 text-xs font-bold cursor-pointer bg-white dark:bg-slate-855 border border-slate-200 dark:border-transparent ${insertOverlayType === 'video' ? 'text-indigo-600 bg-indigo-50 ring-1 ring-indigo-355' : 'text-slate-700 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                          >
                            <Video className="w-3.5 h-3.5 text-sky-500" />
                            <span className="hidden sm:inline">视频</span>
                          </button>

                        </div>

                        {/* MODE SWITCH TOGGLE (SWITCH EDITOR OR COMPILED PREVIEW) */}
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-850 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => setEditorWriteMode(true)}
                            className={`px-3 py-1 text-xs font-extrabold rounded-md shadow-sm transition-all cursor-pointer ${
                              editorWriteMode 
                                ? 'bg-indigo-600 text-white' 
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {locale === 'zh' ? '编辑模式' : 'Code'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditorWriteMode(false)}
                            className={`px-3 py-1 text-xs font-extrabold rounded-md shadow-sm transition-all cursor-pointer ${
                              !editorWriteMode 
                                ? 'bg-indigo-600 text-white' 
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {locale === 'zh' ? '预览模式' : 'Preview'}
                          </button>
                        </div>
                      </div>

                      {/* INLINE CUSTOM POPUP TO CONTROL INSERT SIZING, URL AND MANUALLY REGULATE WIDTH/HEIGHT */}
                      {insertOverlayType && (
                        <div className="p-3 bg-indigo-50/50 dark:bg-slate-950/60 border-b border-indigo-200 dark:border-slate-800 space-y-3 animate-scaleUp text-xs">
                          {insertOverlayType === 'fontSize' ? (
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="font-extrabold text-slate-700 dark:text-slate-300">调节插入内容的字体大小:</span>
                              <select
                                value={overlayFontSize}
                                onChange={e => setOverlayFontSize(e.target.value)}
                                className="bg-white dark:bg-slate-900 border border-slate-300 rounded px-2.5 py-1 text-slate-800 dark:text-white"
                              >
                                <option value="12px">超小 (12px)</option>
                                <option value="14px">较小 (14px)</option>
                                <option value="16px">正常 (16px)</option>
                                <option value="18px">中等大 (18px)</option>
                                <option value="22px">较大标题 (22px)</option>
                                <option value="32px">超大显示 (32px)</option>
                              </select>
                              <button
                                type="button"
                                onClick={handleInsertFontSize}
                                className="bg-indigo-600 hover:bg-indigo-500 flex items-center text-white px-3.5 py-1.5 rounded font-black cursor-pointer shadow"
                              >
                                确定插入口位置
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center justify-between">
                                <span className="font-black text-slate-850 dark:text-slate-300 uppercase">
                                  {insertOverlayType === 'image' ? '🖼️ 插入自适应大小图片' : '🎥 插入自适应大小视频'}
                                </span>
                                <button type="button" onClick={() => setInsertOverlayType(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                <div className="md:col-span-2">
                                  <label className="block text-[10px] text-slate-400 mb-0.5">{insertOverlayType === 'image' ? '输入图片链接 URL' : '输入视频链接 URL (mp4等)'}</label>
                                  <input 
                                    type="text" 
                                    placeholder="https://example.com/file.png"
                                    value={overlayUrl}
                                    onChange={e => setOverlayUrl(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-1.5 text-slate-900 dark:text-white outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-400 mb-0.5">调节宽度 (Width)</label>
                                  <input 
                                    type="text" 
                                    placeholder="e.g. 100% or 400px"
                                    value={overlayWidth}
                                    onChange={e => setOverlayWidth(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-1.5 text-slate-900 dark:text-white outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-400 mb-0.5">调节高度 (Height)</label>
                                  <input 
                                    type="text" 
                                    placeholder="e.g. auto or 300px"
                                    value={overlayHeight}
                                    onChange={e => setOverlayHeight(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-1.5 text-slate-900 dark:text-white outline-none"
                                  />
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={insertOverlayType === 'image' ? handleInsertImage : handleInsertVideo}
                                className="bg-emerald-600 hover:bg-emerald-505 text-white font-extrabold text-[11px] px-4 py-1.5 rounded shadow mt-1 cursor-pointer"
                              >
                                {locale === 'zh' ? '确定插入到编辑器' : 'Confirm Insert'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Main writing frame with resizable selector */}
                      <div className="relative">
                        {editorWriteMode ? (
                          <textarea
                            ref={textareaRef}
                            rows={10}
                            required
                            value={formContent}
                            onChange={e => setFormContent(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border-0 outline-none p-3.5 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 resize-y leading-relaxed shadow-inner"
                            placeholder={locale === 'zh' ? '在这里直接使用 Markdown 撰写正文或配合工具栏。您可以向下拖动右下角无极调节本输入框的高宽...' : 'Compose content here. Drag bottom-right corner to freely adjust heights...'}
                          />
                        ) : (
                          <div className="w-full min-h-[14rem] bg-white dark:bg-slate-900 p-5 overflow-y-auto max-h-[30rem] scrollbar-thin">
                            {renderStyledMarkdown(formContent)}
                            {!formContent.trim() && (
                              <p className="text-slate-400 italic text-xs">{locale === 'zh' ? '内容为空。返回“编辑模式”开始写下您的灵感吧！' : 'Preview is empty. Write something code first!'}</p>
                            )}
                          </div>
                        )}
                        
                        {/* Status characters counts in bottom frame */}
                        <div className="absolute right-3.5 bottom-2 font-mono text-[10px] text-slate-400 bg-slate-100/60 dark:bg-slate-800/60 px-1.5 py-0.5 rounded select-none">
                          {formContent.length} chars
                        </div>
                      </div>

                    </div>

                    <div className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        id="isPinnedCheck"
                        checked={formIsPinned}
                        onChange={e => setFormIsPinned(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 focus:ring-indigo-550 border-slate-350"
                      />
                      <label htmlFor="isPinnedCheck" className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-bold select-none cursor-pointer">
                        {locale === 'zh' ? '📌 将这篇代表作置顶在首页最上方' : 'Pin this article to the frontpage banner'}
                      </label>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        {locale === 'zh' ? '发布并保存文章' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer border border-slate-205 dark:border-transparent"
                      >
                        {translations[locale].cancel}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB 3: COMMENTS HUB (评论管理 - INSTANT RENDERING WITHOUT AUDIT) */}
            {activeTab === 'comments' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                  <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-pink-500" />
                    <span>{locale === 'zh' ? '最新评论管理中心 (实时公开显示)' : 'Instant Comments Management'}</span>
                  </h3>
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full animate-pulse border border-emerald-100 select-none">
                    {locale === 'zh' ? '● 评论极速免审模式' : '● No Audit Mode'}
                  </span>
                </div>

                {comments.length === 0 ? (
                  <div className="bg-slate-50 dark:bg-slate-950/20 p-8 rounded-2xl text-center text-slate-400 text-xs sm:text-sm border border-dashed border-slate-300 dark:border-slate-800">
                    {locale === 'zh' ? '☕ 暂无任何留言留言。发布完即可在此操作隐藏或物理删除。' : 'No comments registered in the database.'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {comments.map(comment => (
                      <div key={comment.id} className={`p-4 rounded-xl border transition-all flex gap-3 ${comment.isHidden ? 'bg-rose-50/40 dark:bg-red-950/10 border-red-200 dark:border-red-900/40 opacity-75' : 'bg-white dark:bg-slate-950/35 border-slate-150 dark:border-slate-800 hover:border-slate-250 dark:hover:border-slate-75 *:'}`}>
                        <img src={comment.avatar} alt="Avatar" className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 dark:border-slate-850 shrink-0" />
                        <div className="flex-1 space-y-2.5 min-w-0">
                          
                          {/* Nickname, Real email, date header */}
                          <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-100 dark:border-slate-900 pb-1.5">
                            <div className="flex flex-wrap items-center gap-1.5 text-xs">
                              <span className="font-black text-slate-900 dark:text-slate-100 text-sm">{comment.nickname}</span>
                              <span className="text-indigo-650 dark:text-cyan-400 font-mono font-bold bg-indigo-50 dark:bg-sky-950/40 px-2 py-0.5 rounded text-[10px]" title="用户真实邮箱">
                                {comment.email}
                              </span>
                              {comment.replyTo && (
                                <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                  {locale === 'zh' ? '回复' : 'Replied to'} @{comment.replyTo}
                                </span>
                              )}
                              {comment.isHidden && (
                                <span className="text-[10px] text-rose-600 dark:text-rose-455 bg-rose-100/60 dark:bg-rose-550/20 px-2 py-0.5 rounded font-black select-none">
                                  {locale === 'zh' ? '已隐藏' : 'Hidden'}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">{comment.date}</span>
                          </div>

                          {/* Raw markup message content rendered cleanly */}
                          <div 
                            className="text-slate-700 dark:text-slate-350 text-xs sm:text-sm prose dark:prose-invert font-medium bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-850"
                            dangerouslySetInnerHTML={{ __html: comment.content }}
                          />

                          {/* Action controls button */}
                          <div className="flex-wrap flex justify-between items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-900/60">
                            <span className="text-[10px] font-bold text-slate-400">
                              {locale === 'zh' ? '关联文章 ID: ' : 'Thread Post ID: '}
                              <span className="font-mono text-indigo-600 dark:text-indigo-400">{comment.postId}</span>
                            </span>
                            
                            <div className="flex items-center gap-1.5 text-xs">
                              {/* TOGGLE HIDDEN / VISIBLE BUT DIRECTLY REFLECTED AT CLIENTS */}
                              <button
                                type="button"
                                onClick={() => onToggleHideComment(comment.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                                  comment.isHidden 
                                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-250 dark:bg-emerald-950/25 dark:text-emerald-400 dark:border-emerald-900/40' 
                                    : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-205 dark:bg-amber-950/21 dark:text-amber-400 dark:border-amber-900/40'
                                }`}
                              >
                                {comment.isHidden ? (
                                  <>
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>{locale === 'zh' ? '公开显示' : 'Show comment'}</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3.5 h-3.5" />
                                    <span>{locale === 'zh' ? '隐藏评论' : 'Hide comment'}</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(locale === 'zh' ? '确定物理删除此评论？此删除不可挽回！' : 'This deletes comment permanently, proceed?')) {
                                    onDeleteComment(comment.id);
                                  }
                                }}
                                className="text-[11px] text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-transparent p-1.5 rounded-lg hover:text-rose-600 transition-all font-bold cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: CATEGORIES & TAGS (FOR INDEX SECTOR FILTERING) */}
            {activeTab === 'tags' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                
                {/* Category Workspace */}
                <div className="bg-white dark:bg-slate-950/20 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                  <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-550" />
                    <span>{locale === 'zh' ? '全站文章分栏类别' : 'System Categories'}</span>
                  </h3>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={locale === 'zh' ? '增加新版块名字...' : 'Add category...'}
                      value={newCatInput}
                      onChange={e => setNewCatInput(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded-lg p-2.5 outline-none text-xs sm:text-sm text-slate-850 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newCatInput.trim()) {
                          onAddCategory(newCatInput.trim());
                          setNewCatInput('');
                        }
                      }}
                      className="bg-indigo-650 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-md"
                    >
                      <Plus className="w-4.5 h-4.5" />
                      <span>{locale === 'zh' ? '大类' : 'Add'}</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 divide-y divide-slate-100 dark:divide-slate-850 max-h-60 overflow-y-auto pr-1">
                    {categories.map(cat => (
                      <div key={cat} className="flex justify-between items-center py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        <span className="font-bold">{cat}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(locale === 'zh' ? `删除类别 "${cat}" 将影响对应文章的归属，确定吗？` : `Confirm delete category "${cat}"?`)) {
                              onDeleteCategory(cat);
                            }
                          }}
                          className="text-rose-500 hover:text-rose-600 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags Workspace */}
                <div className="bg-white dark:bg-slate-950/20 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                  <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-indigo-500" />
                    <span>{locale === 'zh' ? '微标签索引池' : 'Tag Keywords Cloud'}</span>
                  </h3>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={locale === 'zh' ? '增加新检索词...' : 'New tag keyword...'}
                      value={newTagInput}
                      onChange={e => setNewTagInput(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-705 rounded-lg p-2.5 outline-none text-xs sm:text-sm text-slate-850 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newTagInput.trim()) {
                          onAddTag(newTagInput.trim());
                          setNewTagInput('');
                        }
                      }}
                      className="bg-indigo-650 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-md"
                    >
                      <Plus className="w-4.5 h-4.5" />
                      <span>{locale === 'zh' ? '标签' : 'Add'}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-1">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="bg-slate-50 hover:bg-rose-50 dark:bg-slate-850 dark:hover:bg-rose-950/30 text-xs px-3 py-1.2 rounded-xl text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
                        onClick={() => {
                          if (confirm(locale === 'zh' ? `删除标签 "${tag}"？` : `Remove tag "${tag}"?`)) {
                            onDeleteTag(tag);
                          }
                        }}
                      >
                        <span className="font-medium">#{tag}</span>
                        <X className="w-3 h-3 text-slate-400 hover:text-rose-500" />
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 5: WEBSITE SETTINGS - MANUALLY REGULATE TRUTHFUL STATE STATS */}
            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-slate-950/20 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm animate-fadeIn text-xs sm:text-sm">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-805 dark:text-slate-200 mb-2 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-500" />
                    <span>{locale === 'zh' ? '全局真是唯一访问去重统计配置' : 'Visitor Base statistics configure'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed font-medium">
                    {locale === 'zh' 
                      ? '为了遵循您对“所有统计数据要去真实并排除重复IP”的高精度要求，本系统引入了浏览器级的局部存储和会话识别（Session de-duplication）。在此，您可以调整或直接调配全站访问人次累计基数：' 
                      : 'Customize baseline settings. All metrics deduplicate automatically.'}
                  </p>

                  <div className="flex flex-wrap items-end gap-3 max-w-md">
                    <div className="flex-1">
                      <label className="text-xs text-slate-500 block mb-1 font-bold">
                        {locale === 'zh' ? '全站真实独立访问人次' : 'Deduplicated visitor count'}
                      </label>
                      <input
                        type="number"
                        value={editStatsViews}
                        onChange={e => setEditStatsViews(Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded-lg p-2.5 outline-none font-mono font-bold text-slate-900 dark:text-white shadow-inner"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleUpdateViews}
                      className="bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs sm:text-sm px-4.5 py-2.5 rounded-lg transition-all shadow-md cursor-pointer active:scale-95 shrink-0"
                    >
                      {locale === 'zh' ? '保存真实数据' : 'Save'}
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-3">
                  <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-350">{locale === 'zh' ? '预置认证机制 & 存储规格说明' : 'System storage information'}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {locale === 'zh' 
                      ? '● 全站采用高精度单页级 localStorage 模块。后台的用户名默认：xiaohe，密码默认：xiaohe@5200。\n● 每一个用户设备的评论和喜欢机制都有去重限制，从而彻底屏蔽任何爬虫或虚假灌水刷新。' 
                      : 'Client localStorage engine is robust. All stats are protected against refresh inflation.'}
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
