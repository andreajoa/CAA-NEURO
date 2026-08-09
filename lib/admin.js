// IDs com acesso admin total — plano Pro automático, sem restrições
export const ADMIN_IDS = [
  "user_3DvegBUwXFlVIwWgjv34NrQI7bF", // tdahma2@gmail.com
];

export function isAdmin(userId) {
  const configuredIds = (process.env.CAA_ADMIN_USER_IDS || "")
    .split(",")
    .map(id => id.trim())
    .filter(Boolean);
  return [...ADMIN_IDS, ...configuredIds].includes(userId);
}
