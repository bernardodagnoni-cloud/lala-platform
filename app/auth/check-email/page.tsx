import Link from "next/link";
import { getServerT } from "@/lib/i18n/server";
import { LanguageSwitcher } from "@/components/language-switcher";

export default async function CheckEmailPage() {
  const { t } = await getServerT();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="flex justify-end mb-2">
          <LanguageSwitcher />
        </div>
        <div className="text-5xl">📬</div>
        <h1 className="text-2xl font-bold">{t.auth.checkEmail.title}</h1>
        <p className="text-gray-500">
          {t.auth.checkEmail.body}
        </p>
        <p className="text-sm text-gray-400">
          {t.auth.checkEmail.alreadyConfirmed}{" "}
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            {t.auth.checkEmail.signIn}
          </Link>
        </p>
      </div>
    </div>
  );
}
