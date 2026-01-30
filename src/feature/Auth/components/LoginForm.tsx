import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/feature/Auth/schemas/auth.schema";
import { useState } from "react";
import { LoginWithEmail } from "../services/sevices.firebase";
import { Link, useNavigate } from "react-router-dom";

function LoginForm() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await LoginWithEmail(data.email, data.password);

      reset();
      navigate("/app", { replace: true });
    } catch (e) {
      const msgErr = mapLoginError(e);
      setError(msgErr);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1">
            Sign in to continue to your dashboard
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className={[
                "w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition",
                errors.email
                  ? "border-red-300 focus:ring-2 focus:ring-red-500"
                  : "border-slate-300 focus:ring-2 focus:ring-blue-500",
              ].join(" ")}
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>

              {/* optional: forgot password */}
              <button
                type="button"
                className="text-xs font-medium text-slate-500 hover:text-slate-700"
                onClick={() => alert("Forgot password flow later")}
              >
                Forgot?
              </button>
            </div>

            <input
              type="password"
              placeholder="••••••••"
              className={[
                "w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition",
                errors.password
                  ? "border-red-300 focus:ring-2 focus:ring-red-500"
                  : "border-slate-300 focus:ring-2 focus:ring-blue-500",
              ].join(" ")}
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={[
              "w-full rounded-xl py-2.5 text-sm font-semibold transition",
              "flex items-center justify-center gap-2",
              isSubmitting
                ? "bg-slate-300 text-slate-700 cursor-not-allowed"
                : "bg-slate-900 text-white hover:bg-slate-800",
            ].join(" ")}
          >
            {isSubmitting && (
              <span className="inline-block w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            )}
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">OR</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Register link */}
        <p className="text-sm text-center text-slate-600">
          Don’t have an account?{" "}
          <Link to="/register" className="font-semibold text-blue-600 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;

export function mapLoginError(error: unknown): string {
  const code = (error as any)?.code as string | undefined;

  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Please try again.";
    default:
      return "Login failed. Please try again.";
  }
}

