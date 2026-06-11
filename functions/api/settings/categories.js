// functions/api/settings/categories.js - 添加/删除分类

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

// POST /api/settings/categories - 添加分类
export async function onRequestPost({ request, env }) {
  if (!checkAuth(request, env)) return errorResponse('Unauthorized', 401);
  
  try {
    const body = await request.json();
    const { name } = body;
    
    if (!name) {
      return errorResponse('name required', 400);
    }

    // 检查是否已存在
    const existing = await env.DB.prepare(
      `SELECT id FROM categories WHERE name = ?`
    ).bind(name).first();

    if (existing) {
      return successResponse({ success: true, exists: true });
    }

    const id = 'category-' + Date.now();
    try {
      await env.DB.prepare(
        `INSERT INTO categories (id, name) VALUES (?, ?)`
      ).bind(id, name).run();
      return successResponse({ success: true, exists: false });
    } catch (error) {
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        return successResponse({ success: true, exists: true });
      }
      return errorResponse(`Failed to create: ${error.message}`);
    }
  } catch (error) {
    console.error(error);
    return errorResponse(`Internal error: ${error.message}`);
  }
}