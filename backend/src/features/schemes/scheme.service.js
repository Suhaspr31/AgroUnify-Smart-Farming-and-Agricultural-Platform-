const { Scheme, Application } = require('./scheme.model');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const GOVT_SCHEMES_API_KEY = '579b464db66ec23bdd0000017a53f33b898c482354227bdf8ad4fad8';
const GOVT_SCHEMES_API_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

class SchemeService {
  // Get all schemes with optional filtering
  async getAllSchemes(filters = {}) {
    try {
      // First try to fetch from external API
      try {
        const apiParams = {
          'api-key': GOVT_SCHEMES_API_KEY,
          format: 'json',
          limit: 100
        };

        if (filters.state && filters.state !== 'all') {
          apiParams.filters = `state:${filters.state}`;
        }

        const response = await axios.get(GOVT_SCHEMES_API_URL, {
          params: apiParams,
          timeout: 10000
        });

        if (response.data && response.data.records) {
          // Transform API data to our format
          const transformedSchemes = response.data.records.map((record, index) => ({
            id: index + 1,
            name: record.scheme_name || record.name || 'Government Scheme',
            description: record.scheme_description || record.description || 'Government scheme for farmers',
            category: this.mapCategory(record.scheme_category || record.category),
            state: record.state || 'national',
            eligibility: record.eligibility_criteria ? record.eligibility_criteria.split(';') : ['Farmers'],
            benefits: record.benefits ? record.benefits.split(';') : ['Various benefits available'],
            requiredDocuments: record.required_documents ? record.required_documents.split(';') : ['Basic documents'],
            applicationProcess: record.application_process ? record.application_process.split(';') : ['Apply through designated channels'],
            deadline: record.application_deadline || 'Ongoing',
            status: record.status || 'active',
            contactInfo: {
              helpline: record.helpline_number || '1800-XXX-XXXX',
              website: record.website || 'https://gov.in',
              email: record.email || 'info@gov.in'
            },
            // Add deadline notification logic
            deadlineNotification: this.getDeadlineNotification(record.application_deadline)
          }));

          // Filter by category if specified
          let filteredSchemes = transformedSchemes;
          if (filters.category && filters.category !== 'all') {
            filteredSchemes = transformedSchemes.filter(scheme => scheme.category === filters.category);
          }

          return { success: true, data: filteredSchemes };
        }
      } catch (apiError) {
        console.warn('External API failed, falling back to database:', apiError.message);
      }

      // Fallback to database
      const query = {};

      if (filters.category && filters.category !== 'all') {
        query.category = filters.category;
      }

      if (filters.state && filters.state !== 'all') {
        query.state = filters.state;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      const schemes = await Scheme.find(query).sort({ createdAt: -1 });

      // Add deadline notifications to database schemes too
      const schemesWithNotifications = schemes.map(scheme => ({
        ...scheme.toObject(),
        deadlineNotification: this.getDeadlineNotification(scheme.deadline)
      }));

      return { success: true, data: schemesWithNotifications };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Get scheme by ID
  async getSchemeById(id) {
    try {
      // First try to fetch from external API
      try {
        const response = await axios.get(GOVT_SCHEMES_API_URL, {
          params: {
            'api-key': GOVT_SCHEMES_API_KEY,
            format: 'json',
            limit: 1,
            filters: `id:${id}`
          },
          timeout: 10000
        });

        if (response.data && response.data.records && response.data.records.length > 0) {
          const record = response.data.records[0];
          const transformedScheme = {
            id: parseInt(id),
            name: record.scheme_name || record.name || 'Government Scheme',
            description: record.scheme_description || record.description || 'Government scheme for farmers',
            category: this.mapCategory(record.scheme_category || record.category),
            state: record.state || 'national',
            eligibility: record.eligibility_criteria ? record.eligibility_criteria.split(';') : ['Farmers'],
            benefits: record.benefits ? record.benefits.split(';') : ['Various benefits available'],
            requiredDocuments: record.required_documents ? record.required_documents.split(';') : ['Basic documents'],
            applicationProcess: record.application_process ? record.application_process.split(';') : ['Apply through designated channels'],
            deadline: record.application_deadline || 'Ongoing',
            status: record.status || 'active',
            contactInfo: {
              helpline: record.helpline_number || '1800-XXX-XXXX',
              website: record.website || 'https://gov.in',
              email: record.email || 'info@gov.in'
            }
          };
          return { success: true, data: transformedScheme };
        }
      } catch (apiError) {
        console.warn('External API failed for scheme details, falling back to database:', apiError.message);
      }

      // Fallback to database
      const scheme = await Scheme.findOne({ id: parseInt(id) });
      if (!scheme) {
        return { success: false, message: 'Scheme not found' };
      }
      return { success: true, data: scheme };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Get eligible schemes for a farmer (placeholder - would need farmer profile)
  async getEligibleSchemes(farmerProfile = {}) {
    try {
      // Try external API first
      try {
        const response = await axios.get(GOVT_SCHEMES_API_URL, {
          params: {
            'api-key': GOVT_SCHEMES_API_KEY,
            format: 'json',
            limit: 50
          },
          timeout: 10000
        });

        if (response.data && response.data.records) {
          // Transform and filter eligible schemes
          const transformedSchemes = response.data.records
            .filter(record => record.status === 'active' || !record.status)
            .map((record, index) => ({
              id: index + 1,
              name: record.scheme_name || record.name || 'Government Scheme',
              description: record.scheme_description || record.description || 'Government scheme for farmers',
              category: this.mapCategory(record.scheme_category || record.category),
              state: record.state || 'national',
              eligibility: record.eligibility_criteria ? record.eligibility_criteria.split(';') : ['Farmers'],
              benefits: record.benefits ? record.benefits.split(';') : ['Various benefits available'],
              deadline: record.application_deadline || 'Ongoing',
              status: record.status || 'active'
            }));

          return { success: true, data: transformedSchemes };
        }
      } catch (apiError) {
        console.warn('External API failed for eligible schemes, falling back to database:', apiError.message);
      }

      // Fallback to database
      const schemes = await Scheme.find({ status: 'active' });
      return { success: true, data: schemes };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Apply for a scheme
  async applyForScheme(schemeId, applicationData) {
    try {
      // Verify scheme exists
      const scheme = await Scheme.findOne({ id: parseInt(schemeId) });
      if (!scheme) {
        return { success: false, message: 'Scheme not found' };
      }

      // Check if farmer already applied
      const existingApplication = await Application.findOne({
        schemeId: parseInt(schemeId),
        aadhaarNumber: applicationData.aadhaarNumber
      });

      if (existingApplication) {
        return { success: false, message: 'You have already applied for this scheme' };
      }

      // Generate unique application ID
      const applicationId = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Create application
      const application = new Application({
        schemeId: parseInt(schemeId),
        applicationId,
        ...applicationData,
        nextSteps: this.generateNextSteps(scheme.category)
      });

      await application.save();

      return {
        success: true,
        data: {
          applicationId,
          status: application.status,
          submittedAt: application.submittedAt,
          nextSteps: application.nextSteps
        }
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Get applications for a farmer (would need authentication)
  async getApplications(filters = {}) {
    try {
      const query = {};

      if (filters.aadhaarNumber) {
        query.aadhaarNumber = filters.aadhaarNumber;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.schemeId) {
        query.schemeId = parseInt(filters.schemeId);
      }

      const applications = await Application.find(query)
        .populate('schemeId', 'name category')
        .sort({ submittedAt: -1 });

      return { success: true, data: applications };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Get application by ID
  async getApplicationById(id) {
    try {
      const application = await Application.findOne({ applicationId: id })
        .populate('schemeId');

      if (!application) {
        return { success: false, message: 'Application not found' };
      }

      return { success: true, data: application };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Update application status (admin function)
  async updateApplicationStatus(applicationId, status, remarks = '') {
    try {
      const application = await Application.findOne({ applicationId });

      if (!application) {
        return { success: false, message: 'Application not found' };
      }

      application.status = status;
      if (remarks) {
        application.remarks = remarks;
      }

      // Update next steps based on new status
      if (status === 'approved') {
        application.nextSteps = this.generateApprovedNextSteps(application.schemeId.category);
      } else if (status === 'rejected') {
        application.nextSteps = [];
      }

      await application.save();

      return { success: true, data: application };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Map external API categories to our internal categories
  mapCategory(apiCategory) {
    if (!apiCategory) return 'income-support';

    const categoryMap = {
      'income': 'income-support',
      'subsidy': 'income-support',
      'support': 'income-support',
      'insurance': 'insurance',
      'crop insurance': 'insurance',
      'fasal bima': 'insurance',
      'soil': 'soil-health',
      'health': 'soil-health',
      'soil health': 'soil-health',
      'market': 'market-linkage',
      'marketing': 'market-linkage',
      'trade': 'market-linkage',
      'credit': 'credit',
      'loan': 'credit',
      'finance': 'credit',
      'equipment': 'equipment',
      'machinery': 'equipment',
      'technology': 'equipment'
    };

    return categoryMap[apiCategory.toLowerCase()] || 'income-support';
  }

  // Calculate deadline notifications
  getDeadlineNotification(deadline) {
    if (!deadline || deadline === 'Ongoing' || deadline === 'ongoing') {
      return null;
    }

    try {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      const timeDiff = deadlineDate.getTime() - now.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (daysDiff <= 0) {
        return {
          type: 'expired',
          message: 'Application deadline has passed',
          urgent: true
        };
      } else if (daysDiff <= 7) {
        return {
          type: 'urgent',
          message: `Only ${daysDiff} day${daysDiff > 1 ? 's' : ''} left to apply!`,
          urgent: true,
          daysLeft: daysDiff
        };
      } else if (daysDiff <= 30) {
        return {
          type: 'warning',
          message: `${daysDiff} days left to apply`,
          urgent: false,
          daysLeft: daysDiff
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  // Generate next steps based on scheme category
  generateNextSteps(category) {
    const steps = {
      'income-support': [
        {
          step: 'Document Verification',
          description: 'Your documents will be verified by local authorities within 7-10 days',
          deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
          completed: false
        },
        {
          step: 'Bank Account Validation',
          description: 'Your bank account details will be validated for fund transfer',
          deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
          completed: false
        },
        {
          step: 'First Installment',
          description: 'First quarterly installment will be credited to your account',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          completed: false
        }
      ],
      'insurance': [
        {
          step: 'Policy Generation',
          description: 'Insurance policy will be generated and sent to your registered mobile/email',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          completed: false
        },
        {
          step: 'Premium Payment',
          description: 'Pay the applicable premium amount to activate coverage',
          deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
          completed: false
        },
        {
          step: 'Coverage Activation',
          description: 'Your crop insurance coverage will be activated',
          deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days
          completed: false
        }
      ],
      'soil-health': [
        {
          step: 'Sample Collection',
          description: 'Soil sample will be collected from your field',
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
          completed: false
        },
        {
          step: 'Lab Testing',
          description: 'Soil sample will be tested in government lab',
          deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
          completed: false
        },
        {
          step: 'Report Delivery',
          description: 'Soil health card will be delivered to you',
          deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days
          completed: false
        }
      ]
    };

    return steps[category] || [
      {
        step: 'Application Review',
        description: 'Your application is under review by concerned authorities',
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        completed: false
      }
    ];
  }

  // Generate next steps after approval
  generateApprovedNextSteps(category) {
    const steps = {
      'income-support': [
        {
          step: 'Fund Transfer',
          description: 'Funds will be transferred to your bank account',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          completed: false
        },
        {
          step: 'Confirmation SMS',
          description: 'You will receive confirmation SMS about fund transfer',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          completed: false
        }
      ],
      'insurance': [
        {
          step: 'Policy Document',
          description: 'Download your insurance policy document',
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          completed: false
        },
        {
          step: 'Coverage Details',
          description: 'Review your coverage details and terms',
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          completed: false
        }
      ]
    };

    return steps[category] || [
      {
        step: 'Approval Confirmation',
        description: 'Your application has been approved',
        deadline: new Date(),
        completed: true
      }
    ];
  }
}

module.exports = new SchemeService();