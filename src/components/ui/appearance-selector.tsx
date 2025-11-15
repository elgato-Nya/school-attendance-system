/**
 * Unified Appearance Selector Component
 * DRY approach for theme and font size selection
 */

import { type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Option<T> {
  value: T;
  label: string;
  description: string;
  icon?: React.ReactNode;
  meta?: string; // For displaying additional info (e.g., "16px" for font size)
}

interface AppearanceSelectorProps<T extends string> {
  /** Current selected value */
  value: T;
  /** Options to display */
  options: Option<T>[];
  /** Callback when value changes */
  onChange: (value: T) => void;
  /** Icon to display on the trigger button */
  triggerIcon: LucideIcon;
  /** Label for the dropdown */
  label: string;
  /** Title for the trigger button */
  title?: string;
  /** Width of the dropdown content */
  width?: 'sm' | 'md' | 'lg';
  /** Optional footer action */
  footerAction?: {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
  };
  /** Show icons in dropdown items */
  showIcons?: boolean;
  /** Highlight style variant */
  highlightVariant?: 'accent' | 'primary';
}

const widthClasses = {
  sm: 'w-56',
  md: 'w-64',
  lg: 'w-72',
};

export function AppearanceSelector<T extends string>({
  value,
  options,
  onChange,
  triggerIcon: TriggerIcon,
  label,
  title,
  width = 'md',
  footerAction,
  showIcons = false,
  highlightVariant = 'accent',
}: AppearanceSelectorProps<T>) {
  const currentOption = options.find((opt) => opt.value === value);
  const checkColor = highlightVariant === 'accent' ? 'text-accent' : 'text-primary';
  const highlightBg = highlightVariant === 'accent' ? 'bg-accent/10' : 'bg-primary/10';
  const highlightBorder = highlightVariant === 'accent' ? 'border-l-accent' : 'border-l-primary';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 cursor-pointer hover:bg-accent hover:text-accent-foreground"
          title={title || `Current ${label.toLowerCase()}: ${currentOption?.label}`}
        >
          {currentOption?.icon || <TriggerIcon className="h-4 w-4" />}
          <span className="sr-only">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={widthClasses[width]}>
        <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex items-start gap-3 cursor-pointer py-2.5 px-3 rounded-md',
              value === option.value && `${highlightBg} border-l-2 ${highlightBorder}`
            )}
          >
            {showIcons && option.icon && (
              <div
                className={cn(
                  'mt-0.5 flex-shrink-0',
                  value === option.value ? checkColor : 'text-muted-foreground'
                )}
              >
                {option.icon}
              </div>
            )}
            <div className="flex-1 space-y-0.5 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    'text-sm font-medium',
                    value === option.value && showIcons && checkColor
                  )}
                >
                  {option.label}
                </span>
                {option.meta && (
                  <span className="text-xs text-muted-foreground font-mono flex-shrink-0">
                    {option.meta}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">{option.description}</div>
            </div>
          </DropdownMenuItem>
        ))}
        {footerAction && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={footerAction.onClick}
              className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <footerAction.icon className="h-3.5 w-3.5" />
              <span className="text-sm">{footerAction.label}</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
