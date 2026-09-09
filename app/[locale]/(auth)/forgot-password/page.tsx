import { AuthPage } from "@/components/auth/auth-page";

export default async function ForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <AuthPage mode="forgotPassword" locale={locale} />;
}
