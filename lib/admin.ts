const ADMIN_EMAILS = ["bernardodagnoni@gmail.com"];

export function isAdmin(email: string | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email);
}
