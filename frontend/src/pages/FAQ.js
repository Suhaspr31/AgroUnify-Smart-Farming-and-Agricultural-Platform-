import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiChevronDown, FiChevronUp, FiHelpCircle, FiPhone, FiMail, FiMessageCircle } from 'react-icons/fi';
import './FAQ.css';

const FAQ = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData = [
    {
      question: t('faq.questions.what_is_agrounify.question'),
      answer: t('faq.questions.what_is_agrounify.answer')
    },
    {
      question: t('faq.questions.account_creation.question'),
      answer: t('faq.questions.account_creation.answer')
    },
    {
      question: t('faq.questions.free_service.question'),
      answer: t('faq.questions.free_service.answer')
    },
    {
      question: t('faq.questions.crop_disease_detection.question'),
      answer: t('faq.questions.crop_disease_detection.answer')
    },
    {
      question: t('faq.questions.sell_produce.question'),
      answer: t('faq.questions.sell_produce.answer')
    },
    {
      question: t('faq.questions.government_schemes.question'),
      answer: t('faq.questions.government_schemes.answer')
    },
    {
      question: t('faq.questions.available_schemes.question'),
      answer: t('faq.questions.available_schemes.answer')
    },
    {
      question: t('faq.questions.weather_accuracy.question'),
      answer: t('faq.questions.weather_accuracy.answer')
    },
    {
      question: t('faq.questions.track_application.question'),
      answer: t('faq.questions.track_application.answer')
    },
    {
      question: t('faq.questions.supported_crops.question'),
      answer: t('faq.questions.supported_crops.answer')
    },
    {
      question: t('faq.questions.get_help.question'),
      answer: t('faq.questions.get_help.answer')
    },
    {
      question: t('faq.questions.data_security.question'),
      answer: t('faq.questions.data_security.answer')
    },
    {
      question: t('faq.questions.mobile_access.question'),
      answer: t('faq.questions.mobile_access.answer')
    },
    {
      question: t('faq.questions.update_farm_info.question'),
      answer: t('faq.questions.update_farm_info.answer')
    },
    {
      question: t('faq.questions.languages_supported.question'),
      answer: t('faq.questions.languages_supported.answer')
    }
  ];

  const supportOptions = [
    {
      icon: <FiPhone />,
      title: t('faq.support_options.phone.title'),
      description: t('faq.support_options.phone.description'),
      details: t('faq.support_options.phone.details'),
      action: "tel:1800-XXX-XXXX"
    },
    {
      icon: <FiMail />,
      title: t('faq.support_options.email.title'),
      description: t('faq.support_options.email.description'),
      details: t('faq.support_options.email.details'),
      action: "mailto:support@agrounify.com"
    },
    {
      icon: <FiMessageCircle />,
      title: t('faq.support_options.chat.title'),
      description: t('faq.support_options.chat.description'),
      details: t('faq.support_options.chat.details'),
      action: "#"
    }
  ];

  return (
    <div className="faq-page">
      {/* Hero Section */}
      <section className="faq-hero">
        <div className="container">
          <div className="faq-hero-content">
            <FiHelpCircle className="faq-icon" />
            <h1>{t('faq.title')}</h1>
            <p>
              {t('faq.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <div className="faq-grid">
            {faqData.map((faq, index) => (
              <div key={index} className="faq-item">
                <button
                  className="faq-question"
                  onClick={() => toggleFAQ(index)}
                >
                  <span>{faq.question}</span>
                  {openIndex === index ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {openIndex === index && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="support-section">
        <div className="container">
          <div className="support-header">
            <h2>{t('faq.support_title')}</h2>
            <p>{t('faq.support_subtitle')}</p>
          </div>
          <div className="support-grid">
            {supportOptions.map((option, index) => (
              <div key={index} className="support-card">
                <div className="support-icon">
                  {option.icon}
                </div>
                <div className="support-content">
                  <h3>{option.title}</h3>
                  <p className="support-description">{option.description}</p>
                  <p className="support-details">{option.details}</p>
                  <a
                    href={option.action}
                    className="support-link"
                    onClick={(e) => {
                      if (option.action === '#') {
                        e.preventDefault();
                        // Handle live chat opening
                        alert('Live chat feature coming soon!');
                      }
                    }}
                  >
                   {option.action === "tel:1800-XXX-XXXX" ? t('faq.support_options.phone.action') :
                    option.action === "mailto:support@agrounify.com" ? t('faq.support_options.email.action') :
                    t('faq.support_options.chat.action')}
                 </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="quick-links">
        <div className="container">
          <h2>{t('faq.quick_links_title')}</h2>
          <div className="links-grid">
            <a href="/schemes" className="link-card">
              <h3>{t('faq.quick_links.schemes.title')}</h3>
              <p>{t('faq.quick_links.schemes.description')}</p>
            </a>
            <a href="/schemes/status" className="link-card">
              <h3>{t('faq.quick_links.status.title')}</h3>
              <p>{t('faq.quick_links.status.description')}</p>
            </a>
            <a href="/crop-doctor" className="link-card">
              <h3>{t('faq.quick_links.crop_doctor.title')}</h3>
              <p>{t('faq.quick_links.crop_doctor.description')}</p>
            </a>
            <a href="/marketplace" className="link-card">
              <h3>{t('faq.quick_links.marketplace.title')}</h3>
              <p>{t('faq.quick_links.marketplace.description')}</p>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;