-- 文章表
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    coverImage TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    category TEXT DEFAULT '技术干货',
    tags TEXT,
    isPinned INTEGER DEFAULT 0
);

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    nickname TEXT NOT NULL,
    email TEXT,
    content TEXT NOT NULL,
    avatar TEXT,
    date TEXT,
    reply_to TEXT,
    is_hidden INTEGER DEFAULT 0
);

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

-- 标签表
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

-- 设置表
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- 文章浏览记录表（用于 24 小时去重）
CREATE TABLE IF NOT EXISTS post_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id TEXT NOT NULL,
    ip TEXT NOT NULL,
    viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认分类
INSERT OR IGNORE INTO categories (id, name) VALUES 
('cat-1', '技术干货'), 
('cat-2', '行业观察'), 
('cat-3', '随笔生活');

-- 插入默认标签
INSERT OR IGNORE INTO tags (id, name) VALUES 
('tag-1', 'Gemini'), 
('tag-2', 'LLM'), 
('tag-3', 'AI Agent'), 
('tag-4', 'API'), 
('tag-5', '向量检索'), 
('tag-6', 'Edge AI'), 
('tag-7', 'WebGPU'), 
('tag-8', 'Gemma'), 
('tag-9', '前端设计'), 
('tag-10', '编程未来'), 
('tag-11', '深度检索');

-- 插入默认统计数据
INSERT OR REPLACE INTO settings (key, value) VALUES 
('visitCount', '3820'), 
('articleCount', '0'), 
('commentCount', '0');
