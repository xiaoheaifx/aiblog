# 小何AI分享博客 - 傻瓜式部署教程

> 本教程专为零基础小白设计，按照步骤一步一步操作，10分钟就能拥有自己的博客！

---

## 第一步：Fork 仓库代码（复制代码到你自己的 GitHub）

### 1.1 打开原仓库

在浏览器中打开这个地址：
```
https://github.com/xiaoheaifx/aiblog
```

### 1.2 点击 Fork 按钮

在页面右上角找到 **Fork** 按钮，点击它。

### 1.3 填写 Fork 信息

- **Repository name**: 改成你想要的名字，比如 `my-blog` 或 `你的英文名-blog`
- **Description**: 填写你的博客描述（可选）
- 点击 **Create fork**

等待几秒钟，代码就复制到你自己的 GitHub 账号下了！

### 1.4 克隆到本地电脑

打开电脑的 **PowerShell**（Windows）或 **终端**（Mac），输入以下命令：

```bash
# 进入你想存放博客的文件夹（比如桌面）
cd Desktop

# 克隆你的仓库（把 your-username 换成你的 GitHub 用户名）
git clone https://github.com/your-username/my-blog.git

# 进入博客文件夹
cd my-blog
```

---

## 第二步：修改博客个人信息（改成你自己的）

### 2.1 修改网站标题和页脚

**文件位置**: `index.html`

打开这个文件，找到第 7 行：

```html
<title>小何AI分享 - XiaoHe AI Share</title>
```

改成你自己的博客名字，比如：

```html
<title>张三的技术博客 - ZhangSan Tech Blog</title>
```

### 2.2 修改导航栏和个人资料文字

**文件位置**: `src/locales.ts`

这个文件控制博客上显示的所有文字。打开后你会看到中文（zh）和英文（en）两部分。

#### 修改作者名字

找到这两行（大约在第 27 行和第 132 行）：

```typescript
// 中文部分
authorName: 'XiaoHe',
authorSub: '全栈 AI 开发与行业观察者',

// 英文部分
authorName: 'XiaoHe',
authorSub: 'Full Stack AI Developer & Analyst',
```

改成你自己的信息：

```typescript
// 中文部分
authorName: '张三',
authorSub: '前端开发工程师 · 技术博主',

// 英文部分
authorName: 'ZhangSan',
authorSub: 'Frontend Developer · Tech Blogger',
```

#### 修改导航栏菜单名称

找到这些行并修改：

```typescript
// 中文导航
navHome: '主页',           // 可以改成 '首页'
navArticles: '全部文章',    // 可以改成 '文章'
navAbout: '关于小何',       // 改成 '关于我' 或 '关于张三'
navPrivacy: '隐私政策',     // 保持不变
navAdmin: '后台管理',       // 保持不变

// 英文导航
navAbout: 'About XiaoHe',  // 改成 'About Me' 或 'About ZhangSan'
```

#### 修改页脚版权信息

找到这一行（大约在第 113 行和第 218 行）：

```typescript
// 中文
footerText: '小何AI分享 个人博客 © 保留所有权利。',

// 英文
footerText: 'XiaoHe AIShare. All rights reserved.',
```

改成：

```typescript
// 中文
footerText: '张三的技术博客 © 保留所有权利。',

// 英文
footerText: 'ZhangSan Tech Blog. All rights reserved.',
```

### 2.3 修改"关于我"页面

**文件位置**: `src/components/AboutView.tsx`

打开这个文件，找到以下内容并修改：

#### 修改头像图片

找到第 16 行：

```typescript
src="https://vlog.rr.kg/img/avatar.png"
```

改成你自己的头像图片链接（可以用图床上传，或者用 GitHub 头像链接）。

#### 修改名字和简介

找到第 23-24 行：

```typescript
{locale === 'zh' ? '小何 (XiaoHe)' : 'XiaoHe'}
```

改成：

```typescript
{locale === 'zh' ? '张三 (ZhangSan)' : 'ZhangSan'}
```

找到第 27 行：

```typescript
{locale === 'zh' ? '全栈研发工程师 · AI 智能体架构师 · 科技专栏作者' : 'Full Stack Engineer · AI Agent Architect · Tech Columnist'}
```

改成你自己的职业描述。

#### 修改地理位置和邮箱

找到第 33-38 行：

```typescript
<span>{locale === 'zh' ? '中国 · 深圳' : 'Shenzhen, China'}</span>
<span>xiaohefx@gmail.com</span>
```

改成你自己的信息。

#### 修改自我介绍

找到第 52-58 行，把中文和英文的自我介绍都改成你自己的。

#### 修改技能展示

找到第 66-82 行，修改技能卡片的内容。

#### 修改职业里程碑

找到第 90-115 行，修改你的工作经历和时间线。

### 2.4 修改隐私政策页面

**文件位置**: `src/components/PrivacyView.tsx`

打开这个文件，找到第 24 行：

```typescript
'小何AI分享 博客致力于保护读者的个人隐私。'
```

改成你自己的博客名字。

### 2.5 修改博客运行起始日期

