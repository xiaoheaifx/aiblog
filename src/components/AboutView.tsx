import React from 'react';
import { translations } from '../locales';
import { MapPin, Terminal } from 'lucide-react';

interface AboutViewProps {
  locale: 'zh' | 'en';
}

export default function AboutView({ locale }: AboutViewProps) {
  return (
    <div className="bg-white dark:bg-slate-900 shadow-lg rounded-xl p-5 sm:p-8 space-y-6 animate-fadeIn text-slate-800 dark:text-slate-200">
      
      {/* Banner / Introduction Header */}
      <div className="flex flex-col md:flex-row gap-6 items-center border-b border-slate-100 dark:border-slate-800 pb-6">
        <img 
          src="https://vlog.rr.kg/img/avatar.png" 
          alt="XiaoHe" 
          className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-slate-100 dark:bg-slate-800 object-cover"
        />
        
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100">
            {locale === 'zh' ? '小何 (XiaoHe)' : 'XiaoHe'}
          </h2>
          
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {locale === 'zh' ? '全栈研发工程师 · AI 智能体架构师 · 科技专栏作者' : 'Full Stack Engineer · AI Agent Architect · Tech Columnist'}
          </p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{locale === 'zh' ? '中国 · 深圳' : 'Shenzhen, China'}</span>
            </span>
            <span className="flex items-center gap-1">
              <Terminal className="w-3 h-3" />
              <span>xiaohefx@gmail.com</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Narrative Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 leading-relaxed text-sm text-slate-600 dark:text-slate-300">
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {locale === 'zh' ? '关于我' : 'My Story'}
          </h3>
          <p>
            {locale === 'zh'
              ? '您好！我是小何。一个致力于人工智能应用化落地、全栈低延迟技术打磨的前端专家与技术极客。'
              : 'Hello! Im XiaoHe. I am a full-stack engineer and tech enthusiast dedicated to AI applications and low-latency technology.'}
          </p>
          <p>
            {locale === 'zh'
              ? '本博客是我分享日常研究、行业剖析、以及工程实践的自媒体。希望能为您的进阶带来一丝灵感。'
              : 'This blog is where I share research, industry analysis, and engineering practices. I hope you find valuable inspiration here.'}
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {locale === 'zh' ? '技能' : 'Skills'}
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
              <strong className="text-slate-800 dark:text-slate-200 block mb-1">AI & LLMs</strong>
              <div className="text-slate-500 dark:text-slate-400">Gemini, OpenAI, RAG, Prompt Opt</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
              <strong className="text-slate-800 dark:text-slate-200 block mb-1">Frontend</strong>
              <div className="text-slate-500 dark:text-slate-400">React, TypeScript, Tailwind</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
              <strong className="text-slate-800 dark:text-slate-200 block mb-1">DevOps</strong>
              <div className="text-slate-500 dark:text-slate-400">Node, Express, Vercel</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
              <strong className="text-slate-800 dark:text-slate-200 block mb-1">UX/UI</strong>
              <div className="text-slate-500 dark:text-slate-400">Typography, Design Systems</div>
            </div>
          </div>
        </div>
      </div>

      {/* Experience / Career Milestone with Timeline Design */}
      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          {locale === 'zh' ? '里程碑' : 'Career Milestones'}
        </h3>
        
        <div className="relative border-l border-slate-200 dark:border-slate-700 pl-4 ml-1 space-y-4">
          <div className="relative">
            <div className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-sky-500" />
            <div className="text-xs text-sky-600 dark:text-sky-400 font-medium">2024 - PRESENT</div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
              {locale === 'zh' ? '专注于智能体的开源研发者' : 'AI Agent Implementations Specialist'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {locale === 'zh'
                ? '独立开源并维护数套多模态 AI API 与 Agent UI 配套。'
                : 'Pioneered several open-source responsive Agent UIs based on AI API ecosystem.'}
            </p>
          </div>

          <div className="relative">
            <div className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-indigo-500" />
            <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">2022 - 2024</div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
              {locale === 'zh' ? '深耕 RAG 与智能化搜索系统开发' : 'Senior Full Stack & RAG Systems Engineer'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {locale === 'zh'
                ? '主导开发百万级知识库 RAG 系统。'
                : 'Architected and launched deep keyword-vector hybrid RAG modules.'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}