// functions/api/posts/[[id]].js

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

// 主路由处理
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // 从路径中提取 post ID (格式: /api/posts/post-xxx)
    const pathParts = path.split('/').filter(Boolean);
    const id = pathParts.length >= 3 ? pathParts[2] : null;

    try {
      // GET /api/posts 或 /api/posts/:id
      if (method === 'GET') {
        if (!env.DB) return errorResponse('D1 binding DB is not defined', 500);

        const draftParam = url.searchParams.get('draft');
        
        let query = `SELECT id, title, content, excerpt, coverImage, created_at AS date, likes, views, category, tags, isPinned, isDraft FROM posts`;
        let params = [];
        
        if (draftParam === '1') {
          query += ` WHERE isDraft = 1`;
        } else if (draftParam === 'all') {
          // Admin panel: show all posts including drafts
        } else {
          query += ` WHERE isDraft = 0 OR isDraft IS NULL`;
        }
        
        query += ` ORDER BY isPinned DESC, created_at DESC`;

        const { results } = await env.DB.prepare(query).bind(...params).all();

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
          return {
            ...p,
            tags: parsedTags,
            isPinned: !!p.isPinned,
            isDraft: !!p.isDraft,
            likes: p.likes || 0,
            views: p.views || 0,
            titleEn: p.titleEn || '',
            contentEn: p.contentEn || '',
            excerptEn: p.excerptEn || '',
            categoryEn: p.categoryEn || ''
          };
        });
        return successResponse(posts);
      }

      // POST /api/posts - 创建文章
      if (method === 'POST') {
        if (!checkAuth(request, env)) return errorResponse('Unauthorized', 401);
        if (!env.DB) return errorResponse('D1 binding DB is not defined', 500);

        const body = await request.json();
        const { title, content, excerpt, coverImage, category, tags, isPinned, isDraft } = body;
        if (!title || !content) return errorResponse('Title and content required', 400);

        const postId = 'post-' + Date.now();
        const tagsStr = JSON.stringify(tags || []);
        const isPinnedInt = isPinned ? 1 : 0;
        const isDraftInt = isDraft ? 1 : 0;
        const defaultCover = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800';

        await env.DB.prepare(
          `INSERT INTO posts (id, title, content, excerpt, coverImage, likes, views, category, tags, isPinned, isDraft)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          postId, title, content,
          excerpt || content.slice(0, 150) + '...',
          coverImage || defaultCover,
          0, 0, category || '技术干货', tagsStr, isPinnedInt, isDraftInt
        ).run();

        return successResponse({ success: true, id: postId });
      }

      // PUT /api/posts/:id - 更新文章
      if (method === 'PUT') {
        if (!checkAuth(request, env)) return errorResponse('Unauthorized', 401);
        if (!env.DB) return errorResponse('D1 binding DB is not defined', 500);
        if (!id) return errorResponse('Post ID required', 400);

        const body = await request.json();
        const { title, content, excerpt, coverImage, category, tags, isPinned, isDraft } = body;
        if (!title || !content) return errorResponse('Title and content required', 400);

        const tagsStr = JSON.stringify(tags || []);
        const isPinnedInt = isPinned ? 1 : 0;
        const isDraftInt = isDraft ? 1 : 0;

        await env.DB.prepare(
          `UPDATE posts SET title = ?, content = ?, excerpt = ?, coverImage = ?, category = ?, tags = ?, isPinned = ?, isDraft = ? WHERE id = ?`
        ).bind(
          title, content,
          excerpt || content.slice(0, 150) + '...',
          coverImage, category || '技术干货',
          tagsStr, isPinnedInt, isDraftInt, id
        ).run();

        return successResponse({ success: true });
      }

      // DELETE /api/posts/:id - 删除文章
      if (method === 'DELETE') {
        if (!checkAuth(request, env)) return errorResponse('Unauthorized', 401);
        if (!env.DB) return errorResponse('D1 binding DB is not defined', 500);
        if (!id) return errorResponse('Post ID required', 400);

        await env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
        return successResponse({ success: true });
      }

      return new Response('Method not allowed', { status: 405 });
    } catch (error) {
      console.error('API error:', error);
      return errorResponse(`Internal error: ${error.message}`);
    }
  }
};