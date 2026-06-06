// functions/api/posts.js

// ========== Basic Auth 验证函数 ==========
function checkAuth(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }
  // 解码 Base64 凭证
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = atob(base64Credentials);
  const [username, password] = credentials.split(':');
  // 硬编码用户名，密码从环境变量读取
  const validUsername = 'xiaohe';
  const validPassword = env.ADMIN_PASS; // 从 Cloudflare 环境变量获取
  return username === validUsername && password === validPassword;
}

// 辅助函数：返回 JSON 错误
function errorResponse(message, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function successResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// GET /api/posts - 获取所有文章（不需要认证，公开）
export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      `SELECT id, title, content, excerpt, coverImage, date, likes, views, category, tags, isPinned 
       FROM posts ORDER BY isPinned DESC, created_at DESC`
    ).all();
    // 注意：tags 字段是 JSON 字符串，需要解析成数组
    const posts = results.map(p => ({
      ...p,
      tags: p.tags ? JSON.parse(p.tags) : []
    }));
    return successResponse(posts);
  } catch (error) {
    console.error(error);
    return errorResponse('Failed to fetch posts');
  }
}

// POST /api/posts - 创建新文章（需要认证）
export async function onRequestPost({ request, env }) {
  // 验证身份
  if (!checkAuth(request, env)) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    const body = await request.json();
    const { title, content, excerpt, coverImage, category, tags, isPinned } = body;

    if (!title || !content) {
      return errorResponse('Title and content are required', 400);
    }

    const id = 'post-' + Date.now();
    const date = new Date().toISOString().split('T')[0];
    const tagsStr = JSON.stringify(tags || []);
    const isPinnedInt = isPinned ? 1 : 0;
    const defaultCover = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800';

    const { success } = await env.DB.prepare(
      `INSERT INTO posts (id, title, content, excerpt, coverImage, date, likes, views, category, tags, isPinned)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      title,
      content,
      excerpt || content.slice(0, 150) + '...',
      coverImage || defaultCover,
      date,
      0,
      0,
      category || '技术干货',
      tagsStr,
      isPinnedInt
    ).run();

    if (success) {
      return successResponse({ success: true, id });
    } else {
      return errorResponse('Failed to create post');
    }
  } catch (error) {
    console.error(error);
    return errorResponse('Internal server error');
  }
}

// PUT /api/posts/:id - 更新文章（需要认证）
export async function onRequestPut({ request, env }) {
  if (!checkAuth(request, env)) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    const body = await request.json();
    const { title, content, excerpt, coverImage, category, tags, isPinned } = body;

    if (!title || !content) {
      return errorResponse('Title and content are required', 400);
    }

    const tagsStr = JSON.stringify(tags || []);
    const isPinnedInt = isPinned ? 1 : 0;

    const { success } = await env.DB.prepare(
      `UPDATE posts SET title = ?, content = ?, excerpt = ?, coverImage = ?, category = ?, tags = ?, isPinned = ? WHERE id = ?`
    ).bind(
      title,
      content,
      excerpt || content.slice(0, 150) + '...',
      coverImage,
      category || '技术干货',
      tagsStr,
      isPinnedInt,
      id
    ).run();

    if (success) {
      return successResponse({ success: true });
    } else {
      return errorResponse('Post not found or update failed', 404);
    }
  } catch (error) {
    console.error(error);
    return errorResponse('Internal server error');
  }
}

// DELETE /api/posts/:id - 删除文章（需要认证）
export async function onRequestDelete({ request, env }) {
  if (!checkAuth(request, env)) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    const { success } = await env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
    if (success) {
      return successResponse({ success: true });
    } else {
      return errorResponse('Post not found', 404);
    }
  } catch (error) {
    console.error(error);
    return errorResponse('Failed to delete post');
  }
}