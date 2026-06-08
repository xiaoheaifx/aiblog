// functions/api/settings.js

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

// GET /api/settings - 获取所有设置（分类、标签、统计）
export async function onRequestGet({ env }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not defined', 500);
  }
  try {
    // 获取分类
    const categoriesResult = await env.DB.prepare(
      `SELECT id, name FROM categories ORDER BY name`
    ).all();
    const categories = categoriesResult.results.map(c => c.name);

    // 获取标签
    const tagsResult = await env.DB.prepare(
      `SELECT id, name FROM tags ORDER BY name`
    ).all();
    const tags = tagsResult.results.map(t => t.name);

    // 获取统计
    const statsResult = await env.DB.prepare(
      `SELECT key, value FROM settings WHERE key IN ('visitCount', 'articleCount', 'commentCount')`
    ).all();
    
    const settings = {};
    statsResult.results.forEach(row => {
      settings[row.key] = parseInt(row.value, 10);
    });

    return successResponse({
      categories,
      tags,
      settings: {
        visitCount: settings.visitCount || 3820,
        articleCount: settings.articleCount || 0,
        commentCount: settings.commentCount || 0
      }
    });
  } catch (error) {
    console.error(error);
    return errorResponse(`Failed to fetch settings: ${error.message}`);
  }
}

// POST /api/settings/categories - 添加分类
export async function onRequestPost({ request, env }) {
  if (!checkAuth(request, env)) return errorResponse('Unauthorized', 401);
  
  try {
    const body = await request.json();
    const { type, name } = body;
    
    if (!type || !name) {
      return errorResponse('type and name required', 400);
    }

    let table, columnName;
    if (type === 'category') {
      table = 'categories';
      columnName = 'name';
    } else if (type === 'tag') {
      table = 'tags';
      columnName = 'name';
    } else {
      return errorResponse('Invalid type', 400);
    }

    // 检查是否已存在
    const existing = await env.DB.prepare(
      `SELECT id FROM ${table} WHERE ${columnName} = ?`
    ).bind(name).first();

    if (existing) {
      return successResponse({ success: true, exists: true });
    }

    const id = type + '-' + Date.now();
    const { success } = await env.DB.prepare(
      `INSERT INTO ${table} (id, name) VALUES (?, ?)`
    ).bind(id, name).run();

    if (success) return successResponse({ success: true, exists: false });
    else return errorResponse('Failed to create');
  } catch (error) {
    console.error(error);
    return errorResponse(`Internal error: ${error.message}`);
  }
}

// DELETE /api/settings/categories/:name - 删除分类
export async function onRequestDelete({ request, env }) {
  if (!checkAuth(request, env)) return errorResponse('Unauthorized', 401);
  
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const name = decodeURIComponent(pathParts[pathParts.length - 1]);
    const type = pathParts[pathParts.length - 2]; // categories or tags

    let table;
    if (type === 'categories') {
      table = 'categories';
    } else if (type === 'tags') {
      table = 'tags';
    } else {
      return errorResponse('Invalid type', 400);
    }

    const { success } = await env.DB.prepare(
      `DELETE FROM ${table} WHERE name = ?`
    ).bind(name).run();

    if (success) return successResponse({ success: true });
    else return errorResponse('Not found', 404);
  } catch (error) {
    console.error(error);
    return errorResponse(`Failed to delete: ${error.message}`);
  }
}

// PUT /api/settings/stats - 更新统计数据
export async function onRequestPut({ request, env }) {
  if (!checkAuth(request, env)) return errorResponse('Unauthorized', 401);
  
  try {
    const body = await request.json();
    const { visitCount } = body;
    
    if (typeof visitCount !== 'number') {
      return errorResponse('visitCount must be a number', 400);
    }

    // UPSERT 统计数据
    await env.DB.prepare(
      `INSERT OR REPLACE INTO settings (key, value) VALUES ('visitCount', ?)`
    ).bind(visitCount.toString()).run();

    return successResponse({ success: true, visitCount });
  } catch (error) {
    console.error(error);
    return errorResponse(`Internal error: ${error.message}`);
  }
}
