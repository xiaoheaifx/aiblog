// functions/api/post/view.js

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

export async function onRequestPost({ request, env }) {
  try {
    const url = new URL(request.url);
    const postId = url.searchParams.get('postId');
    if (!postId) {
      return errorResponse('Missing postId', 400);
    }

    // 获取真实 IP
    const clientIP = request.headers.get('CF-Connecting-IP') ||
                     request.headers.get('X-Forwarded-For')?.split(',')[0] ||
                     'unknown';

    // 24 小时内是否已记录
    const existing = await env.DB.prepare(
      `SELECT id FROM post_views 
       WHERE post_id = ? AND ip = ? 
       AND viewed_at > datetime('now', '-1 day') 
       LIMIT 1`
    ).bind(postId, clientIP).first();

    if (existing) {
      // 不重复计数，但返回最新浏览量
      const { views } = await env.DB.prepare(
        `SELECT views FROM posts WHERE id = ?`
      ).bind(postId).first();
      return successResponse({ counted: false, views: views || 0 });
    }

    // 插入记录
    await env.DB.prepare(
      `INSERT INTO post_views (post_id, ip, viewed_at) VALUES (?, ?, datetime('now'))`
    ).bind(postId, clientIP).run();

    // 更新 posts 表 views 字段
    const result = await env.DB.prepare(
      `UPDATE posts SET views = views + 1 WHERE id = ? RETURNING views`
    ).bind(postId).first();

    return successResponse({ counted: true, views: result ? result.views : 0 });
  } catch (error) {
    console.error(error);
    return errorResponse('Internal server error');
  }
}

export async function onRequest(context) {
  const { request } = context;
  if (request.method === 'POST') {
    return onRequestPost(context);
  } else {
    return new Response('Method not allowed', { status: 405 });
  }
}