// functions/api/posts.js

// 处理 GET 请求 - 获取所有文章
export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      "SELECT id, title, content, created_at FROM posts ORDER BY created_at DESC"
    ).all();
    
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch posts" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// 处理 POST 请求 - 发布新文章
export async function onRequestPost({ request, env }) {
  try {
    const { title, content } = await request.json();
    
    if (!title || !content) {
      return new Response(JSON.stringify({ error: "Title and content are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    await env.DB.prepare(
      "INSERT INTO posts (title, content) VALUES (?, ?)"
    ).bind(title, content).run();
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to create post" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
