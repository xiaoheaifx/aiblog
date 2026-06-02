import React, { useState, useEffect, useRef } from 'react';
import { Post, Comment, Slide, UserStats } from './types';
import { INITIAL_POSTS, INITIAL_SLIDES, INITIAL_COMMENTS } from './initialData';
import { translations } from './locales';
import { renderStyledMarkdown } from './utils';

// Import our custom submodules
import Sidebar from './components/Sidebar';
import AdminPanel from './components/AdminPanel';
import WysiwygEditor from './components/WysiwygEditor';
import AboutView from './components/AboutView';
import PrivacyView from './components/PrivacyView';

// Lucide Icons
import {
  Search, Sun, Moon, LogIn, LogOut, ChevronLeft, ChevronRight,
  Pin, Heart, Eye, MessageSquare, Calendar, ChevronRightCircle,
  Share2, ArrowLeft, Send, Sparkles, AlertCircle, CheckCircle, HelpCircle,
  Facebook, Instagram, Youtube, Twitter, Home, BookOpen, User, Shield, ChevronDown
} from 'lucide-react';

export default function App() {
  // Locale State (Default: zh)
  const [locale, setLocale] = useState<'zh' | 'en'>(() => {
    const saved = localStorage.getItem('blog_locale');
    return (saved === 'zh' || saved === 'en') ? saved : 'zh';
  });

  // Theme State (Default: dark)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('blog_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  // Blog states backed by localStorage
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('blog_posts');
    if (saved) return JSON.parse(saved);
    return INITIAL_POSTS;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem('blog_comments');
    if (saved) return JSON.parse(saved);
    return INITIAL_COMMENTS;
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('blog_stats');
    const parsed = saved ? JSON.parse(saved) : {
      articleCount: INITIAL_POSTS.length,
      commentCount: INITIAL_COMMENTS.length,
      visitCount: 3820
    };
    
    // De-duplicate visits using sessionStorage so refreshing doesn't inflate stats
    const hasVisitedThisSession = sessionStorage.getItem('session_visited');
    if (!hasVisitedThisSession) {
      sessionStorage.setItem('session_visited', 'true');
      const updated = {
        ...parsed,
        visitCount: parsed.visitCount + 1
      };
      localStorage.setItem('blog_stats', JSON.stringify(updated));
      return updated;
    }
    return parsed;
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('blog_categories');
    if (saved) return JSON.parse(saved);
    return ['技术干货', '行业观察', '随笔生活'];
  });

  const [tags, setTags] = useState<string[]>(() => {
    const saved = localStorage.getItem('blog_tags');
    if (saved) return JSON.parse(saved);
    return ['Gemini', 'LLM', 'AI Agent', 'API', '向量检索', 'Edge AI', 'WebGPU', 'Gemma', '前端设计', '编程未来', '深度检索'];
  });

  // App navigation state
  const [currentTab, setCurrentTab] = useState<'home' | 'articles' | 'about' | 'privacy'>('home');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Sidebar Filtering states
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArchive, setSelectedArchive] = useState<string | null>(null);

  // Slideshow state
  const [slideIndex, setSlideIndex] = useState(0);

  // Modals / Authentication
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('blog_is_admin') === 'true';
  });
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  // Header dropdown state
  const [showArticlesDropdown, setShowArticlesDropdown] = useState(false);

  // Alert Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Guest Review Submission State
  const [newNickname, setNewNickname] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCommentVal, setNewCommentVal] = useState('');
  
  // Inline replies support
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyNickname, setReplyNickname] = useState('');
  const [replyEmail, setReplyEmail] = useState('');
  const [replyCommentVal, setReplyCommentVal] = useState('');

  // Save states to localStorage when updated
  useEffect(() => {
    localStorage.setItem('blog_locale', locale);
  }, [locale]);

  useEffect(() => {
    localStorage.setItem('blog_theme', theme);
    // Apply styling elements to document root for dark mode classes
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('blog_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('blog_comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem('blog_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('blog_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('blog_tags', JSON.stringify(tags));
  }, [tags]);

  // Slideshow automatic transition timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex(prev => (prev + 1) % INITIAL_SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // Alert handler
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername === 'xiaohe' && adminPassword === 'xiaohe@5200') {
      setIsAdmin(true);
      localStorage.setItem('blog_is_admin', 'true');
      setShowLoginModal(false);
      setAdminUsername('');
      setAdminPassword('');
      setShowAdminPanel(true);
      triggerToast(locale === 'zh' ? '欢迎回来，小何！已成功登入控制中心。' : 'Welcome back, XiaoHe! Logged into system administrator successfully.');
    } else {
      alert(locale === 'zh' ? '账号或密码错误！' : 'Wrong username or password!');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.setItem('blog_is_admin', 'false');
    setShowAdminPanel(false);
    triggerToast(locale === 'zh' ? '已安全登出后台管理系统。' : 'Log out successful.');
  };

  // Post CRUD operations
  const handleAddPost = (newPost: Post) => {
    const updated = [newPost, ...posts];
    setPosts(updated);
    setStats(prev => ({ ...prev, articleCount: updated.length }));
    triggerToast(locale === 'zh' ? '新文章发表成功！' : 'Post created successfully!');
  };

  const handleUpdatePost = (updatedPost: Post) => {
    const updated = posts.map(p => p.id === updatedPost.id ? updatedPost : p);
    setPosts(updated);
    triggerToast(locale === 'zh' ? '文章内容更新成功！' : 'Post updated successfully!');
  };

  const handleDeletePost = (id: string) => {
    const updated = posts.filter(p => p.id !== id);
    setPosts(updated);
    setStats(prev => ({ ...prev, articleCount: updated.length }));
    if (selectedPostId === id) {
      setSelectedPostId(null);
    }
    triggerToast(locale === 'zh' ? '文章已被成功移除。' : 'Post deleted.');
  };

  const handleDeleteComment = (id: string) => {
    const updated = comments.filter(c => c.id !== id);
    setComments(updated);
    setStats(prev => ({ ...prev, commentCount: updated.length }));
    triggerToast(locale === 'zh' ? '评论已被成功物理删除。' : 'Comment deleted.');
  };

  const handleToggleHideComment = (id: string) => {
    const updated = comments.map(c => c.id === id ? { ...c, isHidden: !c.isHidden } : c);
    setComments(updated);
    triggerToast(locale === 'zh' ? '评论显示状态已切换。' : 'Comment visibility updated.');
  };

  const handleAddCategory = (newCat: string) => {
    if (!categories.includes(newCat)) {
      setCategories([...categories, newCat]);
    }
  };

  const handleAddTag = (newTag: string) => {
    if (!tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
  };

  const handleDeleteCategory = (cat: string) => {
    setCategories(categories.filter(c => c !== cat));
  };

  const handleDeleteTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // Filtering Logic for articles
  const getFilteredPosts = () => {
    let list = [...posts];

    // 1. Search Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.titleEn.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.excerptEn.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.contentEn.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // 2. Tag Filter
    if (selectedTag) {
      list = list.filter(p => p.tags.includes(selectedTag));
    }

    // 3. Category Filter
    if (selectedCategory) {
      list = list.filter(p => p.category === selectedCategory);
    }

    // 4. Archive YearMonth Filter
    if (selectedArchive) {
      list = list.filter(p => p.date.startsWith(selectedArchive));
    }

    // Sort by Date descebding + Pinned posts always on top
    return list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  };

  const filteredPosts = getFilteredPosts();

  // Handle viewing specific article detail
  const handleSelectPost = (id: string) => {
    setSelectedPostId(id);
    setCurrentTab('articles');
    
    // Check if tracked_reads already includes this post ID in sessionStorage (unique reading deduplication)
    const trackedReadsStr = sessionStorage.getItem('tracked_reads') || '[]';
    const trackedReadsList = JSON.parse(trackedReadsStr) as string[];
    
    if (!trackedReadsList.includes(id)) {
      trackedReadsList.push(id);
      sessionStorage.setItem('tracked_reads', JSON.stringify(trackedReadsList));
      
      // Increment specific post views as realistic site behavior
      setPosts(prev => prev.map(p => p.id === id ? { ...p, views: p.views + 1 } : p));
    }
  };

  // Handle post appreciation likes click
  const handleLikePost = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
    triggerToast(locale === 'zh' ? '❤️ 感谢点赞！' : '❤️ Glad you liked this post!');
  };

  // Submit main top-level comment
  const handlePublishComment = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!newNickname.trim() || !newEmail.trim()) {
      alert(translations[locale].commentRequiredTip);
      return;
    }
    if (!newCommentVal.trim() || newCommentVal === '<p><br></p>') {
      alert(locale === 'zh' ? '请输入一些评论内容！' : 'Please input some comments!');
      return;
    }

    // Assign randomized profile avatar based on name using gorgeous SVG dicebear library
    const randId = Math.floor(Math.random() * 1000);
    const avatarSeed = newNickname.replace(/\s+/g, '_');
    const newComment: Comment = {
      id: 'comment-' + Date.now(),
      postId,
      nickname: newNickname,
      email: newEmail,
      content: newCommentVal,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed || randId}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    const updatedComments = [newComment, ...comments];
    setComments(updatedComments);
    setStats(prev => ({ ...prev, commentCount: updatedComments.length }));
    
    // Reset comment inputs
    setNewCommentVal('');
    triggerToast(translations[locale].commentSuccess);
  };

  // Submit specific comment reply
  const handlePublishReply = (e: React.FormEvent, commentId: string, replyToName: string) => {
    e.preventDefault();
    if (!replyNickname.trim() || !replyEmail.trim()) {
      alert(translations[locale].commentRequiredTip);
      return;
    }
    if (!replyCommentVal.trim() || replyCommentVal === '<p><br></p>') {
      alert(locale === 'zh' ? '请输入回复内容！' : 'Please write your response!');
      return;
    }

    const randId = Math.floor(Math.random() * 1000);
    const avatarSeed = replyNickname.replace(/\s+/g, '_');
    const activePost = posts.find(p => p.id === selectedPostId);

    const newReply: Comment = {
      id: 'comment-' + Date.now(),
      postId: selectedPostId || '',
      nickname: replyNickname,
      email: replyEmail,
      content: replyCommentVal,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed || randId}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      replyTo: replyToName
    };

    const updatedComments = [newReply, ...comments];
    setComments(updatedComments);
    setStats(prev => ({ ...prev, commentCount: updatedComments.length }));

    // Reset replying settings
    setReplyingToCommentId(null);
    setReplyCommentVal('');
    triggerToast(translations[locale].commentSuccess);
  };

  // Handle direct sharing to twitter/X or telegram helper
  const handleShare = (postTitle: string, social: 'x' | 'wechat' | 'weibo' | 'facebook' | 'instagram' | 'youtube' | 'telegram' | 'link') => {
    const shareUrl = window.location.href;
    const shareText = `【${locale === 'zh' ? '小何AI分享' : 'XiaoHe AIShare'}】"${postTitle}" - \n${shareUrl}`;
    
    if (social === 'link') {
      navigator.clipboard.writeText(shareText);
      triggerToast(translations[locale].copiedMsg);
    } else if (social === 'x') {
      window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
    } else if (social === 'wechat') {
      navigator.clipboard.writeText(shareText);
      triggerToast(locale === 'zh' ? '📋 微信分享链接已复制！可直接粘贴分享' : '📋 WeChat sharing link copied! Paste in WeChat to share.');
    } else if (social === 'weibo') {
      window.open(`https://service.weibo.com/share/share.php?title=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (social === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (social === 'instagram') {
      navigator.clipboard.writeText(shareText);
      triggerToast(locale === 'zh' ? '📋 Instagram分享消息已复制！打开 Instagram 即可分享' : '📋 Instagram text copied! Open Instagram to share.');
    } else if (social === 'youtube') {
      navigator.clipboard.writeText(shareText);
      triggerToast(locale === 'zh' ? '📋 YouTube分享链接已复制！打开 YouTube 即可发布分享' : '📋 YouTube link copied! Open YouTube to publish share.');
    } else if (social === 'telegram') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(postTitle)}`, '_blank');
    }
  };

  // Previous post / Next post selectors inside detail view
  const getPrevAndNextPosts = () => {
    if (!selectedPostId) return { prev: null, next: null };
    const idx = posts.findIndex(p => p.id === selectedPostId);
    return {
      prev: idx > 0 ? posts[idx - 1] : null,
      next: idx < posts.length - 1 ? posts[idx + 1] : null
    };
  };

  const { prev: prevPost, next: nextPost } = getPrevAndNextPosts();
  const currentPost = posts.find(p => p.id === selectedPostId);

  // Clear all filters easily
  const handleClearFilters = () => {
    setSelectedTag(null);
    setSelectedCategory(null);
    setSelectedArchive(null);
    setSearchQuery('');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-indigo-500/10 selection:text-indigo-600 ${
      theme === 'dark' ? 'bg-[#090d16] text-slate-100' : 'bg-[#f4f6fa] text-slate-850'
    }`}>
      
      {/* Ambient background decoration glow */}
      <div className="absolute top-0 left-0 right-0 h-[450px] bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none select-none dark:from-indigo-950/10" />

      {/* Toast Notifications */}
      {toastMessage && (
        <div className="fixed z-50 bottom-5 right-5 max-w-sm flex items-center gap-2.5 p-4 rounded-xl bg-slate-900 border border-slate-800/80 text-white shadow-2xl animate-slideUp">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* 1. Header (顶部导航栏) */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#090d16]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.015)]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          
          {/* Left brand logo and navigation menu, aligned next to each other */}
          <div className="flex items-center gap-6 md:gap-8 flex-1 min-w-0">
            {/* Logo Brand - Scaled up visually by 2x */}
            <div 
              onClick={() => { setCurrentTab('home'); setSelectedPostId(null); handleClearFilters(); }}
              className="flex items-center gap-3 cursor-pointer group shrink-0"
            >
              <div className="relative w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-500/30 flex items-center justify-center overflow-hidden shadow-md transition-all group-hover:border-indigo-500 group-hover:shadow-indigo-500/10">
                {/* Pulsing smart node background glowing effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/15 via-purple-500/15 to-pink-500/5 opacity-70 group-hover:opacity-100 transition-opacity" />
                <div className="absolute w-3 h-3 rounded-full bg-indigo-500/80 blur-[2px] group-hover:scale-125 transition-transform" />
                
                {/* Clean high-tech glowing ring / emblem icon */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="relative w-7 h-7 text-indigo-600 dark:text-indigo-400 group-hover:rotate-12 transition-transform duration-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21L14.907 18M14.907 18l5.244-8.125a2.25 2.25 0 10-3.791-2.424l-5.24 8.12M14.907 18L11 13M16.36 6.36l-8.125 5.244a2.25 2.25 0 102.424 3.79l8.125-5.242" />
                </svg>
              </div>
              <div className="leading-none flex flex-col justify-center">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900 dark:text-white block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase">
                  小何 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 font-black">AI</span> 分享
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-505 font-mono tracking-[0.25em] block mt-1.5 font-bold">
                  INTELLIGENT HUB
                </span>
              </div>
            </div>

            {/* Top Menu aligned near logo */}
            <nav className="hidden md:flex items-center gap-2">
              {/* Home */}
              <button
                onClick={() => { setCurrentTab('home'); setSelectedPostId(null); handleClearFilters(); }}
                className={`px-4 py-2 rounded-xl text-sm sm:text-[15px] font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                  currentTab === 'home' && !selectedPostId && !selectedCategory && !selectedTag && !selectedArchive
                    ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <Home className="w-4.5 h-4.5 text-emerald-500 dark:text-emerald-400 stroke-[2.5]" />
                <span>{locale === 'zh' ? '主页' : 'Home'}</span>
              </button>

              {/* Articles with sync dropdown category items */}
              <div 
                className="relative"
                onMouseEnter={() => setShowArticlesDropdown(true)}
                onMouseLeave={() => setShowArticlesDropdown(false)}
              >
                <button
                  onClick={() => { setCurrentTab('articles'); setSelectedPostId(null); setSelectedCategory(null); }}
                  className={`px-4 py-2 rounded-xl text-sm sm:text-[15px] font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                    currentTab === 'articles' || selectedPostId || selectedCategory || selectedTag || selectedArchive
                      ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <BookOpen className="w-4.5 h-4.5 text-sky-500 dark:text-sky-400 stroke-[2.5]" />
                  <span>{locale === 'zh' ? '文章' : 'Articles'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200" />
                </button>

                {/* Categories sub menu dropdown */}
                {showArticlesDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 animate-fadeIn flex flex-col">
                    {/* View all option */}
                    <button
                      onClick={() => {
                        setCurrentTab('articles');
                        setSelectedPostId(null);
                        handleClearFilters();
                        setShowArticlesDropdown(false);
                      }}
                      className="px-3.5 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/50"
                    >
                      <BookOpen className="w-3.5 h-3.5 opacity-60" />
                      <span>{locale === 'zh' ? '全部文章' : 'All Articles'}</span>
                    </button>

                    {/* Auto dynamic listed categories */}
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          setCurrentTab('articles');
                          setSelectedPostId(null);
                          setSelectedCategory(cat);
                          setSelectedTag(null);
                          setSelectedArchive(null);
                          setSearchQuery('');
                          setShowArticlesDropdown(false);
                        }}
                        className={`px-3.5 py-1.5 text-left text-xs transition-colors flex items-center justify-between hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 ${
                          selectedCategory === cat 
                            ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/5' 
                            : 'text-slate-600 dark:text-slate-400 font-medium'
                        }`}
                      >
                        <span className="truncate">{cat}</span>
                        <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded-full">
                          {posts.filter(p => p.category === cat).length}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* About */}
              <button
                onClick={() => { setCurrentTab('about'); setSelectedPostId(null); }}
                className={`px-4 py-2 rounded-xl text-sm sm:text-[15px] font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                  currentTab === 'about'
                    ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <User className="w-4.5 h-4.5 text-rose-500 dark:text-rose-400 stroke-[2.5]" />
                <span>{locale === 'zh' ? '关于' : 'About'}</span>
              </button>

              {/* Privacy */}
              <button
                onClick={() => { setCurrentTab('privacy'); setSelectedPostId(null); }}
                className={`px-4 py-2 rounded-xl text-sm sm:text-[15px] font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                  currentTab === 'privacy'
                    ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <Shield className="w-4.5 h-4.5 text-amber-500 dark:text-amber-400 stroke-[2.5]" />
                <span>{locale === 'zh' ? '隐私' : 'Privacy'}</span>
              </button>
            </nav>
          </div>

          {/* Global Operations Space */}
          <div className="flex items-center gap-2 flex-1 md:flex-initial justify-end">
            
            {/* Real Search Box */}
            <div className="relative max-w-[120px] sm:max-w-[180px] w-full">
              <input
                type="text"
                placeholder={translations[locale].searchPlaceholder}
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  if (currentTab !== 'articles') {
                    setCurrentTab('articles');
                    setSelectedPostId(null);
                  }
                }}
                className={`w-full py-1.5 pl-8 pr-3 rounded-lg border text-xs outline-none transition-all ${
                  theme === 'dark' 
                    ? 'bg-slate-900 border-slate-805 focus:border-indigo-500 text-slate-100 focus:bg-slate-950' 
                    : 'bg-white border-slate-200 focus:border-indigo-500 text-slate-800 focus:bg-white'
                }`}
              />
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Language switch */}
            <button
              onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
              className={`text-[11px] px-2.5 py-1.5 font-bold rounded-lg border transition-colors cursor-pointer ${
                theme === 'dark' ? 'border-slate-800 hover:bg-slate-800 text-slate-200' : 'border-slate-200 hover:bg-slate-100 text-slate-750'
              }`}
              title={locale === 'zh' ? 'Switch to English' : '切换至中文'}
            >
              {translations[locale].currentLanguage}
            </button>

            {/* Theme switcher */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                theme === 'dark' ? 'border-slate-800 text-amber-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Console Dashboard Trigger */}
            {isAdmin ? (
              <button
                onClick={() => setShowAdminPanel(true)}
                className="bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs px-2.5 py-1 rounded transition-all shadow-sm flex items-center gap-1 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{locale === 'zh' ? '后台仪表盘' : 'Console'}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className={`p-2 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-md shrink-0 cursor-pointer bg-white dark:bg-slate-900 ${
                  theme === 'dark' ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-700 bg-white'
                }`}
                title={translations[locale].login}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="text-xs font-bold hidden sm:inline">{translations[locale].login}</span>
              </button>
            )}

          </div>

        </div>
      </header>

      {/* Nav for Mobile Layout */}
      <div className="md:hidden flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090d16] justify-around py-3 text-xs font-semibold">
        <button
          onClick={() => { setCurrentTab('home'); setSelectedPostId(null); }}
          className={currentTab === 'home' && !selectedPostId ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'}
        >
          {translations[locale].navHome}
        </button>
        <button
          onClick={() => { setCurrentTab('articles'); setSelectedPostId(null); }}
          className={currentTab === 'articles' || selectedPostId ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'}
        >
          {translations[locale].navArticles}
        </button>
        <button
          onClick={() => { setCurrentTab('about'); setSelectedPostId(null); }}
          className={currentTab === 'about' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'}
        >
          {translations[locale].navAbout}
        </button>
        <button
          onClick={() => { setCurrentTab('privacy'); setSelectedPostId(null); }}
          className={currentTab === 'privacy' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'}
        >
          {translations[locale].navPrivacy}
        </button>
      </div>

      {/* 2. Main Page Layout Grid (充满屏幕并配有侧边栏) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Core content view area */}
        <div className="flex-1 min-w-0 space-y-8">
          
          {/* TAB 1: HOME VIEW & CAROUSEL */}
          {currentTab === 'home' && !selectedPostId && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Slideshow element (幻灯片播放) */}
              <div id="hero-carousel" className="relative group overflow-hidden rounded-2xl bg-slate-900 border border-slate-200/10 shadow-xl h-[280px] sm:h-[400px]">
                <img 
                  src={INITIAL_SLIDES[slideIndex].image} 
                  alt="Post banner" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-[101%] transition-all duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                {/* Text overlay dynamic banner */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-left space-y-2.5">
                  <span className="inline-block bg-sky-500 text-white font-bold tracking-widest uppercase text-[10px] px-2.5 py-0.5 rounded-full shadow-md">
                    {locale === 'zh' ? '热文推荐' : 'Featured News'}
                  </span>
                  
                  <h2 className="text-lg sm:text-2xl font-extrabold text-white leading-snug drop-shadow-md">
                    {locale === 'zh' ? INITIAL_SLIDES[slideIndex].title : INITIAL_SLIDES[slideIndex].titleEn}
                  </h2>
                  
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium line-clamp-2 leading-relaxed">
                    {locale === 'zh' ? INITIAL_SLIDES[slideIndex].description : INITIAL_SLIDES[slideIndex].descriptionEn}
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={() => handleSelectPost(INITIAL_SLIDES[slideIndex].postId)}
                      className="bg-white hover:bg-sky-500 hover:text-white text-slate-900 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-lg flex items-center gap-1.5 hover:shadow-sky-500/20"
                    >
                      <span>{translations[locale].slideReadMore}</span>
                      <ChevronRightCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Left/Right manual arrows */}
                <button
                  onClick={() => setSlideIndex(prev => (prev - 1 + INITIAL_SLIDES.length) % INITIAL_SLIDES.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/50 text-white hover:bg-slate-950/80 transition-all opacity-0 group-hover:opacity-100 hidden sm:block shadow-md border border-white/5"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSlideIndex(prev => (prev + 1) % INITIAL_SLIDES.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/50 text-white hover:bg-slate-950/80 transition-all opacity-0 group-hover:opacity-100 hidden sm:block shadow-md border border-white/5"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Navigation Dots */}
                <div className="absolute right-6 top-6 flex gap-1.5">
                  {INITIAL_SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSlideIndex(idx)}
                      className={`h-1.5 transition-all rounded-full ${idx === slideIndex ? 'w-6 bg-sky-500' : 'w-1.5 bg-white/50'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Home title separator */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-500" />
                  <span>{locale === 'zh' ? '精品专栏推荐' : 'Featured Columns'}</span>
                </h3>
                
                <span
                  onClick={() => setCurrentTab('articles')}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 font-semibold cursor-pointer flex items-center gap-1"
                >
                  <span>{locale === 'zh' ? '查看更多文章' : 'Explore entries'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Cards list arranged inline as in the screenshot */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 sm:p-6 rounded-2xl shadow-sm divide-y divide-slate-150 dark:divide-slate-800/80">
                {posts.slice(0, 4).map(post => (
                  <article 
                    key={post.id} 
                    id={`post-card-${post.id}`}
                    onClick={() => handleSelectPost(post.id)}
                    className="group cursor-pointer flex flex-col md:flex-row gap-5 py-5 first:pt-1 last:pb-1 transition-all"
                  >
                    {/* Left: Metadata and content */}
                    <div className="flex-1 flex flex-col justify-between min-w-0 md:pr-4">
                      <div className="space-y-2">
                        {post.isPinned && (
                          <div className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                            <Pin className="w-2.5 h-2.5 fill-current" />
                            <span>{translations[locale].pinned}</span>
                          </div>
                        )}
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug line-clamp-2">
                          {locale === 'zh' ? post.title : post.titleEn}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 md:line-clamp-3 leading-relaxed">
                          {locale === 'zh' ? post.excerpt : post.excerptEn}
                        </p>
                      </div>

                      {/* Info footer metadata block */}
                      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
                        <span className="flex items-center gap-1 text-slate-550 dark:text-slate-400">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                          <span>{translations[locale].authorName}</span>
                        </span>
                        <span className="text-slate-205 dark:text-slate-800">|</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{post.date}</span>
                        </span>
                        <span className="text-slate-205 dark:text-slate-800">|</span>
                        <span className="flex items-center gap-1 font-mono">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-rose-500"><path d="M12.969 2.11a1.25 1.25 0 00-1.938 0C10.047 3.318 9 5.23 9 7.25c0 1.25.5 2.45 1.414 3.364A4.75 4.75 0 0013.78 12c1.25 0 2.45-.5 3.364-1.414A4.75 4.75 0 0018.5 7.25c0-2.02-1.047-3.932-2.031-5.14a1.25 1.25 0 00-1.938 0C13.547 3.318 12.5 5.23 12.5 7.25c0 .354-.082.688-.228.987A1.25 1.25 0 0111 9.07a3.25 3.25 0 01-1.439-5.467c.783-.82 1.625-1.442 2.228-1.895l.083-.06c.328-.247.74-.378 1.157-.378a2.12 2.12 0 011.517.625l.063.063c.48.48.868 1.05 1.152 1.687A8.25 8.25 0 0112.969 2.11z" /><path d="M12.93 11.393a4.755 4.755 0 01-.15.405c-.146.299-.364.553-.614.752a1.248 1.248 0 01-1.439.113c-.328-.246-.537-.626-.543-1.041a1.255 1.255 0 00-.78-.934 6.75 6.75 0 00-1.395-.31c-.397-.042-.77.195-.88.583a8.25 8.25 0 00-.083 4.292c.325 1.348 1.15 2.518 2.227 3.23a8.214 8.214 0 004.743 1.514 8.252 8.252 0 007.037-7.228 1.25 1.25 0 00-1.928-1.12c-.934.337-1.815.111-2.585-.363a4.72 4.72 0 01-1.139-1.28c-.48-.72-.868-1.549-1.152-2.422a1.25 1.25 0 00-1.916-.893c-.783.585-1.15 1.348-1.15 2.181 0 .2.02.398.058.59z" /></svg>
                          <span>{post.views} {locale === 'zh' ? '热度' : 'Hotness'}</span>
                        </span>
                        <span className="text-slate-205 dark:text-slate-800">|</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{comments.filter(c => c.postId === post.id).length} {locale === 'zh' ? '评论' : 'Reviews'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Right side: Cover photo in landscape */}
                    <div className="relative w-full md:w-48 lg:w-52 h-32 md:h-28 lg:h-32 rounded-lg bg-slate-100 dark:bg-slate-950 overflow-hidden shrink-0 border border-slate-150 dark:border-slate-800 shadow-sm select-none">
                      <img 
                        src={post.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'} 
                        alt="cover Image" 
                        className="w-full h-full object-cover object-center group-hover:scale-[102%] transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800';
                        }}
                      />
                      {/* Semi translucent category overlay */}
                      <div className="absolute top-2 right-2 bg-[#1e293b]/90 backdrop-blur-sm shadow-sm text-white font-semibold text-[9px] px-2 py-0.5 rounded tracking-wide font-sans">
                        {locale === 'zh' ? post.category : post.categoryEn}
                      </div>
                    </div>
                  </article>
                ))}
              </div>

            </div>
          )}

          {/* TAB 2: ARTICLES DETAILED ARCHIVE LIST */}
          {currentTab === 'articles' && !selectedPostId && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Current filtering subtitle context feedback */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900/60 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {locale === 'zh' ? '探索专栏日志' : 'Article Directory'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-1">
                    {locale === 'zh' ? '总共筛选出 ' : 'Filtered '}
                    <strong className="text-sky-500 font-bold font-mono">{filteredPosts.length}</strong> 
                    {locale === 'zh' ? ' 篇优质科普文章' : ' entries matching indices'}
                    {(selectedTag || selectedCategory || selectedArchive || searchQuery) && (
                      <span className="text-indigo-400 font-bold">
                        (Active Filters: {selectedTag ? `#${selectedTag}` : ''} {selectedCategory ? `@${selectedCategory}` : ''} {selectedArchive ? `[${selectedArchive}]` : ''} {searchQuery ? `"${searchQuery}"` : ''})
                      </span>
                    )}
                  </p>
                </div>

                {(selectedTag || selectedCategory || selectedArchive || searchQuery) && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs bg-slate-100 dark:bg-slate-850 hover:bg-rose-500/10 hover:text-rose-400 px-3 py-1.5 rounded-lg font-semibold text-slate-600 dark:text-slate-350 transition-colors"
                  >
                    {locale === 'zh' ? '清除筛选条件' : 'Clear Filters'}
                  </button>
                )}
              </div>

              {filteredPosts.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-xl shadow-sm text-center space-y-4">
                  <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-sm text-slate-500">{translations[locale].noArticles}</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 sm:p-6 rounded-2xl shadow-sm divide-y divide-slate-150 dark:divide-slate-800/80">
                  {filteredPosts.map(post => (
                    <article 
                      key={post.id} 
                      onClick={() => handleSelectPost(post.id)}
                      className="group cursor-pointer flex flex-col md:flex-row gap-5 py-5 first:pt-1 last:pb-1 transition-all"
                    >
                      {/* Left: Metadata and content */}
                      <div className="flex-1 flex flex-col justify-between min-w-0 md:pr-4">
                        <div className="space-y-2">
                          {post.isPinned && (
                            <div className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                              <Pin className="w-2.5 h-2.5 fill-current" />
                              <span>{translations[locale].pinned}</span>
                            </div>
                          )}
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug line-clamp-2">
                            {locale === 'zh' ? post.title : post.titleEn}
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 md:line-clamp-3 leading-relaxed">
                            {locale === 'zh' ? post.excerpt : post.excerptEn}
                          </p>
                        </div>

                        {/* Info footer metadata block */}
                        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
                          <span className="flex items-center gap-1 text-slate-550 dark:text-slate-400">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                            <span>{translations[locale].authorName}</span>
                          </span>
                          <span className="text-slate-205 dark:text-slate-800">|</span>
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{post.date}</span>
                          </span>
                          <span className="text-slate-205 dark:text-slate-800">|</span>
                          <span className="flex items-center gap-1 font-mono">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-rose-500"><path d="M12.969 2.11a1.25 1.25 0 00-1.938 0C10.047 3.318 9 5.23 9 7.25c0 1.25.5 2.45 1.414 3.364A4.75 4.75 0 0013.78 12c1.25 0 2.45-.5 3.364-1.414A4.75 4.75 0 0018.5 7.25c0-2.02-1.047-3.932-2.031-5.14a1.25 1.25 0 00-1.938 0C13.547 3.318 12.5 5.23 12.5 7.25c0 .354-.082.688-.228.987A1.25 1.25 0 0111 9.07a3.25 3.25 0 01-1.439-5.467c.783-.82 1.625-1.442 2.228-1.895l.083-.06c.328-.247.74-.378 1.157-.378a2.12 2.12 0 011.517.625l.063.063c.48.48.868 1.05 1.152 1.687A8.25 8.25 0 0112.969 2.11z" /><path d="M12.93 11.393a4.755 4.755 0 01-.15.405c-.146.299-.364.553-.614.752a1.248 1.248 0 01-1.439.113c-.328-.246-.537-.626-.543-1.041a1.255 1.255 0 00-.78-.934 6.75 6.75 0 00-1.395-.31c-.397-.042-.77.195-.88.583a8.25 8.25 0 00-.083 4.292c.325 1.348 1.15 2.518 2.227 3.23a8.214 8.214 0 004.743 1.514 8.252 8.252 0 007.037-7.228 1.25 1.25 0 00-1.928-1.12c-.934.337-1.815.111-2.585-.363a4.72 4.72 0 01-1.139-1.28c-.48-.72-.868-1.549-1.152-2.422a1.25 1.25 0 00-1.916-.893c-.783.585-1.15 1.348-1.15 2.181 0 .2.02.398.058.59z" /></svg>
                            <span>{post.views} {locale === 'zh' ? '热度' : 'Hotness'}</span>
                          </span>
                          <span className="text-slate-205 dark:text-slate-800">|</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{comments.filter(c => c.postId === post.id).length} {locale === 'zh' ? '评论' : 'Reviews'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Right side: Cover photo in landscape */}
                      <div className="relative w-full md:w-48 lg:w-52 h-32 md:h-28 lg:h-32 rounded-lg bg-[#f8fafc] dark:bg-slate-950 overflow-hidden shrink-0 border border-slate-150 dark:border-slate-800 shadow-sm select-none">
                        <img 
                          src={post.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'} 
                          alt="cover Image" 
                          className="w-full h-full object-cover object-center group-hover:scale-[102%] transition-transform duration-500"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800';
                          }}
                        />
                        {/* Semi translucent category overlay */}
                        <div className="absolute top-2 right-2 bg-[#1e293b]/90 backdrop-blur-sm shadow-sm text-white font-semibold text-[9px] px-2 py-0.5 rounded tracking-wide font-sans">
                          {locale === 'zh' ? post.category : post.categoryEn}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* ARTICLE VIEW DETAILS LAYOUT */}
          {selectedPostId && currentPost && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Back actions link */}
              <button
                onClick={() => setSelectedPostId(null)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{locale === 'zh' ? '返回文章列表' : 'Back to directory'}</span>
              </button>

              <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden p-4 sm:p-6">
                
                {/* Hero elements */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded shadow-sm">
                      {locale === 'zh' ? currentPost.category : currentPost.categoryEn}
                    </span>
                    {currentPost.isPinned && (
                      <span className="text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm">
                        <Pin className="w-3 h-3 fill-current" />
                        <span>{translations[locale].pinned}</span>
                      </span>
                    )}
                  </div>

                  <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                    {locale === 'zh' ? currentPost.title : currentPost.titleEn}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{currentPost.date}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{currentPost.views}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/10" />
                      <span>{currentPost.likes}</span>
                    </span>
                  </div>
                </div>

                {/* Banner coverage */}
                <div className="my-6 rounded-xl overflow-hidden h-[180px] sm:h-[320px] bg-slate-950/20">
                  <img 
                    src={currentPost.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'} 
                    alt="Cover image" 
                    className="w-full h-full object-cover object-center" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800';
                    }}
                  />
                </div>

                {/* Rich Content Parser */}
                <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-200">
                  {renderStyledMarkdown(locale === 'zh' ? currentPost.content : currentPost.contentEn)}
                </div>

                {/* Tags lists */}
                <div className="flex flex-wrap gap-1.5 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {currentPost.tags.map(t => (
                    <span 
                      key={t}
                      onClick={() => { setSelectedTag(t); setSelectedPostId(null); setCurrentTab('articles'); }} 
                      className="text-xs bg-slate-100 dark:bg-slate-850 hover:bg-sky-500 hover:text-white transition-colors cursor-pointer text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Likes appreciation & Social actions trigger (上一篇、下一篇、社交分享图标) */}
                <div className="mt-8 pt-6 border-t border-slate-150 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                  
                  {/* Appreciation like button */}
                  <button
                    onClick={() => handleLikePost(currentPost.id)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-500/15 text-rose-500 px-6 hover:bg-rose-500/25 transition-all text-xs sm:text-sm font-bold shadow-sm"
                  >
                    <Heart className="w-4.5 h-4.5 fill-current" />
                    <span>{locale === 'zh' ? '给本篇文章点赞' : 'Appreciation Like'} ({currentPost.likes})</span>
                  </button>

                  {/* Social sharing targets */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-400">{translations[locale].shareTo}</span>
                    
                    {/* X (formerly Twitter) */}
                    <button
                      onClick={() => handleShare(currentPost.title, 'x')}
                      className="p-1.5 rounded-full bg-black text-white hover:bg-slate-900 border border-slate-800/20 transition-all shadow-sm transform hover:-translate-y-0.5"
                      title={locale === 'zh' ? '分享到 X (Twitter)' : 'Share to X (Twitter)'}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </button>

                    {/* WeChat (微信) */}
                    <button
                      onClick={() => handleShare(currentPost.title, 'wechat')}
                      className="p-1.5 rounded-full bg-[#07C160] text-white hover:bg-[#06af54] transition-all shadow-sm transform hover:-translate-y-0.5"
                      title={locale === 'zh' ? '分享到微信' : 'Share to WeChat'}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M8.2 14.2c-.3 0-.6-.2-.6-.5 0-.3.3-.5.6-.5.3 0 .6.2.6.5 0 .3-.3.5-.6.5zm3.8 0c-.3 0-.6-.2-.6-.5 0-.3.3-.5.6-.5.3 0 .6.2.6.5 0 .3-.3.5-.6.5zm.9-8.3C10.9 5.3 8.8 5 6.6 5 2.8 5 0 7.6 0 10.9c0 1.8 1 3.4 2.5 4.6l-.6 1.9 2.1-1.1c.8.2 1.6.3 2.5.3h.3c-.2-.6-.3-1.2-.3-1.9 0-3.3 2.9-6 6.5-6h.4c-.9-1.2-2.1-2.1-3.5-2.7zm5.1 4c-3.1 0-5.7 2.2-5.7 4.9s2.6 4.9 5.7 4.9c.7 0 1.5-.1 2.2-.4l1.6.8-.5-1.5c1.1-1 1.9-2.3 1.9-3.8.1-2.7-2.5-4.9-5.7-4.9zm-2.1 4c-.3 0-.5-.2-.5-.5 0-.3.2-.5.5-.5s.5.2.5.5c0 .3-.2.5-.5.5zm4.2 0c-.3 0-.5-.2-.5-.5 0-.3.2-.5.5-.5s.5.2.5.5c0 .3-.2.5-.5.5z"/></svg>
                    </button>

                    {/* Weibo (微博) */}
                    <button
                      onClick={() => handleShare(currentPost.title, 'weibo')}
                      className="p-1.5 rounded-full bg-[#DF2029] text-white hover:bg-[#c51c24] transition-all shadow-sm transform hover:-translate-y-0.5"
                      title={locale === 'zh' ? '分享到新浪微博' : 'Share to Weibo'}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M9.704 14.242c1.948.337 3.738-.415 4-.1.261.315-1.077 1.993-2.946 2.316C8.89 16.782 7.11 16.14 6.85 15.825c-.261-.315 1.076-1.993 2.854-2.316zm6.386-4.526c.23-.21.246-.532.036-.762a.544.544 0 0 0-.762-.036 6.57 6.57 0 0 0-1.782 2.392c-.13.3 0 .653.303.782.3.13.653 0 .782-.3a5.38 5.38 0 0 1 1.423-2.076zm2.222-2.13c.234-.206.257-.557.05-.791a.564.564 0 0 0-.79-.05 10.3 10.3 0 0 0-3.139 3.916.551.551 0 0 0 .307.725.556.556 0 0 0 .723-.307 9.17 9.17 0 0 1 2.85-3.493zM22.9 8.281a8.68 8.68 0 0 0-3.3-3.003h-.002c-.3-.153-.667-.037-.82.261-.153.3-.037.667.261.82 1.348.687 2.15 1.767 2.385 3.208.06.326.37.535.696.475.326-.06.535-.371.475-.697a4.9 4.9 0 0 0-.695-1.064zM10.867 7.009c-4.493-.314-8.158 1.96-8.183 5.078-.025 3.118 3.593 5.908 8.086 6.223 4.494.314 8.16-1.96 8.185-5.078.025-3.118-3.593-5.908-8.088-6.223zm-.088 9.535c-2.482-.174-4.432-1.731-4.355-3.483.076-1.751 2.152-3.033 4.633-2.86 2.48.173 4.43 1.732 4.353 3.483s-2.15 3.033-4.631 2.86z"/></svg>
                    </button>

                    {/* Facebook */}
                    <button
                      onClick={() => handleShare(currentPost.title, 'facebook')}
                      className="p-1.5 rounded-full bg-[#1877F2] text-white hover:bg-[#166fe5] transition-all shadow-sm transform hover:-translate-y-0.5"
                      title={locale === 'zh' ? '分享到 Facebook' : 'Share to Facebook'}
                    >
                      <Facebook className="w-3.5 h-3.5" />
                    </button>

                    {/* Instagram/IG */}
                    <button
                      onClick={() => handleShare(currentPost.title, 'instagram')}
                      className="p-1.5 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white hover:brightness-110 transition-all shadow-sm transform hover:-translate-y-0.5"
                      title={locale === 'zh' ? '分享到 Instagram' : 'Share to Instagram'}
                    >
                      <Instagram className="w-3.5 h-3.5" />
                    </button>

                    {/* Youtube */}
                    <button
                      onClick={() => handleShare(currentPost.title, 'youtube')}
                      className="p-1.5 rounded-full bg-[#FF0000] text-white hover:bg-[#cc0000] transition-all shadow-sm transform hover:-translate-y-0.5"
                      title={locale === 'zh' ? '分享到 YouTube' : 'Share to YouTube'}
                    >
                      <Youtube className="w-3.5 h-3.5" />
                    </button>

                    {/* Telegram */}
                    <button
                      onClick={() => handleShare(currentPost.title, 'telegram')}
                      className="p-1.5 rounded-full bg-[#0088cc] text-white hover:bg-[#0077b5] transition-all shadow-sm transform hover:-translate-y-0.5"
                      title="Share to Telegram"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>

                    {/* Link */}
                    <button
                      onClick={() => handleShare(currentPost.title, 'link')}
                      className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-505 text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-1.5 transition-all shadow-sm transform hover:-translate-y-0.5"
                      title="Copy Link Text"
                    >
                      <span>LINK</span>
                    </button>
                  </div>
                </div>

              </article>

              {/* Prev / Next Pagination index */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prevPost ? (
                  <div 
                    onClick={() => handleSelectPost(prevPost.id)}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 hover:border-slate-200 dark:hover:border-slate-750 shadow-sm rounded-xl cursor-pointer hover:shadow-md transition-all text-left space-y-1 block"
                  >
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-widest block font-bold">{translations[locale].prevPost}</span>
                    <strong className="text-xs sm:text-sm font-semibold truncate block text-slate-850 dark:text-slate-100">{locale === 'zh' ? prevPost.title : prevPost.titleEn}</strong>
                  </div>
                ) : <div className="hidden sm:block" />}

                {nextPost ? (
                  <div 
                    onClick={() => handleSelectPost(nextPost.id)}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 hover:border-slate-200 dark:hover:border-slate-750 shadow-sm rounded-xl cursor-pointer hover:shadow-md transition-all text-right space-y-1 block"
                  >
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-widest block font-bold">{translations[locale].nextPost}</span>
                    <strong className="text-xs sm:text-sm font-semibold truncate block text-slate-850 dark:text-slate-100">{locale === 'zh' ? nextPost.title : nextPost.titleEn}</strong>
                  </div>
                ) : <div className="hidden sm:block" />}
              </div>

              {/* 3. COMMENT BOARD (评论区) */}
              <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 shadow-md rounded-2xl p-5 sm:p-8 space-y-6">
                
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <MessageSquare className="w-5 h-5 text-emerald-500" />
                  <span>{translations[locale].commentArea}</span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-mono font-bold text-slate-500">
                    {comments.filter(c => c.postId === currentPost.id).length}
                  </span>
                </h3>

                {/* Guest comment compose form */}
                <form onSubmit={(e) => handlePublishComment(e, currentPost.id)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">{translations[locale].commentNickname}</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. CodeExplorer"
                        value={newNickname}
                        onChange={e => setNewNickname(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 text-sm rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-sky-500/50 text-slate-800 dark:text-slate-100 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">{translations[locale].commentEmail}</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. public@domain.io"
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 text-sm rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-sky-500/50 text-slate-800 dark:text-slate-100 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* WYSIWYG Editor wrapper */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 block mb-1">{translations[locale].commentContent}</label>
                    <WysiwygEditor
                      locale={locale}
                      value={newCommentVal}
                      onChange={val => setNewCommentVal(val)}
                      placeholder={translations[locale].commentPlaceholder}
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 hover:shadow-emerald-500/20"
                  >
                    <Send className="w-4 h-4" />
                    <span>{translations[locale].commentSubmit}</span>
                  </button>
                </form>

                {/* Review logs display list */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-4 space-y-4">
                  {comments
                    .filter(c => c.postId === currentPost.id && (!c.isHidden || isAdmin))
                    .map(comment => (
                      <div key={comment.id} className={`pt-4 flex gap-3.5 items-start ${comment.isHidden ? 'opacity-60 bg-red-500/5 dark:bg-red-500/10 p-2.5 rounded-xl border border-red-500/10' : ''}`}>
                        
                        {/* Avatar */}
                        <img 
                          src={comment.avatar} 
                          alt="Commenter Avatar" 
                          className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 dark:border-slate-750 shrink-0 shadow-inner" 
                        />
                        
                        <div className="flex-1 min-w-0 space-y-1.5">
                          
                          {/* Name and Date */}
                          <div className="flex items-center justify-between">
                            <div>
                              <strong className="text-slate-800 dark:text-slate-100 text-sm font-semibold">{comment.nickname}</strong>
                              {comment.replyTo && (
                                <span className="text-xs text-slate-300 bg-sky-500/10 px-1.5 py-0.5 rounded mx-2">
                                  {locale === 'zh' ? '回复' : 'Reply to'} @{comment.replyTo}
                                </span>
                              )}
                              {comment.isHidden && (
                                <span className="text-[10px] text-red-500 bg-red-500/10 dark:bg-red-500/20 px-1.5 py-0.5 rounded mx-2 font-bold select-none">
                                  {locale === 'zh' ? '已隐藏' : 'Hidden'}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">{comment.date}</span>
                          </div>

                          {/* Render styled inline content html safely */}
                          <div 
                            className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850 prose dark:prose-invert"
                            dangerouslySetInnerHTML={{ __html: comment.content }}
                          />

                          {/* Quick replies triggers */}
                          <div className="flex justify-end">
                            {replyingToCommentId === comment.id ? (
                              <button
                                onClick={() => setReplyingToCommentId(null)}
                                className="text-xs text-slate-500 cursor-pointer hover:text-slate-700 font-bold"
                              >
                                {translations[locale].commentCancelReply}
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setReplyingToCommentId(comment.id);
                                  setReplyNickname('');
                                  setReplyEmail('');
                                  setReplyCommentVal('');
                                }}
                                className="text-xs text-indigo-500 hover:text-indigo-400 font-bold hover:underline"
                              >
                                {translations[locale].commentReply}
                              </button>
                            )}
                          </div>

                          {/* Nested Inline Reply composing portal */}
                          {replyingToCommentId === comment.id && (
                            <form 
                              onSubmit={(e) => handlePublishReply(e, comment.id, comment.nickname)}
                              className="bg-slate-50 dark:bg-slate-950/60 p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3.5 mt-2 animate-fadeIn"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                  <label className="text-xs text-slate-400 block mb-1">{translations[locale].commentNickname}</label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="Your Name..."
                                    value={replyNickname}
                                    onChange={e => setReplyNickname(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-lg p-2 outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 dark:text-slate-100"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-slate-400 block mb-1">{translations[locale].commentEmail}</label>
                                  <input
                                    type="email"
                                    required
                                    placeholder="public@domain.com"
                                    value={replyEmail}
                                    onChange={e => setReplyEmail(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-lg p-2 outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 dark:text-slate-100"
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <label className="text-xs text-slate-400 block mb-1">{translations[locale].commentContent}</label>
                                <WysiwygEditor
                                  locale={locale}
                                  value={replyCommentVal}
                                  onChange={v => setReplyCommentVal(v)}
                                  placeholder={translations[locale].commentPlaceholder}
                                />
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="submit"
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all shadow"
                                >
                                  {translations[locale].commentSubmit}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setReplyingToCommentId(null)}
                                  className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-350 text-xs px-3.5 py-2 rounded-lg"
                                >
                                  {translations[locale].commentCancelReply}
                                </button>
                              </div>
                            </form>
                          )}

                        </div>
                      </div>
                    ))}
                  {comments.filter(c => c.postId === currentPost.id).length === 0 && (
                    <p className="text-xs text-slate-450 dark:text-slate-500 pt-2 italic text-left">
                      {locale === 'zh' ? '暂无留言。撰写上面的表单，成为第一个发表高见的人！' : 'Be the first to post a thought above!'}
                    </p>
                  )}
                </div>

              </section>

            </div>
          )}

          {/* TAB 3: ABOUT WORKSPACE */}
          {currentTab === 'about' && <AboutView locale={locale} />}

          {/* TAB 4: PRIVACY WORKSPACE */}
          {currentTab === 'privacy' && <PrivacyView locale={locale} />}

        </div>

        {/* Dynamic Sidebar with persistent widgets */}
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

      </main>

      {/* Footer component block */}
      <footer className="mt-auto border-t border-slate-150 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40 text-slate-400 py-6 text-center text-xs space-y-1.5 shadow-inner">
        <p className="font-medium text-slate-655 dark:text-slate-400">
          {translations[locale].footerText}
        </p>
        <p className="text-[10px] text-slate-500 font-mono tracking-wide">
          Designed with ♥ for XiaoHe. Dynamic localized routing. Built on Vercel & Cloudflare SPA standard.
        </p>
      </footer>

      {/* ADMIN DASHBOARD suite modal */}
      {showAdminPanel && (
        <AdminPanel
          posts={posts}
          comments={comments}
          stats={stats}
          locale={locale}
          onAddPost={handleAddPost}
          onUpdatePost={handleUpdatePost}
          onDeletePost={handleDeletePost}
          onDeleteComment={handleDeleteComment}
          onToggleHideComment={handleToggleHideComment}
          onUpdateStats={setStats}
          categories={categories}
          tags={tags}
          onAddCategory={handleAddCategory}
          onAddTag={handleAddTag}
          onDeleteCategory={handleDeleteCategory}
          onDeleteTag={handleDeleteTag}
          onClose={() => setShowAdminPanel(false)}
        />
      )}

      {/* LOGIN ACCESS MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-[#070b13]/85 backdrop-blur-sm flex items-center justify-center p-4 text-slate-800 dark:text-slate-100 font-sans animate-fadeIn">
          <form 
            onSubmit={handleLogin}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative space-y-4 animate-scaleUp"
          >
            <button
              type="button"
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500 dark:text-sky-400 animate-pulse" />
              <strong className="text-base text-slate-900 dark:text-slate-100 font-bold">{translations[locale].adminLoginTitle}</strong>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  {locale === 'zh' ? '管理账号' : 'Username'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={locale === 'zh' ? "请输入管理账号" : "Username"}
                  value={adminUsername}
                  onChange={e => setAdminUsername(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-750 focus:border-indigo-550 rounded-lg p-2.5 outline-none text-sm font-mono text-slate-900 dark:text-white transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  {locale === 'zh' ? '密码' : 'Password'}
                </label>
                <input
                  type="password"
                  required
                  placeholder={locale === 'zh' ? "请输入密码" : "Password"}
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-750 focus:border-indigo-550 rounded-lg p-2.5 outline-none text-sm font-mono text-slate-900 dark:text-white transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold text-xs py-2.5 rounded-lg hover:brightness-110 shadow-md transition-all active:scale-95"
              >
                {translations[locale].submit}
              </button>
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-xs px-4 rounded-lg border border-slate-200 dark:border-transparent transition-all"
              >
                {translations[locale].cancel}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

// X icon helper to resolve inline TS check
function XIcon(props: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={props.className}
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
