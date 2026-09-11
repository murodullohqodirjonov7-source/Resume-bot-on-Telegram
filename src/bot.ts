import 'dotenv/config';
import { Telegraf, Markup, Context } from 'telegraf';
import { Message } from 'telegraf/typings/core/types/typegram';
import { STATES, State, setState, setData, clearSession, getData, getState } from './states';
import { validateName, validatePhone, validateField, validateSkills } from './utils/validator';
import { generateResumePDF, generateResumeDOCX, cleanOldResumes } from './resumeGenerator';
import { ResumeData, ResumeFormat } from './types';

if (!process.env.BOT_TOKEN) {
  console.error('❌ BOT_TOKEN topilmadi! .env faylni sozlang.');
  process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);
const GROUP_ID = process.env.ADMIN_GROUP_ID;

setInterval(() => cleanOldResumes(24), 6 * 60 * 60 * 1000);

const mainKeyboard = () =>
  Markup.keyboard([
    ['📄 Rezyume yaratish'],
    ['ℹ️ Rezyume haqida', '❌ Bekor qilish'],
  ]).resize();

const skipKeyboard = () =>
  Markup.keyboard([['⏭ O‘tkazib yuborish'], ['❌ Bekor qilish']]).resize();

const confirmKeyboard = () =>
  Markup.keyboard([
    ['📄 PDF olish', '📝 DOCX olish'],
    ['✏️ O‘zgartirish', '❌ Bekor qilish'],
  ]).resize();

function safe(value?: string | number): string {
  return value !== undefined && value !== null && value !== ''
    ? String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    : '—';
}

function formatResume(data: ResumeData): string {
  return (
    `📄 <b>Rezyume ma’lumotlari</b>\n\n` +
    `👤 <b>Ism-familiya:</b> ${safe(data.name)}\n` +
    `📞 <b>Telefon:</b> ${safe(data.phone)}\n` +
    `📧 <b>Email:</b> ${safe(data.email)}\n` +
    `📍 <b>Shahar:</b> ${safe(data.city)}\n` +
    `💼 <b>Lavozim:</b> ${safe(data.field)}\n` +
    `🎓 <b>Ta’lim:</b> ${safe(data.education)}\n` +
    `🏢 <b>Tajriba:</b> ${safe(data.experience)}\n` +
    `⚡ <b>Ko‘nikmalar:</b> ${safe(data.skills)}\n` +
    `🌐 <b>Tillar:</b> ${safe(data.languages)}\n` +
    `📝 <b>Men haqimda:</b> ${safe(data.about)}\n` +
    `💰 <b>Kutilayotgan maosh:</b> ${safe(data.salary)}\n` +
    `🔗 <b>Telegram/LinkedIn:</b> ${safe(data.links)}\n` +
    `📷 <b>Foto:</b> ${data.photo ? 'Yuklangan' : 'Yo‘q'}`
  );
}

async function logUser(ctx: Context, action: string, data: ResumeData = {}): Promise<void> {
  if (!GROUP_ID || !ctx.from) return;
  const u = ctx.from;
  const username = u.username ? `@${u.username}` : 'username yo‘q';
  const text =
    `👤 <b>Bot foydalanuvchisi</b>\n\n` +
    `🆔 ID: <code>${u.id}</code>\n` +
    `👤 Ism: ${safe([u.first_name, u.last_name].filter(Boolean).join(' '))}\n` +
    `🔗 Username: ${safe(username)}\n` +
    `📌 Amal: <b>${safe(action)}</b>` +
    (data.phone ? `\n📞 Telefon: ${safe(data.phone)}` : '') +
    (data.field ? `\n💼 Lavozim: ${safe(data.field)}` : '') +
    `\n🕐 ${new Date().toLocaleString('uz-UZ')}`;
  try {
    await ctx.telegram.sendMessage(GROUP_ID, text, { parse_mode: 'HTML' });
  } catch (e) {
    console.error('ADMIN_GROUP_ID ga yuborishda xatolik:', (e as Error).message);
  }
}

bot.start(async (ctx) => {
  clearSession(ctx.from.id);
  await logUser(ctx, 'Botni ishga tushirdi');
  await ctx.reply(
    `👋 Assalomu alaykum, ${safe(ctx.from.first_name)}!\n\n` +
      `🤖 Men sizga professional <b>PDF rezyume</b> tayyorlab beraman.\n\n` +
      `📌 Rezyumeda: shaxsiy ma’lumotlar, aloqa, lavozim, ta’lim, ish tajribasi, ko‘nikmalar, tillar, o‘zingiz haqingizda, maosh va ijtimoiy havolalar bo‘ladi.\n\n` +
      `Boshlash uchun <b>📄 Rezyume yaratish</b> tugmasini bosing.`,
    { parse_mode: 'HTML', ...mainKeyboard() }
  );
});

