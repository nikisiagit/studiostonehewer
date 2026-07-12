export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // OAuth: Redirect to GitHub
    if (url.pathname === '/auth') {
      const client_id = env.GITHUB_CLIENT_ID;
      if (!client_id) {
        return new Response('GITHUB_CLIENT_ID not configured', { status: 500 });
      }
      const redirect_uri = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user`;
      return Response.redirect(redirect_uri, 302);
    }

    // OAuth: Handle GitHub Callback
    if (url.pathname === '/callback') {
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
        
        // Return HTML to pass token to Decap CMS dashboard
        const html = `
          <!DOCTYPE html>
          <html>
          <head><title>Authorizing...</title></head>
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

    // Contact Form Endpoint
    if (url.pathname === '/api/contact' && request.method === 'POST') {
      try {
        let name, email, message;
        const contentType = request.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          const body = await request.json();
          name = body.name;
          email = body.email;
          message = body.message;
        } else {
          const formData = await request.formData();
          name = formData.get('name');
          email = formData.get('email');
          message = formData.get('message');
        }

        if (!name || !email || !message) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
            status: 400, 
            headers: { 'Content-Type': 'application/json' } 
          });
        }

        const html = `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `;

        const text = `New Contact Form Submission\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

        await env.EMAIL.send({
          from: { email: 'notifications@studiostonehewer.co.uk', name: 'Studio Stonehewer' },
          to: 'studiostonehewer@gmail.com',
          replyTo: email,
          subject: `New Inquiry from ${name}`,
          html: html,
          text: text
        });

        return new Response(JSON.stringify({ success: true }), { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Serve static Eleventy site assets for all other routes
    return env.ASSETS.fetch(request);
  }
};
