export const GITHUB_PAGES_URL = 'https://z3n1thh.github.io/app_journal/'

export function docsPath(file) {
  return `${import.meta.env.BASE_URL}docs/${file}`
}

export function isGitHubPagesHost() {
  return typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')
}