**文件位置**: `src/components/Sidebar.tsx`

打开这个文件，找到第 47 行：

```typescript
const startDate = new Date('2025-05-18');
```

改成你博客开始的日期，比如：

```typescript
const startDate = new Date('2024-01-01');
```

### 2.6 修改默认分类和标签

**文件位置**: `init-db.sql`

打开这个文件，找到第 54-57 行（默认分类）：

```sql
INSERT OR IGNORE INTO categories (id, name) VALUES 
('cat-1', '技术干货'), 
('cat-2', '行业观察'), 
('cat-3', '随笔生活');
```

改成你想要的分类，比如：

```sql
INSERT OR IGNORE INTO categories (id, name) VALUES 
('cat-1', '前端开发'), 
('cat-2', '后端技术'), 
('cat-3', '生活随笔'),
('cat-4', '读书笔记');
```

找到第 60-71 行（默认标签）：

```sql
INSERT OR IGNORE INTO tags (id, name) VALUES 
('tag-1', 'Gemini'), 
('tag-2', 'LLM'), 
('tag-3', 'AI Agent'), 
...
```

改成你想要的标签。

### 2.7 修改管理员密码

**文件位置**: `functions/api/posts/[[id]].js`

打开这个文件，找到 `checkAuth` 函数（大约在第 15-25 行）：

```javascript
function checkAuth(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return false;
  
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = atob(base64Credentials);
  const [username, password] = credentials.split(':');
  
  const validUsername = 'xiaohe';
  const validPassword = env.ADMIN_PASS || 'admin';
  
  return username === validUsername && password === validPassword;
}
```

修改这两行：

```javascript
const validUsername = '你的用户名';  // 改成你想要的用户名
const validPassword = env.ADMIN_PASS || '你的默认密码';  // 改成你的默认密码
```

---

## 第三步：注册 Cloudflare 账号

### 3.1 访问 Cloudflare

打开浏览器，访问：
```
https://dash.cloudflare.com
```

### 3.2 注册账号

1. 点击 **Sign up**
2. 输入你的邮箱和密码
3. 验证邮箱（去邮箱点击验证链接）
4. 登录进入控制台

---

## 第四步：创建 D1 数据库

### 4.1 进入 D1 数据库页面

1. 在 Cloudflare 控制台左侧菜单，找到 **Workers & Pages**
2. 点击 **D1 SQL Database**
3. 点击 **Create a database**

### 4.2 创建数据库

1. **Database name**: 输入 `blog`
2. 点击 **Create**

### 4.3 记录 database_id

创建成功后，页面会显示数据库信息，找到 **Database ID**，复制它（格式类似：`fe2de546-e764-44e2-b1b7-358a4e7f46f5`）

### 4.4 初始化数据库表

1. 点击你刚创建的 `blog` 数据库
2. 点击 **Console** 或 **SQL Editor** 标签
3. 在 SQL 输入框中，粘贴以下完整 SQL 代码：

```sql
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
    isPinned INTEGER DEFAULT 0,
    isDraft INTEGER DEFAULT 0
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

-- 文章浏览记录表
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
('visitCount', '0'), 
('articleCount', '0'), 
('commentCount', '0');
```

4. 点击 **Execute** 或 **Run** 按钮
5. 看到 "Success" 提示，说明数据库创建成功！

---

## 第五步：修改 wrangler.toml 配置文件

**文件位置**: `wrangler.toml`

打开这个文件，你会看到：

```toml
name = "xiaohe-ai-share"
compatibility_date = "2024-01-01"
pages_build_output_dir = "./dist"

# D1 Database binding
[[d1_databases]]
binding = "DB"
database_name = "blog"
database_id = "fe2de546-e764-44e2-b1b7-358a4e7f46f5"
```

### 5.1 修改项目名称

把第一行改成你自己的项目名称（只能用英文、数字和连字符）：

```toml
name = "your-blog-name"
```

### 5.2 修改 database_id

把最后一行的 `database_id` 改成你刚才复制的数据库 ID：

```toml
database_id = "你刚才复制的database_id"
```

保存文件。

---

## 第六步：推送代码到 GitHub

### 6.1 提交修改

在 PowerShell 或终端中，进入你的博客文件夹，执行以下命令：

```bash
# 添加所有修改的文件
git add .

# 提交修改
git commit -m "修改博客个人信息"

# 推送到 GitHub
git push
```

如果提示输入 GitHub 用户名和密码，输入你的 GitHub 账号信息。

---

## 第七步：部署到 Cloudflare Pages

### 7.1 创建 Pages 项目

1. 回到 Cloudflare 控制台
2. 左侧菜单 → **Workers & Pages** → **Create application** → **Pages**
3. 点击 **Connect to Git**
4. 选择 **GitHub** 并授权
5. 选择你刚才 Fork 的仓库（比如 `my-blog`）
6. 点击 **Begin setup**

### 7.2 配置构建设置

在配置页面填写：

