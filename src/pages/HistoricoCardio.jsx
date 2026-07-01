import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { listarRegistrosCardio } from "../services/cardio";

export default function HistoricoCardio() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  async function carregar() {
    try {
      setLoading(true);
      setErro("");

      const data = await listarRegistrosCardio(id);

      setRegistros(Array.isArray(data) ? data : []);
    } catch (err) {
      setErro(
        err?.response?.data?.detail ||
        "Erro ao carregar histórico cardiometabólico."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatarData(data) {
    if (!data) return "-";

    return new Date(
      `${data}T00:00:00`
    ).toLocaleDateString("pt-BR");
  }

  useEffect(() => {
    carregar();
  }, [id]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button
          onClick={() => navigate(`/pacientes/${id}`)}
          style={styles.backButton}
        >
          ← Voltar
        </button>

        <div style={styles.header}>
          <h1 style={styles.title}>
            Histórico Cardiometabólico
          </h1>

          <p style={styles.subtitle}>
            Registros enviados por este responsável
          </p>
        </div>

        {loading && (
          <div style={styles.infoBox}>
            Carregando histórico...
          </div>
        )}

        {erro ? (
          <div style={styles.errorBox}>
            {erro}
          </div>
        ) : null}

        {!loading &&
        !erro &&
        registros.length === 0 ? (
          <div style={styles.infoBox}>
            Ainda não há registros cardiometabólicos enviados por você.
          </div>
        ) : null}

        <div style={styles.list}>
          {registros.map((registro) => (
            <button
              key={registro.id}
              onClick={() =>
                navigate(`/registros-cardio/${registro.id}`)
              }
              style={styles.card}
            >
              <div>
                <h2 style={styles.cardDate}>
                  {formatarData(registro.data_registro)}
                </h2>

                <p style={styles.cardText}>
                  Toque para visualizar o detalhe do registro
                </p>
              </div>

              <span style={styles.arrow}>›</span>
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
  backButton: {
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#334155",
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: 18,
  },
  header: {
    marginBottom: 18,
  },
  title: {
    margin: 0,
    fontSize: 30,
    fontWeight: 700,
    color: "#0f172a",
  },
  subtitle: {
    margin: "8px 0 0 0",
    color: "#64748b",
    fontSize: 14,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  card: {
    width: "100%",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    padding: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
  },
  cardDate: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: "#0f172a",
  },
  cardText: {
    margin: "6px 0 0 0",
    fontSize: 14,
    color: "#64748b",
  },
  cardRisk: {
    margin: "8px 0 0 0",
    fontSize: 14,
    fontWeight: 600,
    color: "#0f52ba",
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
    arrow: {
    fontSize: 28,
    color: "#94a3b8",
    lineHeight: 1,
  },
};