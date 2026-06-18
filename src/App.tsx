import React, { useState, useEffect } from 'react';
import { Post, Comment, UserStats } from './types';
import { translations } from './locales';
import { renderStyledMarkdown } from './utils';

import Sidebar from './components/Sidebar';
import AboutView from './components/AboutView';
import PrivacyView from './components/PrivacyView';

import {
  Search, Sun, Moon, ChevronLeft, ChevronRight,
  Eye, MessageSquare, Calendar, ChevronRightCircle,
  ArrowLeft, Send, Sparkles, AlertCircle, CheckCircle,
  Facebook, Instagram, Youtube, Home, BookOpen, User, Shield, Lock
} from 'lucide-react';

export default function App() {
  // ===== Locale / Theme =====
  const [locale, setLocale] = useState<'zh' | 'en'>(() => {
    const saved = localStorage.getItem('blog_locale');
    return (saved === 'zh' || saved === 'en') ? saved : 'zh';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('blog_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'light';
  });

  useEffect(() => { localStorage.setItem('blog_locale', locale); }, [locale]);

  useEffect(() => {
    localStorage.setItem('blog_theme', theme);
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // ===== Data =====
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [stats, setStats] = useState<UserStats>(() => {
    const parsed = { articleCount: 0, commentCount: 0, visitCount: 3820 };
    const hasVisitedThisSession = sessionStorage.getItem('session_visited');
    if (!hasVisitedThisSession) {
      sessionStorage.setItem('session_visited', 'true');
      return { ...parsed, visitCount: parsed.visitCount + 1 };
    }
    return parsed;
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  // ===== Navigation / Filters =====
  const [currentTab, setCurrentTab] = useState<'home' | 'articles' | 'about' | 'privacy'>('home');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArchive, setSelectedArchive] = useState<string | null>(null);

  // ===== Slideshow =====
  const [slideIndex, setSlideIndex] = useState(0);
  const [carouselPosts, setCarouselPosts] = useState<Post[]>([]);

  // Modals / Authentication
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('blog_is_admin') === 'true';
  });
  const [showAdminPanel, setShowAdminPanel] = useState(() => {
    return window.location.pathname === '/admin';
  });
  
  // Basic Auth token (Base64)
    const [authToken, setAuthToken] = useState<string | null>(() => {
    return sessionStorage.getItem('blog_auth_token');
  });

  const isAdminPage = window.location.pathname === '/admin';

  // Header dropdown state
  const [showArticlesDropdown, setShowArticlesDropdown] = useState(false);

  // ===== Toast / Guest Comments =====
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newNickname, setNewNickname] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCommentVal, setNewCommentVal] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyNickname, setReplyNickname] = useState('');
  const [replyEmail, setReplyEmail] = useState('');
  const [replyCommentVal, setReplyCommentVal] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ===== Data Fetching =====
  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await fetch('/api/posts');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPosts(data);
      setCarouselPosts(data.slice(0, 3));
      setStats(prev => ({ ...prev, articleCount: data.length }));
    } catch (err) { console.error('Failed to load posts'); }
    finally { setLoadingPosts(false); }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const res = await fetch('/api/comments');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setComments(data);
      setStats(prev => ({ ...prev, commentCount: data.length }));
    } catch (err) { console.error('Failed to load comments'); }
    finally { setLoadingComments(false); }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategories(data.categories || []);
      setTags(data.tags || []);
      if (data.settings) {
        setStats(prev => ({ ...prev, visitCount: data.settings.visitCount ?? prev.visitCount }));
      }
    } catch (err) {
      setCategories(['技术干货', '行业观察', '随笔生活']);
      setTags(['Gemini', 'LLM', 'AI Agent', 'API', '向量检索', 'Edge AI']);
    }
  };

  useEffect(() => { fetchPosts(); fetchComments(); fetchSettings(); }, []);

  useEffect(() => {
    if (carouselPosts.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIndex(prev => (prev + 1) % carouselPosts.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [carouselPosts.length]);

  // ===== Post View / Reading Count =====
  const handleSelectPost = async (id: string) => {
    setSelectedPostId(id);
    setCurrentTab('articles');
    try {
      const res = await fetch(`/api/post/view?postId=${id}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.views !== undefined) {
        setPosts(prev => prev.map(p => p.id === id ? { ...p, views: data.views } : p));
      }
    } catch (err) { console.error('Failed to record view:', err); }
  };

  // ===== Filtering =====
  const getFilteredPosts = () => {
    let list = [...posts];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (selectedTag) list = list.filter(p => p.tags.includes(selectedTag));
    if (selectedCategory) list = list.filter(p => p.category === selectedCategory);
    if (selectedArchive) list = list.filter(p => p.date.startsWith(selectedArchive));
    return list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  };

  const filteredPosts = getFilteredPosts();
  const handleClearFilters = () => {
    setSelectedTag(null); setSelectedCategory(null); setSelectedArchive(null); setSearchQuery('');
  };

  // ===== Share =====
  const handleShare = (postTitle: string, platform: string) => {
    const shareUrl = window.location.href;
    const shareText = `【小何AI分享】"${postTitle}" - \n${shareUrl}`;
    if (platform === 'link') { navigator.clipboard.writeText(shareText); triggerToast('链接已复制'); return; }
    const map: Record<string, string> = {
      x: `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      weibo: `https://service.weibo.com/share/share.php?title=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(postTitle)}`,
    };
    if (map[platform]) { window.open(map[platform], '_blank'); return; }
    navigator.clipboard.writeText(shareText);
    triggerToast('链接已复制');
  };

  // ===== Prev / Next Post =====
  const currentPost = posts.find(p => p.id === selectedPostId);
  const getPrevAndNextPosts = () => {
    if (!selectedPostId) return { prev: null, next: null };
    const idx = posts.findIndex(p => p.id === selectedPostId);
    return {
      prev: idx > 0 ? posts[idx - 1] : null,
      next: idx < posts.length - 1 ? posts[idx + 1] : null
    };
  };
  const { prev: prevPost, next: nextPost } = getPrevAndNextPosts();

  // ===== Comment Submit =====
  const handlePublishComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!newNickname.trim() || !newEmail.trim()) { alert(translations[locale].commentRequiredTip); return; }
    if (!newCommentVal.trim() || newCommentVal === '<p><br></p>') { alert('请输入一些评论内容！'); return; }

    const newComment: Comment = {
      id: 'comment-' + Date.now(),
      postId, nickname: newNickname, email: newEmail, content: newCommentVal,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${newNickname.replace(/\s+/g, '_')}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    try {
      const res = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newComment) });
      if (res.ok) {
        setComments([newComment, ...comments]);
        setStats(prev => ({ ...prev, commentCount: comments.length + 1 }));
        setNewCommentVal(''); triggerToast(translations[locale].commentSuccess);
      }
    } catch (err) { triggerToast('评论保存失败，请重试'); }
  };

  const handlePublishReply = async (e: React.FormEvent, commentId: string, replyToName: string) => {
    e.preventDefault();
    if (!replyNickname.trim() || !replyEmail.trim()) { alert(translations[locale].commentRequiredTip); return; }
    if (!replyCommentVal.trim() || replyCommentVal === '<p><br></p>') { alert('请输入回复内容！'); return; }

    const newReply: Comment = {
      id: 'comment-' + Date.now(),
      postId: selectedPostId || '',
      nickname: replyNickname, email: replyEmail, content: replyCommentVal,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${replyNickname.replace(/\s+/g, '_')}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      replyTo: replyToName
    };

    try {
      const res = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newReply) });
      if (res.ok) {
        setComments([newReply, ...comments]);
        setStats(prev => ({ ...prev, commentCount: comments.length + 1 }));
        setReplyingToCommentId(null); triggerToast(translations[locale].commentSuccess);
      }
    } catch (err) { triggerToast('回复保存失败，请重试'); }
  };

  // ============================================================
  // ==================== RENDER ================================
  // ============================================================
  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      theme === 'dark' ? 'bg-[#0f1115] text-slate-100' : 'bg-[#f5f6f7] text-slate-800'
    }`}>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed z-50 bottom-5 right-5 max-w-sm flex items-center gap-2.5 p-4 rounded-xl bg-slate-900 border border-slate-800/80 text-white shadow-2xl animate-slideUp">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#0f1115] border-b border-slate-200 dark:border-slate-800">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          <div className="flex items-center gap-6 md:gap-8 flex-1 min-w-0">
            <div onClick={() => { setCurrentTab('home'); setSelectedPostId(null); handleClearFilters(); }} className="flex items-center gap-2 cursor-pointer group shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-slate-700 dark:text-slate-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21L14.907 18M14.907 18l5.244-8.125a2.25 2.25 0 10-3.791-2.424l-5.24 8.12M14.907 18L11 13M16.36 6.36l-8.125 5.244a2.25 2.25 0 102.424 3.79l8.125-5.242" />
              </svg>
              <span className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200">
                xhblog
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-3">
              <button onClick={() => { setCurrentTab('home'); setSelectedPostId(null); handleClearFilters(); }}
                className={`px-4 py-2 rounded-lg text-base transition-all flex items-center gap-2 cursor-pointer ${
                  currentTab === 'home' && !selectedPostId && !selectedCategory && !selectedTag && !selectedArchive
                    ? 'text-slate-900 dark:text-slate-100 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}>
                <Home className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                <span>{locale === 'zh' ? '首页' : 'Home'}</span>
              </button>

              <div className="relative" onMouseEnter={() => setShowArticlesDropdown(true)} onMouseLeave={() => setShowArticlesDropdown(false)}>
                <button onClick={() => { setCurrentTab('articles'); setSelectedPostId(null); setSelectedCategory(null); }}
                  className={`px-4 py-2 rounded-lg text-base transition-all flex items-center gap-2 cursor-pointer ${
                    currentTab === 'articles' || selectedPostId || selectedCategory || selectedTag || selectedArchive
                      ? 'text-slate-900 dark:text-slate-100 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}>
                  <BookOpen className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  <span>{locale === 'zh' ? '文章' : 'Articles'}</span>
                </button>

                {showArticlesDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1.5 z-50 animate-fadeIn">
                    <button onClick={() => { setCurrentTab('articles'); setSelectedPostId(null); handleClearFilters(); setShowArticlesDropdown(false); }}
                      className="w-full px-3 py-2 text-left text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-700">
                      <span>{locale === 'zh' ? '全部文章' : 'All Articles'}</span>
                    </button>
                    {categories.map(cat => (
                      <button key={cat} onClick={() => { setCurrentTab('articles'); setSelectedPostId(null); setSelectedCategory(cat); setSelectedTag(null); setSelectedArchive(null); setSearchQuery(''); setShowArticlesDropdown(false); }}
                        className={`w-full px-3 py-2 text-left text-sm transition-colors flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${
                          selectedCategory === cat ? 'text-slate-900 dark:text-slate-100 font-bold' : 'text-slate-600 dark:text-slate-400 font-medium'
                        }`}>
                        <span className="truncate">{cat}</span>
                        <span className="text-xs text-slate-400">{posts.filter(p => p.category === cat).length}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={() => { setCurrentTab('about'); setSelectedPostId(null); }}
                className={`px-4 py-2 rounded-lg text-base transition-all flex items-center gap-2 cursor-pointer ${
                  currentTab === 'about' ? 'text-slate-900 dark:text-slate-100 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}>
                <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                <span>{locale === 'zh' ? '关于' : 'About'}</span>
              </button>

              <button onClick={() => { setCurrentTab('privacy'); setSelectedPostId(null); }}
                className={`px-4 py-2 rounded-lg text-base transition-all flex items-center gap-2 cursor-pointer ${
                  currentTab === 'privacy' ? 'text-slate-900 dark:text-slate-100 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}>
                <Shield className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                <span>{locale === 'zh' ? '隐私' : 'Privacy'}</span>
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3 flex-1 md:flex-initial justify-end">
            <div className="relative max-w-[120px] sm:max-w-[180px] w-full">
              <input type="text" placeholder={translations[locale].searchPlaceholder} value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); if (currentTab !== 'articles') { setCurrentTab('articles'); setSelectedPostId(null); } }}
                className={`w-full py-2 pl-8 pr-3 rounded-md border text-sm outline-none transition-all ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-800 focus:border-slate-600 text-slate-100' : 'bg-white border-slate-200 focus:border-slate-400 text-slate-800'
                }`} />
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            </div>

            <button onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
              className={`text-sm px-3 py-2 rounded-md transition-colors cursor-pointer ${
                theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
              }`}>
              {translations[locale].currentLanguage}
            </button>

            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-md transition-colors cursor-pointer ${
                theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
              }`}>
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAdmin ? (
              <button
                onClick={() => window.location.href = '/admin'}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2 rounded-lg transition-all shadow-sm flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">{locale === 'zh' ? '后台仪表盘' : 'Console'}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2 rounded-lg transition-all shadow-sm flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">{locale === 'zh' ? '登陆' : 'Login'}</span>
              </button>
            )}

            <button onClick={() => window.location.href = '/admin'}
              className={`p-2 rounded-md transition-colors cursor-pointer ${
                theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title={translations[locale].login}>
              <Lock className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <div className="md:hidden flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1115] justify-around py-3 text-sm">
        <button onClick={() => { setCurrentTab('home'); setSelectedPostId(null); }}
          className={`px-3 py-2 rounded-lg transition-all ${currentTab === 'home' && !selectedPostId ? 'text-slate-900 dark:text-slate-100 font-bold bg-slate-100 dark:bg-slate-800' : 'text-slate-500'}`}>
          {translations[locale].navHome}
        </button>
        <button onClick={() => { setCurrentTab('articles'); setSelectedPostId(null); }}
          className={`px-3 py-2 rounded-lg transition-all ${currentTab === 'articles' || selectedPostId ? 'text-slate-900 dark:text-slate-100 font-bold bg-slate-100 dark:bg-slate-800' : 'text-slate-500'}`}>
          {translations[locale].navArticles}
        </button>
        <button onClick={() => { setCurrentTab('about'); setSelectedPostId(null); }}
          className={`px-3 py-2 rounded-lg transition-all ${currentTab === 'about' ? 'text-slate-900 dark:text-slate-100 font-bold bg-slate-100 dark:bg-slate-800' : 'text-slate-500'}`}>
          {translations[locale].navAbout}
        </button>
        <button onClick={() => { setCurrentTab('privacy'); setSelectedPostId(null); }}
          className={`px-3 py-2 rounded-lg transition-all ${currentTab === 'privacy' ? 'text-slate-900 dark:text-slate-100 font-bold bg-slate-100 dark:bg-slate-800' : 'text-slate-500'}`}>
          {translations[locale].navPrivacy}
        </button>
        <button onClick={() => window.location.href = '/admin'}
          className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-3 py-2">
          <Lock className="w-5 h-5" />
        </button>
      </div>

      {/* ===== MAIN ===== */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col lg:flex-row gap-6 lg:gap-8">

        <div className="flex-1 min-w-0 space-y-6">

          {/* ====== HOME VIEW ====== */}
          {currentTab === 'home' && !selectedPostId && (
            <div className="space-y-6 animate-fadeIn">

              {/* Hero Carousel */}
              <div className="relative group overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-lg">
                {carouselPosts.length > 0 ? (
                  <div className="relative h-[240px] sm:h-[340px]">
                    <img src={carouselPosts[slideIndex]?.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200'}
                      alt="Post banner"
                      className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 text-left space-y-2">
                      <h2 className="text-lg sm:text-2xl font-bold text-white leading-snug">
                        {locale === 'zh' ? carouselPosts[slideIndex]?.title : carouselPosts[slideIndex]?.titleEn || carouselPosts[slideIndex]?.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-200 max-w-2xl line-clamp-2 leading-relaxed">
                        {locale === 'zh' ? carouselPosts[slideIndex]?.excerpt : carouselPosts[slideIndex]?.excerptEn || carouselPosts[slideIndex]?.excerpt}
                      </p>
                      <div className="pt-1">
                        <button onClick={() => handleSelectPost(carouselPosts[slideIndex]?.id)}
                          className="text-xs text-white font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                          <span>{translations[locale].slideReadMore}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {carouselPosts.length > 1 && (
                      <>
                        <button onClick={() => setSlideIndex(prev => (prev - 1 + carouselPosts.length) % carouselPosts.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 text-slate-700 hover:bg-white transition-all">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={() => setSlideIndex(prev => (prev + 1) % carouselPosts.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 text-slate-700 hover:bg-white transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <div className="absolute bottom-3 right-4 flex gap-1">
                      {carouselPosts.map((_, idx) => (
                        <button key={idx} onClick={() => setSlideIndex(idx)}
                          className={`h-1 transition-all rounded-full ${idx === slideIndex ? 'w-5 bg-white' : 'w-1 bg-white/50'}`} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-[240px] sm:h-[340px] flex items-center justify-center bg-slate-50 dark:bg-slate-800">
                    <p className="text-slate-500 text-sm">{locale === 'zh' ? '暂无文章' : 'No posts yet'}</p>
                  </div>
                )}
              </div>

              {/* Featured Posts Header */}
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {locale === 'zh' ? '最新文章' : 'Latest Posts'}
                </h3>
                <span onClick={() => setCurrentTab('articles')}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium cursor-pointer">
                  {locale === 'zh' ? '查看更多' : 'View more'}
                </span>
              </div>

              {loadingPosts ? (
                <div className="bg-white dark:bg-slate-900 shadow-lg rounded-xl p-8 text-center">
                  <div className="animate-pulse text-slate-500 text-sm">加载中...</div>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 shadow-lg rounded-xl p-5">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {posts.slice(0, 10).map(post => (
                      <article key={post.id} onClick={() => handleSelectPost(post.id)}
                        className="group cursor-pointer flex flex-col md:flex-row gap-4 py-4 first:pt-0 last:pb-0">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug line-clamp-2">
                            {locale === 'zh' ? post.title : post.titleEn}
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mt-1.5">
                            {locale === 'zh' ? post.excerpt : post.excerptEn}
                          </p>
                          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 dark:text-slate-500">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
                            <span><Eye className="w-3 h-3 inline mr-1" />{post.views}</span>
                            <span><MessageSquare className="w-3 h-3 inline mr-1" />{comments.filter(c => c.postId === post.id).length}</span>
                          </div>
                        </div>
                        <div className="relative w-full md:w-36 h-24 md:h-20 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                          <img src={post.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'}
                            alt="cover"
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'; }}
                          />
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ====== ARTICLES LIST VIEW ====== */}
          {currentTab === 'articles' && !selectedPostId && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 shadow-lg p-5 rounded-xl">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{locale === 'zh' ? '文章列表' : 'Articles'}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {locale === 'zh' ? '共 ' : 'Total '}
                    <strong className="font-bold text-slate-700 dark:text-slate-300">{filteredPosts.length}</strong>
                    {locale === 'zh' ? ' 篇文章' : ' articles'}
                  </p>
                </div>
                {(selectedTag || selectedCategory || selectedArchive || searchQuery) && (
                  <button onClick={handleClearFilters}
                    className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg font-medium text-slate-600 dark:text-slate-400 transition-colors">
                    {locale === 'zh' ? '清除筛选' : 'Clear'}
                  </button>
                )}
              </div>

              {loadingPosts ? (
                <div className="bg-white dark:bg-slate-900 shadow-lg rounded-xl p-8 text-center">
                  <div className="animate-pulse text-slate-500 text-sm">加载中...</div>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 shadow-lg rounded-xl p-8 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm text-slate-500">{translations[locale].noArticles}</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 shadow-lg rounded-xl p-5">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredPosts.map(post => (
                      <article key={post.id} onClick={() => handleSelectPost(post.id)}
                        className="group cursor-pointer flex flex-col md:flex-row gap-4 py-4 first:pt-0 last:pb-0">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug line-clamp-2">
                            {locale === 'zh' ? post.title : post.titleEn}
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mt-1.5">
                            {locale === 'zh' ? post.excerpt : post.excerptEn}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 text-xs text-slate-400 dark:text-slate-500">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
                            <span><Eye className="w-3 h-3 inline mr-1" />{post.views}</span>
                          </div>
                        </div>
                        <div className="relative w-full md:w-36 h-24 md:h-20 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                          <img src={post.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'}
                            alt="cover"
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'; }}
                          />
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ====== ARTICLE DETAIL VIEW ====== */}
          {selectedPostId && currentPost && (
            <div className="space-y-4 animate-fadeIn">
              <button onClick={() => setSelectedPostId(null)}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{locale === 'zh' ? '返回文章列表' : 'Back to directory'}</span>
              </button>

              <article className="bg-white dark:bg-slate-900 shadow-lg rounded-xl overflow-hidden p-5 sm:p-8">
                <div className="space-y-3">
                  <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                    {locale === 'zh' ? currentPost.title : currentPost.titleEn}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{currentPost.date}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{currentPost.views}</span>
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{locale === 'zh' ? currentPost.category : currentPost.categoryEn}</span>
                  </div>
                </div>

                <div className="my-6 rounded-xl overflow-hidden h-[180px] sm:h-[320px] bg-slate-100 dark:bg-slate-800">
                  <img src={currentPost.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'}
                    alt="Cover" className="w-full h-full object-cover object-center" referrerPolicy="no-referrer" />
                </div>

                <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-200 text-sm sm:text-base lg:text-lg leading-relaxed">
                  {(() => {
                    const content = locale === 'zh' ? currentPost.content : currentPost.contentEn;
                    if (/<(p|div|h[1-6]|br|img|a|strong|em|ul|ol|li|pre|code|blockquote|table|span|video)\b[^>]*>/i.test(content)) {
                      return <div dangerouslySetInnerHTML={{ __html: content }} />;
                    }
                    return renderStyledMarkdown(content);
                  })()}
                </div>

                <div className="flex flex-wrap gap-1.5 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {currentPost.tags.map(t => (
                    <span key={t} onClick={() => { setSelectedTag(t); setSelectedPostId(null); setCurrentTab('articles'); }}
                      className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded">
                      #{t}
                    </span>
                  ))}
                </div>
              </article>

              {/* Prev / Next */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {prevPost ? (
                  <div onClick={() => handleSelectPost(prevPost.id)} className="p-4 bg-white dark:bg-slate-900 shadow-lg rounded-xl cursor-pointer transition-all text-left">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1 font-medium">{translations[locale].prevPost}</span>
                    <strong className="text-xs sm:text-sm truncate block text-slate-800 dark:text-slate-200">{locale === 'zh' ? prevPost.title : prevPost.titleEn}</strong>
                  </div>
                ) : <div className="hidden sm:block" />}
                {nextPost ? (
                  <div onClick={() => handleSelectPost(nextPost.id)} className="p-4 bg-white dark:bg-slate-900 shadow-lg rounded-xl cursor-pointer transition-all text-right">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1 font-medium">{translations[locale].nextPost}</span>
                    <strong className="text-xs sm:text-sm truncate block text-slate-800 dark:text-slate-200">{locale === 'zh' ? nextPost.title : nextPost.titleEn}</strong>
                  </div>
                ) : <div className="hidden sm:block" />}
              </div>

              {/* Comment Section */}
              <section className="bg-white dark:bg-slate-900 shadow-lg rounded-xl p-5 sm:p-6 space-y-5">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-500" />
                  <span>{translations[locale].commentArea}</span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-medium text-slate-500">
                    {comments.filter(c => c.postId === currentPost.id).length}
                  </span>
                </h3>

                <form onSubmit={(e) => handlePublishComment(e, currentPost.id)} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">{translations[locale].commentNickname}</label>
                      <input type="text" required placeholder="Your name..." value={newNickname} onChange={e => setNewNickname(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-lg px-3 py-2 outline-none text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">{translations[locale].commentEmail}</label>
                      <input type="email" required placeholder="public@domain.com" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-lg px-3 py-2 outline-none text-slate-800 dark:text-slate-200" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 block mb-1">{translations[locale].commentContent}</label>
                    <textarea rows={3} placeholder={translations[locale].commentPlaceholder} value={newCommentVal} onChange={e => setNewCommentVal(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-lg px-3 py-2 outline-none text-slate-800 dark:text-slate-200 resize-none" />
                  </div>
                  <button type="submit" className="bg-slate-700 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-500 text-white font-medium text-sm px-4 py-2 rounded-lg transition-all flex items-center gap-1.5"><Send className="w-3.5 h-3.5" /><span>{translations[locale].commentSubmit}</span></button>
                </form>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-2 space-y-4">
                  {comments.filter(c => c.postId === currentPost.id).map(comment => (
                    <div key={comment.id} className="pt-4 flex gap-3 items-start">
                      <img src={comment.avatar} alt="Avatar" className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 dark:border-slate-700 shrink-0" />
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div><strong className="text-slate-800 dark:text-slate-200 text-sm font-medium">{comment.nickname}</strong>
                            {comment.replyTo && <span className="text-xs text-slate-400 px-1.5 py-0.5">回复 @{comment.replyTo}</span>}
                          </div>
                          <span className="text-[10px] text-slate-400">{comment.date}</span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg"
                          dangerouslySetInnerHTML={{ __html: comment.content }} />
                        <div className="flex justify-end">
                          {replyingToCommentId === comment.id ? (
                            <button onClick={() => setReplyingToCommentId(null)} className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">取消</button>
                          ) : (
                            <button onClick={() => { setReplyingToCommentId(comment.id); setReplyNickname(''); setReplyEmail(''); setReplyCommentVal(''); }} className="text-xs text-slate-500 hover:text-slate-700">回复</button>
                          )}
                        </div>
                        {replyingToCommentId === comment.id && (
                          <form onSubmit={(e) => handlePublishReply(e, comment.id, comment.nickname)} className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg space-y-2.5 mt-2 animate-fadeIn">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div><label className="text-xs text-slate-500 block mb-1">昵称</label><input type="text" required value={replyNickname} onChange={e => setReplyNickname(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded px-2 py-1.5 outline-none text-slate-800 dark:text-slate-200" /></div>
                              <div><label className="text-xs text-slate-500 block mb-1">邮箱</label><input type="email" required value={replyEmail} onChange={e => setReplyEmail(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded px-2 py-1.5 outline-none text-slate-800 dark:text-slate-200" /></div>
                            </div>
                            <div className="space-y-1"><label className="text-xs text-slate-500 block mb-1">回复内容</label><textarea rows={2} value={replyCommentVal} onChange={e => setReplyCommentVal(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded px-2 py-1.5 outline-none text-slate-800 dark:text-slate-200 resize-none" /></div>
                            <div className="flex gap-2"><button type="submit" className="bg-slate-700 dark:bg-slate-600 hover:bg-slate-800 text-white font-medium text-xs px-3 py-1.5 rounded transition-all">发布</button><button type="button" onClick={() => setReplyingToCommentId(null)} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-3 py-1.5 rounded">取消</button></div>
                          </form>
                        )}
                      </div>
                    </div>
                  ))}
                  {comments.filter(c => c.postId === currentPost.id).length === 0 && <p className="text-xs text-slate-400 pt-2 italic">暂无评论。快来发表你的评论吧！</p>}
                </div>
              </section>
            </div>
          )}

          {/* About & Privacy */}
          {currentTab === 'about' && <AboutView locale={locale} />}
          {currentTab === 'privacy' && <PrivacyView locale={locale} />}
        </div>

        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:block w-full lg:w-72 xl:w-80 shrink-0">
          <Sidebar
            posts={posts}
            comments={comments}
            stats={stats}
            locale={locale}
            tags={tags}
            categories={categories}
            selectedTag={selectedTag}
            selectedCategory={selectedCategory}
            selectedArchive={selectedArchive}
            onSelectTag={setSelectedTag}
            onSelectCategory={setSelectedCategory}
            onSelectArchive={setSelectedArchive}
            onSelectPost={handleSelectPost}
          />
        </div>
      </main>

      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 py-6 text-center text-xs">
        <p className="font-medium">{translations[locale].footerText}</p>
        <p className="text-slate-400 dark:text-slate-500 mt-1">小何 AI Share · Dynamic Blog</p>
      </footer>

      {/* Admin Panel - Only show on /admin route */}
      {isAdminPage && (
        <AdminPanel
          posts={posts}
          comments={comments}
          stats={stats}
          locale={locale}
          authToken={authToken}
          onAddPost={handleAddPost}
          onUpdatePost={handleUpdatePost}
          onDeletePost={handleDeletePost}
          onDeleteComment={handleDeleteComment}
          onToggleHideComment={handleToggleHideComment}
          onUpdateStats={setStats}
          onLogin={(token) => {
            setAuthToken(token);
            setIsAdmin(true);
            sessionStorage.setItem('blog_auth_token', token);
            localStorage.setItem('blog_is_admin', 'true');
          }}
          onLogout={() => {
            setAuthToken(null);
            setIsAdmin(false);
            sessionStorage.removeItem('blog_auth_token');
            localStorage.setItem('blog_is_admin', 'false');
            window.location.href = '/';
          }}
          categories={categories}
          tags={tags}
          onAddCategory={handleAddCategory}
          onAddTag={handleAddTag}
          onDeleteCategory={handleDeleteCategory}
          onDeleteTag={handleDeleteTag}
        />
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex items-center justify-center p-4 text-slate-800 dark:text-slate-100 font-sans animate-fadeIn">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-lg mx-auto">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">{translations[locale].adminLoginTitle}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">{locale === 'zh' ? '请输入管理员凭据以进入后台' : 'Enter admin credentials to continue'}</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-600 dark:text-slate-400 block mb-1.5 font-bold">{locale === 'zh' ? '管理账号' : 'Username'}</label>
                  <input type="text" required placeholder={locale === 'zh' ? '请输入管理账号' : 'Username'} value={adminUsername} onChange={e => setAdminUsername(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl p-3 outline-none text-sm text-slate-900 dark:text-white transition-all" />
                </div>
                <div>
                  <label className="text-sm text-slate-600 dark:text-slate-400 block mb-1.5 font-bold">{locale === 'zh' ? '密码' : 'Password'}</label>
                  <input type="password" required placeholder={locale === 'zh' ? '请输入密码' : 'Password'} value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl p-3 outline-none text-sm text-slate-900 dark:text-white transition-all" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer">{translations[locale].submit}</button>
                <button type="button" onClick={() => setShowLoginModal(false)} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer">{translations[locale].cancel}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}