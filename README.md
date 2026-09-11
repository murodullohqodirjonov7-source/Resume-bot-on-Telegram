# 🤖 Telegram Resume Bot

Professional Resume yaratish uchun Telegram boti. Foydalanuvchilar bot orqali o'z ma'lumotlarini kiritib, chiroyli PDF formatda resume olishlari mumkin.

## ✨ Xususiyatlar

- ✅ Interaktiv savol-javob jarayoni
- ✅ Ma'lumotlarni validatsiya qilish
- ✅ Professional PDF dizayni
- ✅ Har bir user uchun alohida session
- ✅ Ko'p foydalanuvchi bilan ishlash
- ✅ Xatolarni boshqarish
- ✅ User-friendly interfeys

## 📋 Talablar

- Node.js v14 yoki yuqori
- npm yoki yarn
- Telegram Bot Token (@BotFather dan)

## 🚀 O'rnatish

### 1. Loyihani yuklab olish

```bash
# Agar Git orqali:
git clone <repository-url>
cd telegram-resume-bot

# Yoki fayllarni qo'lda nusxalang
```

### 2. Dependencies o'rnatish

```bash
npm install
```

### 3. Environment variables sozlash

`.env` fayl yarating va bot tokenni kiriting:

```bash
cp .env.example .env
```

`.env` faylini tahrirlang:

```env
BOT_TOKEN=your_bot_token_here
```

**Bot token olish:**
1. Telegram'da @BotFather ga yozing
2. `/newbot` buyrug'ini yuboring
3. Bot nomini kiriting
4. Username kiriting (masalan: my_resume_bot)
5. Olingan tokenni `.env` fayliga qo'ying

### 4. Botni ishga tushirish

```bash
npm start
```

Yoki development rejimida:

```bash
npm run dev
```

## 📖 Ishlatish

### Foydalanuvchi uchun qo'llanma:

1. **Botni boshlash**
   - Telegram'da botingizni toping
   - `/start` buyrug'ini yuboring

2. **Resume yaratish**
   - "✅ Resume yaratish" tugmasini bosing
   - Bot ketma-ket savollar beradi:
     - Ism-familiya
     - Yosh
     - Telefon raqam
     - Ish sohasi
     - Ko'nikmalar

3. **Ma'lumotlarni tasdiqlash**
   - Barcha ma'lumotlar ko'rsatiladi
   - "✅ Tasdiqlash" yoki "❌ Bekor qilish" tanlang

4. **PDF olish**
   - Tasdiqlagandan keyin PDF tayyor bo'ladi
   - Fayl yuboriladi

### Buyruqlar:

- `/start` - Botni boshlash
- `/help` - Yordam olish
- `/cancel` - Jarayonni bekor qilish

## 🏗️ Loyiha strukturasi

```
telegram-resume-bot/
├── src/
│   ├── bot.js              # Asosiy bot mantigi
│   ├── resumeGenerator.js  # PDF yaratish
│   ├── states.js           # State management
│   └── utils/
│       └── validator.js    # Validatsiya funksiyalari
├── resumes/                # PDF fayllar saqlanadigan papka
├── package.json
├── .env.example
└── README.md
```

## 🔧 Texnologiyalar

- **Node.js** - Runtime muhit
- **Telegraf** - Telegram Bot Framework
- **PDFKit** - PDF yaratish
- **dotenv** - Environment variables

## ⚙️ Konfiguratsiya

### Environment Variables

- `BOT_TOKEN` - Telegram bot token (majburiy)
- `LOG_LEVEL` - Log darajasi (ixtiyoriy, default: info)

### PDF sozlamalari

`src/resumeGenerator.js` faylida PDF dizaynini o'zgartirish mumkin:
- Ranglar
- Shriftlar
- Layout
- Bo'limlar

## 🛡️ Validatsiya

Bot quyidagi validatsiyalarni amalga oshiradi:

- **Ism-familiya**: 2-100 belgi
- **Yosh**: 14-100 oralig'ida
- **Telefon**: To'g'ri format (+998...)
- **Ish sohasi**: 3-100 belgi
- **Ko'nikmalar**: 2-500 belgi

## 📦 Production uchun

Production muhitda ishlatish uchun:

1. **Process manager ishlatish** (PM2):
```bash
npm install -g pm2
pm2 start src/bot.js --name resume-bot
pm2 save
pm2 startup
```

2. **Database qo'shish**:
   - User ma'lumotlarini saqlash uchun MongoDB yoki PostgreSQL
   - Session management uchun Redis

3. **Monitoring**:
   - PM2 monitoring
   - Error tracking (Sentry)
   - Log management

4. **Security**:
   - Environment variables xavfsiz saqlash
   - Rate limiting qo'shish
   - Input sanitization

## 🐛 Muammo yechish

### Bot ishlamayapti?

1. Token to'g'ri ekanligini tekshiring
2. Node.js versiyasini tekshiring: `node --version`
3. Dependencies o'rnatilganligini tekshiring: `npm install`
4. Log'larni ko'ring

### PDF yaratilmayapti?

1. `resumes/` papka mavjudligini tekshiring
2. Disk space borligini tekshiring
3. PDFKit to'g'ri o'rnatilganligini tekshiring

### Xatolik yuz bersa:

```bash
# Dependencies ni qayta o'rnatish
rm -rf node_modules package-lock.json
npm install

# Botni qayta ishga tushirish
npm start
```

## 📝 License

MIT

## 👨‍💻 Muallif

Professional Node.js Developer

## 🤝 Hissa qo'shish

Pull request'lar qabul qilinadi!

1. Fork qiling
2. Feature branch yarating (`git checkout -b feature/AmazingFeature`)
3. Commit qiling (`git commit -m 'Add some AmazingFeature'`)
4. Push qiling (`git push origin feature/AmazingFeature`)
5. Pull Request oching

## 📞 Aloqa

Savollar bo'lsa, issue oching yoki bog'laning!

---

**Omad!** 🚀


### Formatlar
Rezyume to‘ldirib bo‘lingach foydalanuvchi **📄 PDF olish** yoki **📝 DOCX olish** tugmasini tanlaydi. Bot tanlangan formatni Telegram orqali fayl qilib yuboradi.
