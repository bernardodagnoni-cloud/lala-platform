export function syntheticEmail(lalaId: string) {
  return `${lalaId.toLowerCase().replace(/[^a-z0-9._-]/g, "-")}@lalaplatform.internal`;
}
