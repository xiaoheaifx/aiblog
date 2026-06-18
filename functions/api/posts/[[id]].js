// functions/api/posts/[[id]].js
// 处理 /api/posts/{id} 的 PUT 和 DELETE 请求

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

// PUT /api/posts/:id - 更新文章
export async function onRequestPut({ request, env, params }) {
  if (!checkAuth(request, env)) return errorResponse('Unauthorized', 401);
  if (!env.DB) return errorResponse('D1 binding DB is not defined', 500);
  
  try {
    const id = params.id;
    if (!id) return errorResponse('Post ID required', 400);
    
    const body = await request.json();
    const { title, content, excerpt, coverImage, category, tags, isPinned } = body;
    if (!title || !content) return errorResponse('Title and content required', 400);

    const tagsStr = JSON.stringify(tags || []);
    const isPinnedInt = isPinned ? 1 : 0;

    await env.DB.prepare(
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

    return successResponse({ success: true });
  } catch (error) {
    console.error('PUT /api/posts/:id error:', error);
    return errorResponse(`Failed to update: ${error.message}`);
  }
}

// DELETE /api/posts/:id - 删除文章
export async function onRequestDelete({ request, env, params }) {
  if (!checkAuth(request, env)) return errorResponse('Unauthorized', 401);
  if (!env.DB) return errorResponse('D1 binding DB is not defined', 500);
  
  try {
    const id = params.id;
    if (!id) return errorResponse('Post ID required', 400);
    
    await env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
    return successResponse({ success: true });
  } catch (error) {
    console.error('DELETE /api/posts/:id error:', error);
    return errorResponse(`Failed to delete: ${error.message}`);
  }
}

// Default export
export async function onRequest(context) {
  const { request } = context;
  
  if (request.method === 'PUT') {
    return onRequestPut(context);
  } else if (request.method === 'DELETE') {
    return onRequestDelete(context);
  } else {
    return new Response('Method not allowed', { status: 405 });
  }
}