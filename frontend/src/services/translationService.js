/**
 * Translation Service using MyMemory API (free, no API key required)
 * For production, consider using LibreTranslate self-hosted instance
 */

const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';

class TranslationService {
  constructor() {
    this.cache = new Map();
    this.isTranslating = false;
  }

  /**
   * Translate text using MyMemory API
   * @param {string} text - Text to translate
   * @param {string} from - Source language (e.g., 'en')
   * @param {string} to - Target language (e.g., 'hi', 'kn')
   * @returns {Promise<string>} Translated text
   */
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
        de: 'your-email@example.com' // Optional: helps with rate limiting
      });

      const response = await fetch(`${MYMEMORY_API_URL}?${params}`);
      const data = await response.json();

      if (data.responseData && data.responseData.translatedText) {
        const translatedText = data.responseData.translatedText;
        this.cache.set(cacheKey, translatedText);
        return translatedText;
      }

      // Fallback: return original text if translation fails
      console.warn(`Translation failed for: "${text}" from ${from} to ${to}`);
      return text;

    } catch (error) {
      console.error('Translation API error:', error);
      return text;
    }
  }

  /**
   * Translate an object recursively
   * @param {object} obj - Object to translate
   * @param {string} from - Source language
   * @param {string} to - Target language
   * @returns {Promise<object>} Translated object
   */
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

  /**
   * Auto-translate missing translations in a language file
   * @param {object} sourceTranslations - Source language translations (English)
   * @param {object} targetTranslations - Target language translations
   * @param {string} targetLang - Target language code
   * @returns {Promise<object>} Updated translations with auto-translated missing keys
   */
  async autoTranslateMissing(sourceTranslations, targetTranslations, targetLang) {
    const updated = { ...targetTranslations };

    for (const [key, value] of Object.entries(sourceTranslations)) {
      if (!(key in updated)) {
        // Key missing in target language, auto-translate
        if (typeof value === 'string') {
          updated[key] = await this.translateText(value, 'en', targetLang);
          console.log(`Auto-translated: ${key} -> "${updated[key]}"`);
        } else if (typeof value === 'object' && value !== null) {
          updated[key] = await this.translateObject(value, 'en', targetLang);
        }
      } else if (typeof value === 'object' && typeof updated[key] === 'object') {
        // Recursively check nested objects
        updated[key] = await this.autoTranslateMissing(value, updated[key], targetLang);
      }
    }

    return updated;
  }

  /**
   * Batch translate multiple strings
   * @param {string[]} texts - Array of texts to translate
   * @param {string} from - Source language
   * @param {string} to - Target language
   * @returns {Promise<string[]>} Array of translated texts
   */
  async batchTranslate(texts, from, to) {
    const results = [];
    for (const text of texts) {
      results.push(await this.translateText(text, from, to));
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return results;
  }

  /**
   * Clear translation cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache size
   * @returns {number} Number of cached translations
   */
  getCacheSize() {
    return this.cache.size;
  }
}

// Export singleton instance
export const translationService = new TranslationService();
export default translationService;