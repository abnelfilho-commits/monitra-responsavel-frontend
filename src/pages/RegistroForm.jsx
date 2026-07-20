import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  criarRegistroPaciente,
  listarRegistrosPaciente,
} from "../services/registros";

export default function RegistroForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const datas = useMemo(() => {
    const hoje = new Date();
    const ontem = new Date();
    ontem.setDate(hoje.getDate() - 1);

    function formatarDataLocal(data) {
      const yyyy = data.getFullYear();
      const mm = String(data.getMonth() + 1).padStart(2, "0");
      const dd = String(data.getDate()).padStart(2, "0");

      return `${yyyy}-${mm}-${dd}`;
    }

    return {
      hoje: formatarDataLocal(hoje),
      ontem: formatarDataLocal(ontem),
    };
  }, []);

  const hojeStr = datas.hoje;
  const ontemStr = datas.ontem;

  const [form, setForm] = useState({
    data: hojeStr,
    sono_qualidade: "",
    evacuacao: "",
    consistencia_fezes: "",
    irritabilidade: "",
    crise_sensorial: "",
    tempo_tela: "",
    seletividade_alimentar: "",
    aceitou_alimento_novo: false,
    observacao: "",
  });

  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDatas, setLoadingDatas] = useState(true);

  const [jaTemHoje, setJaTemHoje] = useState(false);
  const [jaTemOntem, setJaTemOntem] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function toIntOrNull(value) {
    if (
      value === "" ||
      value === null ||
      value === undefined
    ) {
      return null;
    }

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

        const data =
          await listarRegistrosPaciente(id);

        const registros =
          Array.isArray(data) ? data : [];

        const temHoje = registros.some(
          (registro) =>
            registro?.data?.slice(0, 10) ===
            hojeStr
        );

        const temOntem = registros.some(
          (registro) =>
            registro?.data?.slice(0, 10) ===
            ontemStr
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
        setErro(
          err?.response?.data?.detail ||
            "Erro ao validar datas disponíveis."
        );
      } finally {
        setLoadingDatas(false);
      }
    }

    carregarRegistros();
  }, [id, hojeStr, ontemStr]);

  const bloqueadoTotal =
    jaTemHoje && jaTemOntem;

  const referenciaDia = useMemo(() => {
    if (form.data === ontemStr) {
      return "ontem";
    }

    return "hoje";
  }, [form.data, ontemStr]);

  const tituloDia =
    referenciaDia === "ontem"
      ? "Como foi o dia de ontem?"
      : "Como foi o dia de hoje?";

  const subtitulo = useMemo(() => {
    if (bloqueadoTotal) {
      return "Os acompanhamentos de hoje e ontem já foram registrados.";
    }

    return "Leva menos de um minuto e ajuda a equipe a acompanhar a evolução.";
  }, [bloqueadoTotal]);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");

    if (!form.data) {
      setErro(
        "Não há data disponível para um novo acompanhamento."
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        data: form.data,

        sono_qualidade:
          toIntOrNull(form.sono_qualidade),

        evacuacao:
          toBoolOrNull(form.evacuacao),

        consistencia_fezes:
          toIntOrNull(
            form.consistencia_fezes
          ),

        irritabilidade:
          toIntOrNull(form.irritabilidade),

        crise_sensorial:
          toIntOrNull(form.crise_sensorial),

        tempo_tela:
          form.tempo_tela || null,

        seletividade_alimentar:
          form.seletividade_alimentar ||
          null,

        aceitou_alimento_novo:
          Boolean(
            form.aceitou_alimento_novo
          ),

        observacao:
          form.observacao?.trim() || null,
      };

      await criarRegistroPaciente(
        id,
        payload
      );

      navigate(`/pacientes/${id}`, {
        replace: true,
        state: { sucesso: true },
      });
    } catch (err) {
      setErro(
        err?.response?.data?.detail ||
          "Falha ao enviar o acompanhamento."
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
          onClick={() =>
            navigate(`/pacientes/${id}`)
          }
          type="button"
        >
          ← Voltar
        </button>

        <header style={styles.header}>
          <div style={styles.badge}>
            ACOMPANHAMENTO DIÁRIO
          </div>

          <h1 style={styles.title}>
            {tituloDia}
          </h1>

          <p style={styles.subtitle}>
            {subtitulo}
          </p>
        </header>

        {loadingDatas ? (
          <div style={styles.infoBox}>
            Preparando seu acompanhamento...
          </div>
        ) : null}

        {!loadingDatas &&
        jaTemHoje &&
        !jaTemOntem ? (
          <div style={styles.successBox}>
            <strong>
              ✓ O acompanhamento de hoje já foi
              registrado.
            </strong>

            <span>
              Se precisar, você ainda pode contar
              como foi o dia de ontem.
            </span>
          </div>
        ) : null}

        {!loadingDatas &&
        bloqueadoTotal ? (
          <div style={styles.successBox}>
            <strong>
              ✓ Tudo em dia!
            </strong>

            <span>
              Os acompanhamentos de hoje e ontem já
              foram enviados.
            </span>
          </div>
        ) : null}

        {!bloqueadoTotal &&
        !loadingDatas ? (
          <form
            style={styles.form}
            onSubmit={handleSubmit}
          >
            <section style={styles.card}>
              <div style={styles.stepHeader}>
                <span style={styles.stepNumber}>
                  1
                </span>

                <div>
                  <h2 style={styles.sectionTitle}>
                    Qual dia você está registrando?
                  </h2>

                  <p
                    style={
                      styles.sectionDescription
                    }
                  >
                    Escolha hoje ou ontem.
                  </p>
                </div>
              </div>

              <select
                style={styles.input}
                value={form.data}
                onChange={(event) =>
                  updateField(
                    "data",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Selecione
                </option>

                <option
                  value={hojeStr}
                  disabled={jaTemHoje}
                >
                  Hoje
                  {jaTemHoje
                    ? " — já registrado"
                    : ""}
                </option>

                <option
                  value={ontemStr}
                  disabled={jaTemOntem}
                >
                  Ontem
                  {jaTemOntem
                    ? " — já registrado"
                    : ""}
                </option>
              </select>
            </section>

            <section style={styles.card}>
              <div style={styles.stepHeader}>
                <span style={styles.stepNumber}>
                  2
                </span>

                <div>
                  <h2 style={styles.sectionTitle}>
                    Sono e rotina
                  </h2>

                  <p
                    style={
                      styles.sectionDescription
                    }
                  >
                    Conte um pouco sobre o descanso
                    e a rotina.
                  </p>
                </div>
              </div>

              <CampoSelect
                label={`Como foi o sono ${referenciaDia}?`}
                value={form.sono_qualidade}
                onChange={(value) =>
                  updateField(
                    "sono_qualidade",
                    value
                  )
                }
                opcoes={[
                  ["1", "Muito ruim"],
                  ["2", "Ruim"],
                  ["3", "Regular"],
                  ["4", "Bom"],
                  ["5", "Muito bom"],
                ]}
              />

              <CampoSelect
                label={`Quanto tempo de tela teve ${referenciaDia}?`}
                value={form.tempo_tela}
                onChange={(value) =>
                  updateField(
                    "tempo_tela",
                    value
                  )
                }
                opcoes={[
                  [
                    "MENOS_1H",
                    "Menos de 1 hora",
                  ],
                  ["1_2H", "1 a 2 horas"],
                  ["2_4H", "2 a 4 horas"],
                  [
                    "MAIS_4H",
                    "Mais de 4 horas",
                  ],
                ]}
              />
            </section>

            <section style={styles.card}>
              <div style={styles.stepHeader}>
                <span style={styles.stepNumber}>
                  3
                </span>

                <div>
                  <h2 style={styles.sectionTitle}>
                    Saúde intestinal
                  </h2>

                  <p
                    style={
                      styles.sectionDescription
                    }
                  >
                    Essas informações ajudam a
                    identificar mudanças importantes.
                  </p>
                </div>
              </div>

              <CampoSelect
                label={`Evacuou ${referenciaDia}?`}
                value={form.evacuacao}
                onChange={(value) =>
                  updateField(
                    "evacuacao",
                    value
                  )
                }
                opcoes={[
                  ["true", "Sim"],
                  ["false", "Não"],
                ]}
              />

              <CampoSelect
                label={`Como estavam as fezes ${referenciaDia}?`}
                value={
                  form.consistencia_fezes
                }
                onChange={(value) =>
                  updateField(
                    "consistencia_fezes",
                    value
                  )
                }
                opcoes={[
                  [
                    "1",
                    "1 - Muito ressecado",
                  ],
                  ["2", "2 - Ressecado"],
                  [
                    "3",
                    "3 - Tendendo a ressecado",
                  ],
                  ["4", "4 - Normal"],
                  [
                    "5",
                    "5 - Tendendo a pastoso",
                  ],
                  ["6", "6 - Pastoso"],
                  ["7", "7 - Líquido"],
                ]}
              />
            </section>

            <section style={styles.card}>
              <div style={styles.stepHeader}>
                <span style={styles.stepNumber}>
                  4
                </span>

                <div>
                  <h2 style={styles.sectionTitle}>
                    Comportamento e sensorial
                  </h2>

                  <p
                    style={
                      styles.sectionDescription
                    }
                  >
                    Conte como foi o comportamento ao
                    longo do dia.
                  </p>
                </div>
              </div>

              <CampoSelect
                label={`Como estava a irritabilidade ${referenciaDia}?`}
                value={form.irritabilidade}
                onChange={(value) =>
                  updateField(
                    "irritabilidade",
                    value
                  )
                }
                opcoes={[
                  ["0", "Nenhuma"],
                  ["1", "Leve"],
                  ["2", "Moderada"],
                  ["3", "Alta"],
                  ["4", "Muito alta"],
                ]}
              />

              <CampoSelect
                label={`Teve crise sensorial ${referenciaDia}?`}
                value={form.crise_sensorial}
                onChange={(value) =>
                  updateField(
                    "crise_sensorial",
                    value
                  )
                }
                opcoes={[
                  ["0", "Não"],
                  ["1", "Leve"],
                  ["2", "Moderada"],
                  ["3", "Intensa"],
                ]}
              />
            </section>

            <section style={styles.card}>
              <div style={styles.stepHeader}>
                <span style={styles.stepNumber}>
                  5
                </span>

                <div>
                  <h2 style={styles.sectionTitle}>
                    Alimentação
                  </h2>

                  <p
                    style={
                      styles.sectionDescription
                    }
                  >
                    Conte como foi a alimentação
                    neste dia.
                  </p>
                </div>
              </div>

              <CampoSelect
                label={`Como estava a seletividade alimentar ${referenciaDia}?`}
                value={
                  form.seletividade_alimentar
                }
                onChange={(value) =>
                  updateField(
                    "seletividade_alimentar",
                    value
                  )
                }
                opcoes={[
                  ["NENHUMA", "Nenhuma"],
                  ["LEVE", "Leve"],
                  ["MODERADA", "Moderada"],
                  ["GRAVE", "Grave"],
                ]}
              />

              <label style={styles.checkCard}>
                <input
                  type="checkbox"
                  checked={
                    form.aceitou_alimento_novo
                  }
                  onChange={(event) =>
                    updateField(
                      "aceitou_alimento_novo",
                      event.target.checked
                    )
                  }
                  style={styles.checkbox}
                />

                <div>
                  <strong
                    style={styles.checkTitle}
                  >
                    Aceitou um alimento novo
                  </strong>

                  <span
                    style={styles.checkDescription}
                  >
                    Marque se experimentou e aceitou
                    algum alimento novo{" "}
                    {referenciaDia}.
                  </span>
                </div>
              </label>
            </section>

            <section style={styles.card}>
              <div style={styles.stepHeader}>
                <span style={styles.stepNumber}>
                  6
                </span>

                <div>
                  <h2 style={styles.sectionTitle}>
                    Algo importante aconteceu?
                  </h2>

                  <p
                    style={
                      styles.sectionDescription
                    }
                  >
                    Este campo é opcional.
                  </p>
                </div>
              </div>

              <textarea
                style={styles.textarea}
                value={form.observacao}
                onChange={(event) =>
                  updateField(
                    "observacao",
                    event.target.value
                  )
                }
                maxLength={2000}
                placeholder={`Conte algo que você considera importante sobre ${referenciaDia}...`}
              />

              <div style={styles.counter}>
                {form.observacao.length}/2000
              </div>
            </section>

            {erro ? (
              <div style={styles.error}>
                {erro}
              </div>
            ) : null}

            <div style={styles.footer}>
              <div style={styles.footerText}>
                <strong>
                  Pronto para enviar?
                </strong>

                <span>
                  Seu registro ajudará a equipe a
                  acompanhar a evolução ao longo do
                  tempo.
                </span>
              </div>

              <button
                style={styles.button}
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Enviando..."
                  : "✓ Enviar acompanhamento"}
              </button>
            </div>
          </form>
        ) : null}

        {erro && bloqueadoTotal ? (
          <div style={styles.error}>
            {erro}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CampoSelect({
  label,
  value,
  onChange,
  opcoes,
}) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>
        {label}
      </span>

      <select
        style={styles.input}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
      >
        <option value="">
          Selecione
        </option>

        {opcoes.map(([valor, texto]) => (
          <option
            key={valor}
            value={valor}
          >
            {texto}
          </option>
        ))}
      </select>
    </label>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    background: "#f1f5f9",
    padding: 16,
  },

  container: {
    width: "100%",
    maxWidth: 520,
  },

  backButton: {
    border: "none",
    background: "transparent",
    color: "#475569",
    padding: "8px 2px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: 10,
  },

  header: {
    marginBottom: 20,
  },

  badge: {
    display: "inline-block",
    marginBottom: 10,
    padding: "6px 10px",
    borderRadius: 999,
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.5,
  },

  title: {
    margin: 0,
    fontSize: 30,
    lineHeight: 1.15,
    fontWeight: 800,
    color: "#0f172a",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: 15,
    lineHeight: 1.5,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    padding: 18,
    boxShadow:
      "0 6px 18px rgba(15, 23, 42, 0.04)",
  },

  stepHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 18,
  },

  stepNumber: {
    width: 30,
    height: 30,
    flex: "0 0 30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    background: "#0f172a",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 800,
  },

  sectionTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: 18,
    fontWeight: 800,
  },

  sectionDescription: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: 13,
    lineHeight: 1.45,
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 16,
  },

  label: {
    color: "#334155",
    fontSize: 14,
    fontWeight: 700,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: 50,
    padding: "0 14px",
    borderRadius: 13,
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: 16,
    outline: "none",
  },

  checkCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: 15,
    border: "1px solid #dbe2ea",
    borderRadius: 14,
    background: "#f8fafc",
    cursor: "pointer",
  },

  checkbox: {
    width: 20,
    height: 20,
    marginTop: 1,
  },

  checkTitle: {
    display: "block",
    color: "#0f172a",
    fontSize: 15,
  },

  checkDescription: {
    display: "block",
    marginTop: 5,
    color: "#64748b",
    fontSize: 12,
    lineHeight: 1.45,
  },

  textarea: {
    width: "100%",
    minHeight: 130,
    boxSizing: "border-box",
    padding: 14,
    borderRadius: 14,
    border: "1px solid #cbd5e1",
    fontSize: 16,
    lineHeight: 1.5,
    outline: "none",
    resize: "vertical",
    background: "#ffffff",
    fontFamily: "inherit",
  },

  counter: {
    marginTop: 6,
    textAlign: "right",
    color: "#94a3b8",
    fontSize: 11,
  },

  footer: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
  },

  footerText: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    marginBottom: 14,
    color: "#1e3a8a",
    fontSize: 13,
    lineHeight: 1.45,
  },

  button: {
    width: "100%",
    minHeight: 54,
    padding: "14px 18px",
    borderRadius: 14,
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    background: "#0f52ba",
    color: "#ffffff",
    fontWeight: 800,
  },

  infoBox: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 16,
    color: "#64748b",
    marginBottom: 16,
  },

  successBox: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    background: "#ecfdf5",
    border: "1px solid #a7f3d0",
    color: "#065f46",
    borderRadius: 18,
    padding: 18,
    fontSize: 14,
    lineHeight: 1.45,
    marginBottom: 18,
  },

  error: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    padding: 14,
    borderRadius: 14,
    fontSize: 14,
  },
};