- **Project name**: 你的项目名称（会自动填充）
- **Production branch**: `main`（保持默认）
- **Framework preset**: 选择 **Vite**
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/`（保持默认）

点击 **Save and Deploy**

### 7.3 等待部署

部署需要 1-2 分钟，你会看到进度条。部署成功后，会显示一个临时域名，比如：
```
https://my-blog-abc123.pages.dev
```

点击这个链接，你的博客就上线了！

---

## 第八步：绑定 D1 数据库到 Pages

### 8.1 进入项目设置

1. 在 Cloudflare Pages 项目页面，点击 **Settings** 标签
2. 找到 **Functions** 部分

### 8.2 添加数据库绑定

1. 找到 **D1 database bindings**
2. 点击 **Add binding**
3. 填写：
   - **Variable name**: `DB`（必须是大写 DB）
   - **D1 database**: 选择你创建的 `blog` 数据库
4. 点击 **Save**

### 8.3 重新部署

1. 回到 **Deployments** 标签页
2. 找到最新的部署，点击右侧的 **···** 菜单
3. 选择 **Retry deployment**
4. 等待部署完成

---

## 第九步：配置管理员密码

### 9.1 添加环境变量

1. 进入 Pages 项目 → **Settings** → **Environment variables**
2. 点击 **Add variable**
3. 填写：
   - **Variable name**: `ADMIN_PASS`
   - **Value**: 你的管理员密码（比如 `mypassword123`）
4. 点击 **Save**

### 9.2 再次重新部署

1. 回到 **Deployments** 标签页
2. 点击最新部署的 **···** → **Retry deployment**
3. 等待部署完成

---

## 第十步：绑定自定义域名（可选）

### 10.1 进入域名设置

1. 进入 Pages 项目 → **Custom domains**
2. 点击 **Set up a custom domain**

### 10.2 输入你的域名

1. 输入你想使用的域名（比如 `blog.yourname.com`）
2. 点击 **Continue**

### 10.3 配置 DNS

Cloudflare 会提示你添加 DNS 记录：

1. 登录你的域名注册商（比如阿里云、腾讯云、Namecheap）
2. 添加一条 **CNAME** 记录：
   - **主机记录**: `blog`（如果你想用 blog.yourname.com）
   - **记录类型**: `CNAME`
   - **记录值**: `my-blog-abc123.pages.dev`（你的 Pages 临时域名）
3. 保存后等待 DNS 生效（通常几分钟到几小时）

### 10.4 启用 HTTPS

Cloudflare 会自动为你的域名配置 HTTPS，无需额外操作。

---

## 第十一步：登录后台管理

### 11.1 访问后台

在你的博客地址后面加上 `/admin`，比如：
```
https://my-blog-abc123.pages.dev/admin
```

### 11.2 登录

1. 输入你在 `functions/api/posts/[[id]].js` 中设置的用户名
2. 输入你在 Cloudflare 环境变量中设置的 `ADMIN_PASS` 密码
3. 点击登录

### 11.3 开始使用

登录后你可以：
- **发布文章**: 点击"撰写新文章"
- **管理评论**: 审核访客评论
- **管理分类/标签**: 添加或删除分类和标签
- **查看统计**: 查看访问量数据

---

## 第十二步：发布第一篇文章

### 12.1 进入文章管理

在后台管理页面，点击 **文章管理** 标签。

### 12.2 创建新文章

1. 点击 **撰写新文章** 按钮
2. 填写文章信息：
   - **文章标题**: 输入标题
   - **文章分类**: 选择分类
   - **标签**: 输入标签（多个用逗号分隔）
   - **封面图片 URL**: 输入图片链接
   - **文章内容**: 输入文章内容（支持 Markdown 格式）
3. 点击 **保存**

### 12.3 查看文章

回到博客首页，你发布的文章就会显示出来了！

---

## 常见问题解答

### Q1: 部署后文章不显示怎么办？

**A**: 检查以下几点：
1. 数据库是否正确初始化（执行了 SQL 脚本）
2. D1 数据库绑定是否正确（变量名必须是 `DB`）
3. 重新部署项目

### Q2: 无法登录后台怎么办？

**A**: 检查：
1. `ADMIN_PASS` 环境变量是否正确配置
2. 用户名和密码是否匹配
3. 重新部署项目

### Q3: 如何修改博客主题颜色？

**A**: 编辑 `src/index.css` 文件，修改 TailwindCSS 的颜色配置。

### Q4: 如何添加新的页面？

**A**: 
1. 在 `src/components/` 创建新的组件文件
2. 在 `src/App.tsx` 中添加路由
3. 在 `src/locales.ts` 中添加导航文字

### Q5: 如何备份数据库？

**A**: 在 Cloudflare D1 控制台，点击数据库 → **Export**，可以导出 SQL 文件。

### Q6: 博客访问速度慢怎么办？

**A**: 
1. 优化图片大小（使用 WebP 格式）
2. 减少不必要的 JavaScript 代码
3. 使用 CDN 加速

---

## 技术支持

如果遇到问题，可以：
1. 查看 Cloudflare 控制台的部署日志
2. 检查浏览器控制台的错误信息（按 F12）
3. 在 GitHub Issues 中提问

---

**祝你部署顺利！🎉**