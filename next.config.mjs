/**
 * Helper to compute the base path for static export & GitHub Pages
 */
function getBasePath() {
  const customPath = process.env.BASE_PATH || process.env.NEXT_PUBLIC_BASE_PATH;
  if (customPath) {
    const trimmed = customPath.trim();
    return trimmed ? (trimmed.startsWith('/') ? trimmed : `/${trimmed}`).replace(/\/$/, '') : '';
  }

  // Auto-detect GitHub Pages repository name in GitHub Actions environment
  if (process.env.GITHUB_REPOSITORY) {
    const repoName = process.env.GITHUB_REPOSITORY.split('/')[1];
    // If not a user page (e.g. username.github.io), use the repo name as basePath
    if (repoName && !repoName.endsWith('.github.io')) {
      return `/${repoName}`;
    }
  }

  return '';
}

const basePath = getBasePath();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
