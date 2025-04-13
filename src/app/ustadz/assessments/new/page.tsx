"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";
import UstadzLayout from "~/components/layouts/UstadzLayout";

type Student = {
  id: string;
  name: string | null;
  student: {
    nis: string;
    class: string;
    jilid: string;
  } | null;
};

export default function NewAssessmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    studentId: "",
    date: new Date().toISOString().split("T")[0],
    surah: "",
    jilid: "",
    notes: "",
    
    // Fashahah assessment
    makharijulHuruf: 0,
    sifatulHuruf: 0,
    harakat: 0,
    madQashr: 0,
    
    // Tajwid assessment
    hukumNunMati: 0,
    hukumMimMati: 0,
    mad: 0,
    waqafIbtida: 0,
    tafkhimTarqiq: 0,
    
    // Tartil assessment
    tempo: 0,
    calmness: 0,
    fluency: 0,
    
    // Voice assessment (optional)
    voice: 0,
    tone: 0,
    
    // Adab assessment
    attitude: 0,
  });

  useEffect(() => {
    // Redirect if not ustadz
    if (status === "authenticated" && session?.user?.role !== UserRole.USTADZ) {
      router.push("/");
      return;
    }

    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    // Fetch students
    if (status === "authenticated") {
      fetchStudents();
    }
  }, [status, session, router]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ustadz/students");
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      setError("Failed to load students");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "studentId" ? value : 
              ["surah", "jilid", "notes", "date"].includes(name) ? value : 
              parseFloat(value),
    }));
  };

  const calculateFinalScore = () => {
    // Calculate weighted scores for each category
    const fashahahScore = (
      formData.makharijulHuruf * 0.25 +
      formData.sifatulHuruf * 0.25 +
      formData.harakat * 0.25 +
      formData.madQashr * 0.25
    );
    
    const tajwidScore = (
      formData.hukumNunMati * 0.2 +
      formData.hukumMimMati * 0.2 +
      formData.mad * 0.2 +
      formData.waqafIbtida * 0.2 +
      formData.tafkhimTarqiq * 0.2
    );
    
    const tartilScore = (
      formData.tempo * 0.33 +
      formData.calmness * 0.33 +
      formData.fluency * 0.34
    );
    
    const voiceScore = (
      formData.voice * 0.5 +
      formData.tone * 0.5
    );
    
    const adabScore = formData.attitude;
    
    // Calculate final score with category weights
    // Fashahah: 30%, Tajwid: 30%, Tartil: 25%, Voice: 5%, Adab: 10%
    const finalScore = (
      fashahahScore * 0.3 +
      tajwidScore * 0.3 +
      tartilScore * 0.25 +
      voiceScore * 0.05 +
      adabScore * 0.1
    );
    
    return {
      fashahahScore,
      tajwidScore,
      tartilScore,
      voiceScore,
      adabScore,
      finalScore,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    // Calculate scores
    const scores = calculateFinalScore();

    try {
      const response = await fetch("/api/ustadz/assessments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          ...scores,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Terjadi kesalahan saat menyimpan penilaian");
      }

      setSuccess("Penilaian berhasil disimpan");
      
      // Reset form
      setFormData({
        ...formData,
        studentId: "",
        surah: "",
        jilid: "",
        notes: "",
        makharijulHuruf: 0,
        sifatulHuruf: 0,
        harakat: 0,
        madQashr: 0,
        hukumNunMati: 0,
        hukumMimMati: 0,
        mad: 0,
        waqafIbtida: 0,
        tafkhimTarqiq: 0,
        tempo: 0,
        calmness: 0,
        fluency: 0,
        voice: 0,
        tone: 0,
        attitude: 0,
      });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Terjadi kesalahan saat menyimpan penilaian");
      }
      console.error("Assessment submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <UstadzLayout>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-green-500"></div>
            <p>Loading...</p>
          </div>
        </div>
      </UstadzLayout>
    );
  }

  return (
    <UstadzLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Input Penilaian Baru</h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow-md">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                Santri
              </label>
              <select
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
              >
                <option value="">Pilih Santri</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} {student.student ? `(${student.student.nis} - Kelas ${student.student.class})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Tanggal Penilaian
              </label>
              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
              />
            </div>

            <div>
              <label htmlFor="surah" className="block text-sm font-medium text-gray-700">
                Surah
              </label>
              <input
                id="surah"
                name="surah"
                type="text"
                value={formData.surah}
                onChange={handleChange}
                placeholder="Contoh: Al-Fatihah"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
              />
            </div>

            <div>
              <label htmlFor="jilid" className="block text-sm font-medium text-gray-700">
                Jilid
              </label>
              <input
                id="jilid"
                name="jilid"
                type="text"
                value={formData.jilid}
                onChange={handleChange}
                placeholder="Contoh: Jilid 1"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
              />
            </div>
          </div>

          {/* Fashahah Assessment */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="mb-4 text-lg font-medium text-gray-800">Penilaian Fashahah</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="makharijulHuruf" className="block text-sm font-medium text-gray-700">
                  Makharijul Huruf (0-100)
                </label>
                <input
                  id="makharijulHuruf"
                  name="makharijulHuruf"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.makharijulHuruf}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="sifatulHuruf" className="block text-sm font-medium text-gray-700">
                  Sifatul Huruf (0-100)
                </label>
                <input
                  id="sifatulHuruf"
                  name="sifatulHuruf"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.sifatulHuruf}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="harakat" className="block text-sm font-medium text-gray-700">
                  Harakat (0-100)
                </label>
                <input
                  id="harakat"
                  name="harakat"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.harakat}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="madQashr" className="block text-sm font-medium text-gray-700">
                  Mad-Qashr (0-100)
                </label>
                <input
                  id="madQashr"
                  name="madQashr"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.madQashr}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Tajwid Assessment */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="mb-4 text-lg font-medium text-gray-800">Penilaian Tajwid</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="hukumNunMati" className="block text-sm font-medium text-gray-700">
                  Hukum Nun Mati (0-100)
                </label>
                <input
                  id="hukumNunMati"
                  name="hukumNunMati"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.hukumNunMati}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="hukumMimMati" className="block text-sm font-medium text-gray-700">
                  Hukum Mim Mati (0-100)
                </label>
                <input
                  id="hukumMimMati"
                  name="hukumMimMati"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.hukumMimMati}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="mad" className="block text-sm font-medium text-gray-700">
                  Mad (0-100)
                </label>
                <input
                  id="mad"
                  name="mad"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.mad}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="waqafIbtida" className="block text-sm font-medium text-gray-700">
                  Waqaf Ibtida' (0-100)
                </label>
                <input
                  id="waqafIbtida"
                  name="waqafIbtida"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.waqafIbtida}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="tafkhimTarqiq" className="block text-sm font-medium text-gray-700">
                  Tafkhim Tarqiq (0-100)
                </label>
                <input
                  id="tafkhimTarqiq"
                  name="tafkhimTarqiq"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.tafkhimTarqiq}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Tartil Assessment */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="mb-4 text-lg font-medium text-gray-800">Penilaian Tartil</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label htmlFor="tempo" className="block text-sm font-medium text-gray-700">
                  Tempo (0-100)
                </label>
                <input
                  id="tempo"
                  name="tempo"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.tempo}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="calmness" className="block text-sm font-medium text-gray-700">
                  Ketenangan (0-100)
                </label>
                <input
                  id="calmness"
                  name="calmness"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.calmness}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="fluency" className="block text-sm font-medium text-gray-700">
                  Kelancaran (0-100)
                </label>
                <input
                  id="fluency"
                  name="fluency"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.fluency}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Voice Assessment */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="mb-4 text-lg font-medium text-gray-800">Penilaian Suara & Nada (Opsional)</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="voice" className="block text-sm font-medium text-gray-700">
                  Suara (0-100)
                </label>
                <input
                  id="voice"
                  name="voice"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.voice}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="tone" className="block text-sm font-medium text-gray-700">
                  Nada (0-100)
                </label>
                <input
                  id="tone"
                  name="tone"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.tone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Adab Assessment */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="mb-4 text-lg font-medium text-gray-800">Penilaian Adab & Sikap</h2>
            <div>
              <label htmlFor="attitude" className="block text-sm font-medium text-gray-700">
                Adab & Sikap (0-100)
              </label>
              <input
                id="attitude"
                name="attitude"
                type="number"
                min="0"
                max="100"
                value={formData.attitude}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="border-t border-gray-200 pt-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Catatan
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
              placeholder="Tambahkan catatan untuk santri (opsional)"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-300"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Penilaian"}
            </button>
          </div>
        </form>
      </div>
    </UstadzLayout>
  );
}
