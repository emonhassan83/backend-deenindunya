// seeder/lesson.seeder.ts
import mongoose from 'mongoose';
import config from '../config';
import { Lesson, Module } from '../modules/educationHub/educationHub.models';

const lessonsData = [
  // Belief & Core Concepts
  { module: "Belief & Core Concepts", title: "Introduction to Islam", type: "Belief" },
  { module: "Belief & Core Concepts", title: "Six Pillars of Faith", type: "Belief" },
  { module: "Belief & Core Concepts", title: "What is Qur'an and why it matters", type: "Belief" },
  { module: "Belief & Core Concepts", title: "Introduction to Prophet Muhammad", type: "Belief" },
  { module: "Belief & Core Concepts", title: "A simple explanation of Tawheed", type: "Belief" },
  
  // Pillars of Islam
  { module: "Pillars of Islam", title: "Shahadah: Meaning & Significance", type: "Belief" },
  { module: "Pillars of Islam", title: "Salah: Basic Overview Of Prayer", type: "Purification" },
  { module: "Pillars of Islam", title: "Zakah: The spirit Of Giving", type: "Gratitude" },
  { module: "Pillars of Islam", title: "Fasting (Ramadan): Purpose Of Fasting", type: "Purification" },
  { module: "Pillars of Islam", title: "Hajj & Umrah: Simple Introduction", type: "Purification" },
  
  // Purification & Cleanliness
  { module: "Purification & Cleanliness (Essential)", title: "Wudu (Ablution)", type: "Purification" },
  { module: "Purification & Cleanliness (Essential)", title: "Ghusl (Full Body purification)", type: "Purification" },
  { module: "Purification & Cleanliness (Essential)", title: "Clean Body, Clothes, And Prayer Space", type: "Purification" },
  { module: "Purification & Cleanliness (Essential)", title: "Importance Of Cleanliness In Islam", type: "Purification" },
  
  // Prayer (Salah) in Practice
  { module: "Prayer (Salah) in Practice", title: "Prayer Times: Simple Explanation For Beginners", type: "Purification" },
  { module: "Prayer (Salah) in Practice", title: "Conditions Before Prayer", type: "Purification" },
  { module: "Prayer (Salah) in Practice", title: "How To Pray", type: "Purification" },
  { module: "Prayer (Salah) in Practice", title: "Short Du'as", type: "Protection" },
  { module: "Prayer (Salah) in Practice", title: "Common Mistakes", type: "Healing" },
  
  // Qur'an & Dhikr
  { module: "Qur'an & Dhikr", title: "How To Start Reading The Qur'an For Beginners", type: "Purification" },
  { module: "Qur'an & Dhikr", title: "Recommended Short Surahs To Begin With", type: "Purification" },
  { module: "Qur'an & Dhikr", title: "Simple Meanings Of Selected Surahs", type: "Belief" },
  { module: "Qur'an & Dhikr", title: "Daily Dhikr (Remembrance) Practices", type: "Protection" },
  { module: "Qur'an & Dhikr", title: "Short Remembrance Phrases For Daily Use", type: "Protection" },
  
  // Spiritual Wellbeing
  { module: "Spiritual Wellbeing", title: "Trust In Allah", type: "Belief" },
  { module: "Spiritual Wellbeing", title: "Patience During Hardship", type: "Healing" },
  { module: "Spiritual Wellbeing", title: "Repentance & Forgiveness", type: "Healing" },
  { module: "Spiritual Wellbeing", title: "Staying Hopeful", type: "Healing" },
  { module: "Spiritual Wellbeing", title: "Building Routine & Balance", type: "Healing" },
  
  // Lifestyle
  { module: "Lifestyle (Beginner Level)", title: "Integrating Deen (Faith) Into Daily Routine", type: "Gratitude" },
  { module: "Lifestyle (Beginner Level)", title: "Mindfulness & Social Media", type: "Protection" },
  { module: "Lifestyle (Beginner Level)", title: "Basic Relationship Ethics", type: "Purification" },
  { module: "Lifestyle (Beginner Level)", title: "Earning & Spending Ethically", type: "Gratitude" },
  
  // Key Islamic Times
  { module: "Key Islamic Times", title: "Friday (Jumu'ah)", type: "Purification" },
  { module: "Key Islamic Times", title: "Ramadan Overview And Key Practices", type: "Purification" },
  { module: "Key Islamic Times", title: "Laylatul Qadr", type: "Protection" },
  { module: "Key Islamic Times", title: "Meaning And Practices For Both Eids", type: "Gratitude" },
  { module: "Key Islamic Times", title: "10 Days Of Dhul-Hijjah", type: "Purification" },
  
  // Beginner FAQs
  { module: "Beginner FAQs", title: "Why Muslims Pray", type: "Belief" },
  { module: "Beginner FAQs", title: "What Does Hijab Mean?", type: "Purification" },
  { module: "Beginner FAQs", title: "Halal & Haram Basics", type: "Purification" },
  { module: "Beginner FAQs", title: "What If I Struggle With Faith?", type: "Healing" },
  { module: "Beginner FAQs", title: "What If I Keep Making Mistakes?", type: "Healing" },
  
  // Learning Tools
  { module: "Learning Tools", title: "Definitions For Frequently Used Islamic Terms", type: "Belief" }
];

const seedLessons = async () => {
  try {
    // ✅ Connect to database first
    console.log('📦 Connecting to database...');
    await mongoose.connect(config.database_url as string);
    console.log('✅ Database connected successfully!\n');

    // Get unique module names from data
    const uniqueModuleNames = [...new Set(lessonsData.map(item => item.module))];

    // Create modules (skip if already exists)
    const moduleMap = new Map();
    console.log('📚 Processing modules...');
    
    for (const moduleName of uniqueModuleNames) {
      let module = await Module.findOne({ name: moduleName });
      if (!module) {
        module = await Module.create({ name: moduleName });
        console.log(`   ✅ Module created: ${moduleName}`);
      } else {
        console.log(`   ⏭️ Module already exists: ${moduleName}`);
      }
      moduleMap.set(moduleName, module._id);
    }

    // Create lessons
    let createdCount = 0;
    let skippedCount = 0;
    console.log('\n📖 Processing lessons...');

    for (const lesson of lessonsData) {
      const moduleId = moduleMap.get(lesson.module);
      
      const existingLesson = await Lesson.findOne({
        module: moduleId,
        title: lesson.title,
      });

      if (!existingLesson) {
        await Lesson.create({
          module: moduleId,
          type: lesson.type,
          title: lesson.title,
        });
        createdCount++;
        console.log(`   ✅ Lesson created: ${lesson.title}`);
      } else {
        skippedCount++;
        // console.log(`   ⏭️ Lesson already exists: ${lesson.title}`);
      }
    }

    console.log(`\n📊 Seeding Summary:`);
    console.log(`   ✅ Created: ${createdCount} lessons`);
    console.log(`   ⏭️ Skipped: ${skippedCount} lessons`);
    console.log(`   📚 Total Modules: ${moduleMap.size}`);
    
    // ✅ Close connection
    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed.');
    
  } catch (error) {
    console.error('❌ Error seeding lessons:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedLessons();