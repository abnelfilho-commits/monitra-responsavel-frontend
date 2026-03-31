import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarPacientesResponsavel } from "../services/pacientes";
import { logoutResponsavel } from "../services/auth";

export default function Pacientes() {
  const navigate = useNavigate();

  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  async function carregar() {
    try {
      setLoading(true);
      setErro("");
      const data = await listarPacientesResponsavel();
      setPacientes(Array.isArray(data) ? data : []);
    } catch (err) {
      setErro(err?.response?.data?.detail || "Erro ao carregar pacientes.");
    } finally {
      setLoading(false);
    }
  }

  function handleSair() {
    logoutResponsavel();
    navigate("/login", { replace: true });
  }

  function formatarData(data) {
    if (!data) return "";
    return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR");
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Meus pacientes</h1>
            <p style={styles.subtitle}>
              Selecione um paciente para acompanhar
            </p>
          </div>

          <button onClick={handleSair} style={styles.logoutButton}>
            Sair
          </button>
        </header>

        {loading && <div style={styles.infoBox}>Carregando pacientes...</div>}

        {erro ? <div style={styles.errorBox}>{erro}</div> : null}

        {!loading && !erro && pacientes.length === 0 ? (
          <div style={styles.infoBox}>Nenhum paciente vinculado.</div>
        ) : null}

        <div style={styles.list}>
          {pacientes.map((paciente) => (
            <button
              key={paciente.id}
              onClick={() => navigate(`/pacientes/${paciente.id}`)}
              style={styles.card}
            >
              <h2 style={styles.cardTitle}>{paciente.nome}</h2>

              {paciente.data_nascimento ? (
                <p style={styles.cardText}>
                  Nascimento: {formatarData(paciente.data_nascimento)}
                </p>
              ) : null}

              <p style={styles.cardHint}>
                Toque para ver detalhes e registrar o dia.
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    background: "#f1f5f9",
    padding: 20,
  },
  container: {
    width: "100%",
    maxWidth: 520,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
    color: "#0f172a",
  },
  subtitle: {
    margin: "6px 0 0 0",
    fontSize: 14,
    color: "#64748b",
  },
  logoutButton: {
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#334155",
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  card: {
    width: "100%",
    textAlign: "left",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    padding: 20,
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
  },
  cardTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: "#0f172a",
  },
  cardText: {
    margin: "12px 0 0 0",
    fontSize: 15,
    color: "#475569",
  },
  cardHint: {
    margin: "14px 0 0 0",
    fontSize: 14,
    color: "#64748b",
  },
  infoBox: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 16,
    color: "#64748b",
    marginBottom: 16,
  },
  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
};
