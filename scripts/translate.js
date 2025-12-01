#!/usr/bin/env node

/**
 * Translation Management Script
 * Run this script to auto-translate missing translations
 *
 * Usage:
 *   node scripts/translate.js                    # Auto-translate all languages
 *   node scripts/translate.js --lang hi          # Auto-translate only Hindi
 *   node scripts/translate.js --stats            # Show translation statistics
 *   node scripts/translate.js --missing hi       # Show missing translations for Hindi
 *   node scripts/translate.js --add te Telugu    # Add new language (Telugu)
 */

const fs = require('fs');
const path = require('path');

// Import Node.js compatible translation utilities
const { SimpleTranslationManager } = require('./translationUtils');

const translationManager = new SimpleTranslationManager();

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  try {
    switch (command) {
      case '--stats':
        showStats();
        break;

      case '--missing':
        const langCode = args[1];
        if (!langCode) {
          console.error('Please specify a language code: --missing hi');
          process.exit(1);
        }
        showMissing(langCode);
        break;

      case '--lang':
        const targetLang = args[1];
        if (!targetLang) {
          console.error('Please specify a language code: --lang hi');
          process.exit(1);
        }
        await translateLanguage(targetLang);
        break;

      case '--add':
        const newLangCode = args[1];
        const newLangName = args[2];
        if (!newLangCode || !newLangName) {
          console.error('Please specify language code and name: --add te Telugu');
          process.exit(1);
        }
        await addLanguage(newLangCode, newLangName);
        break;

      default:
        await translateAll();
        break;
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

function showStats() {
  console.log('📊 Translation Statistics\n');
  const stats = translationManager.getTranslationStats();

  for (const [langCode, stat] of Object.entries(stats)) {
    console.log(`${stat.name} (${langCode}):`);
    console.log(`  Total strings: ${stat.total}`);
    console.log(`  Translated: ${stat.translated}`);
    console.log(`  Missing: ${stat.missing}`);
    console.log(`  Completion: ${stat.completionRate}`);
    console.log('');
  }
}

function showMissing(langCode) {
  const missing = translationManager.findMissingTranslations(langCode);
  const langName = translationManager.getLanguages()[langCode]?.name || langCode;

  console.log(`❌ Missing translations for ${langName} (${langCode}):\n`);

  if (missing.length === 0) {
    console.log('✅ All translations are complete!');
  } else {
    missing.forEach(key => console.log(`  - ${key}`));
    console.log(`\nTotal missing: ${missing.length}`);
  }
}

async function translateLanguage(langCode) {
  const languages = translationManager.getLanguages();
  if (!languages[langCode]) {
    console.error(`Language '${langCode}' not supported. Available: ${Object.keys(languages).join(', ')}`);
    process.exit(1);
  }

  console.log(`🚀 Starting auto-translation for ${languages[langCode].name}...\n`);

  const updatedTranslations = await translationManager.autoTranslateLanguage(langCode);

  // Save to file
  const filePath = path.join(__dirname, '..', 'frontend', 'src', 'i18n', `${langCode}.json`);
  fs.writeFileSync(filePath, JSON.stringify(updatedTranslations, null, 2), 'utf8');

  console.log(`✅ Auto-translation completed and saved to ${filePath}`);
}

async function translateAll() {
  console.log('🚀 Starting auto-translation for all languages...\n');

  const results = await translationManager.autoTranslateAllLanguages();

  // Save all updated translations
  for (const [langCode, translations] of Object.entries(results)) {
    const filePath = path.join(__dirname, '..', 'frontend', 'src', 'i18n', `${langCode}.json`);
    fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf8');
    console.log(`✅ Saved translations for ${langCode} to ${filePath}`);
  }

  console.log('\n🎉 All languages auto-translated successfully!');
}

async function addLanguage(langCode, langName) {
  console.log(`➕ Adding new language: ${langName} (${langCode})\n`);

  const translations = await translationManager.addLanguage(langCode, langName);

  // Save to new file
  const filePath = path.join(__dirname, '..', 'frontend', 'src', 'i18n', `${langCode}.json`);
  fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf8');

  // Update i18n.js to include the new language
  updateI18nConfig(langCode, langName);

  console.log(`✅ New language ${langName} (${langCode}) added and saved to ${filePath}`);
  console.log('🔧 Updated i18n.js configuration');
}

function updateI18nConfig(langCode, langName) {
  const i18nPath = path.join(__dirname, '..', 'frontend', 'src', 'i18n', 'i18n.js');
  let i18nContent = fs.readFileSync(i18nPath, 'utf8');

  // Add import statement
  const importPattern = /import knTranslations from '\.\/kn\.json';/;
  const newImport = `import knTranslations from './kn.json';\nimport ${langCode}Translations from './${langCode}.json';`;
  i18nContent = i18nContent.replace(importPattern, newImport);

  // Add to resources object
  const resourcesPattern = /kn: \{\s*translation: knTranslations\s*\}/;
  const newResource = `kn: {
    translation: knTranslations
  },
  ${langCode}: {
    translation: ${langCode}Translations
  }`;
  i18nContent = i18nContent.replace(resourcesPattern, newResource);

  fs.writeFileSync(i18nPath, i18nContent, 'utf8');
}

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = { translationManager };