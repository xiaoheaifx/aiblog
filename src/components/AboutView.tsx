import React from 'react';
import { translations } from '../locales';
import { Award, Brain, Code, Cpu, GraduationCap, MapPin, Sparkles, Terminal } from 'lucide-react';

interface AboutViewProps {
  locale: 'zh' | 'en';
}

export default function AboutView({ locale }: AboutViewProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-md rounded-2xl p-6 sm:p-8 space-y-8 animate-fadeIn text-slate-800 dark:text-slate-200">
      
      {/* Banner / Introduction Header */}
      <div className="flex flex-col md:flex-row gap-6 items-center border-b border-slate-100 dark:border-slate-800 pb-8">
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-400 to-indigo-500 rounded-2xl blur opacity-30 transform scale-105" />
          <img 
            src="https://api.dicebear.com/7.x/adventurer/svg?seed=XiaoHe" 
            alt="XiaoHe" 
            className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-755 shadow-md"
          />
        </div>
        
        <div className="space-y-3 text-center md:text-left">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
            <span>{locale === 'zh' ? '小何 (XiaoHe)' : 'XiaoHe'}</span>
            <span className="text-xs bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded-full font-bold">
              AI EXPERT
            </span>
          </h2>
          
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
            {locale === 'zh' ? '全栈研发工程师 · AI 智能体架构师 · 科技专栏作者' : 'Full Stack Engineer · AI Agent Architect · Tech Columnist'}
          </p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>{locale === 'zh' ? '中国 · 深圳' : 'Shenzhen, China'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-500" />
              <span>xiaohefx@gmail.com</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Narrative Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed text-sm text-slate-600 dark:text-slate-300">
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Brain className="w-4.5 h-4.5 text-indigo-500" />
            <span>{locale === 'zh' ? '关于我的主张' : 'My Story'}</span>
          </h3>
          <p>
            {locale === 'zh'
              ? '您好！我是小何。一个致力于人工智能应用化落地、全栈低延迟技术打磨的前端专家与技术极客。在这个人工智能日新月异、传统工程加速被大模型重塑的交汇时代，我的核心使命是：**让高级的 AI 技术变得人人可驾驭，通过轻盈优雅的数字工具服务普罗大众**。'
              : 'Hello! Im XiaoHe. I am a full-stack engineer and tech enthusiast dedicated to refining low-latency applications combined with cutting-edge artificial intelligence. In an era redefined daily by LLMs, my mission remains: to build clean, human-centered products that transform technical capabilities into accessible daily solutions.'}
          </p>
          <p>
            {locale === 'zh'
              ? '本博客是我分享日常研究、行业剖析、以及工程实践的自媒体。这里有详细到可供复制的技术干货（Gemini API、RAG、端侧 AI、Agentic UI 等），也有关于未来软件开发模式的主流趋势展望。希望能为您的进阶带来一丝灵感。'
              : 'This blog serves as an independent thinktank where I document field observations, benchmarks, and functional guides. From hands-on walkthroughs (Gemini SDK, multi-agent frameworks, WebGPU setups) to conceptual forecasting, I hope you find valuable inspiration to drive your craft.'}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Code className="w-4.5 h-4.5 text-sky-500" />
            <span>{locale === 'zh' ? '大底座技能池' : 'Active Skills Vector'}</span>
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 p-3 rounded-xl">
              <strong className="text-slate-800 dark:text-slate-200 block mb-1">AI & LLMs</strong>
              <div className="text-slate-500">Gemini Pro/Flash, OpenAI, RAG Pipelines, Prompt Opt, Vector DBMS</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 p-3 rounded-xl">
              <strong className="text-slate-800 dark:text-slate-200 block mb-1">Frontend Craft</strong>
              <div className="text-slate-500">React, TypeScript, Tailwind CSS, Motion/Framer, WebGPU</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 p-3 rounded-xl">
              <strong className="text-slate-800 dark:text-slate-200 block mb-1">DevOps & Server</strong>
              <div className="text-slate-500">Node/CJS, Express REST API, Edge Middleware, Vercel/Cloudflare</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 p-3 rounded-xl">
              <strong className="text-slate-800 dark:text-slate-200 block mb-1">UX/UI design</strong>
              <div className="text-slate-500">Minimal Typography, Space hierarchies, Interactive transitions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Experience / Career Milestone with Timeline Design */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-4.5 h-4.5 text-violet-500" />
          <span>{locale === 'zh' ? '里程碑历程' : 'Career Milestones Timeline'}</span>
        </h3>
        
        <div className="relative border-l-2 border-slate-100 dark:border-slate-800 pl-5 ml-2.5 space-y-6">
          <div className="relative">
            <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-sky-500 border-2 border-white dark:border-slate-900" />
            <div className="text-xs font-mono font-bold text-sky-500">2024 - PRESENT</div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
              {locale === 'zh' ? '专注于智能体 (Agentic Workflows) 的开源研发者' : 'AI Agent Implementations Specialist'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {locale === 'zh'
                ? '独立开源并维护数套多模态 Gemini API 与 Agent UI 配套，并在海内外开源社区累积千星。'
                : 'Pioneered several open-source responsive Agent UIs based on Google Gemini API ecosystem, gathering developer praise.'}
            </p>
          </div>

          <div className="relative">
            <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-violet-500 border-2 border-white dark:border-slate-900" />
            <div className="text-xs font-mono font-bold text-violet-500">2022 - 2024</div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
              {locale === 'zh' ? '深耕 RAG 与智能化搜索系统开发' : 'Senior Full Stack & RAG Systems Engineer'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {locale === 'zh'
                ? '主导开发百万级知识库 RAG 系统，通过精准的语义 Chunking 和 Rerank，降低企业噪音误诊率高达 60%。'
                : 'Architected and launched deep keyword-vector hybrid RAG modules for corporate knowledge management base systems.'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
