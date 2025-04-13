import Link from "next/link";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { BookOpen, BookText, Heart } from "lucide-react";

import PublicLayout from "~/components/layouts/PublicLayout";

export default function LandingPage() {
  return (
    <PublicLayout>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-12 md:py-24">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2 md:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Taman Pendidikan Al-Mufid
              </h1>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Menanamkan Nilai-Nilai Islami, Membentuk Generasi Berkualitas di Loa Bakung, Samarinda.
              </p>
              <div className="mt-4">
                <h2 className="mb-4 text-xl font-semibold">
                  Daftarkan Putra-Putri Anda Sekarang
                </h2>
                <Link href="/auth/register">
                  <Button size="lg" className="bg-primary text-white">
                    Daftar
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[300px] w-[300px] overflow-hidden rounded-lg bg-primary p-4 sm:h-[350px] sm:w-[350px] md:h-[400px] md:w-[400px]">
                <Image
                  src="/quran-illustration.svg"
                  alt="Quran Illustration"
                  fill
                  className="object-contain p-6"
                  priority
                />
              </div>
            </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted py-12 md:py-24">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-12 text-center text-3xl font-bold">Program Unggulan Kami</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg bg-background p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Tahsin Al-Qur&apos;an</h3>
                <p className="text-gray-500">
                  Pembelajaran membaca Al-Qur&apos;an dengan tajwid yang benar dan makhraj yang tepat.
                </p>
              </div>
              <div className="rounded-lg bg-background p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <BookText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Tahfidz Qur&apos;an</h3>
                <p className="text-gray-500">
                  Program menghafal Al-Qur&apos;an dengan metode yang menyenangkan dan mudah diikuti.
                </p>
              </div>
              <div className="rounded-lg bg-background p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Pembelajaran Akhlak</h3>
                <p className="text-gray-500">
                  Pembentukan karakter Islami dan akhlak mulia sejak dini.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
