import React from 'react';
import { FiDollarSign, FiClock, FiCheckCircle, FiXCircle, FiAlertTriangle, FiCreditCard } from 'react-icons/fi';
import './RefundPolicy.css';

const RefundPolicy = () => {
  const refundScenarios = [
    {
      icon: <FiCheckCircle />,
      title: "Eligible for Refund",
      scenarios: [
        "Service unavailability for more than 24 hours due to our fault",
        "Premium subscription canceled within 7 days (cooling-off period)",
        "Duplicate or erroneous charges on your account",
        "Technical issues preventing access to paid features"
      ],
      color: "#4CAF50"
    },
    {
      icon: <FiXCircle />,
      title: "Not Eligible for Refund",
      scenarios: [
        "Change of mind after using the service",
        "Dissatisfaction with free service features",
        "Expired promotional offers or discounts",
        "Third-party service interruptions (payment gateways, etc.)"
      ],
      color: "#F44336"
    },
    {
      icon: <FiClock />,
      title: "Partial Refunds",
      scenarios: [
        "Pro-rated refunds for unused subscription periods",
        "Partial service delivery due to technical issues",
        "Marketplace transaction disputes (case-by-case basis)",
        "Account suspension due to policy violations"
      ],
      color: "#FF9800"
    }
  ];

  const refundProcess = [
    {
      step: 1,
      title: "Submit Refund Request",
      description: "Contact our support team with your refund reason and relevant details",
      timeframe: "Within 30 days of charge"
    },
    {
      step: 2,
      title: "Review and Verification",
      description: "Our team reviews your request and verifies eligibility",
      timeframe: "2-5 business days"
    },
    {
      step: 3,
      title: "Approval and Processing",
      description: "Approved refunds are processed back to original payment method",
      timeframe: "5-10 business days"
    },
    {
      step: 4,
      title: "Confirmation",
      description: "You receive confirmation once refund is completed",
      timeframe: "Email notification"
    }
  ];

  const paymentMethods = [
    {
      method: "Credit/Debit Cards",
      processing: "5-7 business days",
      notes: "Processed through bank networks"
    },
    {
      method: "UPI/Net Banking",
      processing: "3-5 business days",
      notes: "Direct bank transfer"
    },
    {
      method: "Digital Wallets",
      processing: "2-3 business days",
      notes: "Instant processing available"
    }
  ];

  return (
    <div className="refund-page">
      {/* Hero Section */}
      <section className="refund-hero">
        <div className="container">
          <div className="refund-hero-content">
            <FiDollarSign className="refund-icon" />
            <h1>Refund Policy</h1>
            <p>
              We strive to provide excellent service, but we understand that sometimes
              refunds are necessary. Learn about our fair and transparent refund process.
            </p>
            <div className="policy-highlights">
              <div className="highlight">
                <FiClock />
                <span>30-day refund window</span>
              </div>
              <div className="highlight">
                <FiCheckCircle />
                <span>Fair evaluation process</span>
              </div>
              <div className="highlight">
                <FiCreditCard />
                <span>Original payment method</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="refund-overview">
        <div className="container">
          <div className="overview-content">
            <h2>Our Refund Commitment</h2>
            <p>
              At AgroUnify, customer satisfaction is our priority. We offer refunds in cases
              where our service doesn't meet expectations or technical issues prevent proper
              service delivery. Our refund policy is designed to be fair, transparent, and
              customer-friendly.
            </p>
            <div className="refund-stats">
              <div className="stat">
                <h3>30 Days</h3>
                <p>Refund Request Window</p>
              </div>
              <div className="stat">
                <h3>5 Days</h3>
                <p>Average Processing Time</p>
              </div>
              <div className="stat">
                <h3>95%</h3>
                <p>Customer Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Refund Scenarios */}
      <section className="refund-scenarios">
        <div className="container">
          <h2>When Can You Get a Refund?</h2>
          <div className="scenarios-grid">
            {refundScenarios.map((scenario, index) => (
              <div key={index} className="scenario-card">
                <div className="scenario-header">
                  <div
                    className="scenario-icon"
                    style={{ backgroundColor: scenario.color }}
                  >
                    {scenario.icon}
                  </div>
                  <h3>{scenario.title}</h3>
                </div>
                <ul className="scenario-list">
                  {scenario.scenarios.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Refund Process */}
      <section className="refund-process">
        <div className="container">
          <h2>How Refund Requests Are Processed</h2>
          <div className="process-timeline">
            {refundProcess.map((step, index) => (
              <div key={index} className="process-step">
                <div className="step-number">{step.step}</div>
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  <span className="step-timeframe">{step.timeframe}</span>
                </div>
                {index < refundProcess.length - 1 && <div className="step-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="payment-methods">
        <div className="container">
          <h2>Refund Processing by Payment Method</h2>
          <div className="methods-grid">
            {paymentMethods.map((method, index) => (
              <div key={index} className="method-card">
                <h3>{method.method}</h3>
                <div className="method-details">
                  <div className="processing-time">
                    <FiClock />
                    <span>{method.processing}</span>
                  </div>
                  <p className="method-notes">{method.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="refund-notes">
        <div className="container">
          <div className="notes-content">
            <FiAlertTriangle className="notes-icon" />
            <h2>Important Notes</h2>
            <div className="notes-grid">
              <div className="note-item">
                <h4>Refund Timeframes</h4>
                <p>All refund requests must be submitted within 30 days of the original transaction.</p>
              </div>
              <div className="note-item">
                <h4>Processing Fees</h4>
                <p>Original payment processing fees are not refundable as per banking regulations.</p>
              </div>
              <div className="note-item">
                <h4>Partial Refunds</h4>
                <p>Partial refunds may apply for subscriptions or services used before cancellation.</p>
              </div>
              <div className="note-item">
                <h4>Disputes</h4>
                <p>Unresolved refund disputes can be escalated to consumer courts as per Indian law.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="refund-contact">
        <div className="container">
          <div className="contact-content">
            <h2>Need Help with a Refund?</h2>
            <p>
              Our customer support team is here to help you with any refund-related queries
              or concerns. Please provide your transaction details for faster processing.
            </p>
            <div className="contact-options">
              <div className="contact-item">
                <strong>Email:</strong>
                <a href="mailto:refunds@agrounify.com">refunds@agrounify.com</a>
              </div>
              <div className="contact-item">
                <strong>Phone:</strong>
                <a href="tel:1800-XXX-XXXX">1800-XXX-XXXX</a>
              </div>
              <div className="contact-item">
                <strong>Support Hours:</strong>
                <span>Mon-Sat, 9 AM - 6 PM IST</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RefundPolicy;