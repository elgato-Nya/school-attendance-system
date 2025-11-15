/**
 * User Settings Page - Appearance preferences
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTheme } from '@/components/theme-provider';
import { useColourTheme, type ColourPalette } from '@/hooks/useColourTheme';
import { Palette, Moon, Sun, Monitor, Check, Type, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function Settings() {
  const { theme, setTheme } = useTheme();
  const { palette, setColourPalette } = useColourTheme();
  const [fontSize, setFontSize] = useState(localStorage.getItem('font-size') || 'medium');
  // Force re-render when theme changes to update styling
  const [, setRenderKey] = useState(0);

  useEffect(() => {
    // Force component to re-render when theme changes
    setRenderKey((prev) => prev + 1);
  }, [theme]);

  const handleFontSizeChange = (value: string) => {
    setFontSize(value);
    localStorage.setItem('font-size', value);

    const root = document.documentElement;
    root.classList.remove('text-sm', 'text-base', 'text-lg');

    if (value === 'small') root.classList.add('text-sm');
    else if (value === 'large') root.classList.add('text-lg');

    toast.success('Font size updated');
  };

  const handleColourPaletteChange = (newPalette: ColourPalette) => {
    setColourPalette(newPalette);
    toast.success(`Colour palette changed to ${newPalette}`);
  };

  const colourPalettes: Array<{ name: string; value: ColourPalette; colors: [string, string] }> = [
    { name: 'Default', value: 'default', colors: ['hsl(222.2 47.4% 11.2%)', 'hsl(210 40% 96.1%)'] },
    { name: 'Blue', value: 'blue', colors: ['hsl(221.2 83.2% 53.3%)', 'hsl(210 40% 96.1%)'] },
    { name: 'Green', value: 'green', colors: ['hsl(142.1 76.2% 36.3%)', 'hsl(138.5 76.5% 96.7%)'] },
    { name: 'Purple', value: 'purple', colors: ['hsl(262.1 83.3% 57.8%)', 'hsl(270 100% 98%)'] },
    { name: 'Orange', value: 'orange', colors: ['hsl(24.6 95% 53.1%)', 'hsl(33.3 100% 96.5%)'] },
    { name: 'Red', value: 'red', colors: ['hsl(0 72.2% 50.6%)', 'hsl(0 85.7% 97.3%)'] },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Palette className="h-8 w-8" aria-hidden="true" />
            Appearance Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Customize the look and feel of your interface
          </p>
        </div>

        <div className="space-y-6">
          {/* Theme Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Theme Mode</CardTitle>
              <CardDescription>
                Select your preferred color theme for the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={theme}
                onValueChange={(value) =>
                  setTheme(
                    value as
                      | 'light'
                      | 'dark'
                      | 'system'
                      | 'high-contrast-light'
                      | 'high-contrast-dark'
                  )
                }
                role="radiogroup"
                aria-label="Theme selection"
              >
                <div className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent hover:border-accent-foreground/20 cursor-pointer transition-all">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Sun className="h-5 w-5" aria-hidden="true" />
                    <div>
                      <div className="font-medium">Light</div>
                      <div className="text-sm text-muted-foreground">Bright and clear</div>
                    </div>
                  </Label>
                  {theme === 'light' && (
                    <Check className="h-5 w-5 text-primary" aria-label="Currently selected" />
                  )}
                </div>

                <div className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent hover:border-accent-foreground/20 cursor-pointer transition-all">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Moon className="h-5 w-5" aria-hidden="true" />
                    <div>
                      <div className="font-medium">Dark</div>
                      <div className="text-sm text-muted-foreground">Easy on the eyes</div>
                    </div>
                  </Label>
                  {theme === 'dark' && (
                    <Check className="h-5 w-5 text-primary" aria-label="Currently selected" />
                  )}
                </div>

                <div className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent hover:border-accent-foreground/20 cursor-pointer transition-all">
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Monitor className="h-5 w-5" aria-hidden="true" />
                    <div>
                      <div className="font-medium">System</div>
                      <div className="text-sm text-muted-foreground">Matches your device</div>
                    </div>
                  </Label>
                  {theme === 'system' && (
                    <Check className="h-5 w-5 text-primary" aria-label="Currently selected" />
                  )}
                </div>

                <div className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent hover:border-accent-foreground/20 cursor-pointer transition-all">
                  <RadioGroupItem value="high-contrast-light" id="high-contrast-light" />
                  <Label
                    htmlFor="high-contrast-light"
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <Sun className="h-5 w-5" aria-hidden="true" />
                    <div>
                      <div className="font-medium">High Contrast Light</div>
                      <div className="text-sm text-muted-foreground">Maximum readability</div>
                    </div>
                  </Label>
                  {theme === 'high-contrast-light' && (
                    <Check className="h-5 w-5 text-primary" aria-label="Currently selected" />
                  )}
                </div>

                <div className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent hover:border-accent-foreground/20 cursor-pointer transition-all">
                  <RadioGroupItem value="high-contrast-dark" id="high-contrast-dark" />
                  <Label
                    htmlFor="high-contrast-dark"
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <Moon className="h-5 w-5" aria-hidden="true" />
                    <div>
                      <div className="font-medium">High Contrast Dark</div>
                      <div className="text-sm text-muted-foreground">
                        Maximum contrast, dark mode
                      </div>
                    </div>
                  </Label>
                  {theme === 'high-contrast-dark' && (
                    <Check className="h-5 w-5 text-primary" aria-label="Currently selected" />
                  )}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Color Palette Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
                Color Palette
              </CardTitle>
              <CardDescription>
                Choose your preferred color scheme for the interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="grid grid-cols-2 md:grid-cols-3 gap-4"
                role="radiogroup"
                aria-label="Color palette selection"
              >
                {colourPalettes.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => handleColourPaletteChange(item.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover:shadow-md hover:scale-105 ${
                      palette === item.value
                        ? 'border-primary bg-accent shadow-sm'
                        : 'border-border hover:border-primary/50'
                    }`}
                    role="radio"
                    aria-checked={palette === item.value}
                    aria-label={`${item.name} color palette`}
                  >
                    <div className="flex gap-2" aria-hidden="true">
                      <div
                        className="h-10 w-10 rounded-full border-2 border-border shadow-sm transition-transform hover:scale-110"
                        style={{ backgroundColor: item.colors[0] }}
                      />
                      <div
                        className="h-10 w-10 rounded-full border-2 border-border shadow-sm transition-transform hover:scale-110"
                        style={{ backgroundColor: item.colors[1] }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.name}</span>
                      {palette === item.value && (
                        <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Font Size */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" aria-hidden="true" />
                Font Size
              </CardTitle>
              <CardDescription>Adjust the text size for better readability</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={fontSize}
                onValueChange={handleFontSizeChange}
                role="radiogroup"
                aria-label="Font size selection"
              >
                <div className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent hover:border-accent-foreground/20 cursor-pointer transition-all">
                  <RadioGroupItem value="small" id="small" />
                  <Label htmlFor="small" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Type className="h-4 w-4" aria-hidden="true" />
                    <div>
                      <div className="font-medium text-sm">Small</div>
                      <div className="text-xs text-muted-foreground">Compact view</div>
                    </div>
                  </Label>
                  {fontSize === 'small' && (
                    <Check className="h-5 w-5 text-primary" aria-label="Currently selected" />
                  )}
                </div>

                <div className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent hover:border-accent-foreground/20 cursor-pointer transition-all">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Type className="h-5 w-5" aria-hidden="true" />
                    <div>
                      <div className="font-medium">Medium</div>
                      <div className="text-sm text-muted-foreground">Default size</div>
                    </div>
                  </Label>
                  {fontSize === 'medium' && (
                    <Check className="h-5 w-5 text-primary" aria-label="Currently selected" />
                  )}
                </div>

                <div className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent hover:border-accent-foreground/20 cursor-pointer transition-all">
                  <RadioGroupItem value="large" id="large" />
                  <Label htmlFor="large" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Type className="h-6 w-6" aria-hidden="true" />
                    <div>
                      <div className="font-medium text-lg">Large</div>
                      <div className="text-sm text-muted-foreground">Easier to read</div>
                    </div>
                  </Label>
                  {fontSize === 'large' && (
                    <Check className="h-5 w-5 text-primary" aria-label="Currently selected" />
                  )}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
