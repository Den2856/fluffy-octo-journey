import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthSplitLayout from "../components/layout/AuthSplitLayout";
import { useAuth } from "../context/AuthProvider";
import { AUTH_CLS, ErrorBox, Field, PasswordInput, PrimaryButton } from "../components/ui/AuthUi";

export default function ResetPassword() {
  const { reset } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();

  const token = new URLSearchParams(loc.search).get("token") || "";
  const returnTo = useMemo(() => new URLSearchParams(loc.search).get("returnTo") || "/", [loc.search]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      const p1 = String(fd.get("p1") ?? "");
      const p2 = String(fd.get("p2") ?? "");
      if (p1 !== p2) throw new Error("Passwords do not match");
      await reset(token, p1);
      nav(`/login?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? e?.message ?? "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthSplitLayout
      title="Reset password"
      subtitle={
        <>
          Back to{" "}
          <Link className="text-white hover:underline" to={`/login?returnTo=${encodeURIComponent(returnTo)}`}>
            login
          </Link>
        </>
      }
      backTo="/"
    >
      {!token ? (
        <div className={AUTH_CLS.subtleCard}>
          Missing token. Open the link from email again.
          <div className="mt-4">
            <Link className="text-white hover:underline" to={`/forgot-password?returnTo=${encodeURIComponent(returnTo)}`}>
              Request new link
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Field label="New password">
            <PasswordInput name="p1" required placeholder="New password" autoComplete="new-password" />
          </Field>

          <Field label="Repeat password">
            <PasswordInput name="p2" required placeholder="Repeat password" autoComplete="new-password" />
          </Field>

          {err && <ErrorBox text={err} />}

          <PrimaryButton loading={loading}>{loading ? "Saving…" : "Save password"}</PrimaryButton>
        </form>
      )}
    </AuthSplitLayout>
  );
}
