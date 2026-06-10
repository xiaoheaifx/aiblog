// functions/api/comments.js

// ========== Basic Auth 验证函数 ==========
function checkAuth(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = atob(base64Credentials);
  const [username, password] = credentials.split(':');
  const validUsername = 'xiaohe';
  const validPassword = env.ADMIN_PASS;
  return username === validUsername && password === validPassword;
}

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

// GET /api/comments - 获取所有评论
export async function onRequestGet({ env }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not defined', 500);
  }
  try {
    const { results } = await env.DB.prepare(
      `SELECT id, post_id AS postId, nickname, email, content, avatar, date, reply_to AS replyTo, is_hidden AS isHidden
       FROM comments ORDER BY date DESC`
    ).all();

    const comments = results.map(c => ({
      ...c,
      isHidden: c.isHidden === 1
    }));
    return successResponse(comments);
  } catch (error) {
    console.error(error);
    return errorResponse(`Failed to fetch comments: ${error.message}`);
  }
}

// POST /api/comments - 创建新评论
export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { id, postId, nickname, email, content, avatar, date, replyTo } = body;
    if (!postId || !nickname || !content) {
      return errorResponse('Required fields missing', 400);
    }

    const isHidden = 0; // 默认公开
    
    const { success } = await env.DB.prepare(
      `INSERT INTO comments (id, post_id, nickname, email, content, avatar, date, reply_to, is_hidden)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id || 'comment-' + Date.now(),
      postId,
      nickname,
      email || '',
      content,
      avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${nickname}`,
      date || new Date().toISOString().replace('T', ' ').slice(0, 16),
      replyTo || null,
      isHidden
    ).run();

    if (success) return successResponse({ success: true, id });
    else return errorResponse('Failed to create comment');
  } catch (error) {
    console.error(error);
    return errorResponse(`Internal error: ${error.message}`);
  }
}

// DELETE /api/comments/:id - 删除评论
export async function onRequestDelete({ request, env }) {
  if (!checkAuth(request, env)) return errorResponse('Unauthorized', 401);
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    const { success } = await env.DB.prepare("DELETE FROM comments WHERE id = ?").bind(id).run();
    if (success) return successResponse({ success: true });
    else return errorResponse('Comment not found', 404);
  } catch (error) {
    console.error(error);
    return errorResponse(`Failed to delete: ${error.message}`);
  }
}

// PUT /api/comments/:id/toggle-hide - 切换评论显示状态
export async function onRequestPut({ request, env }) {
  if (!checkAuth(request, env)) return errorResponse('Unauthorized', 401);
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 2]; // /api/comments/:id/toggle-hide
    
    const body = await request.json();
    const { isHidden } = body;
    
    if (typeof isHidden !== 'boolean') {
      return errorResponse('isHidden must be boolean', 400);
    }

    const isHiddenInt = isHidden ? 1 : 0;
    const { success } = await env.DB.prepare(
      "UPDATE comments SET is_hidden = ? WHERE id = ?"
    ).bind(isHiddenInt, id).run();

    if (success) return successResponse({ success: true });
    else return errorResponse('Comment not found', 404);
  } catch (error) {
    console.error(error);
    return errorResponse(`Internal error: ${error.message}`);
  }
}

// Default export for Cloudflare Pages Functions
export async function onRequest(context) {
  const { request } = context;
  
  if (request.method === 'GET') {
    return onRequestGet(context);
  } else if (request.method === 'POST') {
    return onRequestPost(context);
  } else if (request.method === 'DELETE') {
    return onRequestDelete(context);
  } else if (request.method === 'PUT') {
    return onRequestPut(context);
  } else {
    return new Response('Method not allowed', { status: 405 });
  }
}
