const pageConfig = {
  signInVerification: '/auth/verify-request',
  signInVerificationParam: 'nextUrl',
  authJs: {
    signIn: '/login',
    //signOut: '/auth/signout',
    error: '/auth/error', // Error code passed in query string as ?error=
    verifyRequest: '/auth/signin-sent', // (used for check email message)
    //newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  },
}

export default pageConfig
