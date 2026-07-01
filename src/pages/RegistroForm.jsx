import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { criarRegistroPaciente, listarRegistrosPaciente } from "../services/registros";

export default function RegistroForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);

  const hojeStr = hoje.toISOString().slice(0, 10);
  const ontemStr = ontem.toISOString().slice(0, 10);

  const [form, setForm] = useState({
    data: hojeStr,
    sono_qualidade: "",
    evacuacao: "",
    consistencia_fezes: "",
    irritabilidade: "",
    crise_sensorial: "",
    tempo_tela: "",
    seletividade_alimentar: "",
    observacao: "",
  });

  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDatas, setLoadingDatas] = useState(true);
  const [jaTemHoje, setJaTemHoje] = useState(false);
  const [jaTemOntem, setJaTemOntem] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toIntOrNull(value) {
    if (value === "" || value === null || value === undefined) return null;
    return Number(value);
  }

  function toBoolOrNull(value) {
    if (value === "true") return true;
    if (value === "false") return false;
    return null;
  }

  useEffect(() => {
    async function carregarRegistros() {
      try {
        setLoadingDatas(true);
        setErro("");

        const data = await listarRegistrosPaciente(id);
        const registros = Array.isArray(data) ? data : [];

        const temHoje = registros.some((registro) => registro?.data === hojeStr);
        const temOntem = registros.some((registro) => registro?.data === ontemStr);

        setJaTemHoje(temHoje);
        setJaTemOntem(temOntem);

        if (temHoje && !temOntem) {
          setForm((prev) => ({ ...prev, data: ontemStr }));
        } else if (!temHoje) {
          setForm((prev) => ({ ...prev, data: hojeStr }));
        } else if (temHoje && temOntem) {
          setForm((prev) => ({ ...prev, data: "" }));
        }
      } catch (err) {
        setErro(err?.response?.data?.detail || "Erro ao validar datas disponíveis.");
      } finally {
        setLoadingDatas(false);
      }
    }

    carregarRegistros();
  }, [id, hojeStr, ontemStr]);

  const bloqueadoTotal = jaTemHoje && jaTemOntem;

  const referenciaDia = useMemo(() => {
    if (form.data === ontemStr) return "ontem";
    return "hoje";
  }, [form.data, ontemStr]);

  const subtitulo = useMemo(() => {
    if (bloqueadoTotal) {
      return "Já existem registros para hoje e ontem.";
    }
    if (form.data === ontemStr) {
      return "Preencha como foi o dia de ontem";
    }
    return "Preencha como foi o dia de hoje";
  }, [bloqueadoTotal, form.data, ontemStr]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (!form.data) {
      setErro("Não há data disponível para novo registro.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        data: form.data,
        sono_qualidade: toIntOrNull(form.sono_qualidade),
        evacuacao: toBoolOrNull(form.evacuacao),
        consistencia_fezes: toIntOrNull(form.consistencia_fezes),
        irritabilidade: toIntOrNull(form.irritabilidade),
        crise_sensorial: toIntOrNull(form.crise_sensorial),
        tempo_tela: form.tempo_tela || null,
        seletividade_alimentar: form.seletividade_alimentar || null,
        observacao: form.observacao?.trim() || null,
      };

      console.log("PAYLOAD REGISTRO NEURO:", payload);

      await criarRegistroPaciente(id, payload);

      navigate(`/pacientes/${id}`, {
        replace: true,
        state: { sucesso: true },
      });
    } catch (err) {
      setErro(err?.response?.data?.detail || "Falha ao enviar registro.");
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
          <h1 style={styles.title}>Registro diário</h1>
          <p style={styles.subtitle}>{subtitulo}</p>
        </div>

        {loadingDatas ? (
          <div style={styles.infoBox}>Validando datas disponíveis...</div>
        ) : null}

        {!loadingDatas && jaTemHoje && !jaTemOntem ? (
          <div style={styles.warningBox}>
            ✅ O registro de hoje já foi enviado. Você ainda pode registrar ontem.
          </div>
        ) : null}

        {!loadingDatas && bloqueadoTotal ? (
          <div style={styles.infoDoneBox}>
            ✅ Já existem registros para hoje e ontem. Nenhuma nova data está disponível.
          </div>
        ) : null}

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.card}>
            <label style={styles.label}>
              Data
              <select
                style={styles.input}
                value={form.data}
                onChange={(e) => updateField("data", e.target.value)}
                disabled={bloqueadoTotal || loadingDatas}
              >
                <option value="">Selecione</option>
                <option value={hojeStr} disabled={jaTemHoje}>
                  Hoje {jaTemHoje ? "(já registrado)" : ""}
                </option>
                <option value={ontemStr} disabled={jaTemOntem}>
                  Ontem {jaTemOntem ? "(já registrado)" : ""}
                </option>
              </select>
            </label>
          </div>

          <div style={styles.card}>
            <label style={styles.label}>
              Como foi o sono {referenciaDia}?
              <select
                style={styles.input}
                value={form.sono_qualidade}
                onChange={(e) => updateField("sono_qualidade", e.target.value)}
                disabled={bloqueadoTotal}
              >
                <option value="">Selecione</option>
                <option value="1">1 - Muito ruim</option>
                <option value="2">2 - Ruim</option>
                <option value="3">3 - Regular</option>
                <option value="4">4 - Bom</option>
                <option value="5">5 - Muito bom</option>
              </select>
            </label>
          </div>

          <div style={styles.card}>
            <label style={styles.label}>
              Evacuou {referenciaDia}?
              <select
                style={styles.input}
                value={form.evacuacao}
                onChange={(e) => updateField("evacuacao", e.target.value)}
                disabled={bloqueadoTotal}
              >
                <option value="">Selecione</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </label>
          </div>

          <div style={styles.card}>
            <label style={styles.label}>
              Como estavam as fezes {referenciaDia}?
              <select
                style={styles.input}
                value={form.consistencia_fezes}
                onChange={(e) => updateField("consistencia_fezes", e.target.value)}
                disabled={bloqueadoTotal}
              >
                <option value="">Selecione</option>
                <option value="1">1 - Muito ressecada</option>
                <option value="2">2 - Ressecada</option>
                <option value="3">3 - Normal</option>
                <option value="4">4 - Mole</option>
                <option value="5">5 - Líquida</option>
              </select>
            </label>
          </div>

          <div style={styles.card}>
            <label style={styles.label}>
              Como foi o comportamento {referenciaDia}?
              <select
                style={styles.input}
                value={form.irritabilidade}
                onChange={(e) => updateField("irritabilidade", e.target.value)}
                disabled={bloqueadoTotal}
              >
                <option value="">Selecione</option>
                <option value="1">1 - Tranquilo</option>
                <option value="2">2 - Leve irritação</option>
                <option value="3">3 - Moderado</option>
                <option value="4">4 - Alto</option>
                <option value="5">5 - Muito intenso</option>
              </select>
            </label>
          </div>

          <div style={styles.card}>
            <label style={styles.label}>
              Teve crise sensorial {referenciaDia}?
              <select
                style={styles.input}
                value={form.crise_sensorial}
                onChange={(e) => updateField("crise_sensorial", e.target.value)}
                disabled={bloqueadoTotal}
              >
                <option value="">Selecione</option>
                <option value="0">0 - Não</option>
                <option value="1">1 - Leve</option>
                <option value="2">2 - Moderada</option>
                <option value="3">3 - Intensa</option>
              </select>
            </label>
          </div>

          <div style={styles.card}>
            <label style={styles.label}>
              Tempo de tela {referenciaDia}
              <select
                style={styles.input}
                value={form.tempo_tela}
                onChange={(e) => updateField("tempo_tela", e.target.value)}
                disabled={bloqueadoTotal}
              >
                <option value="">Selecione</option>
                <option value="MENOS_1H">Menos de 1 hora</option>
                <option value="1_2H">1 a 2 horas</option>
                <option value="2_4H">2 a 4 horas</option>
                <option value="MAIS_4H">Mais de 4 horas</option>
              </select>
            </label>
          </div>

          <div style={styles.card}>
            <label style={styles.label}>
              Seletividade alimentar {referenciaDia}
              <select
                style={styles.input}
                value={form.seletividade_alimentar}
                onChange={(e) =>
                  updateField("seletividade_alimentar", e.target.value)
                }
                disabled={bloqueadoTotal}
              >
                <option value="">Selecione</option>
                <option value="NENHUMA">Nenhuma</option>
                <option value="LEVE">Leve</option>
                <option value="MODERADA">Moderada</option>
                <option value="INTENSA">Intensa</option>
              </select>
            </label>
          </div>

          <div style={styles.card}>
            <label style={styles.label}>
              Algo importante aconteceu {referenciaDia}?
              <textarea
                style={styles.textarea}
                value={form.observacao}
                onChange={(e) => updateField("observacao", e.target.value)}
                placeholder={`Descreva algo importante que aconteceu ${referenciaDia}`}
                disabled={bloqueadoTotal}
              />
            </label>
          </div>

          {erro ? <div style={styles.error}>{erro}</div> : null}

          <button
            style={{
              ...styles.button,
              ...(bloqueadoTotal ? styles.buttonDisabled : {}),
            }}
            type="submit"
            disabled={loading || bloqueadoTotal || loadingDatas}
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
  infoBox: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 16,
    color: "#64748b",
    marginBottom: 16,
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
};
