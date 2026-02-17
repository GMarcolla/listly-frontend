/**
 * Validates a Brazilian CPF (Cadastro de Pessoas Físicas)
 * Accepts CPF in formatted (XXX.XXX.XXX-XX) or unformatted (11 digits) format
 * @param cpf - The CPF string to validate
 * @returns true if valid, false otherwise
 */
export function validateCPF(cpf: string): boolean {
  // Remove formatting characters
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  // Check if it has 11 digits
  if (cleanCPF.length !== 11) {
    return false;
  }
  
  // Check if all digits are the same (invalid CPF)
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }
  
  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let checkDigit = 11 - (sum % 11);
  if (checkDigit >= 10) checkDigit = 0;
  if (checkDigit !== parseInt(cleanCPF.charAt(9))) {
    return false;
  }
  
  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  checkDigit = 11 - (sum % 11);
  if (checkDigit >= 10) checkDigit = 0;
  if (checkDigit !== parseInt(cleanCPF.charAt(10))) {
    return false;
  }
  
  return true;
}

/**
 * Validates a date string in DD/MM/YYYY format
 * Checks both format and whether the date is valid (e.g., not 32/01/2024)
 * @param dateStr - The date string to validate
 * @returns true if valid, false otherwise
 */
export function isValidDate(dateStr: string): boolean {
  // Check format
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    return false;
  }
  
  const [day, month, year] = dateStr.split('/').map(Number);
  
  // Check ranges
  if (month < 1 || month > 12) {
    return false;
  }
  
  if (day < 1 || day > 31) {
    return false;
  }
  
  // Check days in month
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) {
    return false;
  }
  
  // Check if year is reasonable (not too far in past or future)
  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) {
    return false;
  }
  
  return true;
}

/**
 * Converts a date string from DD/MM/YYYY format to ISO 8601 format
 * @param dateStr - The date string in DD/MM/YYYY format
 * @returns ISO 8601 date string (YYYY-MM-DDTHH:mm:ss.sssZ)
 */
export function dateToISO(dateStr: string): string {
  const [day, month, year] = dateStr.split('/');
  // Create date at midnight UTC
  const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
  return date.toISOString();
}

/**
 * Converts an ISO 8601 date string to DD/MM/YYYY format
 * @param isoStr - The ISO 8601 date string
 * @returns Date string in DD/MM/YYYY format
 */
export function isoToDate(isoStr: string): string {
  const date = new Date(isoStr);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Removes formatting from CPF string, leaving only digits
 * @param cpf - The formatted CPF string (XXX.XXX.XXX-XX)
 * @returns Unformatted CPF string (11 digits)
 */
export function stripCPFFormatting(cpf: string): string {
  return cpf.replace(/[^\d]/g, '');
}
