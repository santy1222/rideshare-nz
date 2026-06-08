const UNSAFE = /<script|javascript:|on\w+\s*=|<iframe|<object|<embed/i;

export function validateName(v: string): string | null {
  const s = v.trim();
  if (s.length < 2) return "nameTooShort";
  if (s.length > 100) return "nameTooLong";
  if (!/^[\p{L}\s'\-.]+$/u.test(s)) return "nameInvalid";
  return null;
}

export function validatePhone(v: string): string | null {
  if (!v.trim()) return null;
  const s = v.trim();
  if (!/^[\d\s+\-()]+$/.test(s)) return "phoneInvalid";
  const digits = s.replace(/\D/g, "");
  if (digits.length < 7) return "phoneTooShort";
  if (digits.length > 15) return "phoneTooLong";
  return null;
}

export function validatePassword(v: string): string | null {
  if (v.length < 6) return "passwordTooShort";
  if (v.length > 72) return "passwordTooLong";
  return null;
}

export function validateMessage(v: string): string | null {
  const s = v.trim();
  if (!s) return "required";
  if (s.length > 1000) return "messageTooLong";
  if (UNSAFE.test(s)) return "contentInvalid";
  return null;
}

export function validateComment(v: string): string | null {
  if (!v.trim()) return null;
  if (v.trim().length > 300) return "commentTooLong";
  if (UNSAFE.test(v)) return "contentInvalid";
  return null;
}

export function validateDescription(v: string): string | null {
  if (!v.trim()) return null;
  if (v.trim().length > 500) return "descriptionTooLong";
  if (UNSAFE.test(v)) return "contentInvalid";
  return null;
}
