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

export async function onRequestDelete({ request, env }) {
  if (!checkAuth(request, env)) return errorResponse('Unauthorized', 401);
  
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const name = decodeURIComponent(pathParts[pathParts.length - 1]);

    if (!name) return errorResponse('Category name required', 400);

    await env.DB.prepare(
      `DELETE FROM categories WHERE name = ?`
    ).bind(name).run();

    return successResponse({ success: true });
  } catch (error) {
    console.error(error);
    return errorResponse(`Failed to delete: ${error.message}`);
  }
}

export async function onRequest(context) {
  if (context.request.method === 'DELETE') {
    return onRequestDelete(context);
  }
  return new Response('Method not allowed', { status: 405 });
}