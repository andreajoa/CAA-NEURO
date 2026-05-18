export function isAdmin(email: string | null | undefined): boolean {
  return email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
}
