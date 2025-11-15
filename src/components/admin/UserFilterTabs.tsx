/**
 * User filter tabs - filter users by role
 */

interface UserFilterTabsProps {
  activeFilter: 'all' | 'admin' | 'teacher';
  onFilterChange: (filter: 'all' | 'admin' | 'teacher') => void;
  counts: {
    all: number;
    admin: number;
    teacher: number;
  };
}

export function UserFilterTabs({ activeFilter, onFilterChange, counts }: UserFilterTabsProps) {
  const tabs = [
    { id: 'all' as const, label: 'All Users', count: counts.all },
    { id: 'admin' as const, label: 'Admins', count: counts.admin },
    { id: 'teacher' as const, label: 'Teachers', count: counts.teacher },
  ];

  return (
    <div className="flex gap-2 border-b">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onFilterChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeFilter === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          {tab.label} ({tab.count})
        </button>
      ))}
    </div>
  );
}
