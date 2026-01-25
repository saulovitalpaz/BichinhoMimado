// Exemplo de Esquema de Validação para Atendimento (Prontuário)
import { z } from 'zod';

export const MedicalRecordSchema = z.object({
  petId: z.string().uuid(),
  vetId: z.string().uuid(),
  appointmentId: z.string().uuid(),
  subjective: z.string().min(5, "Relato do cliente é obrigatório"),
  objective: z.string().min(5, "Exame físico é obrigatório"),
  assessment: z.string(),
  plan: z.string(),
  prescriptions: z.array(z.object({
    medication: z.string(),
    dosage: z.string(),
    frequency: z.string()
  })),
  isClosed: z.boolean().default(false) // Prontuário fechado não pode ser editado
});

export type MedicalRecord = z.infer<typeof MedicalRecordSchema>;