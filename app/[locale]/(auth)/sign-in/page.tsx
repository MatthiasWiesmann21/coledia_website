import { AuthPage } from "@/components/auth/auth-page";

export default async function SignInPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <AuthPage mode="signIn" locale={locale} />;
}
