const medicineDatabase = [
  {
    "id": 1,
    "brand": "Crocin 650",
    "generic": "Paracetamol 650mg",
    "brandPrice": 35,
    "genericPrice": 15,
    "manufacturer": "GSK",
    "storageAdvice": "Store below 30C in a cool, dry place",
    "uses": "Used to relieve mild to moderate pain and fever such as headaches, muscle ache, toothache, and fever due to cold or flu.",
    "sideEffects": [
      "Nausea",
      "Dizziness",
      "Diarrhoea"
    ],
    "imageUrl": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/10c85f7a2dc9bb322e894684e3ee2caeb75a8fd0.jpg"
  },
  {
    "id": 2,
    "brand": "Augmentin 625",
    "generic": "Amoxicillin 500mg + Clavulanic Acid 125mg",
    "brandPrice": 190,
    "genericPrice": 90,
    "manufacturer": "GSK",
    "storageAdvice": "Store below 25C and protect from moisture",
    "uses": "Used for treating bacterial infections such as sinusitis, bronchitis, pneumonia, urinary tract infections, and skin infections.",
    "sideEffects": [
      "Nausea",
      "Vomiting",
      "Diarrhoea"
    ],
    "imageUrl": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/0bbcab206cee48648c9ab1609e4fbe1c56b3da2d.jpg"
  },
  {
    "id": 3,
    "brand": "Glycomet 500",
    "generic": "Metformin 500mg",
    "brandPrice": 28,
    "genericPrice": 12,
    "manufacturer": "USV Ltd",
    "storageAdvice": "Store below 25C and keep away from moisture",
    "uses": "Used in the treatment of type 2 diabetes to help lower blood sugar by reducing glucose production in the liver and improving insulin sensitivity.",
    "sideEffects": [
      "Nausea",
      "Diarrhoea",
      "Abdominal discomfort"
    ],
    "imageUrl": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/16291d72eaa23c022b1792aee7f0dc1040169e82.jpg"
  },
  {
    "id": 4,
    "brand": "Lantus Solostar",
    "generic": "Insulin Glargine 100 IU/ml",
    "brandPrice": 1850,
    "genericPrice": 1400,
    "manufacturer": "Sanofi",
    "storageAdvice": "Refrigerate but do not freeze; once opened, store at room temperature for up to 28 days",
    "uses": "Used as a long-acting insulin for the management of type 1 and type 2 diabetes mellitus to control blood glucose levels.",
    "sideEffects": [
      "Injection site reaction",
      "Hypoglycemia",
      "Weight gain"
    ],
    "imageUrl": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/36ed15f2ed50267bc5a929d2a9ac3e9b5e38b2dc.jpg"
  },
  {
    "id": 5,
    "brand": "Human Mixtard 70/30",
    "generic": "Insulin Isophane 70% + Human Insulin 30%",
    "brandPrice": 650,
    "genericPrice": 480,
    "manufacturer": "Novo Nordisk",
    "storageAdvice": "Refrigerate but do not freeze; once opened, store at room temperature for up to 28 days",
    "uses": "Used as a biphasic insulin for diabetes to provide both short-acting and long-acting insulin effects in a single injection.",
    "sideEffects": [
      "Hypoglycemia",
      "Injection site reaction",
      "Weight gain"
    ],
    "imageUrl": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/5d5e57ef4df3c365d2ebb25b8e6c15b989f4cc5f.jpg"
  },
  {
    "id": 6,
    "brand": "Glycomet-GP 1",
    "generic": "Metformin 500mg + Glimepiride 1mg",
    "brandPrice": 72,
    "genericPrice": 35,
    "manufacturer": "USV Ltd",
    "storageAdvice": "Store below 25C and keep away from moisture",
    "uses": "Used to treat type 2 diabetes by lowering blood glucose levels through reduced glucose production and improved insulin secretion.",
    "sideEffects": [
      "Hypoglycemia",
      "Nausea",
      "Diarrhoea"
    ],
    "imageUrl": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"
  },
  {
    "id": 7,
    "brand": "Telma 40",
    "generic": "Telmisartan 40mg",
    "brandPrice": 85,
    "genericPrice": 38,
    "manufacturer": "Glenmark Pharmaceuticals Ltd",
    "storageAdvice": "Store below 25C and keep away from light",
    "uses": "Used to treat high blood pressure and reduce the risk of heart attack and stroke by blocking angiotensin II-induced vasoconstriction.",
    "sideEffects": [
      "Dizziness",
      "Back pain",
      "Diarrhoea"
    ],
    "imageUrl": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/5c263ba88ec15dd475503dcde4e0fece6efc7928.jpg"
  },
  {
    "id": 8,
    "brand": "Amlopres 5",
    "generic": "Amlodipine 5mg",
    "brandPrice": 45,
    "genericPrice": 18,
    "manufacturer": "Cipla Ltd",
    "storageAdvice": "Store below 30C and keep in a dry place",
    "uses": "Used to treat high blood pressure and angina by relaxing blood vessels and reducing the workload on the heart.",
    "sideEffects": [
      "Swelling feet/ankles",
      "Headache",
      "Dizziness"
    ],
    "imageUrl": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/133f7d045b4466ca6914fd7c57abb3c22d1bd9eb.jpg"
  },
  {
    "id": 9,
    "brand": "Storvas 10",
    "generic": "Atorvastatin 10mg",
    "brandPrice": 95,
    "genericPrice": 42,
    "manufacturer": "Sun Pharmaceutical Industries Ltd",
    "storageAdvice": "Store below 25C and protect from moisture",
    "uses": "Used to lower cholesterol and triglyceride levels to reduce the risk of heart disease and stroke.",
    "sideEffects": [
      "Muscle pain",
      "Diarrhoea",
      "Headache"
    ],
    "imageUrl": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/389c003b74c57e388946f57cc85cad47b17698a8.jpg"
  },
  {
    "id": 10,
    "brand": "Thyronorm 50",
    "generic": "Levothyroxine Sodium 50mcg",
    "brandPrice": 75,
    "genericPrice": 32,
    "manufacturer": "Abbott",
    "storageAdvice": "Store below 25C and keep away from light and moisture",
    "uses": "Used to treat hypothyroidism by replacing or supplementing the naturally occurring thyroid hormone.",
    "sideEffects": [
      "Headache",
      "Weight loss",
      "Increased sweating"
    ],
    "imageUrl": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/9779a34c1c592e4787a0e474ebe6d74b79b60f7f.jpg"
  },
  {
    "id": 11,
    "brand": "Pantocid 40",
    "generic": "Pantoprazole 40mg",
    "brandPrice": 110,
    "genericPrice": 48,
    "manufacturer": "Zydus Cadila",
    "storageAdvice": "Store below 25C and protect from moisture",
    "uses": "Used to treat gastroesophageal reflux disease, peptic ulcers, and conditions with excess stomach acid by reducing gastric acid secretion.",
    "sideEffects": [
      "Headache",
      "Diarrhoea",
      "Nausea"
    ],
    "imageUrl": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/3104abd6dea33d14b960a21ea477e70dd8667658.jpg"
  },
  {
    "id": 12,
    "brand": "Azithral 500",
    "generic": "Azithromycin 500mg",
    "brandPrice": 126,
    "genericPrice": 85,
    "manufacturer": "Zydus Cadila",
    "storageAdvice": "Store below 25C and keep away from moisture",
    "uses": "Used to treat bacterial infections such as respiratory tract infections, skin infections, and some sexually transmitted infections.",
    "sideEffects": [
      "Nausea",
      "Diarrhoea",
      "Abdominal pain"
    ],
    "imageUrl": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/de3aa878b965b08a14c69b3a446c7e02c783c89c.jpg"
  },
  {
    "id": 13,
    "brand": "Dolo 650",
    "generic": "Paracetamol 650mg",
    "brandPrice": 30,
    "genericPrice": 12,
    "manufacturer": "Mankind Pharma",
    "storageAdvice": "Store below 30C in a cool, dry place",
    "uses": "Used to relieve pain and reduce fever associated with headaches, muscle ache, fever, and cold or flu.",
    "sideEffects": [
      "Nausea",
      "Dizziness",
      "Diarrhoea"
    ],
    "imageUrl": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/899757cc67df43b2f30deec7ed1ae4fa1f4108d5.jpg"
  },
  {
    "id": 14,
    "brand": "Allegra 120",
    "generic": "Fexofenadine 120mg",
    "brandPrice": 273,
    "genericPrice": 145,
    "manufacturer": "Sanofi",
    "storageAdvice": "Store below 25C and keep away from moisture",
    "uses": "Used to treat allergic rhinitis and chronic urticaria by blocking histamine-mediated allergy symptoms.",
    "sideEffects": [
      "Headache",
      "Dizziness",
      "Nausea"
    ],
    "imageUrl": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/4ddff6f4fa3e8dbe4b95f085f98134321e70f695.jpg"
  },
  {
    "id": 15,
    "brand": "Lasix 40",
    "generic": "Furosemide 40mg",
    "brandPrice": 18,
    "genericPrice": 8,
    "manufacturer": "Sun Pharmaceutical Industries Ltd",
    "storageAdvice": "Store below 25C and keep away from light",
    "uses": "Used to treat fluid buildup (edema) due to heart failure, liver disease, or kidney disease by increasing urine output.",
    "sideEffects": [
      "Electrolyte imbalance",
      "Dizziness",
      "Diarrhoea"
    ],
    "imageUrl": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/5652e726bf1a150d84535573fb11997c9bde2185.jpg"
  },
  {
    "id": 16,
    "brand": "Lopressor 50",
    "generic": "Metoprolol 50mg",
    "brandPrice": 65,
    "genericPrice": 28,
    "manufacturer": "Novartis",
    "storageAdvice": "Store below 25C and keep away from light",
    "uses": "Used to treat high blood pressure, angina, and to prevent heart attack by reducing heart rate and blood pressure.",
    "sideEffects": [
      "Dizziness",
      "Fatigue",
      "Bradycardia"
    ],
    "imageUrl": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/a3a298859d5b3b239f150108dc38025263d55b1c.jpg"
  },
  {
    "id": 17,
    "brand": "Cozaar 50",
    "generic": "Losartan 50mg",
    "brandPrice": 145,
    "genericPrice": 68,
    "manufacturer": "Merck & Co.",
    "storageAdvice": "Store below 25C and keep away from light",
    "uses": "Used to treat high blood pressure and protect kidney in diabetic patients by blocking angiotensin II receptors.",
    "sideEffects": [
      "Dizziness",
      "Back pain",
      "Diarrhoea"
    ],
    "imageUrl": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/9eda8cae03b08ef22fb2b7ceee87ef7bec6e30b1.jpg"
  },
  {
    "id": 18,
    "brand": "Glucotrol 5",
    "generic": "Glipizide 5mg",
    "brandPrice": 42,
    "genericPrice": 18,
    "manufacturer": "Pfizer",
    "storageAdvice": "Store below 25C and keep away from light",
    "uses": "Used to treat type 2 diabetes by stimulating insulin release from the pancreas to lower blood glucose.",
    "sideEffects": [
      "Hypoglycemia",
      "Dizziness",
      "Diarrhoea"
    ],
    "imageUrl": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/829289b85e502b8d79dfc1e434d960ace125a88f.jpg"
  },
  {
    "id": 19,
    "brand": "Zestril 5",
    "generic": "Lisinopril 5mg",
    "brandPrice": 78,
    "genericPrice": 35,
    "manufacturer": "AstraZeneca",
    "storageAdvice": "Store below 25C and keep away from light",
    "uses": "Used to treat high blood pressure and heart failure by inhibiting angiotensin-converting enzyme and relaxing blood vessels.",
    "sideEffects": [
      "Dizziness",
      "Cough",
      "Headache"
    ],
    "imageUrl": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/47dc468d4b562abec89071222acbe92f87a960ce.jpg"
  },
  {
    "id": 20,
    "brand": "Cardace 2.5",
    "generic": "Ramipril 2.5mg",
    "brandPrice": 88,
    "genericPrice": 42,
    "manufacturer": "Sanofi",
    "storageAdvice": "Store below 25C and keep away from light",
    "uses": "Used to treat high blood pressure and reduce the risk of heart attack and stroke by blocking angiotensin-converting enzyme.",
    "sideEffects": [
      "Dizziness",
      "Cough",
      "Headache"
    ],
    "imageUrl": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/bc168eaa3a6936c0ec2e3e40b0896389463313bd.jpg"
  },
  {
    "id": 21,
    "brand": "Cipcal 500",
    "generic": "Calcium Carbonate 500mg",
    "brandPrice": 65,
    "genericPrice": 28,
    "manufacturer": "Intas Pharmaceuticals",
    "storageAdvice": "Store below 25C and keep away from moisture",
    "uses": "Used to treat calcium deficiency and to prevent osteoporosis by providing supplemental calcium.",
    "sideEffects": [
      "Constipation",
      "Flatulence",
      "Stomach upset"
    ],
    "imageUrl": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"
  },
  {
    "id": 22,
    "brand": "Shelcal 500",
    "generic": "Calcium Carbonate 500mg + Vitamin D3 250 IU",
    "brandPrice": 115,
    "genericPrice": 58,
    "manufacturer": "Intas Pharmaceuticals",
    "storageAdvice": "Store below 25C and keep away from moisture",
    "uses": "Used to prevent or treat calcium and vitamin D deficiency, especially in osteoporosis and during pregnancy.",
    "sideEffects": [
      "Constipation",
      "Flatulence",
      "Stomach upset"
    ],
    "imageUrl": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"
  },
  {
    "id": 23,
    "brand": "Becosules",
    "generic": "Vitamin B Complex + Vitamin C",
    "brandPrice": 38,
    "genericPrice": 18,
    "manufacturer": "Merck & Co.",
    "storageAdvice": "Store below 25C and keep away from light",
    "uses": "Used as a supplement for vitamin B and vitamin C deficiencies to support skin, nerve, and overall metabolic health.",
    "sideEffects": [
      "Nausea",
      "Headache",
      "Urine discoloration"
    ],
    "imageUrl": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"
  },
  {
    "id": 24,
    "brand": "Neurobion Forte",
    "generic": "Vitamin B1 + B6 + B12",
    "brandPrice": 42,
    "genericPrice": 22,
    "manufacturer": "Merck & Co.",
    "storageAdvice": "Store below 25C and keep away from light",
    "uses": "Used to treat vitamin B1, B6, and B12 deficiency-related neuropathy, fatigue, and numbness/tingling in limbs.",
    "sideEffects": [
      "Nausea",
      "Headache",
      "Rash"
    ],
    "imageUrl": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"
  },
  {
    "id": 25,
    "brand": "Omez 20",
    "generic": "Omeprazole 20mg",
    "brandPrice": 95,
    "genericPrice": 42,
    "manufacturer": "Sun Pharmaceutical Industries Ltd",
    "storageAdvice": "Store below 25C and keep away from moisture",
    "uses": "Used to treat gastroesophageal reflux disease, peptic ulcers, and excess stomach acid by reducing acid production.",
    "sideEffects": [
      "Headache",
      "Diarrhoea",
      "Abdominal pain"
    ],
    "imageUrl": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"
  },
  {
    "id": 26,
    "brand": "Ranitidine 150",
    "generic": "Ranitidine 150mg",
    "brandPrice": 18,
    "genericPrice": 8,
    "manufacturer": "GlaxoSmithKline",
    "storageAdvice": "Store below 25C and keep away from moisture",
    "uses": "Used to treat heartburn, peptic ulcers, and gastroesophageal reflux by reducing stomach acid secretion.",
    "sideEffects": [
      "Nausea",
      "Dizziness",
      "Constipation"
    ],
    "imageUrl": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"
  },
  {
    "id": 27,
    "brand": "Domperidone 10",
    "generic": "Domperidone 10mg",
    "brandPrice": 22,
    "genericPrice": 10,
    "manufacturer": "Johnson & Johnson",
    "storageAdvice": "Store below 25C and keep away from moisture",
    "uses": "Used to treat nausea, vomiting, and feeling of fullness after meals by increasing gastric motility.",
    "sideEffects": [
      "Dry mouth",
      "Restlessness",
      "Diarrhoea"
    ],
    "imageUrl": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"
  },
  {
    "id": 28,
    "brand": "Ondem 4",
    "generic": "Ondansetron 4mg",
    "brandPrice": 45,
    "genericPrice": 22,
    "manufacturer": "Emcure Pharmaceuticals",
    "storageAdvice": "Store below 25C and keep away from moisture",
    "uses": "Used to prevent nausea and vomiting associated with chemotherapy, radiotherapy, and surgery.",
    "sideEffects": [
      "Headache",
      "Dizziness",
      "Constipation"
    ],
    "imageUrl": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"
  },
  {
    "id": 29,
    "brand": "Disprin",
    "generic": "Aspirin 325mg",
    "brandPrice": 12,
    "genericPrice": 5,
    "manufacturer": "Reckitt Benckiser",
    "storageAdvice": "Store below 25C in a dry place and keep away from moisture",
    "uses": "Used to relieve pain, reduce fever, and act as an anti-platelet agent to prevent heart attack and stroke.",
    "sideEffects": [
      "Stomach upset",
      "Nausea",
      "Ringing in ears"
    ],
    "imageUrl": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"
  },
  {
    "id": 30,
    "brand": "Ecosprin 75",
    "generic": "Aspirin 75mg",
    "brandPrice": 8,
    "genericPrice": 3,
    "manufacturer": "USV Ltd",
    "storageAdvice": "Store below 25C in a dry place and keep away from moisture",
    "uses": "Used as a low-dose anti-platelet agent to prevent heart attack, stroke, and blood clot formation in high-risk patients.",
    "sideEffects": [
      "Stomach upset",
      "Nausea",
      "Ringing in ears"
    ],
    "imageUrl": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"
  }
];

if (typeof module !== 'undefined') {
  module.exports = medicineDatabase;
}

if (typeof window !== 'undefined') {
  window.medicineDatabase = medicineDatabase;
}
