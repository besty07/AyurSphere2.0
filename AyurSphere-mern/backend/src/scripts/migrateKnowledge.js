/**
 * Migration script: Populates detailed Ayurvedic knowledge into existing plant documents.
 * Run: node src/scripts/migrateKnowledge.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { Plant } from '../models/Plant.js';
import { connectDB } from '../config/db.js';

const knowledgeMap = {
  Tulsi: {
    aka: 'Holy Basil',
    overview: [
      'Tulsi is revered as "The Queen of Herbs" and is considered sacred in Hinduism.',
      'It is one of the most cultivated and commonly used plants in Ayurvedic households.',
      'Contains phytochemicals including eugenol, ursolic acid, rosmarinic acid, and ocimumosides.',
      'Classified as a Rasayana (rejuvenator) that promotes longevity and overall wellbeing.',
      'Acts as an adaptogen, helping the body cope with physical, chemical, and emotional stress.',
      'Has been used in Ayurveda for over 5,000 years for spiritual and medicinal purposes.'
    ],
    diseases: ['Common cold & flu', 'Bronchitis & asthma', 'Fever & malaria', 'Stress & anxiety disorders', 'Diabetes (adjunct therapy)', 'Heart disease & high cholesterol'],
    partsUsed: [
      { part: 'Leaves', uses: 'Anti-inflammatory, immunity booster, respiratory support — chewed raw or made into tea' },
      { part: 'Seeds', uses: 'Helps in urinary disorders and strengthens the reproductive system' },
      { part: 'Root', uses: 'Used in malarial fever and as a general tonic in decoctions' },
      { part: 'Stem', uses: 'Antibacterial — used in making mala beads and purifying water' }
    ],
    usageMethods: [
      { emoji: '🍵', name: 'Tulsi Tea', desc: 'Boil 8-10 fresh leaves in 2 cups water for 5 min. Add honey and lemon. Drink 2-3 times daily for immunity.' },
      { emoji: '🌿', name: 'Fresh Leaf Chewing', desc: 'Chew 4-5 fresh leaves on empty stomach daily to boost metabolism and purify blood.' },
      { emoji: '💧', name: 'Tulsi Drops', desc: 'Add 2-3 drops of Tulsi extract in warm water. Drink daily for respiratory and stress relief.' },
      { emoji: '🧴', name: 'Tulsi Paste (External)', desc: 'Grind fresh leaves with turmeric. Apply on insect bites, ringworm, or skin infections.' }
    ],
    ayurvedicProfile: { rasa: 'Pungent, Bitter', virya: 'Heating', vipaka: 'Pungent', dosha: 'Balances Kapha & Vata, increases Pitta' }
  },

  Ashwagandha: {
    aka: 'Indian Ginseng / Winter Cherry',
    overview: [
      'Ashwagandha literally means "smell of horse" — imparting strength and vitality.',
      'It is one of the most important adaptogenic herbs in the Ayurvedic pharmacopoeia.',
      'Contains withanolides — steroidal lactones that are the primary bioactive compounds.',
      'Classified as Medhya Rasayana — a brain tonic that enhances cognitive function.',
      'Clinically studied for reducing cortisol levels by up to 30% in stressed individuals.',
      'Used for over 3,000 years to relieve stress, increase energy, and improve concentration.'
    ],
    diseases: ['Chronic stress & anxiety', 'Insomnia & sleep disorders', 'Male infertility', 'Hypothyroidism', 'Arthritis & joint inflammation', 'Adrenal fatigue'],
    partsUsed: [
      { part: 'Root', uses: 'Primary medicinal part — used as powder (Churna) for strength, immunity, and vitality' },
      { part: 'Leaves', uses: 'Anti-inflammatory — used topically as poultice for wounds, boils, and swelling' },
      { part: 'Berries', uses: 'Used as a substitute for rennet in cheese making and as a blood purifier' },
      { part: 'Seeds', uses: 'Antiparasitic properties — used in traditional deworming formulations' }
    ],
    usageMethods: [
      { emoji: '🥛', name: 'Ashwagandha Milk', desc: 'Mix 1 tsp powder in warm milk with honey before bed. Promotes deep sleep and reduces stress.' },
      { emoji: '💊', name: 'Capsule/Tablet', desc: '300-600mg standardized extract twice daily with meals for energy and vitality.' },
      { emoji: '🍯', name: 'Ashwagandha Lehyam', desc: 'Mix powder with ghee, honey, and sugar. Take 1 tsp daily as a rejuvenating tonic.' },
      { emoji: '🫖', name: 'Root Decoction', desc: 'Boil 5g root in 200ml water until reduced to half. Strain and drink for joint pain relief.' }
    ],
    ayurvedicProfile: { rasa: 'Bitter, Astringent', virya: 'Heating', vipaka: 'Sweet', dosha: 'Balances Kapha & Vata' }
  },

  Neem: {
    aka: 'Village Pharmacy / Nimba',
    overview: [
      'Neem is called "Sarva Roga Nivarini" — the curer of all ailments in Ayurveda.',
      'Every part of the neem tree has medicinal value — leaves, bark, seeds, flowers, and oil.',
      'Contains over 140 bioactive compounds including nimbin, nimbidin, and azadirachtin.',
      'One of the most important trees in traditional Indian medicine and agriculture.',
      'Has powerful antibacterial, antifungal, and antiviral properties scientifically proven.',
      'Used both internally for detoxification and externally for skin and dental health.'
    ],
    diseases: ['Acne, eczema & psoriasis', 'Diabetes (blood sugar regulation)', 'Malaria & dengue fever', 'Intestinal worms & parasites', 'Dental caries & gum disease', 'Fungal infections & dandruff'],
    partsUsed: [
      { part: 'Leaves', uses: 'Blood purifier, anti-diabetic — boiled and consumed as tea or applied as paste for skin' },
      { part: 'Bark', uses: 'Antimalarial, dental care — chewed as natural toothbrush (datun) or decoction for fever' },
      { part: 'Seeds/Oil', uses: 'Antifungal, insecticidal — applied externally for lice, scabies, and skin infections' },
      { part: 'Flowers', uses: 'Digestive aid — eaten raw or cooked for stomach worms and appetite improvement' }
    ],
    usageMethods: [
      { emoji: '🍵', name: 'Neem Leaf Tea', desc: 'Boil 10-15 neem leaves in water for 5 min. Drink on empty stomach for blood purification and diabetes.' },
      { emoji: '🪥', name: 'Neem Datun (Twig)', desc: 'Chew a fresh neem twig daily as a toothbrush. Natural antibacterial for gum health.' },
      { emoji: '🧴', name: 'Neem Paste', desc: 'Grind fresh leaves into paste. Apply on acne, boils, and fungal infections. Leave 20 min, wash off.' },
      { emoji: '💧', name: 'Neem Water Bath', desc: 'Boil 30-40 neem leaves in bathing water. Soak to treat skin rashes, itching, and chickenpox.' }
    ],
    ayurvedicProfile: { rasa: 'Bitter, Astringent', virya: 'Cooling', vipaka: 'Pungent', dosha: 'Balances Pitta & Kapha' }
  },

  Brahmi: {
    aka: 'Water Hyssop / Brain Herb',
    overview: [
      'Brahmi is named after "Brahma" — the Hindu god of creation, signifying its supreme cognitive benefits.',
      'It is one of the primary Medhya Rasayanas (brain tonics) mentioned in Charaka Samhita.',
      'Contains bacosides A and B, which repair damaged neurons and enhance nerve impulse transmission.',
      'Studies show improved memory retention by up to 25% after 12 weeks of regular use.',
      'Also functions as a powerful anxiolytic (anti-anxiety) herb without sedative side effects.',
      'Traditionally given to children in India to sharpen intellect and improve academic performance.'
    ],
    diseases: ['Memory loss & cognitive decline', 'ADHD in children', 'Anxiety & panic disorders', 'Epilepsy (adjunct therapy)', "Alzheimer's disease (early stage)", 'Insomnia caused by mental restlessness'],
    partsUsed: [
      { part: 'Whole Plant', uses: 'Rich in bacosides — used in juice, powder, and extract form for brain health' },
      { part: 'Leaves', uses: 'Primary medicinal part — eaten raw, juiced, or dried for memory enhancement' },
      { part: 'Stem', uses: 'Contains similar alkaloids — used alongside leaves in decoctions' }
    ],
    usageMethods: [
      { emoji: '🧃', name: 'Brahmi Juice', desc: 'Extract juice from fresh leaves. Take 2 tsp with honey on empty stomach for memory.' },
      { emoji: '🥛', name: 'Brahmi Ghrita', desc: 'Cook Brahmi in cow ghee. Take 1 tsp daily — traditional brain tonic for students.' },
      { emoji: '💊', name: 'Brahmi Powder', desc: '1-2g powder with warm milk at bedtime. Calms mind and improves sleep quality.' },
      { emoji: '🧴', name: 'Brahmi Oil (Head Massage)', desc: 'Massage Brahmi-infused coconut oil on scalp. Cools the mind and reduces hair fall.' }
    ],
    ayurvedicProfile: { rasa: 'Bitter, Astringent', virya: 'Cooling', vipaka: 'Sweet', dosha: 'Balances all three doshas (Tridoshahara)' }
  },

  'Aloe Vera': {
    aka: 'Kumari / Ghrit Kumari',
    overview: [
      'Aloe Vera is called "Kumari" in Sanskrit, meaning young girl — symbolizing its anti-aging properties.',
      'The gel contains over 75 bioactive compounds including vitamins, minerals, amino acids, and enzymes.',
      'Used in Ayurveda as a Rasayana (rejuvenator) for skin, digestion, and reproductive health.',
      'Contains acemannan — a polysaccharide that boosts immune function and wound healing.',
      'The latex (yellow layer) is a potent laxative, while the inner gel is soothing and healing.',
      'One of the few plants effective both internally (digestion) and externally (skin/hair).'
    ],
    diseases: ['Burns, cuts & wounds', 'Constipation & IBS', 'Acne & skin inflammation', 'Gastric ulcers', 'Sunburn & UV damage', 'Hair fall & dandruff'],
    partsUsed: [
      { part: 'Inner Gel', uses: 'Wound healing, skin moisturizing — applied directly or blended into juice for digestion' },
      { part: 'Latex (Yellow Layer)', uses: 'Potent laxative — used in small amounts for constipation relief (use with caution)' },
      { part: 'Whole Leaf', uses: 'Extract juice for internal use — supports liver, digestion, and immunity' }
    ],
    usageMethods: [
      { emoji: '🧃', name: 'Aloe Juice', desc: 'Blend 2 tbsp fresh gel with water. Drink on empty stomach for digestion and detox.' },
      { emoji: '🧴', name: 'Fresh Gel Application', desc: 'Slice leaf, scoop gel. Apply directly on burns, cuts, acne, or sunburn for instant relief.' },
      { emoji: '💆', name: 'Aloe Hair Mask', desc: 'Mix gel with coconut oil and fenugreek paste. Apply to scalp for 30 min to reduce hair fall.' },
      { emoji: '🍯', name: 'Aloe + Honey Face Pack', desc: 'Mix equal parts gel and honey. Apply on face for 15 min. Natural moisturizer and anti-acne.' }
    ],
    ayurvedicProfile: { rasa: 'Bitter, Sweet', virya: 'Cooling', vipaka: 'Sweet', dosha: 'Balances all three doshas' }
  },

  Ginger: {
    aka: 'Shunthi (dry) / Ardrak (fresh)',
    overview: [
      'Ginger is called "Vishwabhesaj" in Ayurveda — meaning universal medicine.',
      'Fresh ginger (Ardrak) and dry ginger (Shunthi) have different therapeutic properties.',
      'Contains gingerols and shogaols — powerful anti-inflammatory and antioxidant compounds.',
      'One of the most commonly used spices in both cooking and medicine across all cultures.',
      'Increases Agni (digestive fire) — the foundation of health according to Ayurveda.',
      'Clinically proven to be as effective as certain drugs for nausea, motion sickness, and morning sickness.'
    ],
    diseases: ['Nausea & morning sickness', 'Osteoarthritis & rheumatoid arthritis', 'Indigestion & bloating', 'Common cold & sore throat', 'Menstrual cramps (dysmenorrhea)', 'Motion sickness & vertigo'],
    partsUsed: [
      { part: 'Fresh Rhizome', uses: 'Anti-emetic, digestive — used in tea, juice, cooking, and poultices for pain relief' },
      { part: 'Dried Rhizome (Shunthi)', uses: 'Stronger medicinal potency — used as powder in formulations for joints and metabolism' },
      { part: 'Ginger Oil', uses: 'Extracted from rhizome — used in aromatherapy and topical pain relief' }
    ],
    usageMethods: [
      { emoji: '🍵', name: 'Ginger-Honey Tea (Kadha)', desc: 'Grate 1-inch ginger in boiling water, add tulsi, black pepper, honey. Drink for cold & sore throat.' },
      { emoji: '🫚', name: 'Fresh Ginger Slice', desc: 'Chew a thin slice with rock salt before meals. Ignites appetite and prevents bloating.' },
      { emoji: '🧴', name: 'Ginger Paste Compress', desc: 'Apply warm ginger paste on knee/joint pain area for 15 min. Natural anti-inflammatory.' },
      { emoji: '🍯', name: 'Dry Ginger + Jaggery', desc: 'Mix 1/2 tsp Shunthi powder with jaggery. Take after meals for indigestion and gas relief.' }
    ],
    ayurvedicProfile: { rasa: 'Pungent', virya: 'Heating', vipaka: 'Sweet', dosha: 'Balances Kapha & Vata, increases Pitta in excess' }
  },

  Turmeric: {
    aka: 'Haridra / The Golden Spice',
    overview: [
      'Turmeric is called "Haridra" meaning "the one that improves skin complexion" in Sanskrit.',
      'Contains curcumin — one of the most extensively studied natural compounds in modern science.',
      'Used in every Indian household as a spice, medicine, cosmetic, and auspicious substance.',
      'Has over 10,000 published scientific studies validating its anti-inflammatory and anticancer properties.',
      'Bioavailability of curcumin increases by 2,000% when consumed with black pepper (piperine).',
      'Integral to the Ayurvedic concept of "Varnya" — herbs that enhance natural skin glow.'
    ],
    diseases: ['Chronic inflammation & arthritis', 'Diabetes (blood sugar regulation)', 'Liver diseases & jaundice', 'Skin conditions — acne, eczema', "Alzheimer's disease (prevention)", 'Cancer (adjunct anti-tumor activity)'],
    partsUsed: [
      { part: 'Rhizome (dried & powdered)', uses: 'Primary part — anti-inflammatory, antioxidant — used internally and externally in all forms' },
      { part: 'Fresh Rhizome', uses: 'Juiced raw for liver detox, or grated into golden milk for immunity boost' },
      { part: 'Leaves', uses: 'Used to wrap food in South Indian cuisine, imparting subtle flavor and antibacterial protection' }
    ],
    usageMethods: [
      { emoji: '🥛', name: 'Golden Milk (Haldi Doodh)', desc: 'Mix 1/2 tsp turmeric + pinch of black pepper in warm milk. Drink at bedtime for immunity and joints.' },
      { emoji: '🧴', name: 'Turmeric Face Pack', desc: 'Mix turmeric, gram flour, and milk cream. Apply on face for 15 min for natural glow.' },
      { emoji: '🍯', name: 'Turmeric + Honey', desc: 'Mix 1/2 tsp turmeric with honey. Take on empty stomach for sore throat, immunity, and liver health.' },
      { emoji: '🩹', name: 'Wound Healing Paste', desc: 'Make a paste of turmeric with warm water. Apply directly on minor cuts — natural antiseptic.' }
    ],
    ayurvedicProfile: { rasa: 'Bitter, Pungent', virya: 'Heating', vipaka: 'Pungent', dosha: 'Balances Kapha, can increase Pitta in excess' }
  },

  Amla: {
    aka: 'Indian Gooseberry / Amalaki',
    overview: [
      'Amla contains 20 times more Vitamin C than oranges — the highest natural source known.',
      "It is one of the three fruits in Triphala — Ayurveda's most renowned formulation.",
      'The Vitamin C in Amla is uniquely heat-stable, retaining potency even after cooking.',
      'Classified as a Rasayana (rejuvenator) that slows aging and promotes longevity.',
      'Strengthens all seven dhatus (tissues) — a rare quality among Ayurvedic herbs.',
      'Mentioned in Charaka Samhita as the best among sour fruits and rejuvenating herbs.'
    ],
    diseases: ['Vitamin C deficiency & scurvy', 'Premature graying & hair loss', 'High cholesterol & atherosclerosis', 'Gastritis & hyperacidity', 'Diabetes (type 2)', 'Anemia (iron absorption enhancer)'],
    partsUsed: [
      { part: 'Fruit', uses: 'Primary part — eaten raw, juiced, dried, or pickled for all-round health benefits' },
      { part: 'Seeds', uses: 'Used in treating asthma and bronchitis — ground into powder for respiratory relief' },
      { part: 'Bark', uses: 'Astringent — used in decoctions for diarrhea and dysentery' }
    ],
    usageMethods: [
      { emoji: '🧃', name: 'Amla Juice', desc: 'Extract juice from 2-3 fresh amla. Mix with honey and warm water. Drink daily on empty stomach.' },
      { emoji: '💊', name: 'Amla Powder (Churna)', desc: '1 tsp amla powder with warm water twice daily. Best natural Vitamin C supplement.' },
      { emoji: '🫙', name: 'Amla Murabba (Preserve)', desc: 'Sugar-syrup preserved amla. Eat 1 piece daily — traditional Indian health confection for all ages.' },
      { emoji: '💆', name: 'Amla Hair Oil', desc: 'Boil dried amla in coconut oil, cool, strain. Massage into scalp to prevent graying and hair fall.' }
    ],
    ayurvedicProfile: { rasa: 'Five rasas (predominantly Sour)', virya: 'Cooling', vipaka: 'Sweet', dosha: 'Balances all three doshas (Tridoshahara)' }
  },

  Giloy: {
    aka: 'Guduchi / Amrita (Divine Nectar)',
    overview: [
      'Giloy literally means "Amrita" (nectar of immortality) — reflecting its supreme healing status.',
      'One of the three Amrit plants mentioned in Ayurveda alongside Tulsi and Haritaki.',
      'Contains tinosporine, tinocordiside, and berberine — potent immunomodulatory compounds.',
      'Gained massive popularity during COVID-19 for boosting innate immunity.',
      'Uniquely effective as an immunomodulator — both boosts and regulates immune response.',
      'The stem is the most potent part, especially when the vine grows on a Neem tree.'
    ],
    diseases: ['Chronic fevers (Dengue, Malaria, Chikungunya)', 'Low immunity & recurrent infections', 'Diabetes (type 2)', 'Gout & hyperuricemia', 'Liver disorders & jaundice', 'Allergic rhinitis & hay fever'],
    partsUsed: [
      { part: 'Stem', uses: 'Most potent — boiled as Kadha (decoction) or dried as powder for fever and immunity' },
      { part: 'Leaves', uses: 'Used in treating gout — juice extracted and consumed with buttermilk' },
      { part: 'Root', uses: 'Used in Ayurvedic formulations for bowel disorders and general debility' }
    ],
    usageMethods: [
      { emoji: '🍵', name: 'Giloy Kadha', desc: 'Boil 6-inch stem piece in 2 cups water until half. Add black pepper, tulsi. Drink for fever & immunity.' },
      { emoji: '🧃', name: 'Giloy Juice', desc: '2-3 tbsp Giloy juice with equal water on empty stomach. Daily immunity boost.' },
      { emoji: '💊', name: 'Giloy Ghanvati (Tablets)', desc: '1-2 tablets twice daily with warm water. Convenient form for chronic fever management.' },
      { emoji: '🌿', name: 'Giloy Satva', desc: 'Starch extracted from stem. Mix 1/2 tsp in water — best form for fever in children.' }
    ],
    ayurvedicProfile: { rasa: 'Bitter, Astringent', virya: 'Heating', vipaka: 'Sweet', dosha: 'Balances all three doshas' }
  },

  Shatavari: {
    aka: 'Queen of Herbs / Wild Asparagus',
    overview: [
      'Shatavari means "she who possesses 100 husbands" — signifying its role in female reproductive health.',
      'Considered the most important Ayurvedic herb for women at all stages of life.',
      'Contains saponins (shatavarins) that have estrogenic and galactagogue effects.',
      'Also beneficial for men — improves sperm count and supports overall vitality.',
      'Acts as a demulcent — soothing and protective to mucous membranes.',
      'Mentioned in all classical Ayurvedic texts as a Rasayana for the reproductive system.'
    ],
    diseases: ['PCOS & hormonal imbalance', 'Low breast milk production', 'Menopausal symptoms', 'Male infertility', 'Gastric ulcers & hyperacidity', 'General debility & fatigue'],
    partsUsed: [
      { part: 'Tuberous Root', uses: 'Primary medicinal part — dried and powdered for hormonal balance, galactagogue action' },
      { part: 'Leaves', uses: 'Used in some traditional formulations for urinary health' }
    ],
    usageMethods: [
      { emoji: '🥛', name: 'Shatavari Milk', desc: 'Mix 1 tsp powder in warm milk with honey. Drink daily for hormonal balance and vitality.' },
      { emoji: '💊', name: 'Shatavari Capsules', desc: '500mg twice daily with meals. Convenient for long-term reproductive health support.' },
      { emoji: '🍯', name: 'Shatavari Ghrita', desc: 'Shatavari processed in ghee — traditional postpartum tonic for nursing mothers.' },
      { emoji: '🫖', name: 'Root Decoction', desc: 'Boil 5g root in 200ml water. Drink warm for gastric ulcers and hyperacidity relief.' }
    ],
    ayurvedicProfile: { rasa: 'Sweet, Bitter', virya: 'Cooling', vipaka: 'Sweet', dosha: 'Balances Pitta & Vata' }
  },

  Mulethi: {
    aka: 'Licorice / Yashtimadhu',
    overview: [
      'Mulethi is one of the most widely used herbs in Ayurveda, Unani, and Chinese medicine.',
      'Its root is 50 times sweeter than sugar due to the compound glycyrrhizin.',
      'A key ingredient in most Ayurvedic cough syrups, voice tonics, and respiratory formulations.',
      'Acts as a demulcent — coats and soothes irritated mucous membranes in throat and stomach.',
      'Also used as a natural sweetener and flavor enhancer in herbal formulations.',
      'Shown to have potent anti-ulcer and anti-H.pylori activity in clinical studies.'
    ],
    diseases: ['Sore throat & cough', 'Gastric & peptic ulcers', 'GERD / acid reflux', 'Bronchitis & asthma', 'Adrenal fatigue', 'Skin pigmentation & dark spots'],
    partsUsed: [
      { part: 'Root', uses: 'Primary part — chewed raw, powdered, or decocted for throat, stomach, and respiratory care' },
      { part: 'Root Extract', uses: 'Used in syrups, tablets, and topical creams for targeted medicinal application' }
    ],
    usageMethods: [
      { emoji: '🪵', name: 'Chew Raw Root', desc: 'Simply chew a small piece of Mulethi root for instant sore throat and cough relief.' },
      { emoji: '🍵', name: 'Mulethi Tea', desc: 'Boil 1-inch stick in water for 5 min. Strain and drink with honey for voice clarity and cough.' },
      { emoji: '💊', name: 'Mulethi Powder', desc: 'Mix 1/2 tsp with honey. Take twice daily for peptic ulcer and hyperacidity.' },
      { emoji: '🧴', name: 'Mulethi Face Pack', desc: 'Mix powder with rose water and milk. Apply on face for 20 min to reduce dark spots and pigmentation.' }
    ],
    ayurvedicProfile: { rasa: 'Sweet', virya: 'Cooling', vipaka: 'Sweet', dosha: 'Balances Pitta & Vata' }
  },

  Arjuna: {
    aka: 'Arjuna Tree / Heart Protector',
    overview: [
      'Arjuna bark is the cornerstone of Ayurvedic cardiology — used for heart health for thousands of years.',
      'Named after the Mahabharata warrior Arjuna — symbolizing strength and a strong heart.',
      'Contains arjunolic acid, arjunic acid, and arjunin — proven cardio-protective compounds.',
      'One of the few Ayurvedic herbs with significant modern clinical trial evidence for heart failure.',
      'Acts as a cardiotonic — strengthens heart muscles, improves cardiac output, and regulates rhythm.',
      'Also used for wound healing, high blood pressure, and as an astringent.'
    ],
    diseases: ['Coronary artery disease', 'Heart failure (adjunct therapy)', 'High blood pressure', 'High cholesterol', 'Chest pain (angina)', 'Urinary tract infections'],
    partsUsed: [
      { part: 'Bark', uses: 'Primary part — processed into powder, decoction, or extract for all cardiac indications' },
      { part: 'Leaves', uses: 'Used externally for ear pain and as an astringent for wounds' },
      { part: 'Fruit', uses: 'Used in some formulations for bleeding disorders and as a general tonic' }
    ],
    usageMethods: [
      { emoji: '🥛', name: 'Arjuna Ksheera Paka', desc: 'Boil 3g bark powder in milk until reduced. Drink at bedtime — the gold standard Ayurvedic heart tonic.' },
      { emoji: '💊', name: 'Arjuna Bark Powder', desc: '3-6g powder with warm water or honey twice daily for cholesterol and BP management.' },
      { emoji: '🍵', name: 'Arjuna Tea', desc: 'Boil 1 tsp bark in water for 10 min. Strain and drink for daily heart protection.' },
      { emoji: '🫖', name: 'Arjunarishta', desc: 'Fermented bark preparation. 15-20ml after meals with equal water — tonic for weak heart.' }
    ],
    ayurvedicProfile: { rasa: 'Astringent', virya: 'Cooling', vipaka: 'Pungent', dosha: 'Balances Pitta & Kapha' }
  },

  Bhringraj: {
    aka: 'False Daisy / King of Hair',
    overview: [
      'Bhringraj literally translates to "King of Hair" — the supreme herb for hair health in Ayurveda.',
      'Also known as Kesharaja (ruler of hair) and Markava (one that prevents aging).',
      'Contains ecliptine and wedelolactone — compounds that promote hair follicle regeneration.',
      'Equally important as a hepatoprotective (liver-protecting) herb, often overlooked.',
      'Used in Panchkarma (Ayurvedic detox) as Nasya (nasal oil) for mental rejuvenation.',
      'One of the key ingredients in Bhringraj oil — the most popular Ayurvedic hair oil.'
    ],
    diseases: ['Hair fall & premature graying', 'Liver cirrhosis & hepatitis', 'Poor eyesight', 'Headaches & migraines', 'Skin disorders', 'Insomnia'],
    partsUsed: [
      { part: 'Whole Plant', uses: 'Entire aerial part is medicinal — juiced, dried, or processed into oil for hair and liver' },
      { part: 'Leaves', uses: 'Most potent — juice consumed for liver health or applied on hair as growth stimulant' },
      { part: 'Root', uses: 'Used in some formulations for dental problems and as an emetic' }
    ],
    usageMethods: [
      { emoji: '💆', name: 'Bhringraj Hair Oil', desc: 'Massage warm Bhringraj oil into scalp 2-3 times/week. Leave overnight for hair growth and blackening.' },
      { emoji: '🧃', name: 'Bhringraj Juice', desc: '2-3 tsp fresh leaf juice with honey. Take on empty stomach for liver detox.' },
      { emoji: '🧴', name: 'Bhringraj Hair Pack', desc: 'Mix powder with curd and fenugreek. Apply on hair for 45 min before washing. Prevents graying.' },
      { emoji: '💊', name: 'Bhringraj Capsules', desc: '500mg twice daily for liver support and as a hair supplement.' }
    ],
    ayurvedicProfile: { rasa: 'Pungent, Bitter', virya: 'Heating', vipaka: 'Pungent', dosha: 'Balances Kapha & Vata' }
  },

  Shilajit: {
    aka: 'Mineral Pitch / Destroyer of Weakness',
    overview: [
      'Shilajit is not a plant but a mineral-rich resinous substance found in Himalayan rocks.',
      "Formed over centuries from decomposed plant matter & minerals — nature's own multivitamin.",
      'Contains over 84 minerals including fulvic acid — the primary bioactive compound.',
      'Called "Shilajit" meaning "conqueror of mountains and destroyer of weakness".',
      'One of the most prized Rasayanas in Ayurveda for anti-aging and vitality.',
      'Acts as a yoga-vahi — enhances the bioavailability and action of other herbs taken with it.'
    ],
    diseases: ['Chronic fatigue syndrome', 'Iron-deficiency anemia', "Alzheimer's disease (early stage)", 'Male infertility & low testosterone', 'High altitude sickness', 'Kidney stones (prevention)'],
    partsUsed: [
      { part: 'Purified Resin', uses: 'The whole substance is the medicine — dissolved in warm milk or water for all therapeutic uses' }
    ],
    usageMethods: [
      { emoji: '🥛', name: 'Shilajit Milk', desc: 'Dissolve pea-sized resin in warm milk. Drink daily morning for energy, stamina, and vitality.' },
      { emoji: '💧', name: 'With Warm Water', desc: 'Dissolve in warm water with honey. Take on empty stomach for mineral supplementation.' },
      { emoji: '💊', name: 'Shilajit Capsules', desc: '250-500mg standardized extract daily. Modern convenient form for consistent dosing.' },
      { emoji: '🍯', name: 'With Ashwagandha', desc: 'Combine Shilajit with Ashwagandha powder in milk. Powerful synergy for strength and vitality.' }
    ],
    ayurvedicProfile: { rasa: 'Bitter, Salty, Astringent', virya: 'Heating', vipaka: 'Pungent', dosha: 'Balances Kapha & Vata' }
  },

  Haritaki: {
    aka: 'King of Medicines / Chebulic Myrobalan',
    overview: [
      'Haritaki is called "Harade" or the "King of Medicines" in Ayurvedic tradition.',
      'It is one of the three ingredients of Triphala, the most widely used Ayurvedic formulation.',
      'Revered in Buddhist tradition — Lord Buddha is often depicted holding a Haritaki fruit.',
      'Contains tannins, chebulic acid, and gallic acid with potent antioxidant properties.',
      'Balances all three doshas and is considered a Rasayana for the digestive system.',
      'Known to enhance Agni (digestive fire) and eliminate Ama (toxins) from the body.'
    ],
    diseases: ['Chronic constipation', 'Digestive disorders & bloating', 'Skin diseases', 'Cough & respiratory ailments', 'Obesity & metabolic syndrome', 'Eye disorders'],
    partsUsed: [
      { part: 'Fruit', uses: 'Primary part — dried and powdered for digestive health, detoxification, and rejuvenation' },
      { part: 'Fruit Rind', uses: 'Used in decoctions for throat and respiratory ailments' },
      { part: 'Seed', uses: 'Occasionally used in oil preparations for external application' }
    ],
    usageMethods: [
      { emoji: '💊', name: 'Haritaki Churna', desc: 'Take 1-3g powder with warm water before bed for constipation relief and detox.' },
      { emoji: '🍯', name: 'With Honey', desc: 'Mix 1 tsp powder with honey. Take in spring season for Kapha balance.' },
      { emoji: '🧂', name: 'With Rock Salt', desc: 'Mix powder with rock salt. Take before meals to stimulate digestive fire (Agni).' },
      { emoji: '🥛', name: 'With Warm Milk', desc: 'Take 1 tsp with warm milk at bedtime for gentle laxative effect and rejuvenation.' }
    ],
    ayurvedicProfile: { rasa: 'Five rasas (all except Salty)', virya: 'Heating', vipaka: 'Sweet', dosha: 'Balances all three doshas' }
  },

  Manjistha: {
    aka: 'Indian Madder / Blood Purifier',
    overview: [
      'Manjistha is the most celebrated blood purifying herb in the Ayurvedic materia medica.',
      'Its root produces a natural red dye — used for centuries in textiles and as medicine.',
      'Contains alizarin, purpurin, and rubiadin — compounds with potent anti-inflammatory action.',
      'Primary herb for Pitta-type skin disorders, acne, and inflammatory conditions.',
      'Supports healthy lymphatic drainage and helps clear skin blemishes from within.',
      'One of the most important Varnya herbs — enhancing natural skin radiance and complexion.'
    ],
    diseases: ['Acne & skin eruptions', 'Eczema & dermatitis', 'Blood impurities', 'Irregular menstruation', 'Lymphatic congestion', 'Urinary tract infections'],
    partsUsed: [
      { part: 'Root', uses: 'Primary part — dried and powdered for blood purification, skin health, and lymphatic support' },
      { part: 'Stem', uses: 'Used alongside root in some decoction formulations' }
    ],
    usageMethods: [
      { emoji: '💊', name: 'Manjistha Powder', desc: 'Take 1-3g powder with warm water twice daily for blood purification and clear skin.' },
      { emoji: '🧴', name: 'Manjistha Face Pack', desc: 'Mix powder with honey and rose water. Apply on face for 20 min for acne and blemishes.' },
      { emoji: '🍵', name: 'Manjistha Decoction', desc: 'Boil 5g in 200ml water until half. Strain and drink for internal detoxification.' },
      { emoji: '🧃', name: 'Manjistha Juice', desc: 'Mix powder in aloe vera juice. Drink daily for lymphatic cleansing and radiant skin.' }
    ],
    ayurvedicProfile: { rasa: 'Bitter, Astringent, Sweet', virya: 'Heating', vipaka: 'Pungent', dosha: 'Balances Pitta & Kapha' }
  },

  Punarnava: {
    aka: 'Hogweed / The Rejuvenator',
    overview: [
      'Punarnava literally means "one that renews the body" — symbolizing its rejuvenating properties.',
      'One of the most important herbs for kidney and urinary system health in Ayurveda.',
      'Contains punarnavine — an alkaloid with diuretic and anti-inflammatory action.',
      'Used extensively in treating edema, water retention, and kidney disorders.',
      'Also valued for its hepatoprotective properties — protects liver from toxin damage.',
      'Listed in Charaka Samhita as a Shothaghna (anti-edema) and Rasayana herb.'
    ],
    diseases: ['Kidney disorders & nephritis', 'Water retention & edema', 'Urinary tract infections', 'Liver disorders', 'Obesity', 'Anemia'],
    partsUsed: [
      { part: 'Root', uses: 'Primary part — diuretic, anti-inflammatory — used in decoctions and powders for kidney health' },
      { part: 'Whole Plant', uses: 'Fresh juice used for liver protection and general rejuvenation' },
      { part: 'Leaves', uses: 'Cooked as vegetable in some regions — provides nutrition and mild diuretic effect' }
    ],
    usageMethods: [
      { emoji: '🍵', name: 'Punarnava Decoction', desc: 'Boil 5g root in 200ml water until half. Drink twice daily for kidney health and edema.' },
      { emoji: '💊', name: 'Punarnava Powder', desc: 'Take 3-5g powder with warm water. Effective diuretic for water retention.' },
      { emoji: '🧃', name: 'Fresh Juice', desc: 'Extract juice from whole plant. Take 10-20ml with honey for liver support.' },
      { emoji: '🫖', name: 'Punarnavadi Kwath', desc: 'Classical formulation with punarnava as base. 30-40ml before meals for kidney disorders.' }
    ],
    ayurvedicProfile: { rasa: 'Bitter, Sweet, Astringent', virya: 'Heating', vipaka: 'Sweet', dosha: 'Balances all three doshas' }
  }
};

/* ────────────────────────────────────────── */

const generateFallbackData = (plant) => {
  const uses = (plant.uses || '').split(',').map(u => u.trim()).filter(Boolean);
  const name = plant.plantName;
  const sci = plant.scientificName;
  const cat = plant.category || 'Herb';
  const desc = plant.description || '';

  return {
    aka: sci,
    overview: [
      `${name} (${sci}) is a traditional Ayurvedic ${cat.toLowerCase()} used for centuries in Indian medicine.`,
      desc || `Known for its therapeutic properties in ${uses.join(', ').toLowerCase() || 'traditional healing'}.`,
      `It is classified under the "${cat}" category of Ayurvedic herbs.`,
      `Contains various bioactive phytochemicals that contribute to its medicinal properties.`,
      `Used in multiple classical Ayurvedic formulations and home remedies.`,
      `Traditionally valued for its role in maintaining the balance of bodily doshas.`
    ],
    diseases: uses.map(u => `Conditions related to ${u.toLowerCase()}`).concat([
      'General weakness & debility', 'Seasonal ailments'
    ]).slice(0, 6),
    partsUsed: [
      { part: 'Leaves', uses: `Used in decoctions, juices, or paste form for ${uses[0]?.toLowerCase() || 'general health'}` },
      { part: 'Root', uses: `Traditional formulations for ${uses[1]?.toLowerCase() || 'tonic preparation'} — often dried and powdered` },
      { part: 'Whole Plant', uses: 'Various parts used depending on the therapeutic application in Ayurvedic practice' }
    ],
    usageMethods: [
      { emoji: '🍵', name: `${name} Decoction`, desc: `Boil 3-5g dried ${name.toLowerCase()} in 200ml water until reduced to half. Strain and drink warm for ${uses[0]?.toLowerCase() || 'general wellness'}.` },
      { emoji: '💊', name: `${name} Powder (Churna)`, desc: `Take 1-3g powder with warm water or honey twice daily for ${uses[1]?.toLowerCase() || 'therapeutic benefit'}.` },
      { emoji: '🧃', name: 'Fresh Juice', desc: 'Extract juice from fresh parts. Take 10-20ml with honey on empty stomach for maximum absorption.' },
      { emoji: '🧴', name: 'External Application', desc: `Make a paste from fresh or powdered ${name.toLowerCase()}. Apply topically as needed for skin and localized issues.` }
    ],
    ayurvedicProfile: {
      rasa: 'Varies by preparation',
      virya: cat.includes('Cool') ? 'Cooling' : 'Heating',
      vipaka: 'Balanced',
      dosha: 'Consult practitioner for dosha specificity'
    }
  };
};

/* ────────── Main Migration ────────── */
const run = async () => {
  await connectDB(process.env.MONGODB_URI);
  console.log('Starting knowledge migration...\n');

  const allPlants = await Plant.find({});
  let updated = 0;

  for (const plant of allPlants) {
    const name = plant.plantName;
    const data = knowledgeMap[name] || generateFallbackData(plant);

    plant.aka = data.aka || '';
    plant.overview = data.overview || [];
    plant.diseases = data.diseases || [];
    plant.partsUsed = data.partsUsed || [];
    plant.usageMethods = data.usageMethods || [];
    plant.ayurvedicProfile = data.ayurvedicProfile || {};

    await plant.save();
    updated++;
    const source = knowledgeMap[name] ? '✅ (detailed)' : '📄 (auto-generated)';
    console.log(`  ${source} ${name}`);
  }

  console.log(`\n🎉 Migration complete! Updated ${updated} plants.`);
  process.exit(0);
};

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
