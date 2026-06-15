import { api } from "../lib/api";

export async function criarRegistroCardio(pacienteId, payload) {
  const res = await api.post(
    `/responsavel/pacientes/${pacienteId}/registros-cardio`,
    payload
  );

  return res.data;
}

export async function listarRegistrosCardio(pacienteId) {
  const res = await api.get(
    `/responsavel/pacientes/${pacienteId}/registros-cardio`
  );

  return res.data;
}