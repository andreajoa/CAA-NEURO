import crypto from "crypto";

const ALGO = "aes-256-gcm";
const KEY = Buffer.from(process.env.ENCRYPTION_KEY || "", "hex");

export function encrypt(text) {
  if (!text || !KEY.length) return text;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(String(text), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decrypt(data) {
  if (!data || !KEY.length) return data;
  try {
    const buf = Buffer.from(data, "base64");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const encrypted = buf.subarray(28);
    const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch {
    return data;
  }
}

export function encryptPatient(p) {
  return {
    ...p,
    nome: encrypt(p.nome),
    data_nascimento: encrypt(p.data_nascimento),
    diagnostico: encrypt(p.diagnostico),
    responsavel: encrypt(p.responsavel),
    escola: encrypt(p.escola),
    medicamentos: encrypt(p.medicamentos),
    objetivos_terapeuticos: encrypt(p.objetivos_terapeuticos),
    observacoes: encrypt(p.observacoes),
  };
}

export function decryptPatient(p) {
  if (!p) return p;
  return {
    ...p,
    nome: decrypt(p.nome),
    data_nascimento: decrypt(p.data_nascimento),
    diagnostico: decrypt(p.diagnostico),
    responsavel: decrypt(p.responsavel),
    escola: decrypt(p.escola),
    medicamentos: decrypt(p.medicamentos),
    objetivos_terapeuticos: decrypt(p.objetivos_terapeuticos),
    observacoes: decrypt(p.observacoes),
  };
}

export function encryptSession(s) {
  return {
    ...s,
    evolucao_observada: encrypt(s.evolucao_observada),
    objetivos_sessao: encrypt(s.objetivos_sessao),
    notas: encrypt(s.notas),
  };
}

export function decryptSession(s) {
  if (!s) return s;
  return {
    ...s,
    evolucao_observada: decrypt(s.evolucao_observada),
    objetivos_sessao: decrypt(s.objetivos_sessao),
    notas: decrypt(s.notas),
  };
}
