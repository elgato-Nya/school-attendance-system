/**
 * Accent Color Test Component
 * Verifies that bg-accent and other accent utilities are working
 */

export function AccentColorTest() {
  return (
    <div className="p-8 space-y-6 bg-background">
      <h2 className="text-2xl font-bold">Ujian Warna Aksen</h2>

      {/* Background Test */}
      <div className="space-y-2">
        <h3 className="font-semibold">bg-accent (sepatutnya teal terang)</h3>
        <div className="bg-accent text-accent-foreground p-4 rounded-lg">
          Ini mempunyai latar belakang bg-accent dengan teks text-accent-foreground
        </div>
      </div>

      {/* Text Test */}
      <div className="space-y-2">
        <h3 className="font-semibold">text-accent (sepatutnya teks teal)</h3>
        <p className="text-accent text-xl font-bold">
          Teks ini sepatutnya teal terang menggunakan text-accent
        </p>
      </div>

      {/* Border Test */}
      <div className="space-y-2">
        <h3 className="font-semibold">border-accent (sepatutnya sempadan teal)</h3>
        <div className="border-4 border-accent p-4 rounded-lg">
          Kotak ini mempunyai sempadan teal tebal menggunakan border-accent
        </div>
      </div>

      {/* Hover Test */}
      <div className="space-y-2">
        <h3 className="font-semibold">hover:bg-accent (hover untuk lihat teal)</h3>
        <div className="bg-secondary hover:bg-accent hover:text-accent-foreground p-4 rounded-lg transition-all cursor-pointer">
          Hover di atas ini untuk lihat ia bertukar teal
        </div>
      </div>

      {/* All Variants */}
      <div className="space-y-2">
        <h3 className="font-semibold">Semua Varian Warna Tersedia</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary text-primary-foreground p-3 rounded text-center">Utama</div>
          <div className="bg-accent text-accent-foreground p-3 rounded text-center">
            Aksen (Teal)
          </div>
          <div className="bg-success text-success-foreground p-3 rounded text-center">Berjaya</div>
          <div className="bg-warning text-warning-foreground p-3 rounded text-center">Amaran</div>
          <div className="bg-info text-info-foreground p-3 rounded text-center">Maklumat</div>
          <div className="bg-destructive text-destructive-foreground p-3 rounded text-center">
            Merosakkan
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-success/10 border-2 border-success text-success p-4 rounded-lg">
        ✅ Jika anda dapat lihat warna teal terang di atas, utiliti aksen berfungsi dengan betul!
      </div>
    </div>
  );
}
