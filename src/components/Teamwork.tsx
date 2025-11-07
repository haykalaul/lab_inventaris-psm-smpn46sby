import { Users } from 'lucide-react';

export function Teamwork() {
  const teamData = {
    kepalaSekolah: ["Ani Musafa'ah, M.Pd."],
    kepalaLaboratorium: ['Dra. Dwi Wulandari'],
    guruPamong: ['Priambodo, S.S'],
    guruIPA: [
      'Dra. Dwi Wulandari',
      'Dra. Bekti Diah Widjajanti, M.Pd',
      'Dra. Mukammilah',
      'Ach. Jubaidi, S.Si',
      'Serly Meinar Paramita',
      'Aditya Gama Nurcahyo',
    ],
    timPenyusun: ['Arika Nadia Zalfa', 'Naurah Fakhrina', 'Novita Azzahra Ramadhina'],
  };

  return (
    <div className="bg-white/90 rounded-3xl shadow-xl p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-3">
        <Users size={32} />
        Teamwork
      </h2>
      <p className="text-gray-700 leading-relaxed mb-8">
        Tim dan penanggung jawab Laboratorium IPA SMPN 46 Surabaya.
      </p>

      <div className="space-y-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Kepala Sekolah</h3>
          <ul className="list-disc list-inside space-y-2">
            {teamData.kepalaSekolah.map((name, i) => (
              <li key={i} className="text-gray-700">
                {name}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Kepala Laboratorium</h3>
          <ul className="list-disc list-inside space-y-2">
            {teamData.kepalaLaboratorium.map((name, i) => (
              <li key={i} className="text-gray-700">
                {name}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Guru Pamong</h3>
          <ul className="list-disc list-inside space-y-2">
            {teamData.guruPamong.map((name, i) => (
              <li key={i} className="text-gray-700">
                {name}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Guru IPA</h3>
          <ul className="list-disc list-inside space-y-2">
            {teamData.guruIPA.map((name, i) => (
              <li key={i} className="text-gray-700">
                {name}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Tim Penyusun</h3>
          <ul className="list-disc list-inside space-y-2">
            {teamData.timPenyusun.map((name, i) => (
              <li key={i} className="text-gray-700">
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-2xl text-center">
        <p className="text-gray-700">
          Get to know more about PSM <br />
          <a
            href="https://instagram.com/psm8.smpn46sby"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-600 font-semibold hover:text-pink-700 hover:underline"
          >
            📷 @psm8.smpn46sby
          </a>
        </p>
      </div>
    </div>
  );
}
