import { ResumeData } from './types';

export const STATES = {
  IDLE: 'idle',
  AWAITING_NAME: 'awaiting_name',
  AWAITING_PHONE: 'awaiting_phone',
  AWAITING_EMAIL: 'awaiting_email',
  AWAITING_CITY: 'awaiting_city',
  AWAITING_FIELD: 'awaiting_field',
  AWAITING_EDUCATION: 'awaiting_education',
  AWAITING_EXPERIENCE: 'awaiting_experience',
  AWAITING_SKILLS: 'awaiting_skills',
  AWAITING_LANGUAGES: 'awaiting_languages',
  AWAITING_ABOUT: 'awaiting_about',
  AWAITING_SALARY: 'awaiting_salary',
  AWAITING_LINKS: 'awaiting_links',
  AWAITING_PHOTO: 'awaiting_photo',
  CONFIRMING: 'confirming',
} as const;

export type State = (typeof STATES)[keyof typeof STATES];

export interface UserSession {
  state: State;
  data: ResumeData;
}

const userSessions = new Map<number, UserSession>();

export function getSession(userId: number): UserSession {
  if (!userSessions.has(userId)) {
    userSessions.set(userId, { state: STATES.IDLE, data: {} });
  }
  return userSessions.get(userId) as UserSession;
}

export function setState(userId: number, state: State): void {
  const session = getSession(userId);
  session.state = state;
}

export function setData(userId: number, key: keyof ResumeData, value: string): void {
  const session = getSession(userId);
  session.data[key] = value;
}

export function getData(userId: number): ResumeData {
  return getSession(userId).data;
}

export function getState(userId: number): State {
  return getSession(userId).state;
}

export function clearSession(userId: number): void {
  userSessions.set(userId, { state: STATES.IDLE, data: {} });
}
