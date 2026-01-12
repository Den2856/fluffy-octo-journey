import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AuthSplitLayout from "../components/layout/AuthSplitLayout";
import { useAuth } from "../context/AuthProvider";
import { AUTH_CLS, ErrorBox, Field, PrimaryButton, TextInput } from "../components/ui/AuthUi";

export default function ForgotPassword() {
  const { forgot } = useAuth();
  const loc = useLocation();
  const returnTo = useMemo(() => new URLSearchParams(loc.search).get("returnTo") || "/", [loc.search]);

  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      await forgot(String(fd.get("email") ?? "").trim());
      setSent(true);
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? e?.response?.data?.message ?? "Failed to send link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthSplitLayout
      title="Forgot password"
      subtitle={
        <>
          Remembered it?{" "}
          <Link className="text-white hover:underline" to={`/login?returnTo=${encodeURIComponent(returnTo)}`}>
            Back to login
          </Link>
        </>
      }
      backTo="/"
    >
      {sent ? (
        <div className={AUTH_CLS.subtleCard}>
          If the account exists, we’ve sent a reset link to your email.
          <div className="mt-4">
            <Link className="text-white hover:underline" to={`/login?returnTo=${encodeURIComponent(returnTo)}`}>
              Go to login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Field label="Email">
            <TextInput name="email" type="email" required placeholder="Email" autoComplete="email" />
          </Field>

          {err && <ErrorBox text={err} />}

          <PrimaryButton loading={loading}>{loading ? "Sending…" : "Send reset link"}</PrimaryButton>
        </form>
      )}
    </AuthSplitLayout>
  );
}
