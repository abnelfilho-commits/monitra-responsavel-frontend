import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { obterMeuPaciente } from "../services/pacientes";
import { listarRegistrosPaciente } from "../services/registros";
import { listarRegistrosCardio } from "../services/cardio";

export default function PacienteHome() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [jaRegistrouHoje, setJaRegistrouHoje] = useState(false);

  const temNeuro = paciente?.modulos?.some((m) => m.slug === "neurodesenvolvimento");
  const temCardio = paciente?.modulos?.some((m) => m.slug === "cardiometabolico");

  async function carregar() {
    try {
      setLoading(true);
      setErro("");

      const pacienteData = await obterMeuPaciente(id);

      setPaciente(pacienteData);

      let registros = [];

      const temNeuroPaciente = pacienteData?.modulos?.some(
        (m) => m.slug === "neurodesenvolvimento"
      );

      const temCardioPaciente = pacienteData?.modulos?.some(
        (m) => m.slug === "cardiometabolico"
      );

      if (temNeuroPaciente) {
        const registrosData = await listarRegistrosPaciente(id);
        registros = Array.isArray(registrosData) ? registrosData : [];
      }

      if (temCardioPaciente) {
        const registrosData = await listarRegistrosCardio(id);
        registros = Array.isArray(registrosData) ? registrosData : [];
      }

      const hoje = new Date().toISOString().slice(0, 10);

      const existeRegistroHoje = registros.some(
        (registro) => registro?.data === hoje
      );

      setJaRegistrouHoje(existeRegistroHoje);
    } catch (err) {
      setErro(err?.response?.data?.detail || "Erro ao carregar paciente.");
    } finally {
      setLoading(false);
    }
  }

  function calcularIdade(dataNascimento) {
    if (!dataNascimento) return "";
    const hoje = new Date();
    const nasc = new Date(`${dataNascimento}T00:00:00`);

    let idade = hoje.getFullYear() - nasc.getFullYear();
    const mes = hoje.getMonth() - nasc.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }

    return `${idade} anos`;
  }

  useEffect(() => {
    carregar();
  }, [id]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button
          onClick={() => navigate("/pacientes")}
          style={styles.backButton}
          type="button"
        >
          ← Voltar
        </button>

        {loading && <div style={styles.infoBox}>Carregando paciente...</div>}

        {erro ? <div style={styles.errorBox}>{erro}</div> : null}

        {!loading && !erro && paciente ? (
          <>
            <div style={styles.headerCard}>
              <h1 style={styles.name}>{paciente.nome}</h1>
              <p style={styles.sectionLabel}>Acompanhamento diário</p>
              <p style={styles.age}>{calcularIdade(paciente.data_nascimento)}</p>
            </div>

            {location.state?.sucesso ? (
              <div style={styles.successBox}>Registro enviado com sucesso.</div>
            ) : null}

            {jaRegistrouHoje ? (
              <div style={styles.infoDoneBox}>
                ✅ O registro de hoje já foi enviado. Você ainda pode registrar ontem, se necessário.
              </div>
            ) : (
              <div style={styles.warningBox}>
                ⚠️ Como foi o dia hoje? Ainda não registramos.
              </div>
            )}
            {temNeuro && !jaRegistrouHoje ? (
              <button
                onClick={() => navigate(`/pacientes/${id}/registrar`)}
                style={styles.primaryButton}
                type="button"
              >
                Registrar Neuro
              </button>
            ) : null}

            {temCardio && !jaRegistrouHoje ? (
              <button
                onClick={() => navigate(`/pacientes/${id}/registrar-cardio`)}
                style={styles.primaryButton}
                type="button"
              >
                Registrar Cardiometabólico
              </button>
            ) : null}

              {temNeuro && (
                <button
                  onClick={() =>
                    navigate(`/pacientes/${id}/historico`)
                  }
                  style={styles.secondaryButton}
                >
                  Histórico Neuro
                </button>
              )}

              {temCardio && (
                <button
                  onClick={() =>
                    navigate(`/pacientes/${id}/historico-cardio`)
                  }
                  style={styles.secondaryButton}
                >
                  Histórico Cardiometabólico
                </button>
              )}
          </>
        ) : null}
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
  headerCard: {
    background: "transparent",
    marginBottom: 22,
  },
  name: {
    margin: 0,
    fontSize: 34,
    fontWeight: 700,
    color: "#0f172a",
  },
  sectionLabel: {
    margin: "12px 0 0 0",
    fontSize: 15,
    color: "#64748b",
  },
  age: {
    margin: "12px 0 0 0",
    fontSize: 18,
    fontWeight: 600,
    color: "#1e293b",
  },
  warningBox: {
    background: "#f5ead7",
    border: "1px solid #ead8b3",
    color: "#1e293b",
    borderRadius: 18,
    padding: 18,
    fontSize: 16,
    marginBottom: 18,
  },
  infoDoneBox: {
    background: "#ecfdf5",
    border: "1px solid #a7f3d0",
    color: "#065f46",
    borderRadius: 18,
    padding: 18,
    fontSize: 16,
    marginBottom: 18,
  },
  successBox: {
    background: "#ecfdf5",
    border: "1px solid #a7f3d0",
    color: "#065f46",
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    marginBottom: 18,
  },
  primaryButton: {
    width: "100%",
    border: "none",
    background: "#0f52ba",
    color: "#fff",
    borderRadius: 18,
    padding: 18,
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: 14,
  },
  secondaryButton: {
    width: "100%",
    border: "1px solid #dbe2ea",
    background: "#fff",
    color: "#111827",
    borderRadius: 18,
    padding: 18,
    fontSize: 18,
    fontWeight: 600,
    cursor: "pointer",
  },
  infoBox: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 16,
    color: "#64748b",
  },
  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    borderRadius: 16,
    padding: 16,
  },
};
