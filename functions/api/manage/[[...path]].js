// functions/api/manage/[[...path]].js
// 处理分类和标签的删除操作

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

// DELETE /api/manage/cat/:name - 删除分类
// DELETE /api/manage/tag/:name - 删除标签
export async function onRequestDelete(context) {
  const { request, env } = context;
  if (!checkAuth(request, env)) return errorResponse('Unauthorized', 401);
  if (!env.DB) return errorResponse('D1 binding DB is not defined', 500);
  
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    // /api/manage/cat/技术干货 -> ['api', 'manage', 'cat', '技术干货']
    
    if (pathParts.length < 4) {
      return errorResponse('Invalid path', 400);
    }
    
    const type = pathParts[2]; // 'cat' or 'tag'
    const name = decodeURIComponent(pathParts.slice(3).join('/'));
    
    if (type === 'cat') {
      // 删除分类
      await env.DB.prepare("DELETE FROM categories WHERE name = ?").bind(name).run();
      return successResponse({ success: true });
    } else if (type === 'tag') {
      // 删除标签
      await env.DB.prepare("DELETE FROM tags WHERE name = ?").bind(name).run();
      return successResponse({ success: true });
    } else {
      return errorResponse('Invalid type', 400);
    }
  } catch (error) {
    console.error('DELETE /api/manage error:', error);
    return errorResponse(`Failed to delete: ${error.message}`);
  }
}