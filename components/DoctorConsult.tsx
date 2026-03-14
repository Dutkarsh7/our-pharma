import React from 'react';

interface DoctorConsultProps {
  onUploadRx: () => void;
  onBookConsultation: () => void;
}

const doctor = {
  name: 'Dr. Anil Dhingra',
  clinic: 'Dr. Anil Dhingra Clinic',
  location: 'DLF City Phase 3, Gurgaon',
  experience: '48 Years in Healthcare',
  qualification: 'MBBS, General Physician',
  rating: 4.2,
  reviews: 91,
  consultFee: '₹1,000',
  platformFee: '₹99',
  availability: 'Opens at 05:30 PM',
  image: '/doctor.jpg'
};

const DoctorConsult: React.FC<DoctorConsultProps> = ({ onUploadRx, onBookConsultation }) => {
  return (
    <div className="rounded-2xl border border-green-800 bg-gray-900 p-6">
      <h2 className="mb-4 text-xl font-bold text-white">
        🩺 Prescription Required
      </h2>
      <p className="mb-4 text-sm text-gray-400">
        This medicine requires a valid prescription. Consult our verified doctor to get one.
      </p>

      <div className="flex flex-col gap-4 rounded-xl bg-gray-800 p-4 sm:flex-row">
        <img
          src={doctor.image}
          alt={doctor.name}
          className="h-20 w-20 rounded-xl object-cover"
        />
        <div>
          <h3 className="font-bold text-white">
            {doctor.name}
          </h3>
          <p className="text-sm text-green-400">
            {doctor.qualification}
          </p>
          <p className="text-sm text-gray-400">
            {doctor.clinic}
          </p>
          <p className="text-sm text-gray-400">
            {doctor.experience}
          </p>
          <p className="text-sm text-gray-400">
            📍 {doctor.location}
          </p>
          <p className="mt-1 text-xs text-green-400">
            {doctor.availability}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-yellow-400">★ {doctor.rating}</span>
            <span className="text-xs text-gray-500">
              ({doctor.reviews} ratings)
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-4">
        <div className="flex-1 rounded-xl bg-gray-800 p-3 text-center">
          <p className="text-xs text-gray-400">
            Consultation Fee
          </p>
          <p className="font-bold text-white">
            {doctor.consultFee}
          </p>
        </div>
        <div className="flex-1 rounded-xl border border-green-600 bg-green-900 p-3 text-center">
          <p className="text-xs text-green-400">
            OurPharma Platform Fee
          </p>
          <p className="font-bold text-green-300">
            {doctor.platformFee}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        ⚕️ Doctor contact details are not shared. Consultation happens through OurPharma platform only. AI accuracy ~95%. Always verify with your doctor.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button onClick={onBookConsultation} className="flex-1 rounded-xl bg-green-600 py-3 font-bold text-white hover:bg-green-500">
          📅 Book Consultation — ₹99
        </button>
        <button
          className="flex-1 rounded-xl border border-gray-600 py-3 text-gray-300"
          onClick={onUploadRx}
        >
          📋 Upload Existing Rx
        </button>
      </div>
    </div>
  );
};

export default DoctorConsult;