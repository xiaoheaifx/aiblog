import React, { useState } from 'react';
import { Post, Comment, UserStats } from '../types';
import { translations } from '../locales';
import { 
  Github, Youtube, Twitter, Send, BookOpen, 
  MessageSquare, Eye, Award, Calendar, Activity, 
  Tag as TagIcon, Layers, FolderHeart, ShieldCheck 
} from 'lucide-react';

interface SidebarProps {
  posts: Post[];
  comments: Comment[];
  stats: UserStats;
  locale: 'zh' | 'en';
  tags: string[];
  categories: string[];
  selectedTag: string | null;
  selectedCategory: string | null;
  selectedArchive: string | null;
  onSelectTag: (tag: string | null) => void;
  onSelectCategory: (cat: string | null) => void;
  onSelectArchive: (archive: string | null) => void;
  onSelectPost: (id: string) => void;
}

export default function Sidebar({
  posts,
  comments,
  stats,
  locale,
  tags,
  categories,
  selectedTag,
  selectedCategory,
  selectedArchive,
  onSelectTag,
  onSelectCategory,
  onSelectArchive,
  onSelectPost,
}: SidebarProps) {
  
  // Track expanded comments
  const [expandedComments, setExpandedComments] = useState<{[key: string]: boolean}>({});

  // Calculate running days of the blog (e.g., since May 18, 2025)
  const getRunningDays = () => {
    const startDate = new Date('2025-05-18');
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Build archive list
  const getArchiveGroups = () => {
    const groups: { [key: string]: { zh: string; en: string; count: number } } = {};
    posts.forEach(post => {
      const dateParts = post.date.split('-');
      if (dateParts.length >= 2) {
        const key = `${dateParts[0]}-${dateParts[1]}`;
        const year = dateParts[0];
        const month = parseInt(dateParts[1], 10);
        
        const zhMonths = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
        const enMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        if (!groups[key]) {
          groups[key] = {
            zh: `${year}年${month}月`,
            en: `${enMonths[month - 1]} ${year}`,
            count: 0
          };
        }
        groups[key].count += 1;
      }
    });

    return Object.entries(groups).map(([key, value]) => ({
      key,
      label: value.zh,
      labelEn: value.en,
      count: value.count
    }));
  };

  const archiveGroups = getArchiveGroups();

  const toggleComment = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedComments(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <aside id="sidebar-aside" className="w-full lg:w-[280px] shrink-0 space-y-5 text-slate-800 dark:text-slate-200">
      
      {/* 1. Profile Block (个人资料) */}
      <div id="sidebar-profile" className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-lg p-5 text-center transition-all">
        <div className="flex justify-center">
          <div className="relative">
            <img 
              src="https://vlog.rr.kg/img/avatar.png" 
              alt="Avatar" 
              className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-850 object-cover"
            />
          </div>
        </div>

        <h3 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
          {translations[locale].authorName}
        </h3>
        
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {translations[locale].authorSub}
        </p>

        {/* Quantify metrics Grid */}
        <div className="mt-5 grid grid-cols-3 gap-2 py-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <div>
            <strong className="text-lg font-bold text-slate-800 dark:text-slate-100 block">{posts.length}</strong>
            <span className="text-xs text-slate-500 block">{translations[locale].articlesCount}</span>
          </div>
          <div className="border-x border-slate-100 dark:border-slate-800">
            <strong className="text-lg font-bold text-slate-800 dark:text-slate-100 block">{comments.length}</strong>
            <span className="text-xs text-slate-500 block">{translations[locale].commentsCount}</span>
          </div>
          <div>
            <strong className="text-lg font-bold text-slate-800 dark:text-slate-100 block">{stats.visitCount}</strong>
            <span className="text-xs text-slate-500 block">{translations[locale].visitCount}</span>
          </div>
        </div>

        {/* Social interactions */}
        <div className="mt-2">
          <div className="flex items-center justify-center gap-4">
            <a 
              href="https://x.com/xiaohefx" 
              referrerPolicy="no-referrer"
              target="_blank" 
              rel="noreferrer" 
              className="text-sky-500 hover:text-sky-600 transition-colors"
              title="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a 
              href="https://www.youtube.com/@xiaohefx" 
              referrerPolicy="no-referrer"
              target="_blank" 
              rel="noreferrer" 
              className="text-red-500 hover:text-red-600 transition-colors"
              title="YouTube"
            >
              <Youtube className="w-5 h-5" />
            </a>
            <a 
              href="https://github.com/xiaoheaifx" 
              referrerPolicy="no-referrer"
              target="_blank" 
              rel="noreferrer" 
              className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a 
              href="https://t.me/xiaohefx" 
              referrerPolicy="no-referrer"
              target="_blank" 
              rel="noreferrer" 
              className="text-sky-500 hover:text-sky-600 transition-colors"
              title="Telegram"
            >
              <Send className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Custom categories Block (分类专栏) */}
      <div id="sidebar-categories" className="bg-white dark:bg-slate-900 shadow-lg rounded-xl p-5 transition-all">
        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <FolderHeart className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          {translations[locale].categoriesTitle}
        </h4>
        
        <div className="space-y-1">
          {categories.map(cat => {
            const count = posts.filter(p => p.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(isSelected ? null : cat)}
                className={`w-full flex items-center justify-between text-sm px-3 py-2 rounded-lg transition-all ${
                  isSelected 
                    ? 'text-slate-900 dark:text-slate-100 font-bold' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <span className="truncate">{cat}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Custom tags Block (热门标签) */}
      <div id="sidebar-tags" className="bg-white dark:bg-slate-900 shadow-lg rounded-xl p-5 transition-all">
        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <TagIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          {translations[locale].tagsTitle}
        </h4>

        <div className="flex flex-wrap gap-2">
          {tags.map(tag => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => onSelectTag(isSelected ? null : tag)}
                className={`text-xs px-3 py-1 rounded-lg transition-all ${
                  isSelected
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Latest comments widget with expandable content */}
      <div id="sidebar-comments" className="bg-white dark:bg-slate-900 shadow-lg rounded-xl p-5 transition-all">
        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          {translations[locale].latestComments}
        </h4>

        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {comments.slice(0, 4).map(comment => {
            const post = posts.find(p => p.id === comment.postId);
            const plainText = comment.content.replace(/<[^>]*>/g, '').trim();
            const isLong = plainText.length > 25;
            const isExpanded = expandedComments[comment.id];
            
            const displayedContent = isLong && !isExpanded 
              ? `${plainText.slice(0, 25)}...` 
              : plainText;

            return (
              <div 
                key={comment.id} 
                className="flex flex-col gap-1.5 pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0"
              >
                <div className="flex gap-2 items-start">
                  <img 
                    src={comment.avatar} 
                    alt="Avatar" 
                    className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate pr-1">
                        {comment.nickname}
                      </strong>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5 break-all">
                      <span>{displayedContent}</span>
                      {isLong && (
                        <button 
                          onClick={(e) => toggleComment(comment.id, e)}
                          className="ml-1 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors inline-block focus:outline-none"
                        >
                          {isExpanded ? (locale === 'zh' ? '收起' : 'Collapse') : (locale === 'zh' ? '展开' : 'Expand')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {post && (
                  <button 
                    onClick={() => onSelectPost(comment.postId)}
                    className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 truncate text-left font-mono font-bold"
                  >
                    → {locale === 'zh' ? post.title : post.titleEn}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Archives (文章归档) */}
      <div id="sidebar-archives" className="bg-white dark:bg-slate-900 shadow-lg rounded-xl p-5 transition-all">
        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          {translations[locale].archivesTitle}
        </h4>

        <div className="space-y-1">
          {archiveGroups.map(grp => {
            const isSelected = selectedArchive === grp.key;
            return (
              <button
                key={grp.key}
                onClick={() => onSelectArchive(isSelected ? null : grp.key)}
                className={`w-full flex items-center justify-between text-sm px-3 py-2 rounded-lg transition-all ${
                  isSelected
                    ? 'text-slate-900 dark:text-slate-100 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <span>{locale === 'zh' ? grp.label : grp.labelEn}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {grp.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Online Metrics with station telemetries */}
      <div id="sidebar-stats" className="bg-white dark:bg-slate-900 shadow-lg rounded-xl p-5 transition-all">
        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          {translations[locale].statsTitle}
        </h4>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
            <span>{translations[locale].runningDays}</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {getRunningDays()} {translations[locale].daysUnit}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
            <span>{translations[locale].todayVisits}</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {Math.floor(stats.visitCount / 10) + 12} {translations[locale].visitsUnit}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
            <span>{translations[locale].currentOnline}</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span>12</span>
            </span>
          </div>
        </div>
      </div>

    </aside>
  );
}