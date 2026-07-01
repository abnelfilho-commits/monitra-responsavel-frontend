
import {
  criarRegistroCardio,
  listarRegistrosCardio,
} from "../services/cardio";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function RegistroCardioForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);

  const hojeStr = hoje.toISOString().slice(0, 10);
  const ontemStr = ontem.toISOString().slice(0, 10);

  const [form, setForm] = useState({
    data: hojeStr,
    glicemia_jejum: "",
    pressao_sistolica: "",
    pressao_diastolica: "",
    peso: "",
    sono: "bom",
    humor: "bom",
    observacoes: "",
  });

  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const [loadingDatas, setLoadingDatas] = useState(true);
  const [jaTemHoje, setJaTemHoje] = useState(false);
  const [jaTemOntem, setJaTemOntem] = useState(false);
  
  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toNumberOrNull(value) {
    if (value === "" || value === null || value === undefined) return null;
    return Number(value);
  }

  const referenciaDia = useMemo(() => {
    if (form.data === ontemStr) return "ontem";
    return "hoje";
  }, [form.data, ontemStr]);

  const subtitulo = useMemo(() => {
    if (form.data === ontemStr) {
      return "Preencha os dados cardiometabólicos de ontem";
    }

  const bloqueadoTotal =
    jaTemHoje && jaTemOntem;

    return "Preencha os dados cardiometabólicos de hoje";
  }, [form.data, ontemStr]);

  async function carregarRegistros() {
    try {
      setLoadingDatas(true);
      setErro("");

      const registros = await listarRegistrosCardio(id);
      const lista = Array.isArray(registros) ? registros : [];

      const temHoje = lista.some(
        (r) => r.data_registro === hojeStr
      );

      const temOntem = lista.some(
        (r) => r.data_registro === ontemStr
      );

      setJaTemHoje(temHoje);
      setJaTemOntem(temOntem);

      if (temHoje && !temOntem) {
        setForm((prev) => ({
          ...prev,
          data: ontemStr,
        }));
      } else if (!temHoje) {
        setForm((prev) => ({
          ...prev,
          data: hojeStr,
        }));
      } else if (temHoje && temOntem) {
        setForm((prev) => ({
          ...prev,
          data: "",
        }));
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDatas(false);
    }
  }

  useEffect(() => {
    carregarRegistros();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (!form.data) {
      setErro("Informe a data do registro.");
      return;
    }

    if (!form.glicemia_jejum && !form.pressao_sistolica && !form.pressao_diastolica && !form.peso) {
      setErro("Informe pelo menos um dado clínico: glicemia, pressão ou peso.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        data: form.data,
        glicemia_jejum: toNumberOrNull(form.glicemia_jejum),
        pressao_sistolica: toNumberOrNull(form.pressao_sistolica),
        pressao_diastolica: toNumberOrNull(form.pressao_diastolica),
        peso: toNumberOrNull(form.peso),
        sono: form.sono || null,
        humor: form.humor || null,
        observacoes: form.observacoes?.trim() || null,
      };

      await criarRegistroCardio(id, payload);

      navigate(`/pacientes/${id}`, {
        replace: true,
        state: { sucesso: true },
      });
    } catch (err) {
      setErro(
        err?.response?.data?.detail ||
          err?.message ||
          "Falha ao enviar registro cardiometabólico."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button
          style={styles.backButton}
          onClick={() => navigate(`/pacientes/${id}`)}
          type="button"
        >
          ← Voltar
        </button>

        <div style={styles.header}>
          <h1 style={styles.title}>Registro Cardiometabólico</h1>
          <p style={styles.subtitle}>{subtitulo}</p>
        </div>

        {loadingDatas && (
          <div style={styles.infoBox}>
            Validando datas disponíveis...
          </div>
        )}

        {!loadingDatas && jaTemHoje && !jaTemOntem && (
          <div style={styles.warningBox}>
            ✅ O registro de hoje já foi enviado.
            Você ainda pode registrar ontem.
          </div>
        )}

        {!loadingDatas && bloqueadoTotal && (
          <div style={styles.infoDoneBox}>
            ✅ Já existem registros para hoje e ontem.
            Nenhuma nova data está disponível.
          </div>
        )}

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.card}>
            <label style={styles.label}>
              Data
              <select
                  style={styles.input}
                  value={form.data}
                  onChange={(e) =>
                      updateField("data", e.target.value)
                  }
                  disabled={bloqueadoTotal || loadingDatas}
              >
                  <option value="">Selecione</option>

                  <option
                      value={hojeStr}
                      disabled={jaTemHoje}
                  >
                      Hoje {jaTemHoje ? "(já registrado)" : ""}
                  </option>

                  <option
                      value={ontemStr}
                      disabled={jaTemOntem}
                  >
                      Ontem {jaTemOntem ? "(já registrado)" : ""}
                  </option>
              </select>
            </label>
          </div>

          <div style={styles.card}>
            <label style={styles.label}>
              Glicemia em jejum {referenciaDia}
              <input
                type="number"
                inputMode="decimal"
                style={styles.input}
                value={form.glicemia_jejum}
                onChange={(e) => updateField("glicemia_jejum", e.target.value)}
                placeholder="Ex: 145"
              />
            </label>
          </div>

          <div style={styles.card}>
            <label style={styles.label}>
              Pressão sistólica {referenciaDia}
              <input
                type="number"
                inputMode="decimal"
                style={styles.input}
                value={form.pressao_sistolica}
                onChange={(e) => updateField("pressao_sistolica", e.target.value)}
                placeholder="Ex: 140"
              />
            </label>
          </div>

          <div style={styles.card}>
            <label style={styles.label}>
              Pressão diastólica {referenciaDia}
              <input
                type="number"
                inputMode="decimal"
                style={styles.input}
                value={form.pressao_diastolica}
                onChange={(e) => updateField("pressao_diastolica", e.target.value)}
                placeholder="Ex: 90"
              />
            </label>
          </div>

          <div style={styles.card}>
            <label style={styles.label}>
              Peso {referenciaDia}
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                style={styles.input}
                value={form.peso}
                onChange={(e) => updateField("peso", e.target.value)}
                placeholder="Ex: 92.5"
              />
            </label>
          </div>

          <div style={styles.card}>
            <label style={styles.label}>
              Como foi o sono {referenciaDia}?
              <select
                style={styles.input}
                value={form.sono}
                onChange={(e) => updateField("sono", e.target.value)}
              >
                <option value="bom">Bom</option>
                <option value="regular">Regular</option>
                <option value="ruim">Ruim</option>
                <option value="muito_ruim">Muito ruim</option>
              </select>
            </label>
          </div>

          <div style={styles.card}>
            <label style={styles.label}>
              Como foi o humor {referenciaDia}?
              <select
                style={styles.input}
                value={form.humor}
                onChange={(e) => updateField("humor", e.target.value)}
              >
                <option value="estavel">Estável</option>
                <option value="bom">Bom</option>
                <option value="ansioso">Ansioso</option>
                <option value="irritado">Irritado</option>
                <option value="desanimado">Desanimado</option>
              </select>
            </label>
          </div>

          <div style={styles.card}>
            <label style={styles.label}>
              Observações
              <textarea
                style={styles.textarea}
                value={form.observacoes}
                onChange={(e) => updateField("observacoes", e.target.value)}
                placeholder={`Descreva algo importante que aconteceu ${referenciaDia}`}
              />
            </label>
          </div>

          {erro ? <div style={styles.error}>{erro}</div> : null}

          <button
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            type="submit"
            disabled={
                loading ||
                bloqueadoTotal ||
                loadingDatas
            }
          >
            {loading
                ? "Enviando..."
                : bloqueadoTotal
                ? "Nenhuma data disponível"
                : "Enviar registro"}
          </button>
        </form>
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
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    fontSize: 15,
    fontWeight: 600,
    color: "#334155",
    gap: 10,
  },
  input: {
    width: "100%",
    padding: 14,
    borderRadius: 14,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    outline: "none",
    background: "#fff",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    minHeight: 110,
    padding: 14,
    borderRadius: 14,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    outline: "none",
    resize: "vertical",
    background: "#fff",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  button: {
    marginTop: 6,
    padding: 16,
    borderRadius: 18,
    border: "none",
    cursor: "pointer",
    fontSize: 17,
    background: "#0f52ba",
    color: "#fff",
    fontWeight: 700,
    boxShadow: "0 8px 20px rgba(15, 82, 186, 0.22)",
  },
  buttonDisabled: {
    background: "#94a3b8",
    boxShadow: "none",
    cursor: "not-allowed",
  },
  error: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    padding: 12,
    borderRadius: 14,
    fontSize: 14,
  },
};