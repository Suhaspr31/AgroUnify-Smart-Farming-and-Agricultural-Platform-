"""
Treatment Recommendation Service
Provides detailed treatment recommendations based on disease diagnosis
"""

import json
import logging
from typing import Dict, List, Optional
from pathlib import Path
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class TreatmentRecommendationEngine:
    def __init__(self, database_path: str = "models/disease_database/"):
        self.db_path = Path(database_path)
        self.load_databases()
        
    def load_databases(self):
        """Load treatment and strategy databases"""
        try:
            with open(self.db_path / "treatment_protocols.json", 'r') as f:
                self.treatment_db = json.load(f)
                
            with open(self.db_path / "integrated_strategies.json", 'r') as f:
                self.strategy_db = json.load(f)
                
            logger.info("Treatment databases loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading treatment databases: {e}")
            self.treatment_db = {}
            self.strategy_db = {}
    
    def get_comprehensive_treatment_plan(self, diagnosis_result: Dict) -> Dict:
        """Generate comprehensive treatment plan based on diagnosis"""
        
        disease = diagnosis_result.get('diagnosis', {}).get('primary_disease', 'unknown')
        severity = diagnosis_result.get('diagnosis', {}).get('severity_level', 'moderate')
        confidence = diagnosis_result.get('diagnosis', {}).get('confidence', 0)
        
        treatment_plan = {
            'immediate_actions': self.get_immediate_actions(disease, severity),
            'chemical_treatments': self.get_chemical_treatments(disease, severity),
            'biological_treatments': self.get_biological_treatments(disease),
            'cultural_practices': self.get_cultural_practices(disease),
            'monitoring_schedule': self.create_monitoring_schedule(disease, severity),
            'prevention_strategy': self.get_prevention_strategy(disease),
            'economic_analysis': self.calculate_treatment_costs(disease, severity),
            'treatment_timeline': self.create_treatment_timeline(disease, severity),
            'success_indicators': self.define_success_indicators(disease),
            'alternative_approaches': self.get_alternative_approaches(disease, severity)
        }
        
        return treatment_plan
    
    def get_immediate_actions(self, disease: str, severity: str) -> List[Dict]:
        """Get immediate actions to take based on disease and severity"""
        
        immediate_actions = []
        
        # Universal immediate actions
        immediate_actions.append({
            'action': 'Isolate affected plants',
            'priority': 'high',
            'timeframe': 'immediately',
            'description': 'Prevent spread to healthy plants'
        })
        
        # Severity-specific actions
        if severity in ['severe', 'epidemic']:
            immediate_actions.append({
                'action': 'Emergency treatment application',
                'priority': 'critical',
                'timeframe': 'within 24 hours',
                'description': 'Apply fast-acting treatment to prevent total crop loss'
            })
            
        if severity == 'epidemic':
            immediate_actions.append({
                'action': 'Contact agricultural authorities',
                'priority': 'critical',
                'timeframe': 'immediately',
                'description': 'Report epidemic outbreak for community response'
            })
        
        # Disease-specific immediate actions
        disease_specific = {
            'late_blight': [
                {
                    'action': 'Remove infected foliage',
                    'priority': 'high',
                    'timeframe': 'within 2 hours',
                    'description': 'Prevent spore production and spread'
                }
            ],
            'bacterial_spot': [
                {
                    'action': 'Avoid plant handling when wet',
                    'priority': 'medium',
                    'timeframe': 'ongoing',
                    'description': 'Prevent bacterial spread through water'
                }
            ],
            'powdery_mildew': [
                {
                    'action': 'Improve air circulation',
                    'priority': 'medium',
                    'timeframe': 'within 6 hours',
                    'description': 'Reduce humidity around plants'
                }
            ]
        }
        
        if disease in disease_specific:
            immediate_actions.extend(disease_specific[disease])
        
        return immediate_actions
    
    def get_chemical_treatments(self, disease: str, severity: str) -> List[Dict]:
        """Get chemical treatment recommendations"""
        
        treatments = []
        
        # Get disease category to determine treatment type
        treatment_categories = {
            'fungal': 'fungicides',
            'bacterial': 'bactericides', 
            'viral': 'insecticides_for_vectors'
        }
        
        # Map diseases to categories (simplified)
        disease_categories = {
            'early_blight': 'fungal',
            'late_blight': 'fungal',
            'powdery_mildew': 'fungal',
            'bacterial_spot': 'bacterial',
            'mosaic_virus': 'viral'
        }
        
        category = disease_categories.get(disease, 'fungal')
        treatment_type = treatment_categories.get(category, 'fungicides')
        
        if treatment_type in self.treatment_db:
            for product_name, product_info in self.treatment_db[treatment_type].items():
                if disease in product_info.get('diseases_controlled', []):
                    treatment = {
                        'product_name': product_name,
                        'active_ingredient': product_info.get('active_ingredients', []),
                        'brand_names': product_info.get('brand_names', []),
                        'application_rate': product_info.get('application_rate', 'As per label'),
                        'cost_per_hectare': product_info.get('cost_per_hectare', 'Variable'),
                        'preharvest_interval': product_info.get('preharvest_interval', 'Check label'),
                        'application_instructions': product_info.get('application_instructions', []),
                        'resistance_risk': product_info.get('resistance_risk', 'Unknown'),
                        'mode_of_action': product_info.get('mode_of_action', 'Multiple sites')
                    }
                    
                    # Adjust recommendations based on severity
                    if severity in ['severe', 'epidemic']:
                        treatment['frequency'] = 'Every 3-5 days initially'
                        treatment['note'] = 'Intensive treatment required'
                    elif severity == 'moderate':
                        treatment['frequency'] = 'Every 7-10 days'
                        treatment['note'] = 'Regular preventive applications'
                    else:
                        treatment['frequency'] = 'Every 10-14 days'
                        treatment['note'] = 'Preventive treatment'
                    
                    treatments.append(treatment)
        
        return treatments[:3]  # Return top 3 recommendations
    
    def get_biological_treatments(self, disease: str) -> List[Dict]:
        """Get biological treatment options"""
        
        biological_treatments = []
        
        if 'biological_controls' in self.treatment_db:
            for bio_name, bio_info in self.treatment_db['biological_controls'].items():
                if disease in bio_info.get('diseases_controlled', []):
                    treatment = {
                        'product_name': bio_name,
                        'active_organism': bio_info.get('active_ingredients', []),
                        'brand_names': bio_info.get('brand_names', []),
                        'application_rate': bio_info.get('application_rate', 'As per label'),
                        'cost_per_hectare': bio_info.get('cost_per_hectare', 'Variable'),
                        'mode_of_action': bio_info.get('mode_of_action', 'Biological'),
                        'application_instructions': bio_info.get('application_instructions', []),
                        'compatibility': 'Compatible with IPM programs',
                        'environmental_impact': 'Low environmental impact'
                    }
                    biological_treatments.append(treatment)
        
        # Add general biological options
        general_bio_options = [
            {
                'product_name': 'Neem oil',
                'active_organism': ['Azadirachtin'],
                'application_rate': '2-5 ml/L water',
                'cost_per_hectare': '$20-40',
                'mode_of_action': 'Multiple modes',
                'application_instructions': ['Apply in evening', 'Repeat every 7-10 days'],
                'compatibility': 'Organic approved',
                'environmental_impact': 'Very low environmental impact'
            },
            {
                'product_name': 'Compost tea',
                'active_organism': ['Beneficial microorganisms'],
                'application_rate': '1:10 dilution',
                'cost_per_hectare': '$10-25',
                'mode_of_action': 'Competition and antagonism',
                'application_instructions': ['Apply weekly', 'Use fresh preparation'],
                'compatibility': 'Compatible with all treatments',
                'environmental_impact': 'Beneficial to soil health'
            }
        ]
        
        biological_treatments.extend(general_bio_options)
        
        return biological_treatments
    
    def get_cultural_practices(self, disease: str) -> List[Dict]:
        """Get cultural practice recommendations"""
        
        cultural_practices = [
            {
                'practice': 'Crop rotation',
                'description': 'Rotate with non-host crops for 2-3 years',
                'implementation': 'Plan next season planting',
                'cost': 'Low',
                'effectiveness': 'High for soil-borne diseases'
            },
            {
                'practice': 'Sanitation',
                'description': 'Remove and destroy infected plant debris',
                'implementation': 'Weekly during growing season',
                'cost': 'Low',
                'effectiveness': 'High for reducing inoculum'
            },
            {
                'practice': 'Water management',
                'description': 'Use drip irrigation, avoid overhead watering',
                'implementation': 'Install drip system if needed',
                'cost': 'Medium',
                'effectiveness': 'High for foliar diseases'
            },
            {
                'practice': 'Plant spacing',
                'description': 'Improve air circulation between plants',
                'implementation': 'Adjust planting density',
                'cost': 'Low',
                'effectiveness': 'Medium for humidity-dependent diseases'
            }
        ]
        
        # Disease-specific cultural practices
        disease_specific_practices = {
            'late_blight': [
                {
                    'practice': 'Hill potatoes',
                    'description': 'Create soil hills around potato plants',
                    'implementation': 'During growing season',
                    'cost': 'Low',
                    'effectiveness': 'High for preventing tuber infection'
                }
            ],
            'powdery_mildew': [
                {
                    'practice': 'Reduce shade',
                    'description': 'Prune to improve light penetration',
                    'implementation': 'Regular pruning schedule',
                    'cost': 'Low',
                    'effectiveness': 'Medium for light-dependent diseases'
                }
            ]
        }
        
        if disease in disease_specific_practices:
            cultural_practices.extend(disease_specific_practices[disease])
        
        return cultural_practices
    
    def create_monitoring_schedule(self, disease: str, severity: str) -> Dict:
        """Create monitoring schedule based on disease and severity"""
        
        base_schedule = {
            'mild': {
                'frequency': 'Weekly',
                'focus_areas': ['New symptoms', 'Spread to new plants'],
                'duration': '4 weeks post-treatment'
            },
            'moderate': {
                'frequency': 'Twice weekly',
                'focus_areas': ['Treatment effectiveness', 'Disease progression'],
                'duration': '6 weeks post-treatment'
            },
            'severe': {
                'frequency': 'Daily',
                'focus_areas': ['Treatment response', 'Spread prevention'],
                'duration': '8 weeks post-treatment'
            },
            'epidemic': {
                'frequency': 'Twice daily',
                'focus_areas': ['Emergency response', 'Containment'],
                'duration': '12 weeks post-treatment'
            }
        }
        
        schedule = base_schedule.get(severity, base_schedule['moderate'])
        
        # Add disease-specific monitoring points
        disease_monitoring = {
            'early_blight': ['Lower leaf inspection', 'Fruit checking'],
            'late_blight': ['Weather monitoring', 'Rapid spread check'],
            'powdery_mildew': ['Upper leaf surfaces', 'New growth inspection'],
            'bacterial_spot': ['Water-soaked lesions', 'Fruit quality'],
            'mosaic_virus': ['New leaf patterns', 'Plant vigor']
        }
        
        if disease in disease_monitoring:
            schedule['disease_specific_checks'] = disease_monitoring[disease]
        
        return schedule
    
    def get_prevention_strategy(self, disease: str) -> Dict:
        """Get comprehensive prevention strategy"""
        
        prevention_strategy = {
            'short_term': [
                'Implement quarantine measures',
                'Sanitize tools and equipment',
                'Monitor weather conditions',
                'Scout neighboring plants'
            ],
            'medium_term': [
                'Plan resistant variety selection',
                'Improve drainage systems',
                'Establish monitoring protocols',
                'Train farm workers on disease recognition'
            ],
            'long_term': [
                'Implement crop rotation program',
                'Develop integrated pest management plan',
                'Build beneficial organism habitat',
                'Establish disease forecasting system'
            ],
            'environmental_modifications': [
                'Improve air circulation',
                'Install drip irrigation',
                'Create buffer zones',
                'Optimize plant nutrition'
            ]
        }
        
        return prevention_strategy
    
    def calculate_treatment_costs(self, disease: str, severity: str) -> Dict:
        """Calculate comprehensive treatment costs"""
        
        # Base cost factors
        cost_factors = {
            'mild': 1.0,
            'moderate': 1.5,
            'severe': 2.5,
            'epidemic': 4.0
        }
        
        multiplier = cost_factors.get(severity, 1.5)
        
        base_costs = {
            'chemical_treatment': 50,
            'biological_treatment': 30,
            'cultural_practices': 20,
            'monitoring': 15,
            'labor': 40
        }
        
        total_treatment_cost = sum(cost * multiplier for cost in base_costs.values())
        
        cost_analysis = {
            'treatment_costs': {
                'chemical_treatment': f"${base_costs['chemical_treatment'] * multiplier:.0f}",
                'biological_treatment': f"${base_costs['biological_treatment'] * multiplier:.0f}",
                'cultural_practices': f"${base_costs['cultural_practices'] * multiplier:.0f}",
                'monitoring': f"${base_costs['monitoring'] * multiplier:.0f}",
                'labor': f"${base_costs['labor'] * multiplier:.0f}"
            },
            'total_per_hectare': f"${total_treatment_cost:.0f}",
            'cost_benefit_analysis': {
                'treatment_cost': total_treatment_cost,
                'potential_loss_without_treatment': total_treatment_cost * 3,
                'net_benefit': total_treatment_cost * 2,
                'roi_percentage': 200
            },
            'cost_optimization_tips': [
                'Use biological controls where possible',
                'Implement preventive cultural practices',
                'Early detection reduces treatment costs',
                'Combine treatments for efficiency'
            ]
        }
        
        return cost_analysis
    
    def create_treatment_timeline(self, disease: str, severity: str) -> List[Dict]:
        """Create detailed treatment timeline"""
        
        timeline = []
        start_date = datetime.now()
        
        # Immediate actions (Day 0)
        timeline.append({
            'day': 0,
            'date': start_date.strftime('%Y-%m-%d'),
            'actions': [
                'Initial diagnosis confirmation',
                'Implement immediate isolation measures',
                'Begin emergency treatments if severe'
            ],
            'priority': 'critical'
        })
        
        # Day 1-3: Initial treatment
        timeline.append({
            'day': '1-3',
            'date': f"{start_date.strftime('%Y-%m-%d')} to {(start_date + timedelta(days=3)).strftime('%Y-%m-%d')}",
            'actions': [
                'Apply primary chemical treatment',
                'Implement cultural control measures',
                'Begin intensive monitoring'
            ],
            'priority': 'high'
        })
        
        # Week 1: Treatment establishment
        timeline.append({
            'day': '4-7',
            'date': f"{(start_date + timedelta(days=4)).strftime('%Y-%m-%d')} to {(start_date + timedelta(days=7)).strftime('%Y-%m-%d')}",
            'actions': [
                'Monitor treatment effectiveness',
                'Adjust treatment if needed',
                'Continue cultural practices'
            ],
            'priority': 'high'
        })
        
        # Week 2-3: Maintenance phase
        timeline.append({
            'day': '8-21',
            'date': f"{(start_date + timedelta(days=8)).strftime('%Y-%m-%d')} to {(start_date + timedelta(days=21)).strftime('%Y-%m-%d')}",
            'actions': [
                'Continue scheduled treatments',
                'Assess disease progression',
                'Implement biological controls'
            ],
            'priority': 'medium'
        })
        
        # Month 1+: Long-term management
        timeline.append({
            'day': '22+',
            'date': f"{(start_date + timedelta(days=22)).strftime('%Y-%m-%d')} onwards",
            'actions': [
                'Transition to preventive program',
                'Plan for next season',
                'Document lessons learned'
            ],
            'priority': 'low'
        })
        
        return timeline
    
    def define_success_indicators(self, disease: str) -> Dict:
        """Define success indicators for treatment"""
        
        success_indicators = {
            'immediate_indicators': [
                'No new lesions appearing',
                'Existing lesions not expanding',
                'No spread to new plants'
            ],
            'short_term_indicators': [
                'Reduction in disease severity',
                'New growth appears healthy',
                'Improved plant vigor'
            ],
            'long_term_indicators': [
                'Season completion without major losses',
                'Reduced disease pressure next season',
                'Improved overall plant health'
            ],
            'measurable_targets': {
                'disease_incidence_reduction': '50% within 2 weeks',
                'severity_reduction': '25% within 1 week',
                'spread_prevention': '0 new plants infected'
            },
            'monitoring_metrics': [
                'Number of infected plants',
                'Average disease severity score',
                'Percentage of healthy new growth',
                'Overall crop yield potential'
            ]
        }
        
        return success_indicators
    
    def get_alternative_approaches(self, disease: str, severity: str) -> List[Dict]:
        """Get alternative treatment approaches"""
        
        alternatives = [
            {
                'approach': 'Organic/Biological Focus',
                'description': 'Emphasis on biological and cultural controls',
                'suitability': 'Good for mild to moderate infections',
                'pros': ['Environmentally friendly', 'Low resistance risk', 'Sustainable'],
                'cons': ['May be slower acting', 'Requires more management']
            },
            {
                'approach': 'Integrated Pest Management (IPM)',
                'description': 'Combination of all available tools',
                'suitability': 'Suitable for all severity levels',
                'pros': ['Balanced approach', 'Sustainable', 'Cost-effective'],
                'cons': ['Complex management', 'Requires knowledge']
            },
            {
                'approach': 'Chemical-Intensive',
                'description': 'Primary reliance on chemical treatments',
                'suitability': 'Best for severe infections',
                'pros': ['Fast acting', 'Reliable', 'Simple to implement'],
                'cons': ['Environmental concerns', 'Resistance risk', 'Higher cost']
            }
        ]
        
        # Add severity-specific recommendations
        if severity in ['severe', 'epidemic']:
            alternatives.append({
                'approach': 'Emergency Response',
                'description': 'Crop destruction and area treatment',
                'suitability': 'Last resort for epidemic conditions',
                'pros': ['Prevents spread', 'Protects neighboring crops'],
                'cons': ['Total crop loss', 'High economic impact']
            })
        
        return alternatives
