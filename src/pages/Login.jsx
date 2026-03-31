import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    try {
      setLoading(true);

      await login(email.trim().toLowerCase(), senha);

      navigate("/pacientes", { replace: true });
    } catch (err) {
      setErro(
        err?.response?.data?.detail ||
          err?.message ||
          "Não foi possível entrar. Verifique seu e-mail e senha."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.logoContainer}>
          <img
            src="/logo-monitra.png"
            alt="Monitra"
            style={styles.logo}
          />

          <p style={styles.subtitle}>
            Monitoramento contínuo para uma saúde mais inteligente.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>E-mail</label>
            <input
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="username"
              spellCheck={false}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Senha</label>
            <input
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="current-password"
              spellCheck={false}
              style={styles.input}
              required
            />
          </div>

          {erro && <div style={styles.error}>{erro}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div style={styles.footer}>
          <span>© Monitra</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
    padding: 16,
  },
  container: {
    width: "100%",
    maxWidth: 420,
    background: "#fff",
    borderRadius: 24,
    padding: 32,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  logoContainer: {
    textAlign: "center",
    marginBottom: 28,
  },
  logo: {
    width: 170,
    height: "auto",
    objectFit: "contain",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 6,
    lineHeight: 1.5,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  field: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 6,
    color: "#334155",
  },
  input: {
    padding: 14,
    borderRadius: 14,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    outline: "none",
    background: "#eef2f7",
  },
  button: {
    marginTop: 8,
    padding: 15,
    borderRadius: 16,
    border: "none",
    background: "#1d4ed8",
    color: "#fff",
    fontWeight: 700,
    fontSize: 16,
    cursor: "pointer",
  },
  error: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    padding: 10,
    borderRadius: 10,
    fontSize: 13,
  },
  footer: {
    marginTop: 22,
    textAlign: "center",
    fontSize: 12,
    color: "#94a3b8",
  },
};