bot.help(async (ctx) =>
  ctx.reply(
    `ℹ️ <b>Botdan foydalanish</b>\n\n` +
      `1️⃣ Rezyume yaratish tugmasini bosing.\n` +
      `2️⃣ Savollarga javob bering.\n` +
      `3️⃣ Keraksiz maydonlarni “O‘tkazib yuborish” mumkin.\n` +
      `4️⃣ Ma’lumotlarni tekshiring.\n` +
      `5️⃣ Tasdiqlang va PDF rezyumeni oling.\n\n` +
      `/start — boshidan boshlash\n/cancel — jarayonni bekor qilish`,
    { parse_mode: 'HTML' }
  )
);

bot.command('cancel', async (ctx) => {
  clearSession(ctx.from.id);
  await ctx.reply('❌ Jarayon bekor qilindi.', mainKeyboard());
});

bot.hears('ℹ️ Rezyume haqida', async (ctx) =>
  ctx.reply(
    `📄 <b>Rezyumeda quyidagilar bo‘ladi:</b>\n\n` +
      `👤 Ism-familiya\n📞 Telefon\n📧 Email\n📍 Shahar\n💼 Lavozim/kasb\n🎓 Ta’lim\n🏢 Ish tajribasi\n⚡ Ko‘nikmalar\n🌐 Tillar\n📝 Men haqimda\n💰 Kutilayotgan maosh\n🔗 Telegram/LinkedIn\n📷 Foto\n\n` +
      `Har bir ixtiyoriy maydonni o‘tkazib yuborish mumkin.`,
    { parse_mode: 'HTML' }
  )
);

bot.hears('📄 Rezyume yaratish', async (ctx) => {
  const id = ctx.from.id;
  clearSession(id);
  setState(id, STATES.AWAITING_NAME);
  await logUser(ctx, 'Rezyume yaratishni boshladi');
  await ctx.reply('📝 <b>1/13</b> Ism-familiyangizni kiriting:', {
    parse_mode: 'HTML',
    ...Markup.removeKeyboard(),
  });
});

bot.hears('❌ Bekor qilish', async (ctx) => {
  clearSession(ctx.from.id);
  await ctx.reply('❌ Rezyume yaratish bekor qilindi.', mainKeyboard());
});

bot.hears('✏️ O‘zgartirish', async (ctx) => {
  const id = ctx.from.id;
  setState(id, STATES.AWAITING_NAME);
  await ctx.reply('✏️ Qaytadan to‘ldiramiz.\n\n👤 Ism-familiyangizni kiriting:', Markup.removeKeyboard());
});

// MUHIM: bu ikkita handler bot.on('text', ...) dan OLDIN turishi shart.
// Aks holda umumiy matn handleri bu tugmalarni "tutib oladi" va PDF/DOCX
// hech qachon generatsiya qilinmaydi (next() chaqirilmagani uchun middleware
// zanjiri shu yerda to'xtaydi).
bot.hears('📄 PDF olish', async (ctx) => createAndSendResume(ctx, 'PDF'));
bot.hears('📝 DOCX olish', async (ctx) => createAndSendResume(ctx, 'DOCX'));

type SkipTransition = [State, string | null, boolean];

bot.hears('⏭ O‘tkazib yuborish', async (ctx) => {
  const id = ctx.from.id;
  const state = getState(id);
  const transitions: Partial<Record<State, SkipTransition>> = {
    [STATES.AWAITING_EMAIL]: [STATES.AWAITING_CITY, '📍 Shahringizni kiriting:', true],
    [STATES.AWAITING_CITY]: [STATES.AWAITING_FIELD, '💼 Qaysi lavozim/kasb bo‘yicha ish qidiryapsiz?', false],
    [STATES.AWAITING_EDUCATION]: [STATES.AWAITING_EXPERIENCE, '🏢 Ish tajribangizni yozing:', true],
    [STATES.AWAITING_EXPERIENCE]: [STATES.AWAITING_SKILLS, '⚡ Ko‘nikmalaringizni vergul bilan yozing:', false],
    [STATES.AWAITING_LANGUAGES]: [STATES.AWAITING_ABOUT, '📝 O‘zingiz haqingizda qisqacha yozing:', true],
    [STATES.AWAITING_ABOUT]: [STATES.AWAITING_SALARY, '💰 Kutilayotgan maoshingizni yozing:', true],
    [STATES.AWAITING_SALARY]: [STATES.AWAITING_LINKS, '🔗 Telegram yoki LinkedIn havolangizni yuboring:', true],
    [STATES.AWAITING_LINKS]: [STATES.AWAITING_PHOTO, '📷 Rezyumega foto yuboring yoki o‘tkazib yuboring:', true],
    [STATES.AWAITING_PHOTO]: [STATES.CONFIRMING, null, false],
  };
  const next = transitions[state];
  if (!next) return ctx.reply('Bu maydonni o‘tkazib bo‘lmaydi.');
  const key = stateKey(state);
  if (next[2] && key) setData(id, key, '—');
  setState(id, next[0]);
  if (next[0] === STATES.CONFIRMING) return showConfirmation(ctx);
  await ctx.reply(next[1] as string, skipKeyboard());
});

