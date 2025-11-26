import React from 'react';
import { FiTarget, FiEye, FiHeart, FiUsers, FiTrendingUp, FiShield } from 'react-icons/fi';
import './About.css';

const About = () => {
  const values = [
    {
      icon: <FiTarget />,
      title: 'Innovation',
      description: 'Leveraging cutting-edge technology to solve agricultural challenges'
    },
    {
      icon: <FiHeart />,
      title: 'Sustainability',
      description: 'Promoting eco-friendly farming practices for a better future'
    },
    {
      icon: <FiUsers />,
      title: 'Community',
      description: 'Building strong connections between farmers, buyers, and experts'
    },
    {
      icon: <FiShield />,
      title: 'Trust',
      description: 'Ensuring transparency and reliability in all our services'
    }
  ];

  const team = [
    {
      name: 'Rajesh Kumar',
      role: 'Founder & CEO',
      image: '/assets/images/team/rajesh.jpg',
      description: 'Agricultural engineer with 15+ years of experience in farming technology.'
    },
    {
      name: 'Priya Sharma',
      role: 'CTO',
      image: '/assets/images/team/priya.jpg',
      description: 'Tech expert specializing in IoT and data analytics for agriculture.'
    },
    {
      name: 'Amit Patel',
      role: 'Head of Operations',
      image: '/assets/images/team/amit.jpg',
      description: 'Operations specialist with deep knowledge of supply chain management.'
    }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content">
            <h1>About AgroUnify</h1>
            <p>
              We're on a mission to revolutionize agriculture through technology, 
              empowering farmers with the tools and knowledge they need to succeed 
              in today's competitive market.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="story">
        <div className="container">
          <div className="story-content">
            <div className="story-text">
              <h2>Our Story</h2>
              <p>
                AgroUnify was born from a simple observation: farmers across India 
                have immense knowledge and passion for agriculture, but often lack 
                access to modern tools, market information, and fair pricing.
              </p>
              <p>
                Founded in 2023, we set out to bridge this gap by creating a 
                comprehensive digital platform that connects farmers with technology, 
                markets, and each other. Our goal is to make farming more profitable, 
                sustainable, and efficient.
              </p>
              <p>
                Today, we serve thousands of farmers across multiple states, helping 
                them increase their yields, reduce costs, and access better markets 
                for their produce.
              </p>
            </div>
            <div className="story-image">
              <img src="/assets/images/about-story.jpg" alt="Our Story" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-vision">
        <div className="container">
          <div className="mv-grid">
            <div className="mv-card">
              <div className="mv-icon">
                <FiTarget />
              </div>
              <h3>Our Mission</h3>
              <p>
                To empower farmers with cutting-edge technology and market access, 
                enabling them to maximize their productivity and profitability while 
                promoting sustainable agricultural practices.
              </p>
            </div>
            <div className="mv-card">
              <div className="mv-icon">
                <FiEye />
              </div>
              <h3>Our Vision</h3>
              <p>
                To create a world where every farmer has access to the knowledge, 
                tools, and markets they need to thrive, contributing to global 
                food security and rural prosperity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values">
        <div className="container">
          <div className="section-header">
            <h2>Our Values</h2>
            <p>The principles that guide everything we do</p>
          </div>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team">
        <div className="container">
          <div className="section-header">
            <h2>Meet Our Team</h2>
            <p>Passionate individuals working to transform agriculture</p>
          </div>
          <div className="team-grid">
            {team.map((member, index) => (
              <div key={index} className="team-card">
                <div className="member-image">
                  <img src={member.image} alt={member.name} />
                </div>
                <div className="member-info">
                  <h3>{member.name}</h3>
                  <p className="role">{member.role}</p>
                  <p className="description">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="impact">
        <div className="container">
          <div className="section-header">
            <h2>Our Impact</h2>
            <p>Making a difference in the agricultural community</p>
          </div>
          <div className="impact-grid">
            <div className="impact-stat">
              <div className="stat-icon">
                <FiUsers />
              </div>
              <h3>10,000+</h3>
              <p>Farmers Empowered</p>
            </div>
            <div className="impact-stat">
              <div className="stat-icon">
                <FiTrendingUp />
              </div>
              <h3>25%</h3>
              <p>Average Yield Increase</p>
            </div>
            <div className="impact-stat">
              <div className="stat-icon">
                <FiTarget />
              </div>
              <h3>₹50Cr+</h3>
              <p>Farmer Income Generated</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
