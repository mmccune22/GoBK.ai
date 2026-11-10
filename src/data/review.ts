/** Review marks ("Reviewed" / "Draft" next to each article) are a working aid for Matt's review.
 *  Turned off now that the whole Library is reviewed. To turn them back on for a new review pass,
 *  set REVIEW_PASS to true: they then show on local builds and Cloudflare preview builds of any
 *  branch except main, and never on the production site (Netlify, or a Cloudflare build of main). */
const REVIEW_PASS = false;
const env = process.env;
export const showReviewMarks =
  REVIEW_PASS && (env.CF_PAGES ? env.CF_PAGES_BRANCH !== 'main' : !env.CI && !env.NETLIFY);
