import { api } from "../lib/api";

export async function loginResponsavel({ email, senha }) {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", senha);

  const res = await api.post("/auth/responsavel/login", form, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return res.data;
}

export function logoutResponsavel() {
  localStorage.removeItem("responsavel_token");
}
