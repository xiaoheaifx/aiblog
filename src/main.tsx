import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import AdminApp from './AdminApp.tsx';
import './index.css';

// 根据 URL 路径路由到不同的应用：
//   /admin  → 后台管理应用 (AdminApp)
//   /*      → 博客首页应用 (App)
const path = window.location.pathname;
const isAdminPage = path === '/admin' || path.startsWith('/admin/');
const RootApp = isAdminPage ? AdminApp : App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
);