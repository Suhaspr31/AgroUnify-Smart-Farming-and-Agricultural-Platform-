/**
 * Node.js compatible translation utilities
 * Simplified version for command-line usage
 */

const fs = require('fs');
const path = require('path');

// Simple translation service using MyMemory API
class SimpleTranslationService {
  constructor() {
    this.cache = new Map();
  }

  async translateText(text, from, to) {
    if (!text || text.trim() === '') return text;

    const cacheKey = `${from}-${to}-${text}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const params = new URLSearchParams({
        q: text,
        langpair: `${from}|${to}`,
        de: 'agrounify@example.com'
      });

      console.log(`Translating: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);

      const response = await fetch(`https://api.mymemory.translated.net/get?${params}`);
      const data = await response.json();

      if (data.responseData && data.responseData.translatedText) {
        const translatedText = data.responseData.translatedText;
        this.cache.set(cacheKey, translatedText);
        return translatedText;
      }

      console.warn(`Translation failed for: "${text}"`);
      return text;

    } catch (error) {
      console.error('Translation API error:', error.message);
      return text;
    }
  }

  async translateObject(obj, from, to) {
    const translated = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        translated[key] = await this.translateText(value, from, to);
      } else if (typeof value === 'object' && value !== null) {
        translated[key] = await this.translateObject(value, from, to);
      } else {
        translated[key] = value;
      }
    }

    return translated;
  }

  async autoTranslateMissing(sourceTranslations, targetTranslations, targetLang) {
    const updated = { ...targetTranslations };

    for (const [key, value] of Object.entries(sourceTranslations)) {
      if (!(key in updated)) {
        if (typeof value === 'string') {
          updated[key] = await this.translateText(value, 'en', targetLang);
        } else if (typeof value === 'object' && value !== null) {
          updated[key] = await this.translateObject(value, 'en', targetLang);
        }
      } else if (typeof value === 'object' && typeof updated[key] === 'object') {
        updated[key] = await this.autoTranslateMissing(value, updated[key], targetLang);
      }
    }

    return updated;
  }
}

// Translation manager for Node.js
class SimpleTranslationManager {
  constructor() {
    this.languages = {};
    this.translationService = new SimpleTranslationService();
    this.loadTranslations();
  }

  loadTranslations() {
    const i18nDir = path.join(__dirname, '..', 'frontend', 'src', 'i18n');

    try {
      const enPath = path.join(i18nDir, 'en.json');
      const hiPath = path.join(i18nDir, 'hi.json');
      const knPath = path.join(i18nDir, 'kn.json');

      this.languages = {
        en: {
          name: 'English',
          path: enPath,
          translations: JSON.parse(fs.readFileSync(enPath, 'utf8'))
        },
        hi: {
          name: 'Hindi',
          path: hiPath,
          translations: JSON.parse(fs.readFileSync(hiPath, 'utf8'))
        },
        kn: {
          name: 'Kannada',
          path: knPath,
          translations: JSON.parse(fs.readFileSync(knPath, 'utf8'))
        },
        te: {
          name: 'Telugu',
          path: path.join(i18nDir, 'te.json'),
          translations: fs.existsSync(path.join(i18nDir, 'te.json')) ?
            JSON.parse(fs.readFileSync(path.join(i18nDir, 'te.json'), 'utf8')) : {}
        }
      };
    } catch (error) {
      console.error('Error loading translation files:', error.message);
      throw error;
    }
  }

  getLanguages() {
    return this.languages;
  }

  async autoTranslateLanguage(targetLang) {
    if (!this.languages[targetLang]) {
      throw new Error(`Language '${targetLang}' not supported`);
    }

    console.log(`🚀 Starting auto-translation for ${this.languages[targetLang].name}...\n`);

    const sourceTranslations = this.languages.en.translations;
    const targetTranslations = this.languages[targetLang].translations;

    const updatedTranslations = await this.translationService.autoTranslateMissing(
      sourceTranslations,
      targetTranslations,
      targetLang
    );

    // Save to file
    fs.writeFileSync(
      this.languages[targetLang].path,
      JSON.stringify(updatedTranslations, null, 2),
      'utf8'
    );

    // Update in-memory
    this.languages[targetLang].translations = updatedTranslations;

    console.log(`✅ Auto-translation completed for ${this.languages[targetLang].name}`);
    return updatedTranslations;
  }

  async autoTranslateAllLanguages() {
    const results = {};

    for (const [langCode, langConfig] of Object.entries(this.languages)) {
      if (langCode !== 'en') {
        console.log(`\n=== Auto-translating ${langConfig.name} ===`);
        results[langCode] = await this.autoTranslateLanguage(langCode);
      }
    }

    return results;
  }

  findMissingTranslations(targetLang) {
    if (!this.languages[targetLang]) {
      throw new Error(`Language '${targetLang}' not supported`);
    }

    const sourceTranslations = this.languages.en.translations;
    const targetTranslations = this.languages[targetLang].translations;

    const missing = [];

    const checkMissing = (source, target, path = '') => {
      for (const [key, value] of Object.entries(source)) {
        const currentPath = path ? `${path}.${key}` : key;

        if (!(key in target)) {
          missing.push(currentPath);
        } else if (typeof value === 'object' && typeof target[key] === 'object') {
          checkMissing(value, target[key], currentPath);
        }
      }
    };

    checkMissing(sourceTranslations, targetTranslations);
    return missing;
  }

  getTranslationStats() {
    const stats = {};
    const sourceTranslations = this.languages.en.translations;

    const countStrings = (obj) => {
      let count = 0;
      for (const value of Object.values(obj)) {
        if (typeof value === 'string') {
          count++;
        } else if (typeof value === 'object' && value !== null) {
          count += countStrings(value);
        }
      }
      return count;
    };

    const totalStrings = countStrings(sourceTranslations);

    for (const [langCode, langConfig] of Object.entries(this.languages)) {
      const missing = this.findMissingTranslations(langCode);
      const translated = totalStrings - missing.length;
      const completionRate = totalStrings > 0 ? ((translated / totalStrings) * 100).toFixed(1) : 0;

      stats[langCode] = {
        name: langConfig.name,
        total: totalStrings,
        translated: translated,
        missing: missing.length,
        completionRate: `${completionRate}%`
      };
    }

    return stats;
  }

  async addLanguage(langCode, langName) {
    if (this.languages[langCode]) {
      throw new Error(`Language '${langCode}' already exists`);
    }

    console.log(`➕ Adding new language: ${langName} (${langCode})\n`);

    const filePath = path.join(__dirname, '..', 'frontend', 'src', 'i18n', `${langCode}.json`);

    // Start with empty translations
    const translations = {};
    fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf8');

    this.languages[langCode] = {
      name: langName,
      path: filePath,
      translations: translations
    };

    // Auto-translate from English
    const updatedTranslations = await this.autoTranslateLanguage(langCode);

    return updatedTranslations;
  }
}

module.exports = { SimpleTranslationManager };