function stateKey(state: State): keyof ResumeData | undefined {
  const map: Partial<Record<State, keyof ResumeData>> = {
    [STATES.AWAITING_EMAIL]: 'email',
    [STATES.AWAITING_CITY]: 'city',
    [STATES.AWAITING_EDUCATION]: 'education',
    [STATES.AWAITING_EXPERIENCE]: 'experience',
    [STATES.AWAITING_LANGUAGES]: 'languages',
    [STATES.AWAITING_ABOUT]: 'about',
    [STATES.AWAITING_SALARY]: 'salary',
    [STATES.AWAITING_LINKS]: 'links',
    [STATES.AWAITING_PHOTO]: 'photo',
  };
  return map[state];
}

type Step = [keyof ResumeData, State, string];

const steps: Partial<Record<State, Step>> = {
  [STATES.AWAITING_NAME]: ['name', STATES.AWAITING_PHONE, '📞 Telefon raqamingizni kiriting:'],
  [STATES.AWAITING_PHONE]: ['phone', STATES.AWAITING_EMAIL, '📧 Email manzilingizni kiriting yoki o‘tkazib yuboring:'],
  [STATES.AWAITING_EMAIL]: ['email', STATES.AWAITING_CITY, '📍 Shahringizni kiriting yoki o‘tkazib yuboring:'],
  [STATES.AWAITING_CITY]: ['city', STATES.AWAITING_FIELD, '💼 Qaysi lavozim/kasb bo‘yicha ish qidiryapsiz?'],
  [STATES.AWAITING_FIELD]: [
    'field',
    STATES.AWAITING_EDUCATION,
    '🎓 Ta’limingizni yozing (universitet, kollej va h.k.) yoki o‘tkazib yuboring:',
  ],
  [STATES.AWAITING_EDUCATION]: [
    'education',
    STATES.AWAITING_EXPERIENCE,
    '🏢 Ish tajribangizni yozing yoki o‘tkazib yuboring:',
  ],
  [STATES.AWAITING_EXPERIENCE]: [
    'experience',
    STATES.AWAITING_SKILLS,
    '⚡ Ko‘nikmalaringizni vergul bilan yozing:',
  ],
  [STATES.AWAITING_SKILLS]: [
    'skills',
    STATES.AWAITING_LANGUAGES,
    '🌐 Qaysi tillarni bilasiz? (masalan: O‘zbek — ona tili, Rus — B2, Ingliz — B1) yoki o‘tkazib yuboring:',
  ],
  [STATES.AWAITING_LANGUAGES]: [
    'languages',
    STATES.AWAITING_ABOUT,
    '📝 O‘zingiz haqingizda 2-4 gap yozing yoki o‘tkazib yuboring:',
  ],
  [STATES.AWAITING_ABOUT]: [
    'about',
    STATES.AWAITING_SALARY,
    '💰 Kutilayotgan maoshingizni yozing yoki o‘tkazib yuboring:',
  ],
  [STATES.AWAITING_SALARY]: [
    'salary',
    STATES.AWAITING_LINKS,
    '🔗 Telegram/LinkedIn havolangizni yozing yoki o‘tkazib yuboring:',
  ],
  [STATES.AWAITING_LINKS]: [
    'links',
    STATES.AWAITING_PHOTO,
    '📷 Rezyumega foto yuboring yoki o‘tkazib yuboring:',
  ],
};

bot.on('photo', async (ctx) => {
  const id = ctx.from.id;
  if (getState(id) !== STATES.AWAITING_PHOTO) return;
  const message = ctx.message as Message.PhotoMessage;
  const photos = message.photo;
  setData(id, 'photo', photos[photos.length - 1].file_id);
  setState(id, STATES.CONFIRMING);
  await showConfirmation(ctx);
});

