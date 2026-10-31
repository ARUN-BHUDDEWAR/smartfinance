import { ArrowRight, CircleDollarSign } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Could not create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-neutral-50 px-5 py-12">
      <div className="pointer-events-none absolute -left-24 top-12 size-80 rounded-full bg-violet-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-8 size-96 rounded-full bg-emerald-200/30 blur-3xl" />

      <section className="relative w-full max-w-md rounded-3xl border border-neutral-200 bg-white/90 p-8 shadow-sm backdrop-blur sm:p-10">
        <Link to="/login" className="mb-10 inline-flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-neutral-900 text-white">
            <CircleDollarSign size={19} />
          </span>
          SmartFinance
        </Link>
        <p className="mb-2 text-sm font-medium text-neutral-500">Start with a clear picture</p>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">Create your account</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-500">
          A simple place to understand where your money goes.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-neutral-700">
            Email address
            <input
              autoComplete="email"
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
              name="email"
              onChange={updateField}
              placeholder="you@example.com"
              required
              type="email"
              value={form.email}
            />
          </label>
          <label className="block text-sm font-medium text-neutral-700">
            Password
            <input
              autoComplete="new-password"
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
              minLength={8}
              name="password"
              onChange={updateField}
              placeholder="At least 8 characters"
              required
              type="password"
              value={form.password}
            />
            <span className="mt-2 block text-xs font-normal text-neutral-500">
              Use at least 8 characters.
            </span>
          </label>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-5 py-3 font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Creating account…" : "Create account"}
            {!submitting && <ArrowRight size={17} />}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link className="font-semibold text-neutral-900 hover:underline" to="/login">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
