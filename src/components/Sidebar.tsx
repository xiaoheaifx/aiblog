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
      <div id="sidebar-profile" className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-5 text-center transition-all hover:shadow-md">
        {/* Abstract design element / top gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-sky-500 to-indigo-600" />
        
        <div className="mt-3 flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-sky-500 rounded-full blur-sm group-hover:opacity-100 opacity-60 transition duration-500" />
            <img 
              src="https://xiaoheai.eu.cc/img/u_0g5up7rqh5/1780112151165_ozd.jpg" 
              alt="Avatar" 
              className="relative w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-850 border-2 border-white dark:border-slate-800 shadow-md object-cover"
            />
          </div>
        </div>

        <h3 className="mt-4.5 text-base font-black text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1.5">
          <span>{translations[locale].authorName}</span>
          <ShieldCheck className="w-4 h-4 text-indigo-500 fill-indigo-500/10" />
        </h3>
        
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-405 leading-normal max-w-[210px] mx-auto font-semibold">
          {translations[locale].authorSub}
        </p>

        {/* Quantify metrics Grid */}
        <div className="my-4.5 grid grid-cols-3 gap-1 px-1 border-y border-slate-100 dark:border-slate-800/80 py-3 text-center">
          <div>
            <span className="text-[10px] text-slate-400 block truncate font-bold">{translations[locale].articlesCount}</span>
            <strong className="text-sm font-black text-slate-800 dark:text-slate-100 font-mono block mt-0.5">{posts.length}</strong>
          </div>
          <div className="border-x border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] text-slate-405 block truncate font-bold">{translations[locale].commentsCount}</span>
            <strong className="text-sm font-black text-slate-800 dark:text-slate-100 font-mono block mt-0.5">{comments.length}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-405 block truncate font-bold">{translations[locale].visitCount}</span>
            <strong className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono block mt-0.5">{stats.visitCount}</strong>
          </div>
        </div>

        {/* Social interactions */}
        <div>
          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-405 dark:text-slate-500 block mb-2.5">
            {translations[locale].socialConnect}
          </span>
          <div className="flex items-center justify-center gap-2.5">
            <a 
              href="https://github.com/xiaohefx" 
              referrerPolicy="no-referrer"
              target="_blank" 
              rel="noreferrer" 
              className="p-2 rounded-full bg-[#24292e] text-white hover:bg-black transition-all shadow-sm transform hover:-translate-y-0.5"
              title="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a 
              href="https://youtube.com" 
              referrerPolicy="no-referrer"
              target="_blank" 
              rel="noreferrer" 
              className="p-2 rounded-full bg-[#FF0000] text-white hover:bg-[#cc0000] transition-all shadow-sm transform hover:-translate-y-0.5"
              title="YouTube"
            >
              <Youtube className="w-4 h-4" />
            </a>
            <a 
              href="https://x.com" 
              referrerPolicy="no-referrer"
              target="_blank" 
              rel="noreferrer" 
              className="p-2 rounded-full bg-black text-white hover:bg-slate-900 border border-slate-800/10 dark:border-slate-800 transition-all shadow-sm transform hover:-translate-y-0.5"
              title="X (Twitter)"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a 
              href="https://t.me" 
              referrerPolicy="no-referrer"
              target="_blank" 
              rel="noreferrer" 
              className="p-2 rounded-full bg-[#0088cc] text-white hover:bg-[#0077b5] transition-all shadow-sm transform hover:-translate-y-0.5"
              title="Telegram"
            >
              <Send className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Custom categories Block (分类专栏) */}
      <div id="sidebar-categories" className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-2xl p-5 transition-all hover:shadow-md">
        <div className="flex items-center gap-3.5 mb-4.5">
          <div className="w-11 h-11 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/5 shadow-sm">
            <Layers className="w-5.2 h-5.2" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-black tracking-tight text-slate-800 dark:text-slate-100 leading-tight">
              {translations[locale].categoriesTitle}
            </span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono tracking-widest block uppercase font-bold mt-0.5">
              ARTICLE SECTIONS
            </span>
          </div>
        </div>
        
        <div className="space-y-1.5">
          {categories.map(cat => {
            const count = posts.filter(p => p.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(isSelected ? null : cat)}
                className={`w-full flex items-center justify-between text-[13px] px-3 py-2 rounded-xl transition-all ${
                  isSelected 
                    ? 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 font-extrabold shadow-sm border border-indigo-500/10' 
                    : 'text-slate-705 dark:text-slate-300 hover:bg-[#f6f8fa] dark:hover:bg-slate-850 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold'
                }`}
              >
                <span className="truncate">{cat}</span>
                <span className="font-sans font-extrabold bg-[#f0f4f9] dark:bg-slate-800 text-slate-650 dark:text-slate-400 px-2.5 py-0.5 rounded-full text-[11px] shrink-0">
                  {count}{locale === 'zh' ? ' 篇' : ' posts'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Custom tags Block (热门标签) */}
      <div id="sidebar-tags" className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-2xl p-5 transition-all hover:shadow-md">
        <div className="flex items-center gap-3.5 mb-4.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/5 shadow-sm">
            <TagIcon className="w-5.2 h-5.2" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-black tracking-tight text-slate-800 dark:text-slate-100 leading-tight">
              {translations[locale].tagsTitle}
            </span>
            <span className="text-[9px] text-slate-400 dark:text-slate-505 font-mono tracking-widest block uppercase font-bold mt-0.5">
              POPULAR TAGS
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map(tag => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => onSelectTag(isSelected ? null : tag)}
                className={`text-xs px-3 py-1 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-605 text-white font-extrabold shadow-md'
                    : 'bg-slate-50 hover:bg-[#f3f4f6] dark:bg-slate-850 text-slate-650 dark:text-slate-300 border-slate-200/50 dark:border-slate-800 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-550'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Latest comments widget with expandable content */}
      <div id="sidebar-comments" className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-2xl p-5 transition-all hover:shadow-md">
        <div className="flex items-center gap-3.5 mb-4.5">
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/5 shadow-sm">
            <MessageSquare className="w-5.2 h-5.2" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-black tracking-tight text-slate-800 dark:text-slate-100 leading-tight">
              {translations[locale].latestComments}
            </span>
            <span className="text-[9px] text-slate-400 dark:text-slate-505 font-mono tracking-widest block uppercase font-bold mt-0.5">
              RECENT VOICE
            </span>
          </div>
        </div>

        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
          {comments.slice(0, 4).map(comment => {
            const post = posts.find(p => p.id === comment.postId);
            const plainText = comment.content.replace(/<[^>]*>/g, '').trim();
            const isLong = plainText.length > 25;
            const isExpanded = expandedComments[comment.id];
            
            // Slice content conditionally
            const displayedContent = isLong && !isExpanded 
              ? `${plainText.slice(0, 25)}...` 
              : plainText;

            return (
              <div 
                key={comment.id} 
                className="group flex flex-col gap-2 p-2.5 rounded-xl hover:bg-[#f6f8fa] dark:hover:bg-slate-850 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
              >
                <div className="flex gap-2.5 items-start">
                  <img 
                    src={comment.avatar} 
                    alt="Avatar" 
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 shadow-sm" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <strong className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate pr-1">
                        {comment.nickname}
                      </strong>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono scale-95 origin-right shrink-0">{comment.date.split(' ')[0]}</span>
                    </div>

                    <div className="text-[12px] text-slate-600 dark:text-slate-350 leading-relaxed mt-1 font-medium break-all">
                      <span>{displayedContent}</span>
                      {isLong && (
                        <button 
                          onClick={(e) => toggleComment(comment.id, e)}
                          className="ml-1 text-[11px] font-extrabold text-indigo-605 hover:text-indigo-400 dark:text-indigo-450 dark:hover:text-indigo-305 transition-colors inline-block focus:outline-none"
                        >
                          {isExpanded ? (locale === 'zh' ? ' 【收起】' : ' [Collapse]') : (locale === 'zh' ? ' 【展开】' : ' [Expand]')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {post && (
                  <button 
                    onClick={() => onSelectPost(comment.postId)}
                    className="text-[10px] text-slate-450 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 truncate text-left mt-0.5 max-w-full font-mono font-bold block pt-1 border-t border-slate-100 dark:border-slate-800/40 select-none scale-95 origin-left"
                  >
                    #{locale === 'zh' ? post.title : post.titleEn}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Archives (文章归档) */}
      <div id="sidebar-archives" className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-2xl p-5 transition-all hover:shadow-md">
        <div className="flex items-center gap-3.5 mb-4.5">
          {/* Pastel Peach/Amber Container matches the style of the screenshot perfectly */}
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/5 shadow-sm">
            <Calendar className="w-5.2 h-5.2" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-black tracking-tight text-slate-800 dark:text-slate-100 leading-tight">
              {translations[locale].archivesTitle}
            </span>
            <span className="text-[9px] text-slate-400 dark:text-slate-505 font-mono tracking-widest block uppercase font-bold mt-0.5">
              HISTORY CHRONICLE
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          {archiveGroups.map(grp => {
            const isSelected = selectedArchive === grp.key;
            return (
              <button
                key={grp.key}
                onClick={() => onSelectArchive(isSelected ? null : grp.key)}
                className={`w-full flex items-center justify-between text-[13px] px-3 py-2 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-505/15 dark:text-indigo-400 font-extrabold shadow-sm border border-indigo-500/10'
                    : 'text-slate-705 dark:text-slate-300 hover:bg-[#f6f8fa] dark:hover:bg-slate-850 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold'
                }`}
              >
                <span>{locale === 'zh' ? grp.label : grp.labelEn}</span>
                <span className="font-sans font-extrabold bg-[#f0f4f9] dark:bg-slate-800 text-slate-650 dark:text-slate-400 px-2.5 py-0.5 rounded-full text-[11px] shrink-0">
                  {grp.count}{locale === 'zh' ? ' 篇' : ' posts'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Online Metrics with station telemetries */}
      <div id="sidebar-stats" className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-2xl p-5 transition-all hover:shadow-md">
        <div className="flex items-center gap-3.5 mb-4.5">
          <div className="w-11 h-11 rounded-xl bg-sky-505/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/5 shadow-sm">
            <Activity className="w-5.2 h-5.2" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-black tracking-tight text-slate-800 dark:text-slate-100 leading-tight">
              {translations[locale].statsTitle}
            </span>
            <span className="text-[9px] text-slate-400 dark:text-slate-505 font-mono tracking-widest block uppercase font-bold mt-0.5">
              STATION TELEMETRY
            </span>
          </div>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-slate-650 dark:text-slate-405">
            <span className="font-semibold">{translations[locale].runningDays}</span>
            <span className="font-mono font-black text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-100 dark:border-slate-800">
              {getRunningDays()} {translations[locale].daysUnit}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-655 dark:text-slate-405">
            <span className="font-semibold">{translations[locale].todayVisits}</span>
            <span className="font-mono font-black text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-100 dark:border-slate-800">
              {Math.floor(stats.visitCount / 10) + 12} {translations[locale].visitsUnit}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-655 dark:text-slate-405">
            <span className="font-semibold">{translations[locale].currentOnline}</span>
            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-505/5 px-2.5 py-0.5 rounded-lg border border-emerald-500/10">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span>12 {translations[locale].onlineUnit}</span>
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-655 dark:text-slate-405 pt-2 border-t border-slate-100 dark:border-slate-800/85">
            <span className="font-semibold">{translations[locale].statsActive}</span>
            <span className="font-black bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-lg text-[10px] tracking-wider">
              ONLINE
            </span>
          </div>
        </div>
      </div>

    </aside>
  );
}
