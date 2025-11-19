/**
 * CalendarLegend Component
 * Displays color coding legend for calendar with theme support
 * Enhanced with shadcn/ui Collapsible and semantic HTML with ARIA
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Calendar,
  TrendingUp,
  AlertCircle,
  Flag,
  School,
  PartyPopper,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export function CalendarLegend() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="shadow-sm" role="complementary" aria-labelledby="legend-title">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle id="legend-title" className="text-base sm:text-lg flex items-center gap-2">
            <div className="p-1.5 rounded bg-primary/10" aria-hidden="true">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
            </div>
            <span>Legenda Warna</span>
          </CardTitle>
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="sm:hidden">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label={isExpanded ? 'Kuncupkan legenda' : 'Kembangkan legenda'}
                aria-expanded={isExpanded}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>
      </CardHeader>
      <CardContent>
        {/* Mobile Compact View */}
        <div className="sm:hidden" role="region" aria-label="Legenda kalendar">
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            {/* Compact Preview - Only show when collapsed */}
            {!isExpanded && (
              <div className="flex flex-wrap gap-2" aria-label="Pratonton legenda pantas">
                <div className="flex items-center gap-1.5 text-xs">
                  <div
                    className="w-4 h-4 rounded bg-[hsl(var(--success))]"
                    aria-hidden="true"
                  ></div>
                  <span>Cemerlang</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <div
                    className="w-4 h-4 rounded bg-[hsl(var(--warning))]"
                    aria-hidden="true"
                  ></div>
                  <span>Baik</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <div
                    className="w-4 h-4 rounded bg-[hsl(var(--poor-attendance))]"
                    aria-hidden="true"
                  ></div>
                  <span>Lemah</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <div
                    className="w-4 h-4 rounded bg-[hsl(var(--holiday-public))]"
                    aria-hidden="true"
                  ></div>
                  <span>Cuti</span>
                </div>
              </div>
            )}

            {/* Expanded Full View */}
            <CollapsibleContent className="mt-3">
              <div>
                {/* Attendance */}
                <section aria-labelledby="attendance-legend">
                  <h3
                    id="attendance-legend"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2"
                  >
                    Kehadiran
                  </h3>
                  <ul className="space-y-2" role="list">
                    <li className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center bg-[hsl(var(--success))]"
                        aria-hidden="true"
                      >
                        <TrendingUp className="h-3 w-3 text-[hsl(var(--success-foreground))]" />
                      </div>
                      <span className="text-sm">≥95% (Cemerlang)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center bg-[hsl(var(--warning))]"
                        aria-hidden="true"
                      >
                        <TrendingUp className="h-3 w-3 text-[hsl(var(--warning-foreground))]" />
                      </div>
                      <span className="text-sm">85-95% (Baik)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center bg-[hsl(var(--poor-attendance))]"
                        aria-hidden="true"
                      >
                        <AlertCircle className="h-3 w-3 text-[hsl(var(--poor-attendance-foreground))]" />
                      </div>
                      <span className="text-sm">&lt;85% (Perlu Perhatian)</span>
                    </li>
                  </ul>
                </section>

                {/* Holidays */}
                <section aria-labelledby="holidays-legend">
                  <h3
                    id="holidays-legend"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2"
                  >
                    Cuti
                  </h3>
                  <ul className="space-y-2" role="list">
                    <li className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center bg-[hsl(var(--holiday-public))]"
                        aria-hidden="true"
                      >
                        <Flag className="h-3 w-3 text-primary-foreground" />
                      </div>
                      <span className="text-sm">Cuti Umum</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center bg-[hsl(var(--holiday-school))]"
                        aria-hidden="true"
                      >
                        <School className="h-3 w-3 text-primary-foreground" />
                      </div>
                      <span className="text-sm">Cuti Sekolah</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center bg-[hsl(var(--holiday-event))]"
                        aria-hidden="true"
                      >
                        <PartyPopper className="h-3 w-3 text-primary-foreground" />
                      </div>
                      <span className="text-sm">Acara Sekolah</span>
                    </li>
                  </ul>
                </section>

                {/* Other & Instructions */}
                <div className="grid grid-cols-2 gap-4">
                  <section aria-labelledby="other-legend">
                    <h3
                      id="other-legend"
                      className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2"
                    >
                      Lain-lain
                    </h3>
                    <ul className="space-y-2" role="list">
                      <li className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded bg-[hsl(var(--muted))]"
                          aria-hidden="true"
                        ></div>
                        <span className="text-sm">Hujung Minggu</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded border-2 border-[hsl(var(--border))] bg-[hsl(var(--background))]"
                          aria-hidden="true"
                        ></div>
                        <span className="text-sm">Tiada Data</span>
                      </li>
                    </ul>
                  </section>
                  <section aria-labelledby="tips-legend">
                    <h3
                      id="tips-legend"
                      className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2"
                    >
                      Petua
                    </h3>
                    <ul className="text-xs text-muted-foreground space-y-1" role="list">
                      <li>• Klik tarikh untuk butiran</li>
                      <li>• Tunjuk untuk info pantas</li>
                    </ul>
                  </section>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Desktop Full View */}
        <nav className="hidden sm:block" role="region" aria-label="Legenda warna kalendar">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-[1200px]">
            {/* Attendance Rates */}
            <section aria-labelledby="desktop-attendance-legend">
              <h3
                id="desktop-attendance-legend"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2"
              >
                Kehadiran
              </h3>
              <ul className="space-y-2" role="list">
                <li className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center bg-[hsl(var(--success))] shadow-sm"
                    role="img"
                    aria-label="Petunjuk hijau"
                  >
                    <TrendingUp
                      className="h-3.5 w-3.5 text-[hsl(var(--success-foreground))]"
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-sm">≥95% (Cemerlang)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center bg-[hsl(var(--warning))] shadow-sm"
                    role="img"
                    aria-label="Petunjuk kuning"
                  >
                    <TrendingUp
                      className="h-3.5 w-3.5 text-[hsl(var(--warning-foreground))]"
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-sm">85-95% (Baik)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center bg-[hsl(var(--poor-attendance))] shadow-sm"
                    role="img"
                    aria-label="Petunjuk gelap"
                  >
                    <AlertCircle
                      className="h-3.5 w-3.5 text-[hsl(var(--poor-attendance-foreground))]"
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-sm">&lt;85% (Perlu Perhatian)</span>
                </li>
              </ul>
            </section>

            {/* Holidays */}
            <section aria-labelledby="desktop-holidays-legend">
              <h3
                id="desktop-holidays-legend"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2"
              >
                Cuti
              </h3>
              <ul className="space-y-2" role="list">
                <li className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center bg-[hsl(var(--holiday-public))] shadow-sm"
                    role="img"
                    aria-label="Petunjuk merah"
                  >
                    <Flag className="h-3.5 w-3.5 text-primary-foreground" aria-hidden="true" />
                  </div>
                  <span className="text-sm">Cuti Umum</span>
                </li>
                <li className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center bg-[hsl(var(--holiday-school))] shadow-sm"
                    role="img"
                    aria-label="Petunjuk biru"
                  >
                    <School className="h-3.5 w-3.5 text-primary-foreground" aria-hidden="true" />
                  </div>
                  <span className="text-sm">Cuti Sekolah</span>
                </li>
                <li className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center bg-[hsl(var(--holiday-event))] shadow-sm"
                    role="img"
                    aria-label="Petunjuk ungu"
                  >
                    <PartyPopper
                      className="h-3.5 w-3.5 text-primary-foreground"
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-sm">Acara Sekolah</span>
                </li>
              </ul>
            </section>

            {/* Other */}
            <section aria-labelledby="desktop-other-legend">
              <h3
                id="desktop-other-legend"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2"
              >
                Lain-lain
              </h3>
              <ul className="space-y-2" role="list">
                <li className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded bg-[hsl(var(--muted))] shadow-sm"
                    role="img"
                    aria-label="Petunjuk kelabu"
                  ></div>
                  <span className="text-sm">Hujung Minggu</span>
                </li>
                <li className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border-2 border-[hsl(var(--border))] bg-[hsl(var(--background))]"
                    role="img"
                    aria-label="Petunjuk kotak kosong"
                  ></div>
                  <span className="text-sm">Tiada Data</span>
                </li>
              </ul>
            </section>

            {/* Instructions */}
            <section aria-labelledby="desktop-instructions-legend">
              <h3
                id="desktop-instructions-legend"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2"
              >
                Arahan
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1" role="list">
                <li>• Klik mana-mana tarikh untuk lihat butiran</li>
                <li>• Tunjuk untuk info pantas</li>
                <li>• Guna julat tarikh untuk laporan</li>
              </ul>
            </section>
          </div>
        </nav>
      </CardContent>
    </Card>
  );
}
