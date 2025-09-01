# Discord Bot - Discord.js v14

بوت Discord مطور باستخدام Discord.js v14 مع دعم لأوامر البادئة (Prefix) والأوامر المائلة (Slash Commands).

## 📋 المتطلبات

- Node.js v16.9.0 أو أحدث
- npm أو yarn
- حساب Discord
- تطبيق Discord Bot

## 🚀 التثبيت والإعداد

### 1. إنشاء بوت Discord

1. اذهب إلى [Discord Developer Portal](https://discord.com/developers/applications)
2. انقر على "New Application"
3. أدخل اسم البوت واحفظ
4. اذهب إلى قسم "Bot" من القائمة الجانبية
5. انقر على "Add Bot"
6. احفظ الـ Token (ستحتاجه لاحقاً)

### 2. الحصول على Client ID

1. في نفس الصفحة، اذهب إلى قسم "General Information"
2. انسخ الـ Application ID (هذا هو Client ID)

### 3. دعوة البوت إلى الخادم

1. اذهب إلى قسم "OAuth2" > "URL Generator"
2. اختر "bot" و "applications.commands" في Scopes
3. اختر الصلاحيات المطلوبة في Bot Permissions
4. انسخ الرابط المولد وافتحه لدعوة البوت

### 4. تثبيت المشروع

```bash
# استنساخ المشروع أو تحميل الملفات
git clone <repository-url>
cd discord-bot

# تثبيت التبعيات
npm install
```

### 5. إعداد التكوين

افتح ملف `config.js` وقم بتعديل القيم التالية:

```javascript
module.exports = {
  token: 'YOUR_BOT_TOKEN_HERE',     // ضع رمز البوت هنا
  clientId: 'YOUR_CLIENT_ID_HERE', // ضع معرف العميل هنا
  prefix: '!',                     // يمكنك تغيير البادئة
  ownerId: 'YOUR_USER_ID_HERE',    // ضع معرف المستخدم الخاص بك
};
```

### 6. تشغيل البوت

```bash
# تشغيل البوت
npm start

# أو للتطوير
npm run dev
```

## 📁 هيكل المشروع

```
discord-bot/
│
├── Commands/
│   ├── PrefixCommands/      # أوامر البادئة
│   │   ├── ping.js
│   │   ├── help.js
│   │   └── serverinfo.js
│   │
│   └── SlashCommands/       # الأوامر المائلة
│       ├── info.js
│       ├── user.js
│       └── avatar.js
│
├── Handler/
│   ├── commandHandler.js    # معالج تحميل الأوامر
│   └── eventHandler.js      # معالج تحميل الأحداث
│
├── Events/
│   ├── ready.js            # حدث جاهزية البوت
│   ├── messageCreate.js    # حدث إنشاء الرسائل
│   └── interactionCreate.js # حدث التفاعلات
│
├── Data/
│   ├── botStats.json       # إحصائيات البوت
│   └── userData.json       # بيانات المستخدمين
│
├── config.js               # إعدادات البوت
├── index.js               # الملف الرئيسي
└── README.md              # هذا الملف
```

## 🛠️ إضافة أوامر جديدة

### إضافة أمر بادئة جديد

أنشئ ملف جديد في `Commands/PrefixCommands/`:

```javascript
module.exports = {
  name: 'commandname',
  description: 'وصف الأمر',
  usage: '!commandname [options]',
  category: 'فئة الأمر',
  aliases: ['alias1', 'alias2'], // اختياري
  permissions: ['ADMINISTRATOR'], // اختياري
  ownerOnly: false, // اختياري
  
  async execute(message, args, client) {
    // منطق الأمر هنا
    message.reply('Hello World!');
  }
};
```

### إضافة أمر مائل جديد

أنشئ ملف جديد في `Commands/SlashCommands/`:

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('commandname')
    .setDescription('وصف الأمر'),
    
  async execute(interaction, client) {
    // منطق الأمر هنا
    await interaction.reply('Hello World!');
  }
};
```

## 🎯 الأوامر المتاحة

### أوامر البادئة (!)
- `!ping` - فحص سرعة استجابة البوت
- `!help` - عرض قائمة الأوامر
- `!serverinfo` - معلومات عن الخادم

### الأوامر المائلة (/)
- `/info` - معلومات عن البوت
- `/user` - معلومات عن مستخدم
- `/avatar` - عرض صورة المستخدم

## 🔧 التخصيص

### تغيير البادئة
في ملف `config.js`، غير قيمة `prefix`:
```javascript
prefix: '$', // بدلاً من '!'
```

### تغيير ألوان الـ Embeds
في ملف `config.js`، عدل قسم `colors`:
```javascript
colors: {
  primary: '#FF0000',
  success: '#00FF00',
  // ...
}
```

## 📝 متغيرات البيئة (اختياري)

يمكنك استخدام متغيرات البيئة بدلاً من وضع القيم مباشرة في `config.js`:

أنشئ ملف `.env`:
```env
BOT_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here
```

## 🐛 استكشاف الأخطاء

### البوت لا يتصل
- تأكد من صحة الـ Token
- تأكد من تفعيل جميع الـ Intents المطلوبة
- تحقق من اتصال الإنترنت

### الأوامر المائلة لا تظهر
- تأكد من أن البوت لديه صلاحية `applications.commands`
- انتظر بضع دقائق لتحديث Discord
- تحقق من وحدة التحكم للأخطاء

### أوامر البادئة لا تعمل
- تأكد من أن البوت لديه صلاحية قراءة الرسائل
- تحقق من صحة البادئة في `config.js`
- تأكد من أن الـ Intent `MessageContent` مفعل

## 📚 الموارد المفيدة

- [Discord.js Documentation](https://discord.js.org/#/docs/discord.js/main/general/welcome)
- [Discord Developer Portal](https://discord.com/developers/docs/intro)
- [Discord.js Guide](https://discordjs.guide/)

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT.

## 🤝 المساهمة

نرحب بالمساهمات! يرجى إنشاء Pull Request أو فتح Issue لأي اقتراحات أو مشاكل.

---

**ملاحظة:** تأكد من عدم مشاركة رمز البوت (Token) مع أي شخص آخر!