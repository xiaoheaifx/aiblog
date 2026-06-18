import React from 'react';
import { translations } from '../locales';
import { KeyRound, Lock, ShieldAlert, ShieldCheck } from 'lucide-react';

interface PrivacyViewProps {
  locale: 'zh' | 'en';
}

export default function PrivacyView({ locale }: PrivacyViewProps) {
  return (
    <div className="bg-white dark:bg-slate-900 shadow-lg rounded-xl p-5 sm:p-8 space-y-5 animate-fadeIn text-slate-800 dark:text-slate-200">
      
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{translations[locale].navPrivacy}</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {locale === 'zh' ? '生效日期: 2026年5月30日 · 我们重视您的隐私安全' : 'Effective Date: May 30, 2026 · We value your digital privacy'}
        </p>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {locale === 'zh'
          ? '小何AI分享 博客致力于保护读者的个人隐私。在使用本博客或撰写评论时，为了向您说明数据的流转透明度，特编写此政策。'
          : 'XiaoHe AI Share personal blog is committed to protecting your online safety. This privacy policy describes standard practices of data handling on this site.'}
      </p>

      {/* Grid of Core Security Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-2">
          <Lock className="w-4 h-4 text-sky-500" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {locale === 'zh' ? '零服务端监控' : 'Zero Server Snooping'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {locale === 'zh'
              ? '本博客所有动态数据都存储在浏览器本地 localStorage 中，不会向远程服务端发送任何追踪。'
              : 'All comment histories and stats data persist directly in your browsers local storage. Zero remote telemetry.'}
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-2">
          <KeyRound className="w-4 h-4 text-indigo-500" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {locale === 'zh' ? '只进行本地统计' : 'Local Host Analytics'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {locale === 'zh'
              ? '我们的访问统计基于页面渲染计数。没有第三方分析标签收集位置或指纹特征。'
              : 'Our audience and visit count stats rely on lightweight rendering updates. No hidden third-party tracking.'}
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-2">
          <ShieldAlert className="w-4 h-4 text-emerald-500" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {locale === 'zh' ? '安全的评论保护' : 'Secure Comment Protection'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {locale === 'zh'
              ? '您的邮箱绝对不公开显示，只用于生成头像和本地数据存储标识。'
              : 'Your email address is confidential. It remains masked and is strictly used to compile an avatar representation.'}
          </p>
        </div>
      </div>

      {/* Structured Sections */}
      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        
        <div className="space-y-1.5">
          <h3 className="font-bold text-slate-800 dark:text-slate-200">
            {locale === 'zh' ? '一、 评论数据与随机头像' : '1. Guest Comments & Randomized Avatars'}
          </h3>
          <p className="text-xs">
            {locale === 'zh'
              ? '当访客发表评论时，必须输入邮箱和昵称以维持社区秩序。系统会为您分配一个专属头像。邮箱地址经过掩码，不会显示在页面的 HTML 结构中。'
              : 'When visitors write a comment, name and email details are validated. The app hashes nickname parameters to assign an avatar. Your email is fully shielded.'}
          </p>
        </div>

        <div className="space-y-1.5">
          <h3 className="font-bold text-slate-800 dark:text-slate-200">
            {locale === 'zh' ? '二、 离线与部署兼容' : '2. Static Deployment Readiness'}
          </h3>
          <p className="text-xs">
            {locale === 'zh'
              ? '本博客完全解耦了对中心化云服务器的依赖，支持 Cloudflare Pages、Vercel 或 GitHub Pages 部署。所有内容管理都能在无需大型数据库的状态下流畅工作。'
              : 'By decoupling from centralized cloud DB solutions, the system supports serverless deployment on Vercel or Cloudflare. This ensures high speed and minimal overhead.'}
          </p>
        </div>

        <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-xs">
          <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
            {locale === 'zh' ? '免责声明' : 'Disclaimer'}
          </span>
          <p className="text-slate-500 dark:text-slate-400">
            {locale === 'zh'
              ? '博主致力于提供准确的内容分析，但不对任何根据本站内容进行的项目部署提供保证。祝您在 AI 技术探索中取得收获！'
              : 'XiaoHe AI Share is an educational personal blog. Source scripts are utilized under Apache standard terms.'}
          </p>
        </div>

      </div>

    </div>
  );
}