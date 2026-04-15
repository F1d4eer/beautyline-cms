import { useState } from "react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Login = () => {
  const { signIn } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError("Неверный email или пароль");
    } else {
      navigate("/admin");
    }
  };

  const inputCls =
    "w-full rounded-xl border border-border/30 bg-surface-low px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-2xl font-semibold text-foreground">Beautyline</p>
          <p className="mt-1 text-sm text-muted-foreground">Панель управления</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[1.5rem] bg-card p-8 shadow-sm"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="space-y-4">
            <div>
              <label className="label-text mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                className={inputCls}
              />
            </div>
            <div>
              <label className="label-text mb-2 block">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className={inputCls}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Вход...</> : "Войти"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
