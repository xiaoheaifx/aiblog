import React, { useState, useEffect } from 'react';
import { Post, Comment, UserStats } from './types';
import { translations } from './locales';
import AdminPanel from './components/AdminPanel';
import {
  Sparkles, Lock, LogOut, User
} from 'lucide-react';

export default function AdminApp() {
  // Locale state (shared across admin)
  const [locale, setLocale] = useState<'zh' | 'en'>(() => {
    const saved = localStorage.getItem('blog_locale');
    return (saved === 'zh' || saved === 'en') ? saved : 'zh';
  });

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('blog_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'light';
  });

  // Data states - loaded from D1 database
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<UserStats>({
    articleCount: 0,
    commentCount: 0,
    visitCount: 3820
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  // Auth state
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return sessionStorage.getItem('blog_auth_token');
  });

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('blog_locale', locale);
  }, [locale]);

  useEffect(() => {
    localStorage.setItem('blog_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // ===== Data Fetching =====
  const fetchPosts = async (includeDrafts = false) => {
    try {
      const url = includeDrafts ? '/api/posts?draft=all' : '/api/posts';
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      setPosts(data);
      setStats(prev => ({ ...prev, articleCount: data.length }));
    } catch (err) {
      console.error('Failed to load posts', err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch('/api/comments');
      if (!res.ok) return;
      const data = await res.json();
      setComments(data);
      setStats(prev => ({ ...prev, commentCount: data.length }));
    } catch (err) {
      console.error('Failed to load comments', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) return;
      const data = await res.json();
      setCategories(data.categories || []);
      setTags(data.tags || []);
      if (data.settings) {
        setStats(prev => ({
          ...prev,
          visitCount: data.settings.visitCount ?? prev.visitCount
        }));
      }
    } catch (err) {
      console.error('Failed to load settings', err);
      setCategories(['技术干货', '行业观察', '随笔生活']);
      setTags(['Gemini', 'LLM', 'AI Agent', 'API', '向量检索', 'Edge AI', 'WebGPU', 'Gemma', '前端设计', '编程未来', '深度检索']);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchPosts();
      fetchComments();
    }
    fetchSettings();
  }, [authToken]);

  // Toast handler
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ===== Login Handler =====
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const token = btoa(`${loginUsername}:${loginPassword}`);
    try {
      const res = await fetch('/api/posts', {
        headers: { 'Authorization': `Basic ${token}` }
      });

      if (res.status === 401) {
        setLoginError(locale === 'zh' ? '用户名或密码错误' : 'Invalid username or password');
        return;
      }

      setAuthToken(token);
      sessionStorage.setItem('blog_auth_token', token);
      localStorage.setItem('blog_is_admin', 'true');
      triggerToast(locale === 'zh' ? '欢迎回来，小何！已成功登入控制中心。' : 'Welcome back, XiaoHe! Logged into system administrator successfully.');
    } catch (err) {
      setLoginError(locale === 'zh' ? '登录失败，请检查网络' : 'Login failed, please check network');
    }
  };

  // ===== Logout Handler =====
  const handleLogout = () => {
    setAuthToken(null);
    sessionStorage.removeItem('blog_auth_token');
    localStorage.setItem('blog_is_admin', 'false');
    triggerToast(locale === 'zh' ? '已安全登出后台管理系统。' : 'Log out successful.');
  };

  // ===== Post CRUD =====
  const handleAddPost = async (newPost: Post): Promise<boolean> => {
    if (!authToken) return false;
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authToken}`
        },
        body: JSON.stringify(newPost)
      });
      if (res.ok) {
        await fetchPosts();
        triggerToast(locale === 'zh' ? '新文章发表成功！' : 'Post created successfully!');
        return true;
      } else {
        triggerToast(locale === 'zh' ? '发表失败，请重试' : 'Failed to create post');
        return false;
      }
    } catch (err) {
      triggerToast(locale === 'zh' ? '发表失败，请重试' : 'Failed to create post');
      return false;
    }
  };

  const handleUpdatePost = async (updatedPost: Post): Promise<boolean> => {
    if (!authToken) return false;
    try {
      const res = await fetch(`/api/posts/${updatedPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authToken}`
        },
        body: JSON.stringify(updatedPost)
      });
      if (res.ok) {
        await fetchPosts();
        triggerToast(locale === 'zh' ? '文章内容更新成功！' : 'Post updated successfully!');
        return true;
      } else if (res.status === 401) {
        handleLogout();
        return false;
      }
      triggerToast(locale === 'zh' ? '更新失败，请重试' : 'Failed to update post');
      return false;
    } catch (err) {
      triggerToast(locale === 'zh' ? '更新失败，请重试' : 'Failed to update post');
      return false;
    }
  };

  const handleDeletePost = async (id: string): Promise<boolean> => {
    if (!authToken) return false;
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${authToken}`
        }
      });
      if (res.ok) {
        await fetchPosts();
        triggerToast(locale === 'zh' ? '文章已被成功移除。' : 'Post deleted.');
        return true;
      } else if (res.status === 401) {
        handleLogout();
        return false;
      }
      return false;
    } catch (err) {
      triggerToast(locale === 'zh' ? '删除失败，请重试' : 'Failed to delete post');
      return false;
    }
  };

  // ===== Comment Management =====
  const handleDeleteComment = async (id: string) => {
    if (!authToken) return;
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${authToken}`
        }
      });
      if (res.ok) {
        await fetchComments();
        triggerToast(locale === 'zh' ? '评论已被成功物理删除。' : 'Comment deleted.');
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (err) {
      triggerToast(locale === 'zh' ? '删除失败，请重试' : 'Failed to delete comment');
    }
  };

  const handleToggleHideComment = async (id: string) => {
    if (!authToken) return;
    try {
      const comment = comments.find(c => c.id === id);
      if (!comment) return;

      const res = await fetch(`/api/comments/${id}/toggle-hide`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authToken}`
        },
        body: JSON.stringify({ isHidden: !comment.isHidden })
      });
      if (res.ok) {
        setComments(comments.map(c => c.id === id ? { ...c, isHidden: !c.isHidden } : c));
        triggerToast(locale === 'zh' ? '评论显示状态已切换。' : 'Comment visibility updated.');
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (err) {
      triggerToast(locale === 'zh' ? '操作失败，请重试' : 'Failed to toggle comment');
    }
  };

  // ===== Category & Tag Management =====
  const handleAddCategory = async (newCat: string) => {
    if (!authToken) return;
    if (categories.includes(newCat)) return;
    try {
      const res = await fetch('/api/settings/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authToken}`
        },
        body: JSON.stringify({ type: 'category', name: newCat })
      });
      if (res.ok) {
        const data = await res.json();
        if (!data.exists) setCategories([...categories, newCat]);
        triggerToast(locale === 'zh' ? '分类添加成功！' : 'Category added successfully!');
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (err) {
      triggerToast(locale === 'zh' ? '添加失败，请重试' : 'Failed to add category');
    }
  };

  const handleAddTag = async (newTag: string) => {
    if (!authToken) return;
    if (tags.includes(newTag)) return;
    try {
      const res = await fetch('/api/settings/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authToken}`
        },
        body: JSON.stringify({ type: 'tag', name: newTag })
      });
      if (res.ok) {
        const data = await res.json();
        if (!data.exists) setTags([...tags, newTag]);
        triggerToast(locale === 'zh' ? '标签添加成功！' : 'Tag added successfully!');
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (err) {
      triggerToast(locale === 'zh' ? '添加失败，请重试' : 'Failed to add tag');
    }
  };

  const handleDeleteCategory = async (cat: string) => {
    if (!authToken) return;
    try {
      const res = await fetch(`/api/manage/cat/${encodeURIComponent(cat)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Basic ${authToken}` }
      });
      if (res.ok) {
        setCategories(categories.filter(c => c !== cat));
        triggerToast(locale === 'zh' ? '分类已被删除。' : 'Category deleted.');
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (err) {
      triggerToast(locale === 'zh' ? '删除失败，请重试' : 'Failed to delete category');
    }
  };

  const handleDeleteTag = async (tag: string) => {
    if (!authToken) return;
    try {
      const res = await fetch(`/api/manage/tag/${encodeURIComponent(tag)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Basic ${authToken}` }
      });
      if (res.ok) {
        setTags(tags.filter(t => t !== tag));
        triggerToast(locale === 'zh' ? '标签已被删除。' : 'Tag deleted.');
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (err) {
      triggerToast(locale === 'zh' ? '删除失败，请重试' : 'Failed to delete tag');
    }
  };

  const handleUpdateStats = (newStats: UserStats) => {
    setStats(newStats);
  };

  // ===== RENDER: Login Screen =====
  if (!authToken) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-dark' : ''}`}>
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed z-50 bottom-5 right-5 max-w-sm flex items-center gap-2.5 p-4 rounded-xl bg-slate-900 border border-slate-800 text-white shadow-2xl">
            <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-200 dark:border-slate-700">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
              <Lock className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {locale === 'zh' ? '小何 · 管理后台' : 'XiaoHe · Admin Login'}
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              {locale === 'zh' ? '请输入账号密码登录' : 'Enter credentials to continue'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                {locale === 'zh' ? '用户名' : 'Username'}
              </label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-bold"
                placeholder="xiaohe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                {locale === 'zh' ? '密码' : 'Password'}
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {loginError && (
              <div className="text-red-500 text-sm font-medium text-center bg-red-50 dark:bg-red-950/30 rounded-xl py-2">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              {locale === 'zh' ? '登录' : 'Login'}
            </button>
          </form>

          <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              {locale === 'zh' ? 'English' : '中文'}
            </button>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              {theme === 'dark' ? '☀ Light' : '☾ Dark'}
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors font-bold"
            >
              {locale === 'zh' ? '← 返回首页' : '← Back to Home'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDER: Admin Panel (when logged in) =====
  return (
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
      onUpdateStats={handleUpdateStats}
      onLogin={() => {}}
      onLogout={handleLogout}
      categories={categories}
      tags={tags}
      onAddCategory={handleAddCategory}
      onAddTag={handleAddTag}
      onDeleteCategory={handleDeleteCategory}
      onDeleteTag={handleDeleteTag}
    />
  );
}