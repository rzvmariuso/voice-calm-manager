/**
 * Password validation utilities for enhanced security
 * Implements NIST and OWASP password guidelines
 */

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}

/**
 * Common weak passwords that should be rejected
 * Source: OWASP Top 10,000 most common passwords
 */
const COMMON_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123', 
  'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
  'baseball', '111111', 'iloveyou', 'master', 'sunshine',
  'ashley', 'bailey', 'passw0rd', 'shadow', '123123',
  '654321', 'superman', 'qazwsx', 'michael', 'football'
];

/**
 * Validates password strength according to OWASP guidelines
 */
export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Check minimum length (8 characters as per OWASP)
  if (password.length < 8) {
    feedback.push('Passwort muss mindestens 8 Zeichen lang sein');
    return { score: 0, feedback, isValid: false };
  }

  // Check maximum length (prevent DoS)
  if (password.length > 128) {
    feedback.push('Passwort darf maximal 128 Zeichen lang sein');
    return { score: 0, feedback, isValid: false };
  }

  // Check for common passwords
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    feedback.push('Dieses Passwort ist zu häufig verwendet. Bitte wählen Sie ein sichereres Passwort.');
    return { score: 0, feedback, isValid: false };
  }

  // Length scoring
  if (password.length >= 12) score += 2;
  else if (password.length >= 10) score += 1;

  // Character variety scoring
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const characterTypes = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecialChars].filter(Boolean).length;

  if (characterTypes >= 3) {
    score += 2;
  } else if (characterTypes >= 2) {
    score += 1;
    feedback.push('Verwenden Sie eine Kombination aus Groß-/Kleinbuchstaben, Zahlen und Sonderzeichen');
  } else {
    feedback.push('Passwort muss mindestens 2 verschiedene Zeichentypen enthalten');
    return { score, feedback, isValid: false };
  }

  // Check for repeated characters
  if (/(.)\1{2,}/.test(password)) {
    score -= 1;
    feedback.push('Vermeiden Sie wiederholte Zeichen');
  }

  // Check for sequential characters
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
    score -= 1;
    feedback.push('Vermeiden Sie einfache Sequenzen (abc, 123, etc.)');
  }

  // Ensure score is between 0 and 4
  score = Math.max(0, Math.min(4, score));

  // Final validation
  const isValid = score >= 2 && password.length >= 8;

  // Add positive feedback
  if (isValid && feedback.length === 0) {
    if (score === 4) {
      feedback.push('Sehr sicheres Passwort!');
    } else if (score === 3) {
      feedback.push('Gutes Passwort');
    } else {
      feedback.push('Passwort akzeptiert');
    }
  }

  return { score, feedback, isValid };
}

/**
 * Get visual strength indicator
 */
export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'Sehr schwach';
    case 2:
      return 'Schwach';
    case 3:
      return 'Mittel';
    case 4:
      return 'Stark';
    default:
      return 'Unbekannt';
  }
}

/**
 * Get color for strength indicator
 */
export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'text-destructive';
    case 2:
      return 'text-orange-500';
    case 3:
      return 'text-yellow-500';
    case 4:
      return 'text-green-500';
    default:
      return 'text-muted-foreground';
  }
}

/**
 * Check if password has been leaked in known data breaches
 * Note: In production, this should call the Have I Been Pwned API
 * or similar service. For now, we just check against common passwords.
 */
export async function checkPasswordLeak(password: string): Promise<boolean> {
  // In production, implement HaveIBeenPwned API check
  // For now, return false (not leaked) for demonstration
  return false;
}