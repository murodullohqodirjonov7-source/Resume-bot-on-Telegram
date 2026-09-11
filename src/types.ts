export interface ResumeData {
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  field?: string;
  education?: string;
  experience?: string;
  skills?: string;
  languages?: string;
  about?: string;
  salary?: string;
  links?: string;
  photo?: string;
  [key: string]: string | undefined;
}

export type ResumeFormat = 'PDF' | 'DOCX';

export interface ValidationResult {
  valid: boolean;
  message?: string;
  value?: string | number;
}
