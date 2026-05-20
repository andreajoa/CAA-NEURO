import { d1Query } from "./d1";
import { isAdmin } from "./admin";

// Retorna o plano real do usuário considerando todos os casos
export async function getPlanoUsuario(userId) {
  if (!userId) return { plano: "gratuito", allowed: false };
  if (isAdmin(userId)) return { plano: "admin", allowed: true, is_admin: true };

  try {
    const rows = await d1Query("SELECT plano, plano_expira, org_id FROM users WHERE id=?", [userId]);
    const user = rows?.[0];
    if (!user) return { plano: "gratuito", allowed: false };

    // Verifica expiração do plano individual
    if (user.plano === "pro" && user.plano_expira) {
      if (new Date(user.plano_expira) < new Date()) {
        await d1Query("UPDATE users SET plano='gratuito' WHERE id=?", [userId]);
        return { plano: "gratuito", allowed: false, expirado: true };
      }
      return { plano: "pro", allowed: true };
    }

    // Verifica plano via organização
    if (user.org_id) {
      const org = await d1Query("SELECT plano, ativo FROM organizations WHERE id=?", [user.org_id]);
      if (org?.[0]?.ativo) {
        return { plano: org[0].plano, allowed: true, org_id: user.org_id };
      }
    }

    // Verifica planos clinica/instituicao direto no user
    if (["clinica", "instituicao"].includes(user.plano) && user.plano_expira) {
      if (new Date(user.plano_expira) > new Date()) {
        return { plano: user.plano, allowed: true };
      }
    }

    return { plano: user.plano || "gratuito", allowed: false };
  } catch {
    return { plano: "gratuito", allowed: false };
  }
}

// Verifica se tem acesso a feature específica
export function podeUsarIA(planoInfo) {
  return planoInfo.allowed && ["pro","clinica","instituicao","admin"].includes(planoInfo.plano);
}
