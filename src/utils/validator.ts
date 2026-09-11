import { ValidationResult } from '../types';

/**
 * Ma'lumotlarni validatsiya qilish funksiyalari
 */

/**
 * Ism-familiyani tekshirish
 */
export function validateName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: "❌ Bu maydon to'ldirilishi shart!" };
  }

  if (name.trim().length < 2) {
    return { valid: false, message: '❌ Ism-familiya juda qisqa!' };
  }

  if (name.trim().length > 100) {
    return { valid: false, message: '❌ Ism-familiya juda uzun!' };
  }

  return { valid: true, value: name.trim() };
}

/**
 * Yoshni tekshirish
 */
export function validateAge(age: string): ValidationResult {
  if (!age || age.trim().length === 0) {
    return { valid: false, message: "❌ Bu maydon to'ldirilishi shart!" };
  }

  const ageNum = parseInt(age, 10);

  if (isNaN(ageNum)) {
    return { valid: false, message: "❌ Yosh raqamda bo'lishi kerak!" };
  }

  if (ageNum < 14 || ageNum > 100) {
    return { valid: false, message: "❌ Yosh 14 dan 100 gacha bo'lishi kerak!" };
  }

  return { valid: true, value: ageNum };
}

/**
 * Telefon raqamni tekshirish
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim().length === 0) {
    return { valid: false, message: "❌ Bu maydon to'ldirilishi shart!" };
  }

  // Telefon raqam formatini tekshirish
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;

  if (!phoneRegex.test(phone.trim())) {
    return { valid: false, message: "❌ Telefon raqam formati noto'g'ri!\nMasalan: +998901234567" };
  }

  return { valid: true, value: phone.trim() };
}

/**
 * Ish sohasini tekshirish
 */
export function validateField(field: string): ValidationResult {
  if (!field || field.trim().length === 0) {
    return { valid: false, message: "❌ Bu maydon to'ldirilishi shart!" };
  }

  if (field.trim().length < 3) {
    return { valid: false, message: '❌ Ish sohasi juda qisqa!' };
  }

  if (field.trim().length > 100) {
    return { valid: false, message: '❌ Ish sohasi juda uzun!' };
  }

  return { valid: true, value: field.trim() };
}

/**
 * Ko'nikmalarni tekshirish
 */
export function validateSkills(skills: string): ValidationResult {
  if (!skills || skills.trim().length === 0) {
    return { valid: false, message: "❌ Bu maydon to'ldirilishi shart!" };
  }

  if (skills.trim().length < 2) {
    return { valid: false, message: "❌ Ko'nikmalar juda qisqa!" };
  }

  if (skills.trim().length > 500) {
    return { valid: false, message: "❌ Ko'nikmalar juda uzun!" };
  }

  return { valid: true, value: skills.trim() };
}
