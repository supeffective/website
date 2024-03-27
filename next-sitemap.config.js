/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://supereffective.gg',
  generateRobotsTxt: true, // (optional)
  sitemapSize: 10000,
  exclude: [
    '/home',
    '/404',
    '/login',
    '/profile',
    '/terms-and-conditions',
    '/terms-of-service',
    '/terms',
    '/legal',
    '/privacy',
    '/privacy-policy',
    '/license',
    '/licenses',
    '/disclaimer',
    '/apps/livingdex/new',
    '/apps/livingdex/missing',
    '/donate/thankyou',
    '/profile',
    '/auth/*',
    '/v4',
    '/v4/*',
  ],
  // ...other options
}
