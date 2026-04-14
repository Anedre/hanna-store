import Link from "next/link";
import Image from "next/image";
import { SITE_NAME } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream-100 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image
              src="/logo.png"
              alt={SITE_NAME}
              width={160}
              height={56}
              className="h-14 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-cream-200 shadow-sm p-8">
          {children}
        </div>

        {/* Back link */}
        <p className="text-center mt-6 text-sm text-cream-500">
          <Link
            href="/"
            className="text-hanna-600 hover:text-hanna-700 font-medium transition-colors"
          >
            Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}
