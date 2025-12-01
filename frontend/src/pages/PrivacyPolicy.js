import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiShield, FiLock, FiEye, FiDatabase, FiUsers, FiMail } from 'react-icons/fi';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  const sections = [
    {
      icon: <FiShield />,
      title: t('faq.privacy.sections.collect.title'),
      content: t('faq.privacy.sections.collect.items', { returnObjects: true })
    },
    {
      icon: <FiLock />,
      title: t('faq.privacy.sections.use.title'),
      content: t('faq.privacy.sections.use.items', { returnObjects: true })
    },
    {
      icon: <FiDatabase />,
      title: t('faq.privacy.sections.storage.title'),
      content: t('faq.privacy.sections.storage.items', { returnObjects: true })
    },
    {
      icon: <FiEye />,
      title: t('faq.privacy.sections.sharing.title'),
      content: t('faq.privacy.sections.sharing.items', { returnObjects: true })
    },
    {
      icon: <FiUsers />,
      title: t('faq.privacy.sections.rights.title'),
      content: t('faq.privacy.sections.rights.items', { returnObjects: true })
    }
  ];

  return (
    <div className="privacy-page">
      {/* Hero Section */}
      <section className="privacy-hero">
        <div className="container">
          <div className="privacy-hero-content">
            <FiShield className="privacy-icon" />
            <h1>{t('faq.privacy.title')}</h1>
            <p>
              {t('faq.privacy.subtitle')}
            </p>
            <div className="policy-meta">
              <span>{t('faq.privacy.last_updated')}: November 2024</span>
              <span>{t('faq.privacy.effective')}: November 2024</span>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="privacy-intro">
        <div className="container">
          <div className="intro-content">
            <h2>{t('faq.privacy.commitment_title')}</h2>
            <p>
              {t('faq.privacy.commitment_text1')}
            </p>
            <p>
              {t('faq.privacy.commitment_text2')}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="privacy-content">
        <div className="container">
          <div className="content-grid">
            {sections.map((section, index) => (
              <div key={index} className="policy-section">
                <div className="section-header">
                  <div className="section-icon">
                    {section.icon}
                  </div>
                  <h3>{section.title}</h3>
                </div>
                <ul className="policy-list">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cookies Section */}
      <section className="cookies-section">
        <div className="container">
          <div className="cookies-content">
            <h2>{t('faq.privacy.cookies_title')}</h2>
            <p>
              {t('faq.privacy.cookies_description')}
            </p>
            <div className="cookie-types">
              <div className="cookie-type">
                <h4>{t('faq.privacy.cookie_types.essential.title')}</h4>
                <p>{t('faq.privacy.cookie_types.essential.description')}</p>
              </div>
              <div className="cookie-type">
                <h4>{t('faq.privacy.cookie_types.analytics.title')}</h4>
                <p>{t('faq.privacy.cookie_types.analytics.description')}</p>
              </div>
              <div className="cookie-type">
                <h4>{t('faq.privacy.cookie_types.preference.title')}</h4>
                <p>{t('faq.privacy.cookie_types.preference.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="privacy-contact">
        <div className="container">
          <div className="contact-content">
            <h2>{t('faq.privacy.contact_title')}</h2>
            <p>
              {t('faq.privacy.contact_description')}
            </p>
            <div className="contact-options">
              <div className="contact-item">
                <FiMail />
                <div>
                  <strong>Email:</strong>
                  <a href={`mailto:${t('faq.privacy.contact_email')}`}>{t('faq.privacy.contact_email')}</a>
                </div>
              </div>
              <div className="contact-item">
                <FiShield />
                <div>
                  <strong>Data Protection Officer:</strong>
                  <a href={`mailto:${t('faq.privacy.contact_dpo')}`}>{t('faq.privacy.contact_dpo')}</a>
                </div>
              </div>
            </div>
            <div className="contact-note">
              <p>
                {t('faq.privacy.contact_note')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Updates Section */}
      <section className="policy-updates">
        <div className="container">
          <div className="updates-content">
            <h2>{t('faq.privacy.updates_title')}</h2>
            <p>
              {t('faq.privacy.updates_text1')}
            </p>
            <p>
              {t('faq.privacy.updates_text2')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;