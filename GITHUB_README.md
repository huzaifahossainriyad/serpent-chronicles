# 🎮 Serpent Chronicles - রিয়াদ সাপ গেম

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Play%20Now-brightgreen?style=for-the-badge)](https://snake-game-7.lindy.site)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge)](https://github.com/huzaifahossainriyad/serpent-chronicles)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> **একটি আধুনিক, ইন্টারেক্টিভ সাপ গেম যা Next.js, TypeScript এবং Canvas API দিয়ে তৈরি**

---

## 🌟 বৈশিষ্ট্য

### Phase 1 (8টি ফিচার) ✅
- 🎮 **মূল Snake গেম** - ক্লাসিক গেমপ্লে
- 🎯 **তিনটি ডিফিকাল্টি মোড** - সহজ, মাঝারি, কঠিন
- 🇧🇩 **বাংলা ভাষা সাপোর্ট** - সম্পূর্ণ বাংলা ইন্টারফেস
- 💾 **হাই স্কোর সংরক্ষণ** - LocalStorage এ স্বয়ংক্রিয় সংরক্ষণ
- 📊 **লগিং সিস্টেম** - বিস্তারিত গেম লগ
- 🎲 **র্যান্ডম গেম ওভার মেসেজ** - মজাদার বার্তা
- 📱 **রেসপন্সিভ ডিজাইন** - সব ডিভাইসে কাজ করে
- ✨ **রিয়াদ ব্র্যান্ডিং** - ব্যক্তিগত স্পর্শ

### Phase 2.1 (4টি ফিচার) ✅
- 🤖 **AI Enemy Snake** - স্বাধীন AI প্রতিদ্বন্দ্বী
- 🎯 **Combo System** - দ্রুত খেলার জন্য বোনাস
- ⚡ **Stun Mechanic** - AI সাপকে স্টান করুন
- 🎨 **Tail Physics** - বাস্তবসম্মত লেজ গতিবিদ্যা

### Phase 2.2 (6টি ফিচার) 🔄 চলমান
- 🌊 **Dynamic Board** - পরিবর্তনশীল বোর্ড
- 🌦️ **Weather System** - আবহাওয়া প্রভাব
- ☠️ **Toxic Zone** - বিষাক্ত এলাকা
- 🌫️ **Fog of War** - দৃশ্যমানতা সীমা
- 👹 **Boss Mode** - বস এনকাউন্টার
- 🎲 **Random Events** - র্যান্ডম ইভেন্ট

---

## 📊 প্রজেক্ট স্ট্যাটিস্টিক্স

```
📈 মোট ফিচার:           18টি
💻 মোট কোড:             ~3,421 লাইন
📚 মোট ডকুমেন্টেশন:     ~4,740 লাইন
🎯 গ্র্যান্ড টোটাল:       ~8,161 লাইন
🔧 কাস্টম Hooks:        9টি
📦 ডকুমেন্টেশন ফাইল:    13টি
```

---

## 🚀 দ্রুত শুরু করুন

### অনলাইনে খেলুন
```bash
👉 https://snake-game-7.lindy.site
```

### স্থানীয়ভাবে চালান

#### প্রয়োজনীয়তা
- Node.js 18+
- npm বা yarn

#### ইনস্টলেশন
```bash
# Repository ক্লোন করুন
git clone https://github.com/huzaifahossainriyad/serpent-chronicles.git
cd serpent-chronicles

# ডিপেন্ডেন্সি ইনস্টল করুন
npm install

# ডেভেলপমেন্ট সার্ভার চালান
npm run dev

# ব্রাউজারে খুলুন
# http://localhost:3000
```

---

## 🎮 গেম নিয়ন্ত্রণ

| কী | কাজ |
|---|---|
| ⬆️ Arrow Up / W | উপরে যান |
| ⬇️ Arrow Down / S | নিচে যান |
| ⬅️ Arrow Left / A | বাম দিকে যান |
| ➡️ Arrow Right / D | ডান দিকে যান |
| Space Bar | পজ/রিজিউম |

---

## 🏗️ প্রযুক্তিগত স্ট্যাক

```
Frontend:
├── Next.js 14
├── TypeScript (strict mode)
├── React Hooks (9টি কাস্টম hooks)
├── Tailwind CSS
├── shadcn/ui
└── HTML5 Canvas API

Architecture:
├── Modular Hook Design
├── Type-Safe Code
├── Performance Optimized
└── Scalable Structure
```

---

## 📁 প্রজেক্ট স্ট্রাকচার

```
serpent-chronicles/
├── app/
│   ├── hooks/                    # 9টি কাস্টম hooks
│   │   ├── useAISnake.ts
│   │   ├── useCombo.ts
│   │   ├── useBossMode.ts
│   │   ├── useDynamicBoard.ts
│   │   ├── useFogOfWar.ts
│   │   ├── useRandomEvents.ts
│   │   ├── useTailPhysics.ts
│   │   ├── useToxicZone.ts
│   │   └── useWeatherSystem.ts
│   ├── page.tsx                  # মূল গেম পেজ
│   └── layout.tsx                # লেআউট
├── components/
│   └── ui/                       # shadcn/ui কম্পোনেন্ট
├── 📚 ডকুমেন্টেশন ফাইল (13টি)
│   ├── 00_START_HERE.md          # এখানে শুরু করুন
│   ├── README.md                 # গেম গাইড
│   ├── PROJECT_SUMMARY.md        # প্রজেক্ট সারসংক্ষেপ
│   ├── PHASE_2_IMPLEMENTATION.md # বাস্তবায়ন গাইড
│   ├── LOGGING_SYSTEM.md         # লগিং সিস্টেম
│   ├── EXECUTIVE_SUMMARY.md      # এক্সিকিউটিভ সারসংক্ষেপ
│   ├── COMPLETION_REPORT.md      # সম্পূর্ণতা রিপোর্ট
│   ├── FINAL_SUMMARY.md          # Phase 1 সারসংক্ষেপ
│   ├── PHASE_2_SUMMARY.md        # Phase 2 সারসংক্ষেপ
│   ├── PHASE_2_ROADMAP.md        # Phase 2 রোডম্যাপ
│   ├── DOCUMENTATION_INDEX.md    # ডকুমেন্টেশন ইন্ডেক্স
│   ├── FINAL_DOCUMENTATION_SUMMARY.txt
│   └── DOCUMENTATION_COMPLETE.md
└── package.json
```

---

## 📚 ডকুমেন্টেশন

### দ্রুত শুরু করুন
- 🚀 **[00_START_HERE.md](./00_START_HERE.md)** - প্রধান এন্ট্রি পয়েন্ট

### ব্যবহারকারী গাইড
- 📖 **[README.md](./README.md)** - গেম গাইড এবং নিয়ন্ত্রণ

### প্রযুক্তিগত ডকুমেন্টেশন
- 📊 **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - প্রজেক্ট সারসংক্ষেপ
- 💻 **[PHASE_2_IMPLEMENTATION.md](./PHASE_2_IMPLEMENTATION.md)** - বাস্তবায়ন গাইড
- 🔧 **[LOGGING_SYSTEM.md](./LOGGING_SYSTEM.md)** - লগিং সিস্টেম

### সারসংক্ষেপ এবং রিপোর্ট
- 🎯 **[EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md)** - এক্সিকিউটিভ সারসংক্ষেপ
- ✅ **[COMPLETION_REPORT.md](./COMPLETION_REPORT.md)** - সম্পূর্ণতা রিপোর্ট
- 📈 **[PHASE_2_SUMMARY.md](./PHASE_2_SUMMARY.md)** - Phase 2 সারসংক্ষেপ

### পরিকল্পনা এবং রোডম্যাপ
- 🗺️ **[PHASE_2_ROADMAP.md](./PHASE_2_ROADMAP.md)** - ভবিষ্যত পরিকল্পনা

### রেফারেন্স
- 📚 **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - সম্পূর্ণ ইন্ডেক্স

---

## 🎯 ভূমিকা অনুযায়ী পড়ার পথ

### 👤 গেমার (5-10 মিনিট)
1. এই README পড়ুন
2. [লাইভ গেম খেলুন](https://snake-game-7.lindy.site)

### 👨‍💻 ডেভেলপার (30-45 মিনিট)
1. [00_START_HERE.md](./00_START_HERE.md)
2. [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
3. [PHASE_2_IMPLEMENTATION.md](./PHASE_2_IMPLEMENTATION.md)
4. [LOGGING_SYSTEM.md](./LOGGING_SYSTEM.md)
5. [PHASE_2_ROADMAP.md](./PHASE_2_ROADMAP.md)

### 📊 প্রজেক্ট ম্যানেজার (20-30 মিনিট)
1. [EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md)
2. [COMPLETION_REPORT.md](./COMPLETION_REPORT.md)
3. [PHASE_2_ROADMAP.md](./PHASE_2_ROADMAP.md)

---

## 🚀 পরবর্তী পর্যায়

### Phase 2.3 - প্লেয়ার প্রগতি
- Snake Evolution Levels
- Snake Skills (RPG System)
- Daily Gifts / Spin Wheel

### Phase 2.4 - বিশেষ মোড
- Time Manipulation
- Mission Storyline
- Replay Share

### Phase 3 - উন্নত ফিচার
- Multiplayer mode
- Leaderboard system
- Advanced analytics
- Custom skins
- Sound effects

---

## 🎮 স্ক্রিনশট

### গেম মেনু
![Game Menu](https://snake-game-7.lindy.site)

### গেমপ্লে
![Gameplay](https://snake-game-7.lindy.site)

---

## 📞 যোগাযোগ

**ডেভেলপার**: রিয়াদ হোসেইন হুজাইফা  
**ইমেইল**: huzaifahossainriyad@proton.me  
**টাইমজোন**: Asia/Dhaka (UTC+6)  
**GitHub**: [@huzaifahossainriyad](https://github.com/huzaifahossainriyad)

---

## 📄 লাইসেন্স

এই প্রজেক্ট MIT লাইসেন্সের অধীন। বিস্তারিত জানতে [LICENSE](LICENSE) ফাইল দেখুন।

---

## 🙏 ধন্যবাদ

এই প্রজেক্টটি ভালোবাসা এবং যত্ন সহকারে তৈরি করা হয়েছে। 

**আপনার সমর্থন এবং ফিডব্যাক আমাদের অনুপ্রাণিত করে!** ⭐

---

## 🎉 প্রজেক্ট স্ট্যাটাস

✅ **Phase 1**: সম্পূর্ণ এবং লাইভ  
✅ **Phase 2.1**: সম্পূর্ণ এবং লাইভ  
🔄 **Phase 2.2**: চলমান (ইন্টিগ্রেশন)  
📅 **Phase 2.3**: পরিকল্পনা চলছে  
📅 **Phase 2.4**: পরিকল্পনা চলছে  
📅 **Phase 3**: ভবিষ্যত পরিকল্পনা  

---

**🚀 এখনই খেলুন**: [https://snake-game-7.lindy.site](https://snake-game-7.lindy.site)

**⭐ এই রিপোজিটরিকে স্টার দিন এবং অনুসরণ করুন!**

---

*সর্বশেষ আপডেট: ১৯ নভেম্বর २०२५*
