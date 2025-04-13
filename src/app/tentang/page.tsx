import Link from "next/link";
import { Button } from "~/components/ui/button";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import PublicLayout from "~/components/layouts/PublicLayout";

export default function TentangPage() {
  return (
    <PublicLayout>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary/10 py-12 md:py-24">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-4 text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Tentang TPQ Al-Mufid
              </h1>
              <p className="mb-8 text-gray-500 md:text-xl/relaxed">
                Taman Pendidikan Al-Qur&apos;an (TPQ) Al-Mufid adalah lembaga pendidikan Islam yang fokus pada pembelajaran Al-Qur&apos;an dan nilai-nilai Islam untuk anak-anak.
              </p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-12 md:py-24">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-2xl font-bold">Sejarah Kami</h2>
                <p className="mb-4 text-gray-500">
                  TPQ Al-Mufid didirikan pada tahun 2010 dengan tujuan untuk memberikan pendidikan Al-Qur&apos;an yang berkualitas bagi anak-anak di wilayah Loa Bakung, Samarinda.
                </p>
                <p className="mb-4 text-gray-500">
                  Berawal dari sebuah majelis kecil dengan beberapa santri, kini TPQ Al-Mufid telah berkembang menjadi lembaga pendidikan yang dipercaya oleh masyarakat dengan ratusan santri.
                </p>
                <p className="text-gray-500">
                  Kami berkomitmen untuk terus meningkatkan kualitas pendidikan dan pelayanan demi terwujudnya generasi Qur&apos;ani yang berakhlak mulia.
                </p>
              </div>
              <div>
                <h2 className="mb-4 text-2xl font-bold">Visi & Misi</h2>
                <div className="mb-6">
                  <h3 className="mb-2 text-xl font-semibold">Visi</h3>
                  <p className="text-gray-500">
                    Menjadi lembaga pendidikan Al-Qur&apos;an terdepan dalam membentuk generasi yang cinta Al-Qur&apos;an, berakhlak mulia, dan berwawasan luas.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold">Misi</h3>
                  <ul className="list-inside list-disc space-y-2 text-gray-500">
                    <li>Menyelenggarakan pendidikan Al-Qur&apos;an dengan metode yang menyenangkan dan efektif</li>
                    <li>Menanamkan nilai-nilai Islam dan akhlak mulia dalam kehidupan sehari-hari</li>
                    <li>Membangun kerjasama yang baik antara lembaga, orangtua, dan masyarakat</li>
                    <li>Mengembangkan potensi santri melalui berbagai kegiatan pendukung</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Program Section */}
        <section className="bg-muted py-12 md:py-24">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-12 text-center text-3xl font-bold">Program Pembelajaran</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-background p-6 shadow-sm">
                <h3 className="mb-2 text-xl font-bold">Iqro&apos;</h3>
                <p className="text-gray-500">
                  Pembelajaran dasar membaca Al-Qur&apos;an dengan metode Iqro&apos; untuk pemula.
                </p>
              </div>
              <div className="rounded-lg bg-background p-6 shadow-sm">
                <h3 className="mb-2 text-xl font-bold">Tahsin</h3>
                <p className="text-gray-500">
                  Perbaikan dan peningkatan kualitas bacaan Al-Qur&apos;an dengan tajwid yang benar.
                </p>
              </div>
              <div className="rounded-lg bg-background p-6 shadow-sm">
                <h3 className="mb-2 text-xl font-bold">Tahfidz</h3>
                <p className="text-gray-500">
                  Program menghafal Al-Qur&apos;an dengan metode yang sistematis dan menyenangkan.
                </p>
              </div>
              <div className="rounded-lg bg-background p-6 shadow-sm">
                <h3 className="mb-2 text-xl font-bold">Akhlak & Adab</h3>
                <p className="text-gray-500">
                  Pembelajaran akhlak dan adab Islami dalam kehidupan sehari-hari.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 md:py-24">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-12 text-center text-3xl font-bold">Hubungi Kami</h2>
            <div className="mx-auto max-w-3xl rounded-lg border bg-background p-8 shadow-sm">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-semibold">Alamat</h3>
                      <p className="text-gray-500">Jl. Loa Bakung No. 123, Samarinda, Kalimantan Timur</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-semibold">Telepon</h3>
                      <p className="text-gray-500">+62 541 123456</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-semibold">Email</h3>
                      <p className="text-gray-500">info@tpqalmufid.ac.id</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-semibold">Jam Belajar</h3>
                      <p className="text-gray-500">Senin - Jumat: 15.00 - 17.30 WITA</p>
                      <p className="text-gray-500">Sabtu - Minggu: 09.00 - 11.30 WITA</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="mb-4 text-xl font-semibold">Daftar Sekarang</h3>
                  <p className="mb-6 text-gray-500">
                    Untuk informasi lebih lanjut atau pendaftaran, silakan hubungi kami atau kunjungi lokasi TPQ Al-Mufid.
                  </p>
                  <Link href="/auth/register">
                    <Button className="w-full bg-primary text-white">
                      Daftar Santri Baru
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
