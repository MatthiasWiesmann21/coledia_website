import { AuthPage } from "@/components/auth/auth-page";

export default async function SignUpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <AuthPage mode="signUp" locale={locale} />;
}
