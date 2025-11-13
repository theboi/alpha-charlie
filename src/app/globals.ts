const IS_PRODUCTION_OR_PREVIEW = process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview";
const CWD_PATH = IS_PRODUCTION_OR_PREVIEW ? `/tmp` : `./tmp`;
const BASE_URL = "https://bravosresearch.com"

export const k = {
  IS_PRODUCTION_OR_PREVIEW, CWD_PATH, BASE_URL
}