// src/app/seeder/surah.seed.ts
import mongoose from "mongoose";
import fetch from "node-fetch";
import cliProgress from "cli-progress";
import fs from "fs-extra";
import path from "path";
import { Surah, SurahVerse } from "../modules/surah/surah.models";
import config from "../config";

const CACHE_FILE = path.join(__dirname, "quran-full-cache.json");
const DETAIL_CACHE_DIR = path.join(__dirname, "surah-cache");
const BATCH_SIZE = 200;
const BASE_URL = "https://quranapi.pages.dev/api";

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" }, // কিছু API User-Agent চায়
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.json();
    } catch (err: any) {
      console.warn(`\n  Attempt ${attempt} failed: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
}

async function seedQuranData() {
  await mongoose.connect(config.database_url as string);
  console.log("✅ Connected to MongoDB\n");

  // Ensure detail cache dir exists
  await fs.ensureDir(DETAIL_CACHE_DIR);

  // Step 1: Fetch surah list
  let allSurahs: any[] = [];
  if (await fs.pathExists(CACHE_FILE)) {
    console.log("📦 Loading surah list from cache...");
    allSurahs = await fs.readJson(CACHE_FILE);
  } else {
    console.log("🌐 Fetching all Surahs from API...");
    allSurahs = await fetchWithRetry(`${BASE_URL}/surah.json`);
    await fs.writeJson(CACHE_FILE, allSurahs, { spaces: 2 });
    console.log(`💾 Cached ${allSurahs.length} surahs!\n`);
  }

  const totalSurahs = allSurahs.length;
  let totalVerses = 0;
  let failedSurahs: number[] = [];

  const progressBar = new cliProgress.SingleBar({
    format: "Seeding |{bar}| {percentage}% | {value}/{total} Surahs",
    barCompleteChar: "█",
    barIncompleteChar: "░",
    hideCursor: true,
  });

  progressBar.start(totalSurahs, 0);

  for (let index = 0; index < allSurahs.length; index++) {
    const surah = allSurahs[index];
    const surahNumber = index + 1;
    const surahName =
      surah.surahName ||
      `Surah ${surahNumber}`;

    // Upsert Surah document
    const surahDoc = await Surah.findOneAndUpdate(
      { number: surahNumber },
      {
        number: surahNumber,
        name: surahName,
        nameArabic: surah.surahNameArabic || '',
        nameTranslation: surah.surahNameTranslation || '',
        revelationPlace: surah.revelationPlace || '',
        totalVerses: surah.totalAyah || 0,
    
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Check per-surah detail cache
    const detailCacheFile = path.join(DETAIL_CACHE_DIR, `${surahNumber}.json`);
    let detailRes: any;

    try {
      if (await fs.pathExists(detailCacheFile)) {
        detailRes = await fs.readJson(detailCacheFile);
      } else {
        // ✅ CORRECT endpoint: /{surahNumber}.json (not /surah/{surahNumber}.json)
        detailRes = await fetchWithRetry(`${BASE_URL}/${surahNumber}.json`);
        await fs.writeJson(detailCacheFile, detailRes, { spaces: 2 });
      }
    } catch (err: any) {
      progressBar.increment();
      failedSurahs.push(surahNumber);
      continue;
    }

    // ✅ Parse verses correctly from quranapi.pages.dev structure:
    // { arabic1: [...], arabic2: [...], english: [...], bengali: [...], ... }
    const arabicTexts: string[] = detailRes.arabic1 || detailRes.arabic2 || [];
    const translations: string[] = detailRes.english || [];
    const bengaliTexts: string[] = detailRes.bengali || [];
    const totalAyah: number =
      detailRes.totalAyah || arabicTexts.length || 0;

    const verseDocs = Array.from({ length: totalAyah }, (_, i) => ({
      surahId: surahDoc._id,
      verseNumber: i + 1,
      arabicText: arabicTexts[i] || "",
      translation: translations[i] || "",
      bengaliTranslation: bengaliTexts[i] || "",
      audioUrl: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${
        // Global ayah number calculation
        allSurahs
          .slice(0, index)
          .reduce((sum: number, s: any) => sum + (s.totalAyah || 0), 0) +
        i +
        1
      }.mp3`,
    }));

    // Bulk insert with duplicate skip
    if (verseDocs.length > 0) {
      for (let i = 0; i < verseDocs.length; i += BATCH_SIZE) {
        const batch = verseDocs.slice(i, i + BATCH_SIZE);
        await SurahVerse.insertMany(batch, { ordered: false }).catch(
          () => {} // Duplicate হলে skip করবে
        );
      }
      totalVerses += verseDocs.length;
    }

    progressBar.increment();
  }

  progressBar.stop();

  console.log("\n🎉 Quran Seeding Completed!");
  console.log(`   Total Surahs : ${totalSurahs}`);
  console.log(`   Total Verses : ${totalVerses}`);

  if (failedSurahs.length > 0) {
    console.log(`   ⚠️  Failed    : Surah ${failedSurahs.join(", ")}`);
  }

  process.exit(0);
}

seedQuranData().catch((err) => {
  console.error("\n❌ Seeding Failed:", err.message || err);
  process.exit(1);
});