bot.on('text', async (ctx) => {
  const id = ctx.from.id;
  const text = (ctx.message as Message.TextMessage).text;
  const controlButtons = [
    '📄 Rezyume yaratish',
    'ℹ️ Rezyume haqida',
    '❌ Bekor qilish',
    '⏭ O‘tkazib yuborish',
    '✏️ O‘zgartirish',
    '✅ Tasdiqlash',
    '📄 PDF olish',
    '📝 DOCX olish',
  ];
  if (controlButtons.includes(text)) return;

  const state = getState(id);
  const step = steps[state];
  if (!step) {
    if (state === STATES.AWAITING_PHOTO) {
      await ctx.reply('📷 Iltimos, foto yuboring yoki “⏭ O‘tkazib yuborish” tugmasini bosing.', skipKeyboard());
    } else if (state === STATES.CONFIRMING) {
      await ctx.reply('Pastdagi tugmalardan birini tanlang.', confirmKeyboard());
    } else {
      await ctx.reply('Boshlash uchun 📄 Rezyume yaratish tugmasini bosing.', mainKeyboard());
    }
    return;
  }

  let value = text.trim();
  if (state === STATES.AWAITING_NAME) {
    const v = validateName(value);
    if (!v.valid) return ctx.reply(v.message as string);
    value = v.value as string;
  }
  if (state === STATES.AWAITING_PHONE) {
    const v = validatePhone(value);
    if (!v.valid) return ctx.reply(v.message as string);
    value = v.value as string;
  }
  if (state === STATES.AWAITING_FIELD) {
    const v = validateField(value);
    if (!v.valid) return ctx.reply(v.message as string);
    value = v.value as string;
  }
  if (state === STATES.AWAITING_SKILLS) {
    const v = validateSkills(value);
    if (!v.valid) return ctx.reply(v.message as string);
    value = v.value as string;
  }
  if (state === STATES.AWAITING_EMAIL && !/^\S+@\S+\.\S+$/.test(value)) {
    return ctx.reply('📧 Email noto‘g‘ri. Masalan: example@gmail.com');
  }

  setData(id, step[0], value);
  setState(id, step[1]);
  if (step[1] === STATES.CONFIRMING) return showConfirmation(ctx);

  const optional: State[] = [
    STATES.AWAITING_EMAIL,
    STATES.AWAITING_CITY,
    STATES.AWAITING_EDUCATION,
    STATES.AWAITING_EXPERIENCE,
    STATES.AWAITING_LANGUAGES,
    STATES.AWAITING_ABOUT,
    STATES.AWAITING_SALARY,
    STATES.AWAITING_LINKS,
    STATES.AWAITING_PHOTO,
  ];
  await ctx.reply(step[2], optional.includes(step[1]) ? skipKeyboard() : Markup.removeKeyboard());
});

async function showConfirmation(ctx: Context): Promise<void> {
  if (!ctx.from) return;
  const data = getData(ctx.from.id);
  await ctx.reply(
    formatResume(data) + '\n\n❓ <b>Ma’lumotlar to‘g‘rimi?</b>\n\n📥 Kerakli formatni tanlang: <b>PDF</b> yoki <b>DOCX</b>.',
    { parse_mode: 'HTML', ...confirmKeyboard() }
  );
}

async function createAndSendResume(ctx: Context, format: ResumeFormat): Promise<void> {
  if (!ctx.from) return;
  const id = ctx.from.id;
  if (getState(id) !== STATES.CONFIRMING) {
    await ctx.reply('Avval rezyumeni to‘ldiring.', mainKeyboard());
    return;
  }
  const data = getData(id);
  await ctx.reply(`⏳ ${format} rezyume tayyorlanmoqda...`, Markup.removeKeyboard());
  try {
    const filePath =
      format === 'PDF' ? await generateResumePDF(data, id, ctx) : await generateResumeDOCX(data, id, ctx);

    await ctx.replyWithDocument(
      { source: filePath },
      {
        caption: `✅ ${format} rezyume tayyor!\n\n👤 ${data.name}\n💼 ${data.field}`,
        ...mainKeyboard(),
      }
    );
    await logUser(ctx, `Rezyume yaratdi (${format})`, data);
    clearSession(id);
  } catch (e) {
    console.error(e);
    await ctx.reply(`❌ ${format} yaratishda xatolik yuz berdi. Qaytadan urinib ko‘ring.`, confirmKeyboard());
  }
}

bot.catch((err, ctx) => {
  console.error('Bot xatoligi:', err);
  ctx.reply('❌ Xatolik yuz berdi. /start ni yuborib qaytadan urinib ko‘ring.');
});

bot
  .launch()
  .then(() => {
    console.log('✅ Resume bot ishga tushdi: @' + bot.botInfo?.username);
    console.log('👥 ADMIN_GROUP_ID:', GROUP_ID || 'sozlanmagan');
  })
  .catch((err) => {
    console.error('❌ Botni ishga tushirishda xatolik:', err);
    process.exit(1);
  });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
