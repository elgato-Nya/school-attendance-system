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
            <h3 className="font-semibold text-foreground mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://www.moe.gov.my"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  Ministry of Education
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
                  Privacy Policy
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
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@smktm.edu.my"
                  className="hover:text-foreground transition-colors"
                >
                  Technical Support
                </a>
              </li>
            </ul>
          </div>

          {/* System Information */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">System Information</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Attendance Management System</span>
              </p>
              <p>Version 1.0.0 (Beta)</p>
              <p>Last Updated: November 2025</p>
              <div className="pt-2">
                <p className="text-xs">
                  Designed for seamless attendance tracking and reporting. For assistance, contact
                  the IT Department.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-muted-foreground">
          <p className="flex items-center gap-1.5 text-center sm:text-left">
            © {currentYear} SMK Taman Melawati. All rights reserved.
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              Made with{' '}
              <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 inline" aria-label="love" />{' '}
              by IT Team
            </span>
          </p>
          <p className="text-xs">Powered by React, TypeScript & Firebase</p>
        </div>
      </div>
    </footer>
  );
}
