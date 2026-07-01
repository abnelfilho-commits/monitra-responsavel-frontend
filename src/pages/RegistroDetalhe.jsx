import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obterRegistro } from "../services/registros";

export default function RegistroDetalhe() {
  const { registroId } = useParams();
  const navigate = useNavigate();

  const [registro, setRegistro] = useState(null);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(true);

  function formatarData(data) {
    if (!data) return "-";
    return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR");
  }

  function formatarEvacuacao(valor) {
    if (valor === true) return "Sim";
    if (valor === false) return "Não";
    return "-";
  }

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setErro("");
        const data = await obterRegistro(registroId);
        setRegistro(data);
      } catch (err) {
        setErro(err?.response?.data?.detail || "Erro ao carregar registro.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [registroId]);

  if (loading) {
    return <div style={styles.page}><div style={styles.container}>Carregando...</div></div>;
  }

  if (erro) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <button style={styles.backButton} onClick={() => navigate(-1)} type="button">
            ← Voltar
          </button>
          <div style={styles.error}>{erro}</div>
        </div>
      </div>
    );
  }

  if (!registro) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <button style={styles.backButton} onClick={() => navigate(-1)} type="button">
            ← Voltar
          </button>
          <div style={styles.error}>Registro não encontrado.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => navigate(-1)} type="button">
          ← Voltar
        </button>

        <h1 style={styles.title}>Detalhe do registro</h1>

        <div style={styles.card}>
          <p><strong>Data:</strong> {formatarData(registro.data)}</p>
          <p><strong>Sono:</strong> {registro.sono_qualidade ?? "-"}</p>
          <p><strong>Evacuação:</strong> {formatarEvacuacao(registro.evacuacao)}</p>
          <p><strong>Consistência das fezes:</strong> {registro.consistencia_fezes ?? "-"}</p>
          <p><strong>Irritabilidade:</strong> {registro.irritabilidade ?? "-"}</p>
          <p><strong>Crise sensorial:</strong> {registro.crise_sensorial ?? "-"}</p>
          <p><strong>Tempo de tela:</strong> {registro.tempo_tela || "-"}</p>
          <p><strong>Seletividade alimentar:</strong> {registro.seletividade_alimentar || "-"}</p>
          <p><strong>Observação:</strong> {registro.observacao || "-"}</p>
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
  title: {
    margin: "0 0 18px 0",
    fontSize: 30,
    fontWeight: 700,
    color: "#0f172a",
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
    lineHeight: 1.8,
    color: "#1e293b",
  },
  error: {
    color: "#b42318",
    background: "#fef3f2",
    border: "1px solid #fecdca",
    borderRadius: 12,
    padding: 12,
  },
};
