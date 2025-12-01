import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiFileText, FiUsers, FiShield, FiAlertTriangle, FiDollarSign, FiAward } from 'react-icons/fi';
import './TermsOfService.css';

const TermsOfService = () => {
  const { t } = useTranslation();
  const sections = [
    {
      icon: <FiFileText />,
      title: t('faq.terms.acceptance_title'),
      content: t('faq.terms.acceptance_text')
    },
    {
      icon: <FiUsers />,
      title: t('faq.terms.user_accounts_title'),
      content: t('faq.terms.user_accounts_text')
    },
    {
      icon: <FiShield />,
      title: t('faq.terms.platform_usage_title'),
      content: t('faq.terms.platform_usage_text')
    },
    {
      icon: <FiAlertTriangle />,
      title: t('faq.terms.content_accuracy_title'),
      content: t('faq.terms.content_accuracy_text')
    },
    {
      icon: <FiDollarSign />,
      title: t('faq.terms.fees_payments_title'),
      content: t('faq.terms.fees_payments_text')
    },
    {
      icon: <FiAward />,
      title: t('faq.terms.liability_title'),
      content: t('faq.terms.liability_text')
    }
  ];

  const serviceTerms = [
    {
      title: t('faq.terms.service_terms.schemes.title'),
      points: t('faq.terms.service_terms.schemes.points', { returnObjects: true })
    },
    {
      title: t('faq.terms.service_terms.marketplace.title'),
      points: t('faq.terms.service_terms.marketplace.points', { returnObjects: true })
    },
    {
      title: t('faq.terms.service_terms.ai_services.title'),
      points: t('faq.terms.service_terms.ai_services.points', { returnObjects: true })
    }
  ];

  return (
    <div className="terms-page">
      {/* Hero Section */}
      <section className="terms-hero">
        <div className="container">
          <div className="terms-hero-content">
            <FiFileText className="terms-icon" />
            <h1>{t('faq.terms.title')}</h1>
            <p>
              {t('faq.terms.subtitle')}
            </p>
            <div className="terms-meta">
              <span>{t('faq.privacy.last_updated')}: November 2024</span>
              <span>{t('faq.privacy.effective')}: November 2024</span>
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="terms-overview">
        <div className="container">
          <div className="overview-content">
            <h2>{t('faq.terms.overview_title')}</h2>
            <p>
              {t('faq.terms.overview_text1')}
            </p>
            <p>
              {t('faq.terms.overview_text2')}
            </p>
          </div>
        </div>
      </section>

      {/* Main Terms */}
      <section className="terms-content">
        <div className="container">
          <div className="terms-grid">
            {sections.map((section, index) => (
              <div key={index} className="terms-section">
                <div className="section-header">
                  <div className="section-icon">
                    {section.icon}
                  </div>
                  <h3>{section.title}</h3>
                </div>
                <p className="section-content">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service-Specific Terms */}
      <section className="service-terms">
        <div className="container">
          <h2>{t('faq.terms.service_terms_title')}</h2>
          <div className="service-grid">
            {serviceTerms.map((service, index) => (
              <div key={index} className="service-card">
                <h3>{service.title}</h3>
                <ul>
                  {service.points.map((point, pointIndex) => (
                    <li key={pointIndex}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Responsibilities */}
      <section className="user-responsibilities">
        <div className="container">
          <div className="responsibilities-content">
            <h2>{t('faq.terms.user_responsibilities_title')}</h2>
            <div className="responsibilities-grid">
              <div className="responsibility-item">
                <h4>{t('faq.terms.user_responsibilities.accurate_info.title')}</h4>
                <p>{t('faq.terms.user_responsibilities.accurate_info.description')}</p>
              </div>
              <div className="responsibility-item">
                <h4>{t('faq.terms.user_responsibilities.legal_compliance.title')}</h4>
                <p>{t('faq.terms.user_responsibilities.legal_compliance.description')}</p>
              </div>
              <div className="responsibility-item">
                <h4>{t('faq.terms.user_responsibilities.account_security.title')}</h4>
                <p>{t('faq.terms.user_responsibilities.account_security.description')}</p>
              </div>
              <div className="responsibility-item">
                <h4>{t('faq.terms.user_responsibilities.content_ownership.title')}</h4>
                <p>{t('faq.terms.user_responsibilities.content_ownership.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Termination */}
      <section className="termination-section">
        <div className="container">
          <div className="termination-content">
            <h2>{t('faq.terms.termination_title')}</h2>
            <p>
              {t('faq.terms.termination_text1')}
            </p>
            <p>
              {t('faq.terms.termination_text2')}
            </p>
          </div>
        </div>
      </section>

      {/* Governing Law */}
      <section className="governing-law">
        <div className="container">
          <div className="law-content">
            <h2>{t('faq.terms.governing_law_title')}</h2>
            <p>
              {t('faq.terms.governing_law_text')}
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="terms-contact">
        <div className="container">
          <div className="contact-content">
            <h2>{t('faq.terms.contact_title')}</h2>
            <p>
              {t('faq.terms.contact_description')}
            </p>
            <div className="contact-info">
              <div className="contact-item">
                <strong>Email:</strong> {t('faq.terms.contact_info.email')}
              </div>
              <div className="contact-item">
                <strong>Phone:</strong> {t('faq.terms.contact_info.phone')}
              </div>
              <div className="contact-item">
                <strong>Address:</strong> {t('faq.terms.contact_info.address')}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfService;