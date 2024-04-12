const renderHtml = (url: string, token: string): string => {
  return `
  <html>
  <head>
    <style>
    html {
      margin: 0;
      padding: 0;
      color: #333333;
      background: #ffffff;
      background-color: #ffffff;
      font-size: 16px;
      line-height: 1.5;
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    }
    body {
      margin: 0;
      padding: 1rem;
      color: #333333;
      background: #ffffff;
      background-color: #ffffff;
      font-size: inherit;
      line-height: inherit;
    }
    </style>
  </head>
  <body>
  <h2>Sign in to SuperEffective.gg</h2>

  <p>
    You have requested to sign in to SuperEffective.gg with this email address.
    If you did not request access to our site with this email, you can safely ignore it.
  </p>

  <p>
    To sign in, click the link below:
    <br />
    <br />
    <a style="font-size: 14px; color: #4E78DA; word-break: break-all; word-wrap: break-word;" href="${url}" target="_blank" rel="nofollow">${url}</a>
  </p>

  <p>
    Alternatively, you can copy and paste the following token on the website login page,
    using the option <em>"Sign in with Token"</em>:
  </p>

  <pre style="font-size: 16px; font-weight: bold;">${token}</pre>
  </body>
  `
}

const renderText = (url: string, token: string): string => {
  return `
  Sign in to SuperEffective.gg

  You have requested to sign in to SuperEffective.gg with this email address.

  If you did not request access to our site with this email, you can safely ignore it.

  To sign in, click the link below:

  ${url}

  
  Alternatively, you can copy and paste the following token on the website login page,
  using the option "Sign in with Token":

  ${token}
  `
}

export { renderHtml, renderText }
