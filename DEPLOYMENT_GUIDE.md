# Cloudflare Pages + D1 博客部署指南

## 问题诊断与解决方案

### 问题 1: 发布文章没有反应
**原因**: 缺少 Basic Auth 认证或 D1 数据库未正确绑定

### 问题 2: 删除的数据重新部署后恢复
**原因**: 数据存储在 localStorage 而非 D1 数据库（已修复为使用 D1）

---

## 第一步：获取 D1 Database ID

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **D1**
3. 点击名为 `blog` 的数据库
4. 复制 **Database ID** (格式类似：`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

---

## 第二步：执行 SQL 初始化脚本

### 方法 A: 通过 Cloudflare Dashboard (推荐)

1. 进入 D1 数据库详情页
2. 点击 **Console** 标签
3. 将 `init-db.sql` 文件内容复制粘贴到控制台
4. 点击 **Execute** 执行

### 方法 B: 通过 Wrangler CLI

```bash
# 安装 wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 执行 SQL 脚本
wrangler d1 execute blog --file=init-db.sql
```

---

## 第三步：配置 wrangler.toml

编辑 `/workspace/wrangler.toml` 文件：

```toml
name = "xiaohe-ai-share"
compatibility_date = "2024-01-01"
pages_build_output_dir = "./dist"

# D1 Database binding
[[d1_databases]]
binding = "DB"
database_name = "blog"
database_id = "你的 DATABASE_ID"  # ← 替换为第一步复制的 ID

# 管理员密码（建议使用强密码）
[vars]
ADMIN_PASS = "your_secure_password"  # ← 设置你的管理员密码
```

**重要**: 
- `database_id` 必须填写真实的 D1 数据库 ID
- `ADMIN_PASS` 是后台登录密码，用户名固定为 `xiaohe`

---

## 第四步：设置 Cloudflare Pages 环境变量

1. 进入 **Workers & Pages** → 选择你的项目
2. 点击 **Settings** → **Environment Variables**
3. 添加以下变量：
   - `ADMIN_PASS` = `你的管理员密码` (与 wrangler.toml 一致)
   - `GEMINI_API_KEY` = `你的 Gemini API 密钥` (如果需要 AI 功能)

---

## 第五步：重新部署

### 如果使用 Git 自动部署
1. 提交更改到 Git:
```bash
git add .
git commit -m "fix: configure D1 database and admin auth"
git push
```
2. Cloudflare Pages 会自动触发部署

### 如果手动部署
```bash
# 构建项目
npm run build

# 通过 Wrangler 部署
wrangler pages deploy dist/
```

---

## 第六步：验证功能

### 1. 测试后台登录
- 访问博客首页
- 点击右上角登录图标
- 用户名：`xiaohe`
- 密码：你设置的 `ADMIN_PASS`

### 2. 测试文章发布
1. 登录后台
2. 进入"文章管理"
3. 点击"新建文章"
4. 填写标题、内容等信息
5. 点击保存
6. **应该看到成功提示**："新文章发表成功！"
7. 返回首页，文章应该立即显示

### 3. 测试数据持久化
1. 删除一篇文章或评论
2. 在 Cloudflare Dashboard 触发重新部署
3. 检查被删除的内容**不应该恢复**

---

## 常见问题排查

### Q1: 发布文章时没有任何提示
**检查**:
1. 浏览器控制台是否有错误 (F12 → Console)
2. 确认 D1 数据库已正确绑定到 Pages 项目
3. 确认 `ADMIN_PASS` 环境变量已设置

### Q2: 提示 "Unauthorized" 或 "401"
**解决**:
- 确认用户名是 `xiaohe` (区分大小写)
- 确认密码与 `ADMIN_PASS` 环境变量一致
- 清除浏览器缓存后重试

### Q3: 删除的数据重新部署后又出现
**原因**: 可能还在使用旧的 localStorage 数据
**解决**:
1. 清除浏览器数据 (LocalStorage)
2. 确保 API 调用正常 (查看网络请求)
3. 确认 D1 数据库中有正确的数据

### Q4: 提示 "D1 binding DB is not defined"
**解决**:
1. 检查 `wrangler.toml` 中的 binding 名称是否为 `DB`
2. 在 Cloudflare Dashboard 确认 D1 数据库已绑定到 Pages 项目
3. 绑定名称必须是 `DB` (区分大小写)

---

## 数据库表结构

已创建的表：
- `posts` - 文章表
- `comments` - 评论表
- `categories` - 分类表
- `tags` - 标签表
- `settings` - 设置表 (统计数据)
- `post_views` - 浏览记录表 (24 小时去重)

---

## 安全建议

1. **使用强密码**: `ADMIN_PASS` 应至少 12 位，包含大小写字母、数字和符号
2. **定期备份**: 通过 Cloudflare Dashboard 导出 D1 数据
3. **限制访问**: 考虑添加 IP 白名单或其他认证机制

---

## 联系支持

如果仍有问题，请提供：
1. 浏览器控制台的完整错误信息
2. Cloudflare Pages 的部署日志
3. D1 数据库的绑定截图
