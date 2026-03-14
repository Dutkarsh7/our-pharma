export interface Medicine {
  id: number;
  brand_name: string;
  generic_name: string;
  brand_price: number;
  generic_price: number;
  manufacturer: string;
  storage_advice: string;
  uses: string;
  side_effects: string[];
  imageUrl: string;
  chronic_keywords?: string;
  target_patients?: string;
  health_issues?: string;
  sideEffects?: string;
}

export const medicines: Medicine[] = [
  {
    id: 1,
    brand_name: "Crocin 650",
    generic_name: "Paracetamol 650mg",
    brand_price: 35,
    generic_price: 15,
    manufacturer: "GSK",
    storage_advice: "Store below 30C in a cool, dry place",
    uses: "Used to relieve mild to moderate pain and fever such as headaches, muscle ache, toothache, and fever due to cold or flu.",
    side_effects: ["Nausea", "Dizziness", "Diarrhoea"],
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/10c85f7a2dc9bb322e894684e3ee2caeb75a8fd0.jpg"
  },
  {
    id: 2,
    brand_name: "Augmentin 625",
    generic_name: "Amoxicillin 500mg + Clavulanic Acid 125mg",
    brand_price: 190,
    generic_price: 90,
    manufacturer: "GSK",
    storage_advice: "Store below 25C and protect from moisture",
    uses: "Used for treating bacterial infections such as sinusitis, bronchitis, pneumonia, urinary tract infections, and skin infections.",
    side_effects: ["Nausea", "Vomiting", "Diarrhoea"],
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/0bbcab206cee48648c9ab1609e4fbe1c56b3da2d.jpg"
  },
  {
    id: 3,
    brand_name: "Glycomet 500",
    generic_name: "Metformin 500mg",
    brand_price: 28,
    generic_price: 12,
    manufacturer: "USV Ltd",
    storage_advice: "Store below 25C and keep away from moisture",
    uses: "Used in the treatment of type 2 diabetes to help lower blood sugar by reducing glucose production in the liver and improving insulin sensitivity.",
    side_effects: ["Nausea", "Diarrhoea", "Abdominal discomfort"],
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/16291d72eaa23c022b1792aee7f0dc1040169e82.jpg"
  },
  {
    id: 4,
    brand_name: "Lantus Solostar",
    generic_name: "Insulin Glargine 100 IU/ml",
    brand_price: 1850,
    generic_price: 1400,
    manufacturer: "Sanofi",
    storage_advice: "Refrigerate but do not freeze; once opened, store at room temperature for up to 28 days",
    uses: "Used as a long-acting insulin for the management of type 1 and type 2 diabetes mellitus to control blood glucose levels.",
    side_effects: ["Injection site reaction", "Hypoglycemia", "Weight gain"],
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/36ed15f2ed50267bc5a929d2a9ac3e9b5e38b2dc.jpg"
  },
  {
    id: 5,
    brand_name: "Human Mixtard 70/30",
    generic_name: "Insulin Isophane 70% + Human Insulin 30%",
    brand_price: 650,
    generic_price: 480,
    manufacturer: "Novo Nordisk",
    storage_advice: "Refrigerate but do not freeze; once opened, store at room temperature for up to 28 days",
    uses: "Used as a biphasic insulin for diabetes to provide both short-acting and long-acting insulin effects in a single injection.",
    side_effects: ["Hypoglycemia", "Injection site reaction", "Weight gain"],
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/5d5e57ef4df3c365d2ebb25b8e6c15b989f4cc5f.jpg"
  },
  {
    id: 6,
    brand_name: "Glycomet-GP 1",
    generic_name: "Metformin 500mg + Glimepiride 1mg",
    brand_price: 72,
    generic_price: 35,
    manufacturer: "USV Ltd",
    storage_advice: "Store below 25C and keep away from moisture",
    uses: "Used to treat type 2 diabetes by lowering blood glucose levels through reduced glucose production and improved insulin secretion.",
    side_effects: ["Hypoglycemia", "Nausea", "Diarrhoea"],
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"
  },
  {
    id: 7,
    brand_name: "Telma 40",
    generic_name: "Telmisartan 40mg",
    brand_price: 85,
    generic_price: 38,
    manufacturer: "Glenmark Pharmaceuticals Ltd",
    storage_advice: "Store below 25C and keep away from light",
    uses: "Used to treat high blood pressure and reduce the risk of heart attack and stroke by blocking angiotensin II-induced vasoconstriction.",
    side_effects: ["Dizziness", "Back pain", "Diarrhoea"],
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/5c263ba88ec15dd475503dcde4e0fece6efc7928.jpg"
  },
  {
    id: 8,
    brand_name: "Amlopres 5",
    generic_name: "Amlodipine 5mg",
    brand_price: 45,
    generic_price: 18,
    manufacturer: "Cipla Ltd",
    storage_advice: "Store below 30C and keep in a dry place",
    uses: "Used to treat high blood pressure and angina by relaxing blood vessels and reducing the workload on the heart.",
    side_effects: ["Swelling feet/ankles", "Headache", "Dizziness"],
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/133f7d045b4466ca6914fd7c57abb3c22d1bd9eb.jpg"
  },
  {
    id: 9,
    brand_name: "Storvas 10",
    generic_name: "Atorvastatin 10mg",
    brand_price: 95,
    generic_price: 42,
    manufacturer: "Sun Pharmaceutical Industries Ltd",
    storage_advice: "Store below 25C and protect from moisture",
    uses: "Used to lower cholesterol and triglyceride levels to reduce the risk of heart disease and stroke.",
    side_effects: ["Muscle pain", "Diarrhoea", "Headache"],
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/389c003b74c57e388946f57cc85cad47b17698a8.jpg"
  },
  {
    id: 10,
    brand_name: "Thyronorm 50",
    generic_name: "Levothyroxine Sodium 50mcg",
    brand_price: 75,
    generic_price: 32,
    manufacturer: "Abbott",
    storage_advice: "Store below 25C and keep away from light and moisture",
    uses: "Used to treat hypothyroidism by replacing or supplementing the naturally occurring thyroid hormone.",
    side_effects: ["Headache", "Weight loss", "Increased sweating"],
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/9779a34c1c592e4787a0e474ebe6d74b79b60f7f.jpg"
  },
  {
    id: 11,
    brand_name: "Pantocid 40",
    generic_name: "Pantoprazole 40mg",
    brand_price: 110,
    generic_price: 48,
    manufacturer: "Zydus Cadila",
    storage_advice: "Store below 25C and protect from moisture",
    uses: "Used to treat gastroesophageal reflux disease, peptic ulcers, and conditions with excess stomach acid by reducing gastric acid secretion.",
    side_effects: ["Headache", "Diarrhoea", "Nausea"],
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/3104abd6dea33d14b960a21ea477e70dd8667658.jpg"
  },
  {
    id: 12,
    brand_name: "Azithral 500",
    generic_name: "Azithromycin 500mg",
    brand_price: 126,
    generic_price: 85,
    manufacturer: "Zydus Cadila",
    storage_advice: "Store below 25C and keep away from moisture",
    uses: "Used to treat bacterial infections such as respiratory tract infections, skin infections, and some sexually transmitted infections.",
    side_effects: ["Nausea", "Diarrhoea", "Abdominal pain"],
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/de3aa878b965b08a14c69b3a446c7e02c783c89c.jpg"
  },
  {
    id: 13,
    brand_name: "Dolo 650",
    generic_name: "Paracetamol 650mg",
    brand_price: 30,
    generic_price: 12,
    manufacturer: "Mankind Pharma",
    storage_advice: "Store below 30C in a cool, dry place",
    uses: "Used to relieve pain and reduce fever associated with headaches, muscle ache, fever, and cold or flu.",
    side_effects: ["Nausea", "Dizziness", "Diarrhoea"],
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/899757cc67df43b2f30deec7ed1ae4fa1f4108d5.jpg"
  },
  {
    id: 14,
    brand_name: "Allegra 120",
    generic_name: "Fexofenadine 120mg",
    brand_price: 273,
    generic_price: 145,
    manufacturer: "Sanofi",
    storage_advice: "Store below 25C and keep away from moisture",
    uses: "Used to treat allergic rhinitis and chronic urticaria by blocking histamine-mediated allergy symptoms.",
    side_effects: ["Headache", "Dizziness", "Nausea"],
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/4ddff6f4fa3e8dbe4b95f085f98134321e70f695.jpg"
  },
  {
    id: 15,
    brand_name: "Lasix 40",
    generic_name: "Furosemide 40mg",
    brand_price: 18,
    generic_price: 8,
    manufacturer: "Sun Pharmaceutical Industries Ltd",
    storage_advice: "Store below 25C and keep away from light",
    uses: "Used to treat fluid buildup (edema) due to heart failure, liver disease, or kidney disease by increasing urine output.",
    side_effects: ["Electrolyte imbalance", "Dizziness", "Diarrhoea"],
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/5652e726bf1a150d84535573fb11997c9bde2185.jpg"
  },
  {
    id: 16,
    brand_name: "Lopressor 50",
    generic_name: "Metoprolol 50mg",
    brand_price: 65,
    generic_price: 28,
    manufacturer: "Novartis",
    storage_advice: "Store below 25C and keep away from light",
    uses: "Used to treat high blood pressure, angina, and to prevent heart attack by reducing heart rate and blood pressure.",
    side_effects: ["Dizziness", "Fatigue", "Bradycardia"],
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/a3a298859d5b3b239f150108dc38025263d55b1c.jpg"
  },
  {
    id: 17,
    brand_name: "Cozaar 50",
    generic_name: "Losartan 50mg",
    brand_price: 145,
    generic_price: 68,
    manufacturer: "Merck & Co.",
    storage_advice: "Store below 25C and keep away from light",
    uses: "Used to treat high blood pressure and protect kidney in diabetic patients by blocking angiotensin II receptors.",
    side_effects: ["Dizziness", "Back pain", "Diarrhoea"],
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/9eda8cae03b08ef22fb2b7ceee87ef7bec6e30b1.jpg"
  },
  {
    id: 18,
    brand_name: "Glucotrol 5",
    generic_name: "Glipizide 5mg",
    brand_price: 42,
    generic_price: 18,
    manufacturer: "Pfizer",
    storage_advice: "Store below 25C and keep away from light",
    uses: "Used to treat type 2 diabetes by stimulating insulin release from the pancreas to lower blood glucose.",
    side_effects: ["Hypoglycemia", "Dizziness", "Diarrhoea"],
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/829289b85e502b8d79dfc1e434d960ace125a88f.jpg"
  },
  {
    id: 19,
    brand_name: "Zestril 5",
    generic_name: "Lisinopril 5mg",
    brand_price: 78,
    generic_price: 35,
    manufacturer: "AstraZeneca",
    storage_advice: "Store below 25C and keep away from light",
    uses: "Used to treat high blood pressure and heart failure by inhibiting angiotensin-converting enzyme and relaxing blood vessels.",
    side_effects: ["Dizziness", "Cough", "Headache"],
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/47dc468d4b562abec89071222acbe92f87a960ce.jpg"
  },
  {
    id: 20,
    brand_name: "Cardace 2.5",
    generic_name: "Ramipril 2.5mg",
    brand_price: 88,
    generic_price: 42,
    manufacturer: "Sanofi",
    storage_advice: "Store below 25C and keep away from light",
    uses: "Used to treat high blood pressure and reduce the risk of heart attack and stroke by blocking angiotensin-converting enzyme.",
    side_effects: ["Dizziness", "Cough", "Headache"],
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/bc168eaa3a6936c0ec2e3e40b0896389463313bd.jpg"
  },
  {
    id: 21,
    brand_name: "Cipcal 500",
    generic_name: "Calcium Carbonate 500mg",
    brand_price: 65,
    generic_price: 28,
    manufacturer: "Intas Pharmaceuticals",
    storage_advice: "Store below 25C and keep away from moisture",
    uses: "Used to treat calcium deficiency and to prevent osteoporosis by providing supplemental calcium.",
    side_effects: ["Constipation", "Flatulence", "Stomach upset"],
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"
  },
  {
    id: 22,
    brand_name: "Shelcal 500",
    generic_name: "Calcium Carbonate 500mg + Vitamin D3 250 IU",
    brand_price: 115,
    generic_price: 58,
    manufacturer: "Intas Pharmaceuticals",
    storage_advice: "Store below 25C and keep away from moisture",
    uses: "Used to prevent or treat calcium and vitamin D deficiency, especially in osteoporosis and during pregnancy.",
    side_effects: ["Constipation", "Flatulence", "Stomach upset"],
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"
  },
  {
    id: 23,
    brand_name: "Becosules",
    generic_name: "Vitamin B Complex + Vitamin C",
    brand_price: 38,
    generic_price: 18,
    manufacturer: "Merck & Co.",
    storage_advice: "Store below 25C and keep away from light",
    uses: "Used as a supplement for vitamin B and vitamin C deficiencies to support skin, nerve, and overall metabolic health.",
    side_effects: ["Nausea", "Headache", "Urine discoloration"],
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"
  },
  {
    id: 24,
    brand_name: "Neurobion Forte",
    generic_name: "Vitamin B1 + B6 + B12",
    brand_price: 42,
    generic_price: 22,
    manufacturer: "Merck & Co.",
    storage_advice: "Store below 25C and keep away from light",
    uses: "Used to treat vitamin B1, B6, and B12 deficiency-related neuropathy, fatigue, and numbness/tingling in limbs.",
    side_effects: ["Nausea", "Headache", "Rash"],
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"
  },
  {
    id: 25,
    brand_name: "Omez 20",
    generic_name: "Omeprazole 20mg",
    brand_price: 95,
    generic_price: 42,
    manufacturer: "Sun Pharmaceutical Industries Ltd",
    storage_advice: "Store below 25C and keep away from moisture",
    uses: "Used to treat gastroesophageal reflux disease, peptic ulcers, and excess stomach acid by reducing acid production.",
    side_effects: ["Headache", "Diarrhoea", "Abdominal pain"],
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"
  },
  {
    id: 26,
    brand_name: "Ranitidine 150",
    generic_name: "Ranitidine 150mg",
    brand_price: 18,
    generic_price: 8,
    manufacturer: "GlaxoSmithKline",
    storage_advice: "Store below 25C and keep away from moisture",
    uses: "Used to treat heartburn, peptic ulcers, and gastroesophageal reflux by reducing stomach acid secretion.",
    side_effects: ["Nausea", "Dizziness", "Constipation"],
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"
  },
  {
    id: 27,
    brand_name: "Domperidone 10",
    generic_name: "Domperidone 10mg",
    brand_price: 22,
    generic_price: 10,
    manufacturer: "Johnson & Johnson",
    storage_advice: "Store below 25C and keep away from moisture",
    uses: "Used to treat nausea, vomiting, and feeling of fullness after meals by increasing gastric motility.",
    side_effects: ["Dry mouth", "Restlessness", "Diarrhoea"],
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"
  },
  {
    id: 28,
    brand_name: "Ondem 4",
    generic_name: "Ondansetron 4mg",
    brand_price: 45,
    generic_price: 22,
    manufacturer: "Emcure Pharmaceuticals",
    storage_advice: "Store below 25C and keep away from moisture",
    uses: "Used to prevent nausea and vomiting associated with chemotherapy, radiotherapy, and surgery.",
    side_effects: ["Headache", "Dizziness", "Constipation"],
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"
  },
  {
    id: 29,
    brand_name: "Disprin",
    generic_name: "Aspirin 325mg",
    brand_price: 12,
    generic_price: 5,
    manufacturer: "Reckitt Benckiser",
    storage_advice: "Store below 25C in a dry place and keep away from moisture",
    uses: "Used to relieve pain, reduce fever, and act as an anti-platelet agent to prevent heart attack and stroke.",
    side_effects: ["Stomach upset", "Nausea", "Ringing in ears"],
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"
  },
  {
    id: 30,
    brand_name: "Ecosprin 75",
    generic_name: "Aspirin 75mg",
    brand_price: 8,
    generic_price: 3,
    manufacturer: "USV Ltd",
    storage_advice: "Store below 25C in a dry place and keep away from moisture",
    uses: "Used as a low-dose anti-platelet agent to prevent heart attack, stroke, and blood clot formation in high-risk patients.",
    side_effects: ["Stomach upset", "Nausea", "Ringing in ears"],
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"
  }
];
