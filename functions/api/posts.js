// functions/api/posts.js

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

// GET /api/posts
export async function onRequestGet({ env }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not defined', 500);
  }
  try {
    const { results } = await env.DB.prepare(
      `SELECT id, title, content, excerpt, coverImage, created_at AS date, likes, views, category, tags, isPinned 
       FROM posts ORDER BY isPinned DESC, created_at DESC`
    ).all();

    const posts = results.map(p => {
      let parsedTags = [];
      if (p.tags) {
        try {
          parsedTags = JSON.parse(p.tags);
          if (!Array.isArray(parsedTags)) parsedTags = [];
        } catch (e) {
          if (typeof p.tags === 'string' && p.tags.includes(',')) {
            parsedTags = p.tags.split(',').map(t => t.trim()).filter(t => t);
          }
        }
      }
      return { ...p, tags: parsedTags };
    });
    return successResponse(posts);
  } catch (error) {
    console.error(error);
    return errorResponse(`Failed to fetch posts: ${error.message}`);
  }
}

// POST /api/posts
export async function onRequestPost({ request, env }) {
  if (!checkAuth(request, env)) return errorResponse('Unauthorized', 401);
  try {
    const body = await request.json();
    const { title, content, excerpt, coverImage, category, tags, isPinned } = body;
    if (!title || !content) return errorResponse('Title and content required', 400);

    const id = 'post-' + Date.now();
    const tagsStr = JSON.stringify(tags || []);
    const isPinnedInt = isPinned ? 1 : 0;
    const defaultCover = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800';

    const { success } = await env.DB.prepare(
      `INSERT INTO posts (id, title, content, excerpt, coverImage, likes, views, category, tags, isPinned)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      title,
      content,
      excerpt || content.slice(0, 150) + '...',
      coverImage || defaultCover,
      0,
      0,
      category || '技术干货',
      tagsStr,
      isPinnedInt
    ).run();

    if (success) return successResponse({ success: true, id });
    else return errorResponse('Failed to create post');
  } catch (error) {
    console.error(error);
    return errorResponse(`Internal error: ${error.message}`);
  }
}

// PUT /api/posts/:id
export async function onRequestPut({ request, env }) {
  if (!checkAuth(request, env)) return errorResponse('Unauthorized', 401);
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    const body = await request.json();
    const { title, content, excerpt, coverImage, category, tags, isPinned } = body;
    if (!title || !content) return errorResponse('Title and content required', 400);

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

    if (success) return successResponse({ success: true });
    else return errorResponse('Post not found', 404);
  } catch (error) {
    console.error(error);
    return errorResponse(`Internal error: ${error.message}`);
  }
}

// DELETE /api/posts/:id
export async function onRequestDelete({ request, env }) {
  if (!checkAuth(request, env)) return errorResponse('Unauthorized', 401);
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    const { success } = await env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
    if (success) return successResponse({ success: true });
    else return errorResponse('Post not found', 404);
  } catch (error) {
    console.error(error);
    return errorResponse(`Failed to delete: ${error.message}`);
  }
}

// Default export for Cloudflare Pages Functions
export async function onRequest(context) {
  const { request } = context;
  
  if (request.method === 'GET') {
    return onRequestGet(context);
  } else if (request.method === 'POST') {
    return onRequestPost(context);
  } else if (request.method === 'PUT') {
    return onRequestPut(context);
  } else if (request.method === 'DELETE') {
    return onRequestDelete(context);
  } else {
    return new Response('Method not allowed', { status: 405 });
  }
}
