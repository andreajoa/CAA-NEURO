import { d1Query } from "./d1";

/** Retorna o paciente quando ele pertence ao usuário ou à mesma organização ativa. */
export async function getAccessiblePatient(patientId, userId) {
  const rows = await d1Query(
    `SELECT p.* FROM patients p
     WHERE p.id=? AND (
       p.user_id=? OR EXISTS (
         SELECT 1
         FROM org_members requester
         INNER JOIN org_members owner ON owner.org_id=requester.org_id
         WHERE requester.user_id=? AND owner.user_id=p.user_id
           AND requester.ativo!=0 AND owner.ativo!=0
       )
     ) LIMIT 1`,
    [patientId, userId, userId]
  );
  return rows?.[0] || null;
}
