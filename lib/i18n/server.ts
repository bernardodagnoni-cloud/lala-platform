import { cookies } from "next/headers";
import { translations, type Locale } from "./translations";

export async function getServerT() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("NEXT_LOCALE")?.value as Locale) || "en";
  return { t: translations[locale], locale };
}
