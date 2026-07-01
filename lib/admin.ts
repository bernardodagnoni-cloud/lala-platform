const ADMIN_EMAILS = ["bernardodagnoni@gmail.com", "paloma.flores@somoslala.org", "analidia.schroeder@somoslala.org"];

export function isAdmin(email: string | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email);
}
