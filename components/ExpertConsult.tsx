import React from 'react';

interface ExpertConsultProps {
  onBookMedicalConsultation: () => void;
}

interface Expert {
  name: string;
  clinic: string;
  role: string;
  qualification: string;
  experience: string;
  location: string;
  rating: number;
  reviews: number;
  fee: string;
  image: string;
  type: 'medical' | 'career';
  services: string[];
  badge: string;
  badgeColor: string;
}

const experts: Expert[] = [
  {
    name: 'Dr. Anil Dhingra',
    clinic: 'Dr. Anil Dhingra Clinic',
    role: 'General Physician',
    qualification: 'MBBS',
    experience: '48 Years in Healthcare',
    location: 'DLF City Phase 3, Gurgaon',
    rating: 4.2,
    reviews: 91,
    fee: '₹199',
    image: '/doctor.jpg',
    type: 'medical',
    services: [
      '✅ Prescription for medicines',
      '✅ General health consultation',
      '✅ Chronic disease management',
      '❌ Not for emergencies'
    ],
    badge: '🏥 Medical',
    badgeColor: 'bg-blue-900 text-blue-300'
  },
  {
    name: 'Utkarsh Shukla',
    clinic: 'OurPharma Wellness',
    role: 'Certified Career Coach & Counsellor',
    qualification: 'Certified Coach',
    experience: 'Career & Mental Wellness Expert',
    location: 'Online • Available Now',
    rating: 4.9,
    reviews: 50,
    fee: '₹199',
    image: '/utkarsh.jpg',
    type: 'career',
    services: [
      '✅ Career guidance & planning',
      '✅ Mental wellness support',
      '✅ Academic counselling',
      '❌ Not a medical consultation'
    ],
    badge: '🧠 Career & Wellness',
    badgeColor: 'bg-purple-900 text-purple-300'
  }
];

const ExpertConsult: React.FC<ExpertConsultProps> = ({ onBookMedicalConsultation }) => {
  return (
    <section className="min-h-screen bg-[#0B1F1C] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            🩺 Talk to an Expert
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Get guidance from verified professionals at just ₹199
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-yellow-700 bg-yellow-950 p-3">
          <p className="text-xs text-yellow-400">
            ⚠️ Career & wellness consultations are NOT medical advice. For medical prescriptions, consult Dr. Anil Dhingra only.
          </p>
        </div>

        {experts.map((expert) => (
          <div key={expert.name} className="mb-4 rounded-2xl border border-green-900 bg-gray-900 p-5 shadow-[0_20px_60px_-32px_rgba(22,163,74,0.55)]">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${expert.badgeColor}`}>
              {expert.badge}
            </span>

            <div className="mt-3 flex flex-col gap-4 sm:flex-row">
              <img
                src={expert.image}
                alt={expert.name}
                className="h-24 w-24 rounded-2xl border-2 border-green-700 object-cover"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">
                  {expert.name}
                </h3>
                <p className="text-sm font-medium text-green-400">
                  {expert.role}
                </p>
                <p className="text-xs text-gray-400">
                  {expert.clinic}
                </p>
                <p className="text-xs text-gray-400">
                  {expert.qualification}
                </p>
                <p className="text-xs text-gray-400">
                  {expert.experience}
                </p>
                <p className="text-xs text-gray-500">
                  📍 {expert.location}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm text-yellow-400">
                    ★ {expert.rating}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({expert.reviews} ratings)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-gray-800 p-3">
              <p className="mb-2 text-xs font-medium text-gray-400">What's included:</p>
              {expert.services.map((service) => (
                <p key={service} className="mb-1 text-xs text-gray-300">{service}</p>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-green-800 bg-green-950 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-gray-400">
                  Consultation Fee
                </p>
                <p className="text-xl font-bold text-white">
                  {expert.fee}
                </p>
                <p className="text-xs text-green-400">
                  per session • 30 minutes
                </p>
              </div>
              <button
                onClick={expert.type === 'medical' ? onBookMedicalConsultation : undefined}
                className={`rounded-xl px-6 py-3 font-bold text-white transition-all ${expert.type === 'medical' ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                {expert.type === 'medical' ? 'Book Now →' : 'Coming Soon'}
              </button>
            </div>

            <p className="mt-3 text-center text-xs text-gray-600">
              🔒 Personal contact details are never shared. All sessions through OurPharma platform only.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ExpertConsult;