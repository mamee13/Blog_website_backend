export const authEvents = {
  login: () => window.dispatchEvent(new Event('auth-login')),
  logout: () => window.dispatchEvent(new Event('auth-logout'))
}