export async function onRequest(context) {
  const { request, env } = context;
  const client_id = env.GITHUB_CLIENT_ID;
  
  if (!client_id) {
    return new Response('GITHUB_CLIENT_ID not configured', { status: 500 });
  }

  // Redirect to GitHub for authorization
  const redirect_uri = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user`;
  
  return Response.redirect(redirect_uri, 302);
}
