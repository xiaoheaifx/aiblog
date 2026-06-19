// functions/api/comments/[[id]].js

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
  const validPassword = env.ADMIN_PASS || 'xiaohe@5200';
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

// 从 URL 路径中提取 comment ID
function extractIdFromUrl(url) {
  const pathParts = url.pathname.split('/').filter(Boolean);
  // /api/comments/comment-xxx -> pathParts = ['api', 'comments', 'comment-xxx']
  // /api/comments/comment-xxx/toggle-hide -> pathParts = ['api', 'comments', 'comment-xxx', 'toggle-hide']
  return pathParts.length >= 3 ? pathParts[2] : null;
}

// GET /api/comments 或 /api/comments/:id
export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.DB) return errorResponse('D1 binding DB is not defined', 500);
  
  try {
    const url = new URL(request.url);
    const id = extractIdFromUrl(url);
    
    if (id) {
      // 获取单个评论
      const { results } = await env.DB.prepare(
        `SELECT id, post_id AS postId, nickname, email, content, avatar, date, reply_to AS replyTo, is_hidden AS isHidden
         FROM comments WHERE id = ?`
      ).bind(id).all();
      
      if (results.length === 0) {
        return errorResponse('Comment not found', 404);
      }
      
      const comment = results[0];
      comment.isHidden = comment.isHidden === 1;
      return successResponse(comment);
    } else {
      // 获取所有评论
      const { results } = await env.DB.prepare(
        `SELECT id, post_id AS postId, nickname, email, content, avatar, date, reply_to AS replyTo, is_hidden AS isHidden
         FROM comments ORDER BY date DESC`
      ).all();

      const comments = results.map(c => ({
        ...c,
        isHidden: c.isHidden === 1
      }));
      return successResponse(comments);
    }
  } catch (error) {
    console.error('GET /api/comments error:', error);
    return errorResponse(`Failed to fetch comments: ${error.message}`);
  }
}

// POST /api/comments - 创建新评论
export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.DB) return errorResponse('D1 binding DB is not defined', 500);
  
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
    console.error('POST /api/comments error:', error);
    return errorResponse(`Internal error: ${error.message}`);
  }
}

// DELETE /api/comments/:id - 删除评论
export async function onRequestDelete(context) {
  const { request, env } = context;
  if (!checkAuth(request, env)) return errorResponse('Unauthorized', 401);
  if (!env.DB) return errorResponse('D1 binding DB is not defined', 500);
  
  try {
    const url = new URL(request.url);
    const id = extractIdFromUrl(url);
    if (!id) return errorResponse('Comment ID required', 400);
    
    const { success } = await env.DB.prepare("DELETE FROM comments WHERE id = ?").bind(id).run();
    if (success) return successResponse({ success: true });
    else return errorResponse('Comment not found', 404);
  } catch (error) {
    console.error('DELETE /api/comments/:id error:', error);
    return errorResponse(`Failed to delete: ${error.message}`);
  }
}

// PUT /api/comments/:id/toggle-hide - 切换评论显示状态
export async function onRequestPut(context) {
  const { request, env } = context;
  if (!checkAuth(request, env)) return errorResponse('Unauthorized', 401);
  if (!env.DB) return errorResponse('D1 binding DB is not defined', 500);
  
  try {
    const url = new URL(request.url);
    const id = extractIdFromUrl(url);
    if (!id) return errorResponse('Comment ID required', 400);
    
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
    console.error('PUT /api/comments/:id/toggle-hide error:', error);
    return errorResponse(`Internal error: ${error.message}`);
  }
}