import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="text-5xl">📬</div>
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="text-gray-500">
          We sent a confirmation link to your email address.
          Click the link to activate your account and complete your profile.
        </p>
        <p className="text-sm text-gray-400">
          Already confirmed?{" "}
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
