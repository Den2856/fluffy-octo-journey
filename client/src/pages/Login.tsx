import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthSplitLayout from "../components/layout/AuthSplitLayout";
import { useAuth } from "../context/AuthProvider";
import { Checkbox, Divider, ErrorBox, Field, PasswordInput, PrimaryButton, SocialButtons, TextInput } from "../components/ui/AuthUi";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const returnTo = useMemo(() => new URLSearchParams(loc.search).get("returnTo") || "/", [loc.search]);

  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      await login(String(fd.get("email")).trim(), String(fd.get("password")), remember);
      nav(returnTo, { replace: true });
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? e?.response?.data?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthSplitLayout
      title="Welcome back"
      subtitle={
        <>
          New to OPT-Rent?{" "}
          <Link className="text-white hover:underline" to={`/register?returnTo=${encodeURIComponent(returnTo)}`}>
            Create an account
          </Link>
        </>
      }
      backTo="/"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Email">
          <TextInput name="email" type="email" required placeholder="Email" autoComplete="email" />
        </Field>

        <Field label="Password">
          <PasswordInput name="password" required placeholder="Enter your password" autoComplete="current-password" />
        </Field>

        <div className="flex items-center justify-between gap-3">
          <Checkbox checked={remember} onChange={setRemember}>Remember me</Checkbox>
          <Link className="text-sm text-white/60 hover:text-white hover:underline" to="/forgot-password">
            Forgot password?
          </Link>
        </div>

        {err && <ErrorBox text={err} />}

        <PrimaryButton loading={loading}>{loading ? "Signing in…" : "Log in"}</PrimaryButton>

        <Divider label="Or continue with" />
        <SocialButtons />
      </form>
    </AuthSplitLayout>
  );
}
