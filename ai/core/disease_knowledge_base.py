"""
Enhanced Disease Knowledge Base with Comprehensive Disease Information
Includes: Early Blight, Late Blight, Powdery Mildew, Bacterial Spot, Leaf Curl, Mosaic Virus, Septoria Leaf Spot
"""

import json
from typing import Dict, List, Optional
import sqlite3
from dataclasses import dataclass

@dataclass
class DiseaseInfo:
    disease_name: str
    crop_type: str
    severity_level: str
    symptoms: List[str]
    causes: List[str]
    treatment_methods: List[str]
    pesticides: List[Dict]
    prevention_strategies: List[str]
    environmental_conditions: Dict
    economic_impact: str
    organic_treatments: List[str]

class DiseaseKnowledgeBase:
    def __init__(self, db_path="C:\Users\Suhas\Agri Project\ai\data\disease_database.db"):
        self.db_path = db_path
        self.init_database()
        self.populate_disease_data()
    
    def init_database(self):
        """Initialize SQLite database with comprehensive disease information"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS diseases (
                id INTEGER PRIMARY KEY,
                disease_name TEXT NOT NULL,
                crop_type TEXT NOT NULL,
                scientific_name TEXT,
                symptoms TEXT,
                causes TEXT,
                treatment_methods TEXT,
                pesticides TEXT,
                prevention_strategies TEXT,
                environmental_conditions TEXT,
                severity_indicators TEXT,
                economic_impact TEXT,
                organic_treatments TEXT,
                application_schedule TEXT,
                resistance_management TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS pesticides (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                active_ingredient TEXT,
                target_diseases TEXT,
                application_rate TEXT,
                safety_interval TEXT,
                mode_of_action TEXT,
                resistance_group TEXT,
                environmental_impact TEXT,
                cost_per_hectare REAL
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def populate_disease_data(self):
        """Populate database with comprehensive disease information for 7 major diseases"""
        disease_data = [
            # 1. EARLY BLIGHT
            {
                "disease_name": "Early Blight",
                "crop_type": "Tomato",
                "scientific_name": "Alternaria solani",
                "symptoms": [
                    "Dark brown to black circular spots with concentric rings (target spot pattern)",
                    "Yellow halo around lesions on older leaves",
                    "Leaf yellowing and progressive defoliation from bottom up",
                    "Stem cankers near soil line with dark brown lesions",
                    "Fruit lesions with concentric rings near stem end",
                    "Lesions can coalesce causing large dead areas"
                ],
                "causes": [
                    "High humidity (90%+ for 12+ hours)",
                    "Temperatures 24-29°C (optimal for spore germination)",
                    "Poor air circulation in dense canopy",
                    "Water stress weakening plant defenses",
                    "Nitrogen deficiency making plants susceptible",
                    "Overhead irrigation wetting foliage",
                    "Plant debris from previous season"
                ],
                "treatment_methods": [
                    "Remove and destroy infected plant debris immediately",
                    "Apply copper-based fungicides as protective treatment",
                    "Use systemic fungicides (Azoxystrobin) for established infections",
                    "Improve plant nutrition with balanced fertilizer",
                    "Ensure proper irrigation management (drip preferred)",
                    "Prune lower leaves to improve air circulation",
                    "Apply fungicides preventively in humid conditions"
                ],
                "pesticides": [
                    {
                        "name": "Mancozeb 75% WP",
                        "active_ingredient": "Mancozeb",
                        "application_rate": "2-2.5 g/L water",
                        "interval": "7-10 days",
                        "safety_period": "7 days before harvest",
                        "cost": "₹250-350 per hectare"
                    },
                    {
                        "name": "Azoxystrobin 23% SC",
                        "active_ingredient": "Azoxystrobin",
                        "application_rate": "1 ml/L water",
                        "interval": "14 days",
                        "safety_period": "3 days before harvest",
                        "cost": "₹400-600 per hectare"
                    },
                    {
                        "name": "Chlorothalonil 75% WP",
                        "active_ingredient": "Chlorothalonil",
                        "application_rate": "2 g/L water",
                        "interval": "7-10 days",
                        "safety_period": "7 days before harvest",
                        "cost": "₹300-450 per hectare"
                    }
                ],
                "prevention_strategies": [
                    "Crop rotation with non-solanaceous crops for 2-3 years",
                    "Use disease-resistant varieties (e.g., Mountain Fresh Plus)",
                    "Maintain proper plant spacing (45-60 cm between plants)",
                    "Avoid overhead irrigation; use drip irrigation",
                    "Apply preventive fungicide sprays before disease onset",
                    "Remove volunteer plants and weeds",
                    "Stake and prune plants for better air circulation",
                    "Apply mulch to prevent soil splash"
                ],
                "environmental_conditions": {
                    "optimal_temp": "24-29°C",
                    "humidity": ">90%",
                    "moisture": "High soil moisture with leaf wetness",
                    "season": "Warm, humid weather in monsoon season"
                },
                "economic_impact": "Can cause 30-50% yield loss if untreated; reduces fruit quality and marketability",
                "organic_treatments": [
                    "Neem oil spray (5 ml/L) every 7-10 days",
                    "Baking soda solution (5 g/L water) weekly",
                    "Compost tea application as foliar spray",
                    "Trichoderma-based biocontrol agents (5 g/L)",
                    "Copper sulfate (Bordeaux mixture) 1% solution",
                    "Garlic extract spray (50 g garlic/L water)"
                ]
            },
            
            # 2. LATE BLIGHT
            {
                "disease_name": "Late Blight",
                "crop_type": "Tomato",
                "scientific_name": "Phytophthora infestans",
                "symptoms": [
                    "Dark, water-soaked spots on leaves that rapidly expand",
                    "White, moldy growth on undersides of leaves in humid conditions",
                    "Brown to black lesions on stems that can girdle the plant",
                    "Fruit rot with brown, firm, leathery patches",
                    "Rapid plant death in severe infections (within 7-14 days)",
                    "Greasy appearance of infected tissue",
                    "Entire fields can be devastated within weeks"
                ],
                "causes": [
                    "Cool, wet weather (15-25°C with high humidity)",
                    "Extended periods of leaf wetness (>12 hours)",
                    "Rainfall or heavy dew providing moisture",
                    "Cloudy, overcast conditions",
                    "Infected potato plants nearby",
                    "Contaminated seed potatoes or transplants",
                    "Wind-borne spores from infected fields"
                ],
                "treatment_methods": [
                    "Apply systemic fungicides immediately upon detection",
                    "Remove and destroy all infected plant material",
                    "Improve air circulation and reduce humidity",
                    "Use combination fungicides (mefenoxam + mancozeb)",
                    "Apply protective fungicides preventively in high-risk periods",
                    "Harvest healthy fruit immediately to save crop",
                    "Implement strict field sanitation"
                ],
                "pesticides": [
                    {
                        "name": "Metalaxyl + Mancozeb",
                        "active_ingredient": "Metalaxyl 8% + Mancozeb 64%",
                        "application_rate": "2 g/L water",
                        "interval": "7-10 days",
                        "safety_period": "7 days before harvest",
                        "cost": "₹400-550 per hectare"
                    },
                    {
                        "name": "Cymoxanil + Mancozeb",
                        "active_ingredient": "Cymoxanil 8% + Mancozeb 64%",
                        "application_rate": "2 g/L water",
                        "interval": "7-10 days",
                        "safety_period": "7 days before harvest",
                        "cost": "₹450-600 per hectare"
                    },
                    {
                        "name": "Copper Fungicide",
                        "active_ingredient": "Copper hydroxide 77%",
                        "application_rate": "2-3 ml/L water",
                        "interval": "7-10 days",
                        "safety_period": "0-1 day before harvest",
                        "cost": "₹250-400 per hectare"
                    },
                    {
                        "name": "Mandipropamid",
                        "active_ingredient": "Mandipropamid 250 g/L",
                        "application_rate": "2 ml/L water",
                        "interval": "7-10 days",
                        "safety_period": "3 days before harvest",
                        "cost": "₹600-800 per hectare"
                    }
                ],
                "prevention_strategies": [
                    "Plant resistant varieties (Mountain Magic, Defiant PHR)",
                    "Ensure proper spacing between plants for air circulation",
                    "Avoid overhead watering; water in morning",
                    "Crop rotation away from potatoes and tomatoes",
                    "Remove plant debris after harvest",
                    "Monitor weather and apply preventive sprays before rain",
                    "Use disease-free certified seed and transplants",
                    "Isolate fields from infected potato crops"
                ],
                "environmental_conditions": {
                    "optimal_temp": "15-25°C",
                    "humidity": ">90%",
                    "moisture": "High leaf wetness for 12+ hours",
                    "season": "Cool, wet weather (monsoon, early spring)"
                },
                "economic_impact": "Can cause 70-100% crop loss; entire fields destroyed within 2-3 weeks if untreated",
                "organic_treatments": [
                    "Copper sulfate spray (Bordeaux mixture 1%)",
                    "Neem oil (5 ml/L water) weekly application",
                    "Baking soda solution (1 tablespoon/L water)",
                    "Bacillus subtilis biological fungicide",
                    "Potassium bicarbonate (5 g/L water)",
                    "Remove infected plants immediately"
                ]
            },
            
            # 3. POWDERY MILDEW
            {
                "disease_name": "Powdery Mildew",
                "crop_type": "Multiple (Tomato, Cucurbits, Grapes)",
                "scientific_name": "Erysiphe cichoracearum / Oidium spp.",
                "symptoms": [
                    "White powdery coating on upper leaf surfaces",
                    "Patches spread to cover entire leaves",
                    "Leaves may curl, yellow, and drop prematurely",
                    "Reduced photosynthesis and stunted growth",
                    "Fruit may have poor quality and reduced size",
                    "Stems and flowers also affected in severe cases",
                    "High homogeneity in affected tissue texture"
                ],
                "causes": [
                    "Moderate temperatures (20-30°C)",
                    "High humidity but not requiring free water",
                    "Poor air circulation",
                    "Dense plant canopy",
                    "Shaded conditions",
                    "Nitrogen excess promoting succulent growth",
                    "Drought stress making plants susceptible"
                ],
                "treatment_methods": [
                    "Apply sulfur-based fungicides as preventive",
                    "Use systemic fungicides (Azoxystrobin, Propiconazole)",
                    "Improve air circulation by pruning",
                    "Reduce nitrogen fertilization",
                    "Apply fungicides to undersides of leaves",
                    "Remove heavily infected leaves",
                    "Alternate fungicides to prevent resistance"
                ],
                "pesticides": [
                    {
                        "name": "Sulfur 80% WP",
                        "active_ingredient": "Sulfur",
                        "application_rate": "2-3 g/L water",
                        "interval": "7-10 days",
                        "safety_period": "0 days (safe till harvest)",
                        "cost": "₹150-250 per hectare"
                    },
                    {
                        "name": "Azoxystrobin 23% SC",
                        "active_ingredient": "Azoxystrobin",
                        "application_rate": "1 ml/L water",
                        "interval": "10-14 days",
                        "safety_period": "3-7 days before harvest",
                        "cost": "₹400-650 per hectare"
                    },
                    {
                        "name": "Propiconazole 25% EC",
                        "active_ingredient": "Propiconazole",
                        "application_rate": "1 ml/L water",
                        "interval": "14-21 days",
                        "safety_period": "14-21 days before harvest",
                        "cost": "₹350-550 per hectare"
                    },
                    {
                        "name": "Hexaconazole 5% SC",
                        "active_ingredient": "Hexaconazole",
                        "application_rate": "2 ml/L water",
                        "interval": "15 days",
                        "safety_period": "7 days before harvest",
                        "cost": "₹300-450 per hectare"
                    }
                ],
                "prevention_strategies": [
                    "Plant resistant varieties when available",
                    "Ensure adequate plant spacing (follow recommendations)",
                    "Prune for air circulation and sunlight penetration",
                    "Avoid excess nitrogen fertilization",
                    "Water at base of plants, not overhead",
                    "Apply preventive sulfur sprays in high-risk periods",
                    "Remove infected plant parts promptly",
                    "Rotate fungicides by mode of action (FRAC codes)"
                ],
                "environmental_conditions": {
                    "optimal_temp": "20-30°C",
                    "humidity": "40-70% (does not need free water)",
                    "moisture": "Low to moderate; thrives in dry conditions",
                    "season": "Warm, dry weather with moderate humidity"
                },
                "economic_impact": "Can reduce yields by 20-40%; affects fruit quality and shelf life",
                "organic_treatments": [
                    "Sulfur dust or wettable sulfur spray",
                    "Potassium bicarbonate solution (1 tablespoon/L)",
                    "Neem oil spray (5 ml/L) weekly",
                    "Milk spray (10% milk solution) bi-weekly",
                    "Baking soda with horticultural oil (5 g/L + 5 ml/L oil)",
                    "Bacillus subtilis (Serenade) biological control",
                    "Compost tea foliar spray"
                ]
            },
            
            # 4. BACTERIAL SPOT
            {
                "disease_name": "Bacterial Spot",
                "crop_type": "Tomato and Pepper",
                "scientific_name": "Xanthomonas euvesicatoria / X. perforans",
                "symptoms": [
                    "Small (1-3 mm), dark, greasy-looking spots on leaves",
                    "Spots often surrounded by yellow halos",
                    "Lesions may coalesce causing leaf yellowing and drop",
                    "Fruit spots are raised, brown, with white halos",
                    "Stem lesions appear as dark streaks",
                    "Severe defoliation in advanced infections",
                    "Many small spots (10+ per leaf) characteristic"
                ],
                "causes": [
                    "Warm, humid weather (25-30°C)",
                    "Rain splash and overhead irrigation",
                    "Contaminated seeds or transplants",
                    "Wounds from insects, pruning, or wind damage",
                    "High nitrogen promoting succulent growth",
                    "Poor air circulation",
                    "Copper-resistant bacterial strains"
                ],
                "treatment_methods": [
                    "Apply copper-based bactericides preventively",
                    "Use combination copper + Mancozeb for better control",
                    "Remove and destroy infected plant parts",
                    "Avoid overhead irrigation and working in wet plants",
                    "Apply plant activators (Actigard) to boost resistance",
                    "Rotate with non-host crops",
                    "Use antibiotics (streptomycin) only in severe cases"
                ],
                "pesticides": [
                    {
                        "name": "Copper Hydroxide 77% WP",
                        "active_ingredient": "Copper hydroxide",
                        "application_rate": "2-3 g/L water",
                        "interval": "5-7 days",
                        "safety_period": "0-1 day before harvest",
                        "cost": "₹200-350 per hectare"
                    },
                    {
                        "name": "Copper Oxychloride 50% WP",
                        "active_ingredient": "Copper oxychloride",
                        "application_rate": "3 g/L water",
                        "interval": "7-10 days",
                        "safety_period": "0 days",
                        "cost": "₹150-300 per hectare"
                    },
                    {
                        "name": "Streptomycin Sulfate",
                        "active_ingredient": "Streptomycin 90% + Tetracycline 10%",
                        "application_rate": "0.5 g/L water",
                        "interval": "7-10 days (max 3 applications)",
                        "safety_period": "30 days before harvest",
                        "cost": "₹500-700 per hectare"
                    },
                    {
                        "name": "Copper + Mancozeb",
                        "active_ingredient": "Copper + Mancozeb combination",
                        "application_rate": "2-2.5 g/L water",
                        "interval": "7 days",
                        "safety_period": "7 days before harvest",
                        "cost": "₹300-450 per hectare"
                    }
                ],
                "prevention_strategies": [
                    "Use disease-free, certified seeds and transplants",
                    "Hot water seed treatment (50°C for 25 minutes)",
                    "Avoid working with wet plants",
                    "Use drip irrigation instead of overhead sprinklers",
                    "Crop rotation with non-solanaceous crops (3 years)",
                    "Remove volunteer plants and weeds",
                    "Proper plant spacing for air circulation",
                    "Sanitize tools and equipment with 10% bleach",
                    "Apply copper preventively before rain events"
                ],
                "environmental_conditions": {
                    "optimal_temp": "25-30°C",
                    "humidity": ">95% with leaf wetness",
                    "moisture": "Rain or irrigation providing leaf wetness",
                    "season": "Warm, rainy weather; monsoon season"
                },
                "economic_impact": "Can cause 10-50% yield loss; reduces fruit marketability due to lesions",
                "organic_treatments": [
                    "Copper-based sprays (approved for organic)",
                    "Bacillus subtilis strain QST 713 (Serenade)",
                    "Hydrogen peroxide solution (3%) spray",
                    "Neem oil with copper mixture",
                    "Plant activators to induce systemic resistance",
                    "Remove infected leaves immediately",
                    "Improve plant nutrition for natural defense"
                ]
            },
            
            # 5. TOMATO/TOBACCO LEAF CURL VIRUS
            {
                "disease_name": "Leaf Curl Virus",
                "crop_type": "Tomato",
                "scientific_name": "Tomato yellow leaf curl virus (TYLCV) - Begomovirus",
                "symptoms": [
                    "Upward and downward curling of leaf margins",
                    "Yellowing of young leaves (interveinal chlorosis)",
                    "Severe stunting and bushy appearance",
                    "Shortened internodes giving 'bonsai' look",
                    "Flower drop before fruit set",
                    "Dramatically reduced fruit production",
                    "Leaves become thick, leathery, and crinkled",
                    "High edge density due to leaf distortion"
                ],
                "causes": [
                    "Transmitted by whitefly (Bemisia tabaci)",
                    "Infected transplants introducing virus",
                    "High whitefly populations in warm weather",
                    "Reservoir hosts (weeds, ornamentals)",
                    "Early infection causing more severe symptoms",
                    "No seed transmission (insect-borne only)",
                    "Warm temperatures favoring whitefly activity"
                ],
                "treatment_methods": [
                    "Control whitefly vectors with insecticides",
                    "Remove and destroy infected plants immediately",
                    "Use reflective mulches to repel whiteflies",
                    "Apply neonicotinoid insecticides systemically",
                    "Install insect-proof nets in protected cultivation",
                    "Rogue infected plants to reduce virus spread",
                    "No cure once infected - prevention is key"
                ],
                "pesticides": [
                    {
                        "name": "Imidacloprid 17.8% SL",
                        "active_ingredient": "Imidacloprid",
                        "application_rate": "0.5 ml/L water",
                        "interval": "10-15 days",
                        "safety_period": "7-14 days before harvest",
                        "cost": "₹250-400 per hectare",
                        "note": "For whitefly control"
                    },
                    {
                        "name": "Thiamethoxam 25% WG",
                        "active_ingredient": "Thiamethoxam",
                        "application_rate": "0.2 g/L water",
                        "interval": "10-15 days",
                        "safety_period": "7 days before harvest",
                        "cost": "₹300-450 per hectare",
                        "note": "Systemic insecticide for whitefly"
                    },
                    {
                        "name": "Spiromesifen 22.9% SC",
                        "active_ingredient": "Spiromesifen",
                        "application_rate": "1 ml/L water",
                        "interval": "15 days",
                        "safety_period": "3 days before harvest",
                        "cost": "₹400-600 per hectare",
                        "note": "For whitefly nymphs"
                    },
                    {
                        "name": "Acetamiprid 20% SP",
                        "active_ingredient": "Acetamiprid",
                        "application_rate": "0.2 g/L water",
                        "interval": "7-10 days",
                        "safety_period": "7 days before harvest",
                        "cost": "₹250-350 per hectare",
                        "note": "Contact and systemic"
                    }
                ],
                "prevention_strategies": [
                    "Plant resistant or tolerant varieties (consult seed companies)",
                    "Use virus-free, certified transplants",
                    "Control whitefly populations with yellow sticky traps",
                    "Apply reflective silver mulch to deter whiteflies",
                    "Remove infected plants immediately (roguing)",
                    "Eliminate weed hosts (nightshades, jimsonweed)",
                    "Use insect-proof nets (50-mesh) in nurseries",
                    "Delay planting to avoid peak whitefly periods",
                    "Spray neem oil for whitefly suppression",
                    "Avoid planting near infected fields or weeds"
                ],
                "environmental_conditions": {
                    "optimal_temp": "25-35°C (optimal for whitefly)",
                    "humidity": "Low to moderate",
                    "moisture": "Not moisture-dependent (vector-borne)",
                    "season": "Hot, dry weather favoring whitefly populations"
                },
                "economic_impact": "Can cause 50-100% yield loss; young infections result in no harvestable fruit",
                "organic_treatments": [
                    "Neem oil spray (5 ml/L) for whitefly control",
                    "Yellow sticky traps for monitoring and mass trapping",
                    "Reflective mulches to repel whiteflies",
                    "Remove infected plants promptly",
                    "Spray water to dislodge whiteflies",
                    "Encourage natural predators (ladybugs, lacewings)",
                    "Use insecticidal soap for whitefly nymphs",
                    "No cure for virus - focus on vector control"
                ]
            },
            
            # 6. MOSAIC VIRUS
            {
                "disease_name": "Mosaic Virus",
                "crop_type": "Multiple (Tomato, Cucumber, Tobacco, Beans)",
                "scientific_name": "Tobacco mosaic virus (TMV) / Cucumber mosaic virus (CMV)",
                "symptoms": [
                    "Yellow and green mottling patterns on leaves",
                    "Mosaic or patchy discoloration of foliage",
                    "Stunted plant growth and reduced vigor",
                    "Leaf distortion, wrinkling, and cupping",
                    "Reduced fruit size and quality",
                    "Dark green blisters on leaves",
                    "Fruit may show warty, raised areas",
                    "Variable color distribution across plant"
                ],
                "causes": [
                    "Transmitted mechanically (sap, tools, hands)",
                    "Aphid transmission (especially CMV)",
                    "Infected seeds or transplants",
                    "Contaminated tobacco products",
                    "Contact with infected plants",
                    "Weed reservoirs harboring virus",
                    "No cure once plant is infected"
                ],
                "treatment_methods": [
                    "Remove and destroy infected plants immediately",
                    "Control aphid vectors with insecticides",
                    "Disinfect tools with 10% bleach or trisodium phosphate",
                    "Wash hands frequently when handling plants",
                    "Apply insecticidal soap for aphid control",
                    "No chemical cure for virus infection",
                    "Focus on prevention and vector control"
                ],
                "pesticides": [
                    {
                        "name": "For Aphid Control: Imidacloprid 17.8% SL",
                        "active_ingredient": "Imidacloprid",
                        "application_rate": "0.5 ml/L water",
                        "interval": "10-15 days",
                        "safety_period": "7-14 days before harvest",
                        "cost": "₹250-400 per hectare",
                        "note": "Controls aphid vectors"
                    },
                    {
                        "name": "Neem-based Insecticide",
                        "active_ingredient": "Azadirachtin 0.15%",
                        "application_rate": "5 ml/L water",
                        "interval": "7 days",
                        "safety_period": "0 days (organic approved)",
                        "cost": "₹200-350 per hectare",
                        "note": "Repels aphids"
                    },
                    {
                        "name": "Note: No fungicides work on viruses",
                        "active_ingredient": "Focus on insect vector control",
                        "application_rate": "N/A",
                        "interval": "N/A",
                        "safety_period": "N/A",
                        "cost": "N/A",
                        "note": "Viruses require prevention"
                    }
                ],
                "prevention_strategies": [
                    "Use resistant varieties when available",
                    "Plant virus-free, certified seeds and transplants",
                    "DO NOT save seeds from infected plants",
                    "Remove weeds that can harbor viruses",
                    "Install row covers to exclude aphids",
                    "Disinfect tools between plants (1:4 bleach:water)",
                    "Wash hands before handling plants",
                    "Avoid using tobacco products near plants",
                    "Do not work with wet plants",
                    "Remove and destroy infected plants (do not compost)",
                    "Control aphids with yellow sticky traps",
                    "Isolate new plants for observation period"
                ],
                "environmental_conditions": {
                    "optimal_temp": "20-30°C",
                    "humidity": "Variable (transmitted mechanically and by insects)",
                    "moisture": "Not moisture-dependent",
                    "season": "Any season; depends on vector activity"
                },
                "economic_impact": "Can cause 20-90% yield reduction depending on infection stage; early infections most damaging",
                "organic_treatments": [
                    "Remove infected plants immediately",
                    "Neem oil for aphid control (5 ml/L)",
                    "Insecticidal soap for aphids",
                    "Diatomaceous earth for crawling insects",
                    "Reflective mulches to repel aphids",
                    "Milk spray (10% solution) may have antiviral properties",
                    "Encourage beneficial insects (ladybugs, lacewings)",
                    "Strict sanitation and tool disinfection",
                    "No cure exists - prevention is essential"
                ]
            },
            
            # 7. SEPTORIA LEAF SPOT
            {
                "disease_name": "Septoria Leaf Spot",
                "crop_type": "Tomato",
                "scientific_name": "Septoria lycopersici",
                "symptoms": [
                    "Numerous small (1-3 mm) circular spots on lower leaves",
                    "Spots have gray or tan centers with dark margins",
                    "Tiny black specks (pycnidia) in spot centers",
                    "Yellowing around spots leading to leaf drop",
                    "Progressive defoliation from bottom to top of plant",
                    "Reduced photosynthesis and fruit size",
                    "Stems and calyxes may also be affected"
                ],
                "causes": [
                    "Warm, wet weather (20-25°C)",
                    "High humidity and extended leaf wetness",
                    "Rain splash spreading spores",
                    "Overhead irrigation wetting foliage",
                    "Plant debris from previous season",
                    "Infected transplants",
                    "Poor air circulation in dense plantings"
                ],
                "treatment_methods": [
                    "Remove infected lower leaves promptly",
                    "Apply fungicides at first sign of disease",
                    "Use combination of contact and systemic fungicides",
                    "Improve air circulation through pruning and spacing",
                    "Avoid overhead irrigation; water at base",
                    "Apply mulch to prevent soil splash",
                    "Rotate fungicides to prevent resistance"
                ],
                "pesticides": [
                    {
                        "name": "Chlorothalonil 75% WP",
                        "active_ingredient": "Chlorothalonil",
                        "application_rate": "2 g/L water",
                        "interval": "7-10 days",
                        "safety_period": "7 days before harvest",
                        "cost": "₹300-450 per hectare"
                    },
                    {
                        "name": "Mancozeb 75% WP",
                        "active_ingredient": "Mancozeb",
                        "application_rate": "2-2.5 g/L water",
                        "interval": "7-10 days",
                        "safety_period": "7-14 days before harvest",
                        "cost": "₹250-400 per hectare"
                    },
                    {
                        "name": "Azoxystrobin 23% SC",
                        "active_ingredient": "Azoxystrobin",
                        "application_rate": "1 ml/L water",
                        "interval": "10-14 days",
                        "safety_period": "3 days before harvest",
                        "cost": "₹400-600 per hectare"
                    },
                    {
                        "name": "Copper Fungicide",
                        "active_ingredient": "Copper oxychloride 50%",
                        "application_rate": "3 g/L water",
                        "interval": "7-10 days",
                        "safety_period": "0 days",
                        "cost": "₹150-300 per hectare"
                    }
                ],
                "prevention_strategies": [
                    "Crop rotation (1+ years away from tomatoes)",
                    "Use disease-free, certified transplants",
                    "Remove and destroy all plant debris after harvest",
                    "Proper plant spacing (45-60 cm) for air flow",
                    "Avoid overhead irrigation; use drip system",
                    "Mulch to prevent soil splash onto leaves",
                    "Stake and prune plants for better air circulation",
                    "Remove lower leaves touching soil",
                    "Apply preventive fungicides in wet weather",
                    "Control weeds (especially solanaceous weeds)",
                    "Do not compost infected plant material"
                ],
                "environmental_conditions": {
                    "optimal_temp": "20-25°C",
                    "humidity": ">90%",
                    "moisture": "Extended leaf wetness from rain or dew",
                    "season": "Warm, wet weather; monsoon season"
                },
                "economic_impact": "Can cause 30-60% yield reduction through defoliation; affects fruit size and quality",
                "organic_treatments": [
                    "Copper-based fungicides (approved for organic)",
                    "Neem oil spray (5 ml/L) weekly",
                    "Baking soda solution (5 g/L + surfactant)",
                    "Compost tea as foliar spray",
                    "Sulfur fungicides (wettable sulfur)",
                    "Remove infected leaves immediately",
                    "Improve soil health with compost",
                    "Bacillus subtilis biological fungicide",
                    "Proper sanitation and crop rotation"
                ]
            }
        ]
        
        # Insert data into database
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for disease in disease_data:
            cursor.execute('''
                INSERT OR REPLACE INTO diseases 
                (disease_name, crop_type, scientific_name, symptoms, causes, 
                 treatment_methods, pesticides, prevention_strategies, 
                 environmental_conditions, economic_impact, organic_treatments)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                disease["disease_name"],
                disease["crop_type"],
                disease["scientific_name"],
                json.dumps(disease["symptoms"]),
                json.dumps(disease["causes"]),
                json.dumps(disease["treatment_methods"]),
                json.dumps(disease["pesticides"]),
                json.dumps(disease["prevention_strategies"]),
                json.dumps(disease["environmental_conditions"]),
                disease["economic_impact"],
                json.dumps(disease["organic_treatments"])
            ))
        
        conn.commit()
        conn.close()
        
        print(f"✅ Successfully populated database with {len(disease_data)} diseases")
    
    def get_disease_info(self, disease_name: str, crop_type: str = None) -> Optional[DiseaseInfo]:
        """Retrieve comprehensive disease information"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if crop_type:
            cursor.execute('''
                SELECT * FROM diseases 
                WHERE disease_name = ? AND crop_type = ?
            ''', (disease_name, crop_type))
        else:
            cursor.execute('''
                SELECT * FROM diseases 
                WHERE disease_name = ?
            ''', (disease_name,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return DiseaseInfo(
                disease_name=result[1],
                crop_type=result[2],
                severity_level="High",  # Can be calculated based on symptoms
                symptoms=json.loads(result[4]),
                causes=json.loads(result[5]),
                treatment_methods=json.loads(result[6]),
                pesticides=json.loads(result[7]),
                prevention_strategies=json.loads(result[8]),
                environmental_conditions=json.loads(result[9]),
                economic_impact=result[11],
                organic_treatments=json.loads(result[12])
            )
        
        return None
    
    def list_all_diseases(self) -> List[str]:
        """List all diseases in the database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('SELECT disease_name, crop_type FROM diseases')
        results = cursor.fetchall()
        conn.close()
        return [f"{r[0]} ({r[1]})" for r in results]


# Example usage and testing
if __name__ == "__main__":
    # Initialize database
    kb = DiseaseKnowledgeBase()
    
    # List all diseases
    print("\n" + "="*80)
    print("AVAILABLE DISEASES IN DATABASE")
    print("="*80)
    for disease in kb.list_all_diseases():
        print(f"  • {disease}")
    
    # Test retrieval
    print("\n" + "="*80)
    print("EXAMPLE: Late Blight Information")
    print("="*80)
    info = kb.get_disease_info("Late Blight", "Tomato")
    if info:
        print(f"\nDisease: {info.disease_name}")
        print(f"Crop: {info.crop_type}")
        print(f"\nSymptoms ({len(info.symptoms)} listed):")
        for symptom in info.symptoms[:3]:
            print(f"  • {symptom}")
        print(f"\nPesticides ({len(info.pesticides)} listed):")
        for pest in info.pesticides[:2]:
            print(f"  • {pest['name']}: {pest['application_rate']}")
        print(f"\nEconomic Impact: {info.economic_impact}")
    
    print("\n✅ Disease Knowledge Base successfully created and tested!")
