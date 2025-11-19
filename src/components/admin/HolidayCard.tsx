/**
 * Holiday Card Component with enhanced accessibility and mobile responsiveness
 */

import { Calendar, Trash2, Edit, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Holiday } from '@/types';
import { format } from 'date-fns';
import { HOLIDAY_CARD_COLORS } from '@/constants/calendar';

interface HolidayCardProps {
  holiday: Holiday;
  onEdit: (holiday: Holiday) => void;
  onDelete: (holidayId: string) => void;
}

export function HolidayCard({ holiday, onEdit, onDelete }: HolidayCardProps) {
  // Use centralized color configuration
  const config = HOLIDAY_CARD_COLORS[holiday.type];

  return (
    <Card
      className="hover:shadow-md transition-shadow border-l-4"
      style={{ borderLeftColor: config.leftBorder }}
      role="article"
      aria-label={`Cuti: ${holiday.name} pada ${format(new Date(holiday.date), 'EEEE, dd MMMM yyyy')}`}
    >
      <CardContent className="p-3 md:p-4">
        <div className="flex items-start justify-between gap-2 md:gap-4">
          <div className="flex-1 min-w-0">
            {/* Date */}
            <div className="flex items-center gap-2 mb-2">
              <Calendar
                className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0"
                aria-hidden="true"
              />
              <time className="font-semibold text-sm md:text-lg" dateTime={holiday.date}>
                {format(new Date(holiday.date), 'EEE, dd MMM yyyy')}
              </time>
            </div>

            {/* Holiday Name */}
            <h3 className="font-bold text-base md:text-xl mb-2 break-words">{holiday.name}</h3>

            {/* Badges */}
            <div
              className="flex items-center gap-2 flex-wrap"
              role="group"
              aria-label="Atribut cuti"
            >
              <Badge
                variant={config.badge}
                aria-label={`Jenis cuti: ${config.label}`}
                className="text-xs"
              >
                {config.label}
              </Badge>
              {holiday.isRecurring && (
                <Badge
                  variant="outline"
                  className="text-xs"
                  aria-label="Cuti ini berulang setiap tahun"
                >
                  Berulang
                </Badge>
              )}
            </div>
          </div>

          {/* Action Buttons - Desktop */}
          <div
            className="hidden sm:flex gap-1 flex-shrink-0"
            role="group"
            aria-label="Tindakan cuti"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(holiday)}
              aria-label={`Sunting ${holiday.name}`}
              title={`Sunting ${holiday.name}`}
            >
              <Edit className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(holiday.id!)}
              aria-label={`Padam ${holiday.name}`}
              title={`Padam ${holiday.name}`}
            >
              <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
            </Button>
          </div>

          {/* Action Menu - Mobile */}
          <div className="flex sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label={`Tindakan untuk ${holiday.name}`}
                >
                  <MoreVertical className="h-4 w-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(holiday)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Sunting
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(holiday.id!)} variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Padam
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
