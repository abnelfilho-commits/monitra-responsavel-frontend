import { api } from "../lib/api";

export async function listarRegistrosPaciente(pacienteId) {
  const res = await api.get(`/responsavel/pacientes/${pacienteId}/registros`);
  return res.data;
}

export async function obterRegistro(id) {
  const res = await api.get(`/responsavel/registros/${id}`);
  return res.data;
}

export async function criarRegistroPaciente(pacienteId, payload) {
  const res = await api.post(`/responsavel/pacientes/${pacienteId}/registros`, payload);
  return res.data;
}
