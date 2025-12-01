# 🌐 AgroUnify Translation System

A comprehensive, automated multilingual system for the AgroUnify agricultural platform supporting farmers across India.

## 🎯 Supported Languages

- **🇺🇸 English** (en) - Base language
- **🇮🇳 Hindi** (hi) - हिन्दी
- **🇮🇳 Kannada** (kn) - ಕನ್ನಡ
- **🇮🇳 Telugu** (te) - తెలుగు

## 🚀 Features

- **100% Complete Translation**: Every text element on the website is translated
- **Automated Translation**: Uses MyMemory API for instant translation of new content
- **Persistent Language Selection**: User's language choice is saved across sessions
- **Real-time Language Switching**: Instant UI updates when changing languages
- **Backend Support**: Chatbot and API responses adapt to selected language
- **Easy Management**: Command-line tools for translation management

## 📊 Translation Statistics

```
📊 Translation Statistics

English (en):   215 strings - 100.0% complete
Hindi (hi):     215 strings - 100.0% complete
Kannada (kn):   215 strings - 100.0% complete
Telugu (te):    215 strings - 100.0% complete
```

## 🛠️ Quick Start

### Using the Language Selector

1. Look for the language dropdown in the top-right header
2. Select your preferred language (English, हिंदी, ಕನ್ನಡ, తెలుగు)
3. The entire website instantly switches to your selected language
4. Your choice is automatically saved for future visits

### For Developers: Managing Translations

#### Check Translation Status

```bash
cd frontend
npm run translate:stats
```

#### Auto-translate a Specific Language

```bash
npm run translate:lang hi    # Translate Hindi
npm run translate:lang kn    # Translate Kannada
```

#### Auto-translate All Languages

```bash
npm run translate:all
```

#### Add a New Language

```bash
node ../scripts/translate.js --add ta Tamil
```

#### Find Missing Translations

```bash
node ../scripts/translate.js --missing hi
```

## 🏗️ Architecture

### Frontend Components

- **LanguageSelector**: Dropdown component in header
- **i18n Configuration**: React-i18next setup with all languages
- **Translation Keys**: Structured JSON files for each language

### Backend Integration

- **Chatbot**: Responds in user's selected language
- **API Localization**: Middleware for language-aware responses

### Translation Management

- **TranslationService**: API integration for automated translation
- **TranslationManager**: Utilities for managing translation files
- **CLI Tools**: Command-line scripts for batch operations

## 📁 File Structure

```
frontend/src/
├── i18n/
│   ├── en.json          # English translations (base)
│   ├── hi.json          # Hindi translations
│   ├── kn.json          # Kannada translations
│   ├── te.json          # Telugu translations
│   └── i18n.js          # i18n configuration
├── services/
│   └── translationService.js    # Translation API service
├── utils/
│   └── translationManager.js    # Translation management utilities
└── components/common/
    └── LanguageSelector.js      # Language selection UI

scripts/
├── translate.js                 # Main translation CLI
└── translationUtils.js          # Node.js utilities
```

## 🔧 Technical Implementation

### Translation Keys Structure

```json
{
  "common": {
    "home": "Home",
    "login": "Login",
    "brand_name": "AgroUnify"
  },
  "home": {
    "hero": {
      "title": "Empowering Farmers with Technology",
      "subtitle": "AgroUnify connects farmers..."
    }
  }
}
```

### Component Usage

```jsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("home.hero.title")}</h1>
      <p>{t("home.hero.subtitle")}</p>
      <button>{t("common.login")}</button>
    </div>
  );
}
```

## 🌐 Translation API

Uses **MyMemory Translation API** (free, no API key required):

- Rate-limited but sufficient for development
- Supports major Indian languages
- Automatic fallback to original text on failure

### For Production

Consider upgrading to:

- **LibreTranslate** (self-hosted for full control)
- **Google Translate API** (paid, high quality)
- **Azure Translator** (enterprise-grade)

## 🚀 Adding New Languages

1. **Auto-translate** using the CLI:

   ```bash
   node ../scripts/translate.js --add mr Marathi
   ```

2. **Manual review** of auto-translated content for accuracy

3. **Update UI** components to include the new language option

4. **Test thoroughly** across all pages

## 📈 Benefits

- **Accessibility**: Farmers can use the platform in their native language
- **User Experience**: Seamless language switching without page reload
- **Scalability**: Easy to add new languages as the platform grows
- **Maintenance**: Automated tools reduce manual translation effort
- **Quality**: Professional-grade translation system

## 🔍 Quality Assurance

- **Automated Testing**: Translation completeness checks
- **Manual Review**: Native speakers validate translations
- **Fallback Handling**: Graceful degradation if translations fail
- **Performance**: Cached translations for fast loading

## 🎯 Use Cases

- **Farmers in Hindi-speaking regions** (UP, Bihar, Rajasthan, etc.)
- **Farmers in Kannada-speaking regions** (Karnataka)
- **Farmers in Telugu-speaking regions** (Andhra Pradesh, Telangana)
- **English-speaking users** (urban farmers, agricultural experts)

## 📞 Support

For translation-related issues:

1. Check translation statistics: `npm run translate:stats`
2. Find missing translations: `node ../scripts/translate.js --missing [lang]`
3. Auto-translate missing content: `npm run translate:lang [lang]`

---

**AgroUnify** - Empowering farmers with technology, accessible in every language! 🌾🇮🇳
