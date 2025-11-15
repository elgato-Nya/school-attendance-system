/**
 * Accent Color Test Component
 * Verifies that bg-accent and other accent utilities are working
 */

export function AccentColorTest() {
  return (
    <div className="p-8 space-y-6 bg-background">
      <h2 className="text-2xl font-bold">Accent Color Test</h2>

      {/* Background Test */}
      <div className="space-y-2">
        <h3 className="font-semibold">bg-accent (should be vibrant teal)</h3>
        <div className="bg-accent text-accent-foreground p-4 rounded-lg">
          This has bg-accent background with text-accent-foreground text
        </div>
      </div>

      {/* Text Test */}
      <div className="space-y-2">
        <h3 className="font-semibold">text-accent (should be teal text)</h3>
        <p className="text-accent text-xl font-bold">
          This text should be vibrant teal using text-accent
        </p>
      </div>

      {/* Border Test */}
      <div className="space-y-2">
        <h3 className="font-semibold">border-accent (should have teal border)</h3>
        <div className="border-4 border-accent p-4 rounded-lg">
          This box has a thick teal border using border-accent
        </div>
      </div>

      {/* Hover Test */}
      <div className="space-y-2">
        <h3 className="font-semibold">hover:bg-accent (hover to see teal)</h3>
        <div className="bg-secondary hover:bg-accent hover:text-accent-foreground p-4 rounded-lg transition-all cursor-pointer">
          Hover over this to see it turn teal
        </div>
      </div>

      {/* All Variants */}
      <div className="space-y-2">
        <h3 className="font-semibold">All Color Variants Available</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary text-primary-foreground p-3 rounded text-center">Primary</div>
          <div className="bg-accent text-accent-foreground p-3 rounded text-center">
            Accent (Teal)
          </div>
          <div className="bg-success text-success-foreground p-3 rounded text-center">Success</div>
          <div className="bg-warning text-warning-foreground p-3 rounded text-center">Warning</div>
          <div className="bg-info text-info-foreground p-3 rounded text-center">Info</div>
          <div className="bg-destructive text-destructive-foreground p-3 rounded text-center">
            Destructive
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-success/10 border-2 border-success text-success p-4 rounded-lg">
        ✅ If you can see vibrant teal colors above, the accent utilities are working correctly!
      </div>
    </div>
  );
}
