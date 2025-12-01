const fs = require('fs');
const path = require('path');

// Comprehensive agricultural product data generator
function generateComprehensiveProducts() {
  const products = [];

  // Seeds Data
  const seedBrands = ['Mahyco', 'Bayer CropScience', 'Monsanto', 'Rasi Seeds', 'Nuziveedu Seeds', 'JS Seeds', 'Tropical Seeds', 'Seminis', 'Floral Gardens', 'JK Seeds', 'Kaveri Seeds', 'Ankur Seeds'];

  // Generate 10 Rice Seeds
  const riceVarieties = ['Pusa Basmati 1121', 'Pusa 1509', 'PR 126', 'PR 121', 'PR 114', 'PR 113', 'PR 111', 'PR 106', 'Swarna', 'Samba Masuri'];
  riceVarieties.forEach((variety, index) => {
    products.push({
      name: `Premium Hybrid Rice Seeds (${variety}) - ${seedBrands[index % seedBrands.length]}`,
      description: `High-yielding aromatic rice variety with excellent grain quality and disease resistance. Perfect for commercial cultivation in ${index % 2 === 0 ? 'Kharif' : 'Rabi'} season.`,
      category: 'seeds',
      subcategory: 'rice_seeds',
      brand: seedBrands[index % seedBrands.length],
      tags: ['rice', variety.toLowerCase().replace(/\s+/g, '_'), 'hybrid', 'aromatic', 'high_yield', index % 2 === 0 ? 'kharif' : 'rabi'],
      cropType: ['rice'],
      region: index % 3 === 0 ? ['north_india', 'central_india'] : index % 3 === 1 ? ['south_india', 'east_india'] : ['all_india'],
      seasonal: true,
      seasonStart: index % 2 === 0 ? 'june' : 'november',
      seasonEnd: index % 2 === 0 ? 'october' : 'march',
      price: 750 + (index * 25),
      basePrice: 750 + (index * 25),
      currentPrice: 750 + (index * 25),
      unit: 'kg',
      stock: 2000 + (index * 500),
      minOrderQuantity: 1,
      maxOrderQuantity: 500,
      images: [`/images/products/rice-seeds-${index + 1}.jpg`],
      specifications: {
        yield_potential: `${6 + index * 0.5}-${7.5 + index * 0.5} t/ha`,
        maturity_days: `${135 + index * 5}-${150 + index * 5}`,
        grain_length: '8.0-9.5 mm',
        disease_resistance: 'Blast, Bacterial Blight, Sheath Blight',
        protein_content: '7-9%',
        germination_rate: '90% minimum'
      },
      discount: (index + 1) % 3 === 0 ? 5 : 0,
      isActive: true,
      isFeatured: index < 2,
      isTrending: index % 3 === 0,
      viewCount: 1000 + (index * 200),
      purchaseCount: 500 + (index * 100),
      supplierRating: 4.5,
      deliveryTime: 3,
      certifications: ['Seed Certification', 'ISO 9001'],
      warranty: '1 year germination guarantee'
    });
  });

  // Generate 10 Wheat Seeds
  const wheatVarieties = ['HD 2967', 'HD 3086', 'HD 3226', 'PBW 725', 'PBW 752', 'DBW 187', 'DBW 222', 'HI 1620', 'HI 1633', 'HD 3059'];
  wheatVarieties.forEach((variety, index) => {
    products.push({
      name: `Wheat Seeds (${variety})`,
      description: `Drought-tolerant wheat variety suitable for ${index % 2 === 0 ? 'rainfed' : 'irrigated'} conditions. High protein content and excellent milling quality.`,
      category: 'seeds',
      subcategory: 'wheat_seeds',
      brand: seedBrands[(index + 3) % seedBrands.length],
      tags: ['wheat', variety.toLowerCase().replace(/\s+/g, '_'), 'drought_tolerant', 'high_protein', 'rabi'],
      cropType: ['wheat'],
      region: ['north_india', 'central_india', 'west_india'],
      seasonal: true,
      seasonStart: 'november',
      seasonEnd: 'march',
      price: 380 + (index * 15),
      basePrice: 380 + (index * 15),
      currentPrice: 380 + (index * 15),
      unit: 'kg',
      stock: 2500 + (index * 300),
      minOrderQuantity: 5,
      maxOrderQuantity: 1000,
      images: [`/images/products/wheat-seeds-${index + 1}.jpg`],
      specifications: {
        yield_potential: `${4.2 + index * 0.3}-${5.2 + index * 0.3} t/ha`,
        maturity_days: `${145 + index * 3}-${160 + index * 3}`,
        protein_content: `${11 + index}-${13 + index}%`,
        gluten_content: `${26 + index}-${30 + index}%`,
        disease_resistance: 'Rust, Powdery Mildew, Spot Blotch',
        drought_tolerance: index % 2 === 0 ? 'High' : 'Medium'
      },
      discount: index % 4 === 0 ? 3 : 0,
      isActive: true,
      isFeatured: index < 2,
      isTrending: index % 3 === 0,
      viewCount: 800 + (index * 150),
      purchaseCount: 350 + (index * 80),
      supplierRating: Math.min(5, 4.1 + (index * 0.08)),
      deliveryTime: 2,
      certifications: ['Seed Certification'],
      warranty: '6 months viability guarantee'
    });
  });

  // Generate 10 Maize Seeds
  const maizeVarieties = ['900M Gold', '900M Yellow', '900M White', 'P 3396', 'P 3522', 'DKC 9108', 'DKC 9161', 'P 1847', 'P 1848', 'DKC 7074'];
  maizeVarieties.forEach((variety, index) => {
    products.push({
      name: `Maize Seeds (${variety})`,
      description: `Premium quality maize hybrid with excellent yield potential and ${index % 2 === 0 ? 'drought' : 'pest'} resistance. Suitable for both Kharif and Rabi seasons.`,
      category: 'seeds',
      subcategory: 'maize_seeds',
      brand: seedBrands[(index + 6) % seedBrands.length],
      tags: ['maize', variety.toLowerCase().replace(/\s+/g, '_'), 'hybrid', 'high_yield', 'dual_purpose'],
      cropType: ['maize'],
      region: ['all_india'],
      seasonal: true,
      seasonStart: 'june',
      seasonEnd: 'march',
      price: 350 + (index * 20),
      basePrice: 350 + (index * 20),
      currentPrice: 350 + (index * 20),
      unit: 'kg',
      stock: 3000 + (index * 400),
      minOrderQuantity: 2,
      maxOrderQuantity: 800,
      images: [`/images/products/maize-seeds-${index + 1}.jpg`],
      specifications: {
        yield_potential: `${7.5 + index * 0.5}-${9 + index * 0.5} t/ha`,
        maturity_days: `${85 + index * 5}-${105 + index * 5}`,
        starch_content: `${68 + index * 0.5}-${72 + index * 0.5}%`,
        protein_content: `${7.5 + index * 0.2}-${9 + index * 0.2}%`,
        oil_content: `${3.5 + index * 0.2}-${5 + index * 0.2}%`,
        drought_tolerance: index % 2 === 0 ? 'High' : 'Medium',
        pest_resistance: index % 2 === 1 ? 'Stem Borer, Armyworm' : 'None'
      },
      discount: index % 3 === 0 ? 5 : 0,
      isActive: true,
      isFeatured: index < 2,
      isTrending: index % 3 === 0,
      viewCount: 1200 + (index * 250),
      purchaseCount: 600 + (index * 120),
      supplierRating: Math.min(5, 4.3 + (index * 0.09)),
      deliveryTime: 3,
      certifications: ['Seed Certification', 'Bt Technology'],
      warranty: '1 year germination guarantee'
    });
  });

  // Generate 10 Cotton Seeds
  const cottonVarieties = ['Bt Cotton 302', 'Bt Cotton 299', 'Bt Cotton 601', 'Bt Cotton 645', 'Bt Cotton 617', 'Bt Cotton 634', 'Bt Cotton 651', 'Bt Cotton 622', 'Bt Cotton 621', 'Bt Cotton 618'];
  cottonVarieties.forEach((variety, index) => {
    products.push({
      name: `Cotton Seeds (${variety})`,
      description: `Genetically modified cotton seeds with built-in pest resistance. High fiber quality and excellent yield.`,
      category: 'seeds',
      subcategory: 'cotton_seeds',
      brand: seedBrands[(index + 2) % seedBrands.length],
      tags: ['cotton', variety.toLowerCase().replace(/\s+/g, '_'), 'bt_cotton', 'pest_resistant', 'high_fiber', 'kharif'],
      cropType: ['cotton'],
      region: index % 2 === 0 ? ['central_india', 'south_india'] : ['north_india', 'west_india'],
      seasonal: true,
      seasonStart: 'may',
      seasonEnd: 'december',
      price: 600 + (index * 30),
      basePrice: 600 + (index * 30),
      currentPrice: 600 + (index * 30),
      unit: 'kg',
      stock: 1500 + (index * 200),
      minOrderQuantity: 1,
      maxOrderQuantity: 300,
      images: [`/images/products/cotton-seeds-${index + 1}.jpg`],
      specifications: {
        yield_potential: `${22 + index * 2}-${28 + index * 2} q/ha`,
        maturity_days: `${155 + index * 5}-${175 + index * 5}`,
        fiber_length: `${27 + index * 0.5}-${31 + index * 0.5} mm`,
        micronaire: `${3.6 + index * 0.1}-${4.2 + index * 0.1}`,
        boll_weight: `${4.2 + index * 0.2}-${5.2 + index * 0.2} g`,
        pest_resistance: 'American Bollworm, Pink Bollworm',
        herbicide_tolerance: 'Yes'
      },
      discount: index % 2 === 0 ? 8 : 5,
      isActive: true,
      isFeatured: index < 2,
      isTrending: index % 3 === 0,
      viewCount: 900 + (index * 180),
      purchaseCount: 400 + (index * 90),
      supplierRating: Math.min(5, 4.4 + (index * 0.07)),
      deliveryTime: 4,
      certifications: ['Bt Technology', 'GEAC Approved'],
      warranty: '1 year germination guarantee'
    });
  });

  // Generate 10 Vegetable Seeds
  const vegetableSeeds = [
    { name: 'Tomato Hybrid Seeds', variety: 'Hybrid', price: 120 },
    { name: 'Chili Seeds', variety: 'Bird Eye', price: 85 },
    { name: 'Brinjal Seeds', variety: 'Long Purple', price: 95 },
    { name: 'Okra Seeds', variety: 'Pusa Sawani', price: 75 },
    { name: 'Cucumber Seeds', variety: 'Japanese Long', price: 110 },
    { name: 'Bitter Gourd Seeds', variety: 'Pusa Do Mausami', price: 80 },
    { name: 'Bottle Gourd Seeds', variety: 'Pusa Naveen', price: 70 },
    { name: 'Ridge Gourd Seeds', variety: 'Pusa Nasdar', price: 65 },
    { name: 'Cauliflower Seeds', variety: 'Pusa Snowball', price: 90 },
    { name: 'Cabbage Seeds', variety: 'Golden Acre', price: 85 }
  ];

  vegetableSeeds.forEach((seed, index) => {
    products.push({
      name: `${seed.name} (${seed.variety})`,
      description: `High-quality ${seed.name.toLowerCase()} for commercial cultivation. Excellent yield and disease resistance.`,
      category: 'seeds',
      subcategory: 'vegetable_seeds',
      brand: seedBrands[index % seedBrands.length],
      tags: [seed.name.toLowerCase().replace(/\s+/g, '_'), 'vegetable', 'commercial', 'high_yield'],
      cropType: ['vegetables'],
      region: ['all_india'],
      seasonal: false,
      price: seed.price,
      basePrice: seed.price,
      currentPrice: seed.price,
      unit: 'packet',
      stock: 1000 + (index * 100),
      minOrderQuantity: 1,
      maxOrderQuantity: 100,
      images: [`/images/products/vegetable-seeds-${index + 1}.jpg`],
      specifications: {
        yield_potential: `${25 + index * 5}-${35 + index * 5} t/ha`,
        maturity_days: `${55 + index * 5}-${75 + index * 5}`,
        disease_resistance: 'Various pests and diseases',
        germination_rate: '85% minimum'
      },
      discount: index % 4 === 0 ? 10 : 0,
      isActive: true,
      isFeatured: index < 2,
      isTrending: index % 3 === 0,
      viewCount: 400 + (index * 80),
      purchaseCount: 150 + (index * 30),
      supplierRating: Math.min(5, 4.0 + (index * 0.03)),
      deliveryTime: 1,
      certifications: ['Seed Certification'],
      warranty: '6 months viability guarantee'
    });
  });

  // Generate 10 Flower Seeds
  const flowerSeeds = [
    { name: 'Rose Seeds', variety: 'Hybrid Red', price: 95 },
    { name: 'Marigold Seeds', variety: 'African Orange', price: 45 },
    { name: 'Sunflower Seeds', variety: 'Giant Yellow', price: 55 },
    { name: 'Chrysanthemum Seeds', variety: 'White Dwarf', price: 85 },
    { name: 'Jasmine Seeds', variety: 'Madurai', price: 120 },
    { name: 'Hibiscus Seeds', variety: 'Red Single', price: 65 },
    { name: 'Lotus Seeds', variety: 'Sacred Pink', price: 150 },
    { name: 'Dahlia Seeds', variety: 'Dinner Plate', price: 180 },
    { name: 'Gladiolus Seeds', variety: 'White Prosperity', price: 200 },
    { name: 'Tuberose Seeds', variety: 'Single', price: 85 }
  ];

  flowerSeeds.forEach((seed, index) => {
    products.push({
      name: `${seed.name} (${seed.variety})`,
      description: `Beautiful ${seed.name.toLowerCase()} seeds for garden and commercial cultivation.`,
      category: 'seeds',
      subcategory: 'flower_seeds',
      brand: 'Floral Gardens',
      tags: [seed.name.toLowerCase(), 'flowers', 'ornamental', 'garden'],
      cropType: ['flowers'],
      region: ['all_india'],
      seasonal: false,
      price: seed.price,
      basePrice: seed.price,
      currentPrice: seed.price,
      unit: 'packet',
      stock: 600 + (index * 50),
      minOrderQuantity: 1,
      maxOrderQuantity: 50,
      images: [`/images/products/flower-seeds-${index + 1}.jpg`],
      specifications: {
        blooming_period: '6-8 months',
        germination_rate: '70% minimum',
        climate_suitability: 'Tropical, Sub-tropical'
      },
      discount: index % 3 === 0 ? 20 : 0,
      isActive: true,
      isFeatured: index < 2,
      isTrending: index % 3 === 0,
      viewCount: 300 + (index * 60),
      purchaseCount: 100 + (index * 20),
      supplierRating: 3.8 + (index * 0.02),
      deliveryTime: 1,
      certifications: ['Seed Certification'],
      warranty: '3 months viability guarantee'
    });
  });

  // Generate 10 Fertilizers
  const fertilizers = [
    { name: 'NPK Fertilizer', formula: '20-20-20', price: 1200, type: 'chemical_fertilizer' },
    { name: 'NPK Fertilizer', formula: '10-26-26', price: 1350, type: 'chemical_fertilizer' },
    { name: 'NPK Fertilizer', formula: '17-17-17', price: 1180, type: 'chemical_fertilizer' },
    { name: 'Urea Fertilizer', formula: '46-0-0', price: 580, type: 'chemical_fertilizer' },
    { name: 'DAP Fertilizer', formula: '18-46-0', price: 1400, type: 'chemical_fertilizer' },
    { name: 'MOP Fertilizer', formula: '0-0-60', price: 1800, type: 'chemical_fertilizer' },
    { name: 'Organic Vermicompost', formula: '1.5-0.8-0.6', price: 180, type: 'organic_fertilizer' },
    { name: 'Neem Cake Organic', formula: '5-1-2', price: 220, type: 'organic_fertilizer' },
    { name: 'Bone Meal Organic', formula: '3-15-0', price: 350, type: 'organic_fertilizer' },
    { name: 'Cow Dung Manure Organic', formula: '0.5-0.2-0.5', price: 120, type: 'organic_fertilizer' }
  ];

  fertilizers.forEach((fert, index) => {
    products.push({
      name: `${fert.name} (${fert.formula})`,
      description: `${fert.type === 'organic_fertilizer' ? 'Organic' : 'Chemical'} fertilizer providing essential nutrients for healthy plant growth.`,
      category: 'fertilizers',
      subcategory: fert.type,
      brand: fert.type === 'organic_fertilizer' ? 'BioFert' : 'Coromandel',
      tags: [fert.name.toLowerCase().replace(/\s+/g, '_'), fert.type, 'nutrients', 'plant_growth'],
      cropType: ['paddy', 'wheat', 'maize', 'vegetables', 'fruits'],
      region: ['all_india'],
      seasonal: false,
      price: fert.price,
      basePrice: fert.price,
      currentPrice: fert.price,
      unit: 'bag',
      stock: 500 + (index * 100),
      minOrderQuantity: 1,
      maxOrderQuantity: 50,
      images: [`/images/products/fertilizer-${index + 1}.jpg`],
      specifications: fert.type === 'organic_fertilizer' ? {
        organic_matter: '25-30%',
        nitrogen: fert.formula.split('-')[0] + '%',
        phosphorus: fert.formula.split('-')[1] + '%',
        potassium: fert.formula.split('-')[2] + '%',
        ph_range: '6.5-7.5',
        moisture: '20-25%',
        beneficial_bacteria: 'Present'
      } : {
        nitrogen: fert.formula.split('-')[0] + '%',
        phosphorus: fert.formula.split('-')[1] + '%',
        potassium: fert.formula.split('-')[2] + '%',
        moisture: '1.5% maximum',
        particle_size: '1-4 mm',
        solubility: '100%',
        ph_range: '6.0-7.0'
      },
      discount: index % 3 === 0 ? 5 : 0,
      isActive: true,
      isFeatured: index < 2,
      isTrending: index % 3 === 0,
      viewCount: 600 + (index * 100),
      purchaseCount: 250 + (index * 50),
      supplierRating: 4.2 + (index * 0.05),
      deliveryTime: 2,
      certifications: fert.type === 'organic_fertilizer' ? ['Organic Certification', 'NPOP'] : ['FCO', 'ISO 9001'],
      warranty: fert.type === 'organic_fertilizer' ? '1 year shelf life' : '2 years shelf life'
    });
  });

  // Generate 10 Pesticides
  const pesticides = [
    { name: 'Neem Oil Pesticide', type: 'bio_pesticide', price: 450, concentration: 'Cold Pressed' },
    { name: 'Imidacloprid Insecticide', type: 'chemical_pesticide', price: 850, concentration: '17.8% SL' },
    { name: 'Chlorpyrifos Insecticide', type: 'chemical_pesticide', price: 720, concentration: '20% EC' },
    { name: 'Mancozeb Fungicide', type: 'chemical_pesticide', price: 650, concentration: '75% WP' },
    { name: 'Carbendazim Fungicide', type: 'chemical_pesticide', price: 580, concentration: '50% WP' },
    { name: 'Glyphosate Herbicide', type: 'chemical_pesticide', price: 380, concentration: '41% SL' },
    { name: 'Bacillus Thuringiensis', type: 'bio_pesticide', price: 320, concentration: 'Bio-insecticide' },
    { name: 'Trichoderma Fungicide', type: 'bio_pesticide', price: 280, concentration: 'Bio-fungicide' },
    { name: 'Beauveria Bassiana', type: 'bio_pesticide', price: 350, concentration: 'Bio-insecticide' },
    { name: 'Azoxystrobin Fungicide', type: 'chemical_pesticide', price: 2100, concentration: '23% SC' }
  ];

  pesticides.forEach((pest, index) => {
    products.push({
      name: `${pest.name} (${pest.concentration})`,
      description: `${pest.type === 'bio_pesticide' ? 'Natural bio-pesticide' : 'Chemical pesticide'} for effective pest and disease control.`,
      category: 'pesticides',
      subcategory: pest.type,
      brand: pest.type === 'bio_pesticide' ? 'Organic India' : 'Syngenta',
      tags: [pest.name.toLowerCase().replace(/\s+/g, '_'), pest.type, 'pest_control', 'disease_control'],
      cropType: ['paddy', 'wheat', 'cotton', 'vegetables', 'fruits'],
      region: ['all_india'],
      seasonal: false,
      price: pest.price,
      basePrice: pest.price,
      currentPrice: pest.price,
      unit: 'liter',
      stock: 300 + (index * 50),
      minOrderQuantity: 1,
      maxOrderQuantity: 50,
      images: [`/images/products/pesticide-${index + 1}.jpg`],
      specifications: pest.type === 'bio_pesticide' ? {
        azadirachtin_content: '1500-2000 ppm',
        purity: '100% pure neem oil',
        extraction_method: 'Cold pressed',
        color: 'Golden yellow',
        odor: 'Characteristic neem',
        solubility: 'Oil soluble',
        storage: 'Cool, dry place'
      } : {
        active_ingredient: pest.name,
        concentration: pest.concentration,
        formulation: pest.concentration.split(' ')[1],
        toxicity_class: 'II or III',
        mode_of_action: 'Systemic/Contact',
        residual_effect: '7-14 days',
        compatibility: 'Compatible with most pesticides'
      },
      discount: index % 4 === 0 ? 10 : 0,
      isActive: true,
      isFeatured: index < 2,
      isTrending: index % 3 === 0,
      viewCount: 450 + (index * 80),
      purchaseCount: 180 + (index * 35),
      supplierRating: Math.min(5, 4.1 + (index * 0.04)),
      deliveryTime: 2,
      certifications: pest.type === 'bio_pesticide' ? ['Organic', 'NPOP'] : ['CIB Registration'],
      warranty: '2 years shelf life'
    });
  });

  // Generate 10 Equipment
  const equipment = [
    { name: 'Tractor Trolley', type: 'transport_equipment', price: 45000, capacity: '2 tons' },
    { name: 'Power Sprayer', type: 'spraying_equipment', price: 8500, capacity: '16 liters' },
    { name: 'Solar Insect Trap', type: 'pest_control_equipment', price: 3200, capacity: '500 sqm coverage' },
    { name: 'Greenhouse Plastic Sheet', type: 'greenhouse_equipment', price: 85, capacity: '200 micron' },
    { name: 'Drip Irrigation Kit', type: 'irrigation_equipment', price: 12500, capacity: '1 acre' },
    { name: 'Rotavator', type: 'tillage_equipment', price: 65000, capacity: '42 inches' },
    { name: 'Seed Drill', type: 'planting_equipment', price: 28000, capacity: '9 rows' },
    { name: 'Harvester', type: 'harvesting_equipment', price: 185000, capacity: '2 tons/hour' },
    { name: 'Threshing Machine', type: 'processing_equipment', price: 95000, capacity: '1 ton/hour' },
    { name: 'Rice Transplanter', type: 'planting_equipment', price: 125000, capacity: '4 rows' }
  ];

  equipment.forEach((equip, index) => {
    products.push({
      name: `${equip.name} (${equip.capacity})`,
      description: `High-quality ${equip.type.replace('_', ' ')} for efficient agricultural operations.`,
      category: 'equipment',
      subcategory: equip.type,
      brand: ['FarmKing', 'Kirloskar', 'AgriTech Solutions', 'PolyGreen', 'Jain Irrigation'][index % 5],
      tags: [equip.name.toLowerCase().replace(/\s+/g, '_'), equip.type, 'agricultural_equipment'],
      cropType: ['paddy', 'wheat', 'maize', 'vegetables'],
      region: ['all_india'],
      seasonal: false,
      price: equip.price,
      basePrice: equip.price,
      currentPrice: equip.price,
      unit: equip.price > 10000 ? 'piece' : 'meter',
      stock: 50 - (index * 5),
      minOrderQuantity: 1,
      maxOrderQuantity: equip.price > 50000 ? 2 : 10,
      images: [`/images/products/equipment-${index + 1}.jpg`],
      specifications: {
        capacity: equip.capacity,
        material: 'High-quality steel/plastic',
        power_source: equip.name.includes('Solar') ? 'Solar' : 'Manual/Electric',
        weight: `${20 + index * 10}-${50 + index * 20} kg`,
        dimensions: 'Standard agricultural size',
        warranty: '1 year comprehensive warranty'
      },
      discount: index % 3 === 0 ? 5 : 0,
      isActive: true,
      isFeatured: index < 2,
      isTrending: index % 3 === 0,
      viewCount: 300 + (index * 50),
      purchaseCount: 15 + (index * 5),
      supplierRating: 4.3 + (index * 0.03),
      deliveryTime: equip.price > 50000 ? 15 : 5,
      certifications: ['ISI Mark'],
      warranty: '1 year comprehensive warranty'
    });
  });

  // Generate 10 Farm Machinery
  const machinery = [
    { name: 'Mini Tractor', type: 'tractor', price: 285000, power: '12 HP' },
    { name: 'Power Tiller', type: 'tiller', price: 125000, power: '8 HP' },
    { name: 'Disc Harrow', type: 'tillage_tool', price: 45000, size: '7 feet' },
    { name: 'Cultivator', type: 'tillage_tool', price: 35000, size: '9 tines' },
    { name: 'Plough', type: 'tillage_tool', price: 28000, size: '2 bottom' },
    { name: 'Sprinkler System', type: 'irrigation_system', price: 85000, coverage: '5 acres' },
    { name: 'Grain Dryer', type: 'processing_machine', price: 165000, capacity: '2 tons' },
    { name: 'Milking Machine', type: 'dairy_equipment', price: 75000, capacity: '10 cows/hour' },
    { name: 'Feed Mixer', type: 'feed_equipment', price: 95000, capacity: '500 kg/batch' },
    { name: 'Silage Cutter', type: 'feed_equipment', price: 65000, capacity: '2 tons/hour' }
  ];

  machinery.forEach((mach, index) => {
    products.push({
      name: `${mach.name} (${mach.power || mach.size || mach.capacity || mach.coverage})`,
      description: `Professional grade ${mach.type.replace('_', ' ')} for large-scale agricultural operations.`,
      category: 'farm_machinery',
      subcategory: mach.type,
      brand: ['Mahindra', 'TAFE', 'Sonalika', 'John Deere'][index % 4],
      tags: [mach.name.toLowerCase().replace(/\s+/g, '_'), mach.type, 'farm_machinery', 'commercial'],
      cropType: ['paddy', 'wheat', 'maize', 'cotton'],
      region: ['all_india'],
      seasonal: false,
      price: mach.price,
      basePrice: mach.price,
      currentPrice: mach.price,
      unit: 'piece',
      stock: 20 - (index * 2),
      minOrderQuantity: 1,
      maxOrderQuantity: 3,
      images: [`/images/products/machinery-${index + 1}.jpg`],
      specifications: {
        power: mach.power || 'N/A',
        capacity: mach.capacity || mach.coverage || 'N/A',
        fuel_type: 'Diesel',
        weight: `${500 + index * 200}-${1000 + index * 300} kg`,
        dimensions: 'Standard commercial size',
        warranty: '2 years comprehensive warranty'
      },
      discount: index % 2 === 0 ? 3 : 0,
      isActive: true,
      isFeatured: index < 2,
      isTrending: index % 3 === 0,
      viewCount: 200 + (index * 30),
      purchaseCount: 8 + (index * 2),
      supplierRating: Math.min(5, 4.4 + (index * 0.02)),
      deliveryTime: 20,
      certifications: ['ISI Mark', 'BIS'],
      warranty: '2 years comprehensive warranty'
    });
  });

  // Generate 10 Animal Husbandry
  const animalProducts = [
    { name: 'Fish Feed', type: 'fish_feed', price: 35, protein: '32%', unit: 'kg' },
    { name: 'Cow Feed Supplement', type: 'cattle_feed', price: 450, protein: '18%', unit: 'bag' },
    { name: 'Poultry Feed', type: 'poultry_feed', price: 28, protein: '16%', unit: 'kg' },
    { name: 'Cattle Mineral Mixture', type: 'cattle_supplement', price: 380, unit: 'bag' },
    { name: 'Broiler Feed', type: 'poultry_feed', price: 32, protein: '20%', unit: 'kg' },
    { name: 'Layer Feed', type: 'poultry_feed', price: 30, protein: '17%', unit: 'kg' },
    { name: 'Pig Feed', type: 'swine_feed', price: 42, protein: '16%', unit: 'kg' },
    { name: 'Goat Feed', type: 'ruminant_feed', price: 38, protein: '14%', unit: 'kg' },
    { name: 'Rabbit Feed', type: 'small_animal_feed', price: 45, protein: '18%', unit: 'kg' },
    { name: 'Duck Feed', type: 'poultry_feed', price: 31, protein: '15%', unit: 'kg' }
  ];

  animalProducts.forEach((animal, index) => {
    products.push({
      name: `${animal.name} (${animal.protein || 'Premium'})`,
      description: `High-quality ${animal.type.replace('_', ' ')} formulated for optimal animal health and productivity.`,
      category: 'animal_husbandry',
      subcategory: animal.type,
      brand: ['AquaFeed', 'VetCare', 'PoultryPro', 'NutriMix'][index % 4],
      tags: [animal.name.toLowerCase().replace(/\s+/g, '_'), animal.type, 'animal_feed', 'nutrition'],
      cropType: ['other'],
      region: ['all_india'],
      seasonal: false,
      price: animal.price,
      basePrice: animal.price,
      currentPrice: animal.price,
      unit: animal.unit,
      stock: 2000 + (index * 300),
      minOrderQuantity: animal.unit === 'bag' ? 1 : 50,
      maxOrderQuantity: animal.unit === 'bag' ? 50 : 5000,
      images: [`/images/products/animal-${index + 1}.jpg`],
      specifications: {
        protein_content: animal.protein || '16-18%',
        fat_content: '4-6%',
        fiber_content: '3-5%',
        ash_content: '10-12%',
        metabolizable_energy: '2800-3000 kcal/kg',
        calcium: '1.0-1.5%',
        phosphorus: '0.6-0.8%'
      },
      discount: index % 5 === 0 ? 5 : 0,
      isActive: true,
      isFeatured: index < 2,
      isTrending: index % 3 === 0,
      viewCount: 350 + (index * 60),
      purchaseCount: 120 + (index * 25),
      supplierRating: Math.min(5, 4.2 + (index * 0.03)),
      deliveryTime: 2,
      certifications: ['FSSAI', 'ISO 22000'],
      warranty: '6 months shelf life'
    });
  });

  // Generate 20 Produce Products
  const produceProducts = [
    { name: 'Fresh Tomatoes', variety: 'Hybrid Red', price: 25, unit: 'kg', category: 'produce', subcategory: 'vegetables' },
    { name: 'Organic Potatoes', variety: 'Desi', price: 18, unit: 'kg', category: 'produce', subcategory: 'vegetables' },
    { name: 'Fresh Onions', variety: 'Red', price: 22, unit: 'kg', category: 'produce', subcategory: 'vegetables' },
    { name: 'Green Chilies', variety: 'Bird Eye', price: 35, unit: 'kg', category: 'produce', subcategory: 'vegetables' },
    { name: 'Fresh Cabbage', variety: 'Round', price: 15, unit: 'kg', category: 'produce', subcategory: 'vegetables' },
    { name: 'Cauliflower', variety: 'Snowball', price: 28, unit: 'kg', category: 'produce', subcategory: 'vegetables' },
    { name: 'Fresh Carrots', variety: 'Orange', price: 32, unit: 'kg', category: 'produce', subcategory: 'vegetables' },
    { name: 'Brinjal', variety: 'Long Purple', price: 20, unit: 'kg', category: 'produce', subcategory: 'vegetables' },
    { name: 'Lady Finger', variety: 'Pusa Sawani', price: 30, unit: 'kg', category: 'produce', subcategory: 'vegetables' },
    { name: 'Fresh Cucumber', variety: 'Japanese Long', price: 24, unit: 'kg', category: 'produce', subcategory: 'vegetables' },
    { name: 'Fresh Mangoes', variety: 'Alphonso', price: 80, unit: 'kg', category: 'produce', subcategory: 'fruits' },
    { name: 'Bananas', variety: 'Cavendish', price: 45, unit: 'kg', category: 'produce', subcategory: 'fruits' },
    { name: 'Oranges', variety: 'Nagpur', price: 55, unit: 'kg', category: 'produce', subcategory: 'fruits' },
    { name: 'Apples', variety: 'Red Delicious', price: 120, unit: 'kg', category: 'produce', subcategory: 'fruits' },
    { name: 'Grapes', variety: 'Thompson Seedless', price: 85, unit: 'kg', category: 'produce', subcategory: 'fruits' },
    { name: 'Pineapple', variety: 'Queen Victoria', price: 65, unit: 'kg', category: 'produce', subcategory: 'fruits' },
    { name: 'Pomegranate', variety: 'Bhagwa', price: 95, unit: 'kg', category: 'produce', subcategory: 'fruits' },
    { name: 'Guava', variety: 'Allahabad Safeda', price: 40, unit: 'kg', category: 'produce', subcategory: 'fruits' },
    { name: 'Papaya', variety: 'Red Lady', price: 35, unit: 'kg', category: 'produce', subcategory: 'fruits' },
    { name: 'Watermelon', variety: 'Sugar Baby', price: 25, unit: 'kg', category: 'produce', subcategory: 'fruits' }
  ];

  produceProducts.forEach((prod, index) => {
    products.push({
      name: `${prod.name} (${prod.variety})`,
      description: `Fresh, high-quality ${prod.name.toLowerCase()} ${prod.subcategory.slice(0, -1)} harvested at peak ripeness.`,
      category: prod.category,
      subcategory: prod.subcategory,
      brand: 'FreshHarvest',
      tags: [prod.name.toLowerCase().replace(/\s+/g, '_'), prod.subcategory, 'fresh', 'organic', 'farm_fresh'],
      cropType: [prod.subcategory],
      region: ['all_india'],
      seasonal: true,
      seasonStart: index % 4 === 0 ? 'january' : index % 4 === 1 ? 'april' : index % 4 === 2 ? 'july' : 'october',
      seasonEnd: index % 4 === 0 ? 'march' : index % 4 === 1 ? 'june' : index % 4 === 2 ? 'september' : 'december',
      price: prod.price,
      basePrice: prod.price,
      currentPrice: prod.price,
      unit: prod.unit,
      stock: 500 + (index * 100),
      minOrderQuantity: 1,
      maxOrderQuantity: 100,
      images: [`/images/products/produce-${index + 1}.jpg`],
      specifications: {
        quality_grade: 'A Grade',
        shelf_life: '7-10 days',
        storage_temperature: '4-8°C',
        moisture_content: '85-90%',
        nutritional_value: 'High in vitamins and minerals',
        pesticide_residue: 'Below detectable limits'
      },
      discount: index % 5 === 0 ? 10 : 0,
      isActive: true,
      isFeatured: index < 4,
      isTrending: index % 3 === 0,
      viewCount: 500 + (index * 100),
      purchaseCount: 200 + (index * 50),
      supplierRating: 4.5,
      deliveryTime: 1,
      certifications: ['FSSAI', 'Organic Certification'],
      warranty: 'Freshness guaranteed'
    });
  });

  // Generate 10 Crop Protection Products
  const cropProtectionProducts = [
    { name: 'Copper Fungicide', type: 'fungicide', price: 650, concentration: '50% WP' },
    { name: 'Sulfur Dust', type: 'fungicide', price: 280, concentration: '80% WP' },
    { name: 'Bordeaux Mixture', type: 'fungicide', price: 420, concentration: 'Liquid' },
    { name: 'Captan Fungicide', type: 'fungicide', price: 580, concentration: '50% WP' },
    { name: 'Propiconazole Fungicide', type: 'fungicide', price: 1250, concentration: '25% EC' },
    { name: 'Lambda Cyhalothrin', type: 'insecticide', price: 920, concentration: '5% EC' },
    { name: 'Thiamethoxam Insecticide', type: 'insecticide', price: 1100, concentration: '25% WG' },
    { name: 'Emamectin Benzoate', type: 'insecticide', price: 2800, concentration: '5% SG' },
    { name: 'Acetamiprid Insecticide', type: 'insecticide', price: 850, concentration: '20% SP' },
    { name: 'Fipronil Insecticide', type: 'insecticide', price: 1650, concentration: '5% SC' }
  ];

  cropProtectionProducts.forEach((cp, index) => {
    products.push({
      name: `${cp.name} (${cp.concentration})`,
      description: `Effective ${cp.type} for comprehensive crop protection against pests and diseases.`,
      category: 'crop_protection',
      subcategory: cp.type,
      brand: 'AgriShield',
      tags: [cp.name.toLowerCase().replace(/\s+/g, '_'), cp.type, 'crop_protection', 'pest_control', 'disease_control'],
      cropType: ['paddy', 'wheat', 'cotton', 'vegetables', 'fruits', 'maize'],
      region: ['all_india'],
      seasonal: false,
      price: cp.price,
      basePrice: cp.price,
      currentPrice: cp.price,
      unit: 'liter',
      stock: 200 + (index * 30),
      minOrderQuantity: 1,
      maxOrderQuantity: 25,
      images: [`/images/products/crop-protection-${index + 1}.jpg`],
      specifications: {
        active_ingredient: cp.name,
        concentration: cp.concentration,
        formulation: cp.concentration.split(' ')[1],
        toxicity_class: 'II or III',
        mode_of_action: cp.type === 'fungicide' ? 'Protective/Curative' : 'Systemic/Contact',
        residual_effect: '10-21 days',
        compatibility: 'Compatible with most pesticides',
        application_method: 'Spraying'
      },
      discount: index % 4 === 0 ? 8 : 0,
      isActive: true,
      isFeatured: index < 2,
      isTrending: index % 3 === 0,
      viewCount: 400 + (index * 70),
      purchaseCount: 150 + (index * 30),
      supplierRating: Math.min(5, 4.3 + (index * 0.04)),
      deliveryTime: 2,
      certifications: ['CIB Registration', 'ISO 9001'],
      warranty: '2 years shelf life'
    });
  });

  // Generate 10 Dairy Inputs Products
  const dairyInputsProducts = [
    { name: 'Cow Feed Concentrate', type: 'feed_supplement', price: 520, protein: '22%', unit: 'bag' },
    { name: 'Buffalo Feed Mix', type: 'feed_supplement', price: 480, protein: '20%', unit: 'bag' },
    { name: 'Calf Starter Feed', type: 'calf_feed', price: 650, protein: '24%', unit: 'bag' },
    { name: 'Dairy Mineral Block', type: 'mineral_supplement', price: 180, unit: 'piece' },
    { name: 'Urea Molasses Block', type: 'feed_supplement', price: 220, unit: 'piece' },
    { name: 'Bypass Fat Supplement', type: 'fat_supplement', price: 380, unit: 'kg' },
    { name: 'Yeast Culture', type: 'digestive_enhancer', price: 450, unit: 'kg' },
    { name: 'Electrolyte Powder', type: 'health_supplement', price: 320, unit: 'kg' },
    { name: 'Mastitis Prevention Powder', type: 'health_supplement', price: 580, unit: 'kg' },
    { name: 'Hoof Care Supplement', type: 'health_supplement', price: 420, unit: 'kg' }
  ];

  dairyInputsProducts.forEach((dairy, index) => {
    products.push({
      name: `${dairy.name} (${dairy.protein || 'Premium'})`,
      description: `Specialized dairy input supplement for enhanced milk production and cattle health.`,
      category: 'dairy_inputs',
      subcategory: dairy.type,
      brand: 'DairyBoost',
      tags: [dairy.name.toLowerCase().replace(/\s+/g, '_'), dairy.type, 'dairy', 'cattle_health', 'milk_production'],
      cropType: ['other'],
      region: ['all_india'],
      seasonal: false,
      price: dairy.price,
      basePrice: dairy.price,
      currentPrice: dairy.price,
      unit: dairy.unit,
      stock: 1500 + (index * 200),
      minOrderQuantity: dairy.unit === 'piece' ? 5 : 1,
      maxOrderQuantity: dairy.unit === 'piece' ? 100 : 20,
      images: [`/images/products/dairy-${index + 1}.jpg`],
      specifications: {
        protein_content: dairy.protein || '18-22%',
        fat_content: '2-4%',
        fiber_content: '8-12%',
        calcium: '1.5-2.5%',
        phosphorus: '0.8-1.2%',
        metabolizable_energy: '2500-2800 kcal/kg',
        milk_production_increase: '15-25%',
        palatability: 'High'
      },
      discount: index % 3 === 0 ? 5 : 0,
      isActive: true,
      isFeatured: index < 2,
      isTrending: index % 4 === 0,
      viewCount: 250 + (index * 40),
      purchaseCount: 80 + (index * 15),
      supplierRating: Math.min(5, 4.4 + (index * 0.03)),
      deliveryTime: 2,
      certifications: ['FSSAI', 'ISO 22000', 'Veterinary Approved'],
      warranty: '1 year shelf life'
    });
  });

  // Write the generated products to a JSON file
  const outputPath = path.join(__dirname, 'products.json');
  fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
  console.log(`Generated ${products.length} comprehensive agricultural products and saved to ${outputPath}`);

  return products;
}

// Run the generator if called directly
if (require.main === module) {
  generateComprehensiveProducts();
}

module.exports = generateComprehensiveProducts;