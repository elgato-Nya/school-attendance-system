/**
 * Reusable Footer Component
 * Professional footer with school information and system details
 */

import { Heart, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* School Information */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">SMK Taman Melawati</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  Jalan Bandar 1, Taman Melawati,
                  <br />
                  53100 Kuala Lumpur, Malaysia
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                <a href="tel:+60341234567" className="hover:text-foreground transition-colors">
                  +60 3-4123 4567
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                <a
                  href="mailto:admin@smktm.edu.my"
                  className="hover:text-foreground transition-colors"
                >
                  admin@smktm.edu.my
                </a>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Pautan Pantas</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://www.moe.gov.my"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  Kementerian Pendidikan Malaysia
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors"
                  onClick={(e) => {
                    e.preventDefault(); /* TODO: Add privacy policy */
                  }}
                >
                  Dasar Privasi
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors"
                  onClick={(e) => {
                    e.preventDefault(); /* TODO: Add terms */
                  }}
                >
                  Terma Perkhidmatan
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@smktm.edu.my"
                  className="hover:text-foreground transition-colors"
                >
                  Sokongan Teknikal
                </a>
              </li>
            </ul>
          </div>

          {/* System Information */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Maklumat Sistem</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Sistem Pengurusan Kehadiran</span>
              </p>
              <p>Versi 1.0.0 (Beta)</p>
              <p>Kemas Kini Terakhir: November 2025</p>
              <div className="pt-2">
                <p className="text-xs">
                  Direka untuk penjejakan dan pelaporan kehadiran yang lancar. Untuk bantuan,
                  hubungi Jabatan IT.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-muted-foreground">
          <p className="flex items-center gap-1.5 text-center sm:text-left">
            © {currentYear} SMK Taman Melawati. Hak cipta terpelihara.
          </p>
          <p className="text-xs">Dikuasakan oleh React, TypeScript & Firebase</p>
        </div>
      </div>
    </footer>
  );
}
