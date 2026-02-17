import { z } from 'zod';
import { validateCPF, isValidDate } from './validation';

/**
 * Zod validation schema for the registration form
 * Validates all required fields with appropriate error messages in Portuguese
 */
export const registrationSchema = z.object({
  name: z.string().min(1, "Nome completo é obrigatório"),
  
  email: z.string()
    .min(1, "Email é obrigatório")
    .email("Email inválido"),
  
  cpf: z.string()
    .min(1, "CPF é obrigatório")
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve estar no formato XXX.XXX.XXX-XX")
    .refine((cpf) => validateCPF(cpf), "CPF inválido"),
  
  birthDate: z.string()
    .min(1, "Data de nascimento é obrigatória")
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Data deve estar no formato DD/MM/AAAA")
    .refine((date) => isValidDate(date), "Data inválida"),
  
  password: z.string()
    .min(6, "Senha deve ter no mínimo 6 caracteres"),
  
  confirmPassword: z.string()
    .min(1, "Confirmação de senha é obrigatória")
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
});

/**
 * TypeScript type inferred from the Zod schema
 */
export type RegistrationFormData = z.infer<typeof registrationSchema>;
