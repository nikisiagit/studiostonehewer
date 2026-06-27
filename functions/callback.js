export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  if (!code) {
    return new Response('Missing code parameter', { status: 400 });
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      return new Response(`Error from GitHub: ${data.error_description}`, { status: 400 });
    }

    const token = data.access_token;
    
    // Decap CMS looks for this specific postMessage handshake
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authorizing...</title>
      </head>
      <body>
        <p>Authorizing with GitHub, please wait...</p>
        <script>
          const receiveMessage = (message) => {
            if (!message.data || message.data !== "authorizing:github") return;
            window.opener.postMessage(
              'authorization:github:success:' + JSON.stringify({ token: '${token}', provider: 'github' }),
              message.origin
            );
            window.removeEventListener('message', receiveMessage);
          };
          window.addEventListener('message', receiveMessage, false);
          window.opener.postMessage('authorizing:github', '*');
        </script>
      </body>
      </html>
    `;
    
    return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}
