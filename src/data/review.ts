/** Review marks ("Reviewed" / "Draft" next to each article) are a working aid for Matt's review.
 *  They show on local builds and on Cloudflare preview builds of any branch except main.
 *  They never show on the production site (Netlify, or a Cloudflare build of main). */
const env = process.env;
export const showReviewMarks = env.CF_PAGES ? env.CF_PAGES_BRANCH !== 'main' : !env.CI && !env.NETLIFY;
