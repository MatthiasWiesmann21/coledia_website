import { AuthPage } from "@/components/auth/auth-page";

export default async function ResetPasswordPage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { locale } = await params;
  const { token } = await searchParams;
  return <AuthPage mode="resetPassword" locale={locale} token={typeof token === "string" ? token : undefined} />;
}
