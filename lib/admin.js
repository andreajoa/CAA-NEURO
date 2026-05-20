// IDs com acesso admin total — plano Pro automático, sem restrições
export const ADMIN_IDS = [
  "user_3DvegBUwXFlVIwWgjv34NrQI7bF", // tdahma2@gmail.com
];

export function isAdmin(userId) {
  return ADMIN_IDS.includes(userId);
}
