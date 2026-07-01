import { api } from "../lib/api";

export async function listarPacientesResponsavel() {
  const res = await api.get("/responsavel/pacientes/");
  return res.data;
}

export async function listarMeusPacientes() {
  const res = await api.get("/responsavel/pacientes/");
  return res.data;
}

export async function obterPacienteResponsavel(id) {
  const res = await api.get(`/responsavel/pacientes/${id}`);
  return res.data;
}


export async function obterMeuPaciente(id) {
  const res = await api.get(`/responsavel/pacientes/${id}`);
  return res.data;
}