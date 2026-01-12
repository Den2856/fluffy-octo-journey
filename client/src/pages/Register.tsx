import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthSplitLayout from "../components/layout/AuthSplitLayout";
import { useAuth } from "../context/AuthProvider";
import { Checkbox, Divider, ErrorBox, Field, PasswordInput, PrimaryButton, SocialButtons, TextInput } from "../components/ui/AuthUi";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const returnTo = useMemo(() => new URLSearchParams(loc.search).get("returnTo") || "/", [loc.search]);

  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!agree) return setErr("Please accept Terms & Conditions.");
    setErr(null);
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      const first = String(fd.get("first") ?? "").trim();
      const last = String(fd.get("last") ?? "").trim();
      const name = `${first} ${last}`.trim();
      const email = String(fd.get("email") ?? "").trim();
      const password = String(fd.get("password") ?? "");
      await register(name, email, password);
      nav(returnTo, { replace: true });
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? e?.response?.data?.message ?? "Register failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthSplitLayout
      title="Create an account"
      subtitle={
        <>
          Already have an account?{" "}
          <Link className="text-white hover:underline" to={`/login?returnTo=${encodeURIComponent(returnTo)}`}>
            Log in
          </Link>
        </>
      }
      backTo="/"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="First name">
            <TextInput name="first" required placeholder="Jhon" autoComplete="given-name" />
          </Field>
          <Field label="Last name">
            <TextInput name="last" required placeholder="Smith" autoComplete="family-name" />
          </Field>
        </div>

        <Field label="Email">
          <TextInput name="email" type="email" required placeholder="Email" autoComplete="email" />
        </Field>

        <Field label="Password">
          <PasswordInput name="password" required placeholder="Enter your password" autoComplete="new-password" />
        </Field>

        <Checkbox checked={agree} onChange={setAgree}>
          I agree to the{" "}
          <a className="text-white hover:underline" href="/terms" target="_blank" rel="noreferrer">
            Terms & Conditions
          </a>
        </Checkbox>

        {err && <ErrorBox text={err} />}

        <PrimaryButton loading={loading}>{loading ? "Creating…" : "Create account"}</PrimaryButton>

        <Divider label="Or register with" />
        <SocialButtons />
      </form>
    </AuthSplitLayout>
  );
}
