/**
 * Translation Manager Utility
 * Helps manage and auto-translate language files
 */

import translationService from '../services/translationService';
import enTranslations from '../i18n/en.json';
import hiTranslations from '../i18n/hi.json';
import knTranslations from '../i18n/kn.json';

class TranslationManager {
  constructor() {
    this.languages = {
      en: { name: 'English', translations: enTranslations },
      hi: { name: 'Hindi', translations: hiTranslations },
      kn: { name: 'Kannada', translations: knTranslations }
    };
  }

  /**
   * Get all available languages
   * @returns {object} Language configuration
   */
  getLanguages() {
    return this.languages;
  }

  /**
   * Auto-translate missing translations for a target language
   * @param {string} targetLang - Target language code (e.g., 'hi', 'kn')
   * @returns {Promise<object>} Updated translations
   */
  async autoTranslateLanguage(targetLang) {
    if (!this.languages[targetLang]) {
      throw new Error(`Language '${targetLang}' not supported`);
    }

    console.log(`Starting auto-translation for ${this.languages[targetLang].name}...`);

    const sourceTranslations = this.languages.en.translations;
    const targetTranslations = this.languages[targetLang].translations;

    const updatedTranslations = await translationService.autoTranslateMissing(
      sourceTranslations,
      targetTranslations,
      targetLang
    );

    // Update the in-memory translations
    this.languages[targetLang].translations = updatedTranslations;

    console.log(`Auto-translation completed for ${this.languages[targetLang].name}`);
    return updatedTranslations;
  }

  /**
   * Auto-translate all supported languages
   * @returns {Promise<object>} Updated translations for all languages
   */
  async autoTranslateAllLanguages() {
    const results = {};

    for (const [langCode, langConfig] of Object.entries(this.languages)) {
      if (langCode !== 'en') { // Skip English as it's the source
        console.log(`\n=== Auto-translating ${langConfig.name} ===`);
        results[langCode] = await this.autoTranslateLanguage(langCode);
      }
    }

    return results;
  }

  /**
   * Find missing translations in a target language
   * @param {string} targetLang - Target language code
   * @returns {string[]} Array of missing translation keys
   */
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

  /**
   * Get translation statistics
   * @returns {object} Statistics for each language
   */
  getTranslationStats() {
    const stats = {};
    const sourceTranslations = this.languages.en.translations;

    // Count total translatable strings in English
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

  /**
   * Export translations as JSON files (for development)
   * @param {string} targetLang - Target language code
   * @returns {string} JSON string of translations
   */
  exportTranslations(targetLang) {
    if (!this.languages[targetLang]) {
      throw new Error(`Language '${targetLang}' not supported`);
    }

    return JSON.stringify(this.languages[targetLang].translations, null, 2);
  }

  /**
   * Add a new language
   * @param {string} langCode - Language code (e.g., 'te' for Telugu)
   * @param {string} langName - Language name (e.g., 'Telugu')
   * @returns {Promise<object>} Auto-translated translations for the new language
   */
  async addLanguage(langCode, langName) {
    if (this.languages[langCode]) {
      throw new Error(`Language '${langCode}' already exists`);
    }

    console.log(`Adding new language: ${langName} (${langCode})`);

    // Start with empty translations
    this.languages[langCode] = {
      name: langName,
      translations: {}
    };

    // Auto-translate from English
    const translations = await this.autoTranslateLanguage(langCode);

    return translations;
  }

  /**
   * Update a specific translation key
   * @param {string} langCode - Language code
   * @param {string} key - Translation key (dot notation)
   * @param {string} value - New translation value
   */
  updateTranslation(langCode, key, value) {
    if (!this.languages[langCode]) {
      throw new Error(`Language '${langCode}' not supported`);
    }

    const keys = key.split('.');
    let current = this.languages[langCode].translations;

    // Navigate to the nested object
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    // Set the value
    current[keys[keys.length - 1]] = value;
  }

  /**
   * Get a translation value
   * @param {string} langCode - Language code
   * @param {string} key - Translation key (dot notation)
   * @returns {string|object} Translation value
   */
  getTranslation(langCode, key) {
    if (!this.languages[langCode]) {
      throw new Error(`Language '${langCode}' not supported`);
    }

    const keys = key.split('.');
    let current = this.languages[langCode].translations;

    for (const k of keys) {
      if (!current || typeof current !== 'object') {
        return undefined;
      }
      current = current[k];
    }

    return current;
  }
}

// Export singleton instance
export const translationManager = new TranslationManager();
export default translationManager;