import React from 'react';
import { translations } from '../locales';
import { EyeOff, KeyRound, Lock, ShieldAlert, ShieldCheck } from 'lucide-react';

interface PrivacyViewProps {
  locale: 'zh' | 'en';
}

export default function PrivacyView({ locale }: PrivacyViewProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-md rounded-2xl p-6 sm:p-8 space-y-6 animate-fadeIn text-slate-800 dark:text-slate-200">
      
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-2">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
          <span>{translations[locale].navPrivacy}</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {locale === 'zh' ? '生效日期: 2026年5月30日 · 我们高度重视您的隐私安全' : 'Effective Date: May 30, 2026 · We value your digital privacy'}
        </p>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {locale === 'zh'
          ? '小何AI分享 博客致力于保护读者的个人隐私。在使用本博客或撰写评论时，为了向您说明数据的流转透明度，特编写此政策。'
          : 'XiaoHe AI Share personal blog is committed to protecting your online safety. This privacy policy describes standard practices of data handling on this site.'}
      </p>

      {/* Grid of Core Security Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-850 rounded-xl space-y-2">
          <Lock className="w-5 h-5 text-sky-500" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-250">
            {locale === 'zh' ? '零服务端监控' : 'Zero Server Snooping'}
          </h4>
          <p className="text-xs text-slate-500 leading-normal">
            {locale === 'zh'
              ? '为了完美的便携性，本博客的所有动态写入数据均存储于本地 localStorage 数据库中，我们不会向远程发送任何秘密轨迹。'
              : 'All comment histories and stats data persist directly in your browsers local storage database. Zero remote telemetry tracks you.'}
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-850 rounded-xl space-y-2">
          <KeyRound className="w-5 h-5 text-indigo-500" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-250">
            {locale === 'zh' ? '只进行本地统计' : 'Local Host Analytics'}
          </h4>
          <p className="text-xs text-slate-500 leading-normal">
            {locale === 'zh'
              ? '我们的访问和会话统计基于瞬时的用户渲染页面加载计数。没有任何第三方分析标签在背景收集位置或指纹特征。'
              : 'Our audience and visit count stats rely on lightweight rendering updates. No hidden third-party tracking pixels listen at runtime.'}
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-850 rounded-xl space-y-2">
          <ShieldAlert className="w-5 h-5 text-emerald-500" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-250">
            {locale === 'zh' ? '安全的评论保护' : 'Secure Comment Protection'}
          </h4>
          <p className="text-xs text-slate-500 leading-normal">
            {locale === 'zh'
              ? '您评论时输入的邮箱绝对不公开显示，也仅作为本地生成 DiceBear 精美头像和存储在本地数据模型时的标识性哈希。'
              : 'Your email address is confidential. It remains masked and is strictly used to compile an avatar representation.'}
          </p>
        </div>
      </div>

      {/* Structured Sections */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        
        <div className="space-y-1.5">
          <h3 className="font-bold text-slate-850 dark:text-white">
            {locale === 'zh' ? '一、 评论数据与随机头像的分配' : '1. Guest Comments & Randomized Avatars'}
          </h3>
          <p className="text-xs">
            {locale === 'zh'
              ? '当访客发表评论或提交回复时，必须输入邮箱和昵称以维持社区秩序。系统会针对您的昵称哈希，为您随机、公正地分配一个科幻风格的专属机器人/冒险者角色头像。邮箱地址经过掩码，永远不会显示在页面的 HTML 结构中，杜绝了被爬虫抓取用于垃圾邮件营销的隐患。'
              : 'When visitors write a comment, name and email details are validated. The app hashes nickname parameters to assign an avatar blockly. Your email is fully shielded from DOM crawlers, avoiding the threat of marketing spam.'}
          </p>
        </div>

        <div className="space-y-1.5">
          <h3 className="font-bold text-slate-850 dark:text-white">
            {locale === 'zh' ? '二、 离线与部署兼容' : '2. Static Deployment Readiness'}
          </h3>
          <p className="text-xs">
            {locale === 'zh'
              ? '本博客完全解耦了对中心化云服务器的深层依赖，这意味着您可以毫无障碍地通过 cloudflare pages、Vercel 甚至 GitHub Pages 进行秒级打包部署。所有内容及管理增删改查都能在没有大型 SQL 数据库的状态下流畅工作，给您的硬件负载和隐私护航。'
              : 'By decoupling from centralized cloud DB solutions, the system supports serverless deployment on Vercel or Cloudflare. This ensures high speed and minimal hardware overhead.'}
          </p>
        </div>

        <div className="space-y-1.5 bg-sky-500/5 p-4 rounded-xl border border-sky-500/10 text-xs">
          <span className="font-bold text-slate-900 dark:text-white block mb-1">
            {locale === 'zh' ? '免责声明 (Disclaimer)' : 'Disclaimer'}
          </span>
          <p className="text-slate-550 dark:text-slate-400">
            {locale === 'zh'
              ? '博主（小何）致力于提供准确的前沿内容分析，但并不对任何人根据这些探讨而进行的项目代码部署其运行盈亏提供任何格式保证。祝您在 AI 技术深度探索中有更大的收获！'
              : 'XiaoHe AI Share is an educational personal blog. We provide guide templates for research and exploration. Source scripts are utilized under Apache standard terms.'}
          </p>
        </div>

      </div>

    </div>
  );
}
