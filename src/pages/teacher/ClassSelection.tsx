import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Users,
  Calendar,
  ChevronRight,
  Loader2,
  Filter,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import { getAllClasses } from '@/services/class/class.service';
import { getAttendanceByClassAndDate } from '@/services/attendance.service';
import type { Class } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ClassSelection() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [todaySubmissions, setTodaySubmissions] = useState<Set<string>>(new Set());

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const loadClasses = async () => {
      try {
        setIsLoading(true);
        const allClasses = await getAllClasses();
        setClasses(allClasses);
        setFilteredClasses(allClasses);

        const submittedToday = new Set<string>();
        await Promise.all(
          allClasses.map(async (cls) => {
            try {
              const attendance = await getAttendanceByClassAndDate(cls.id, today);
              if (attendance) {
                submittedToday.add(cls.id);
              }
            } catch {
              // Ignore
            }
          })
        );
        setTodaySubmissions(submittedToday);
      } catch (error) {
        console.error('Error loading classes:', error);
        toast.error('Failed to load classes');
      } finally {
        setIsLoading(false);
      }
    };

    loadClasses();
  }, [today]);

  useEffect(() => {
    let filtered = classes;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (cls) =>
          cls.name.toLowerCase().includes(query) || String(cls.grade).toLowerCase().includes(query)
      );
    }

    if (selectedGrade !== 'all') {
      filtered = filtered.filter((cls) => String(cls.grade) === selectedGrade);
    }

    setFilteredClasses(filtered);
  }, [searchQuery, selectedGrade, classes]);

  const uniqueGrades = Array.from(new Set(classes.map((cls) => cls.grade))).sort();

  const handleClassClick = (classId: string) => {
    navigate(`/teacher/mark-attendance/${classId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Select Class</h1>
        <p className="text-muted-foreground mt-2">
          Choose a class to mark attendance for today ({new Date().toLocaleDateString('en-MY')})
        </p>
      </div>

      <section aria-label="Search and filter classes">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <label htmlFor="class-search" className="sr-only">
                  Search classes by name or grade
                </label>
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                  aria-hidden="true"
                />
                <Input
                  id="class-search"
                  type="search"
                  placeholder="Search by class name or grade..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  aria-describedby="search-help"
                />
                <span id="search-help" className="sr-only">
                  Start typing to filter classes by name or grade level
                </span>
              </div>

              <div className="sm:w-48">
                <label htmlFor="grade-filter" className="sr-only">
                  Filter by grade level
                </label>
                <div className="relative">
                  <Filter
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                    aria-hidden="true"
                  />
                  <select
                    id="grade-filter"
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full h-10 pl-9 pr-4 rounded-md border border-input bg-background text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    aria-label="Filter classes by grade"
                  >
                    <option value="all">All Grades</option>
                    {uniqueGrades.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-muted-foreground" role="status" aria-live="polite">
              Showing {filteredClasses.length} of {classes.length} classes
            </div>
          </CardContent>
        </Card>
      </section>

      {isLoading && (
        <div
          className="flex items-center justify-center py-12"
          role="status"
          aria-live="polite"
          aria-label="Loading classes"
        >
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
          <span className="ml-2 text-muted-foreground">Loading classes...</span>
        </div>
      )}

      {!isLoading && filteredClasses.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
            <p className="text-lg font-medium mb-2">No classes found</p>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              {searchQuery || selectedGrade !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No classes available in the system. Please contact your administrator.'}
            </p>
            {(searchQuery || selectedGrade !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGrade('all');
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {!isLoading && filteredClasses.length > 0 && (
        <section aria-label="Available classes">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
            {filteredClasses.map((cls) => {
              const isSubmittedToday = todaySubmissions.has(cls.id);
              const studentCount = cls.students?.length || 0;

              return (
                <article key={cls.id} className="group" role="listitem">
                  <Card
                    className="h-full transition-all hover:shadow-md hover:border-primary cursor-pointer"
                    onClick={() => handleClassClick(cls.id)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Open attendance for ${cls.name}, ${cls.grade}. ${studentCount} students. ${isSubmittedToday ? 'Attendance already submitted today' : 'Not yet submitted today'}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleClassClick(cls.id);
                      }
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">
                            {cls.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1.5 mt-1">
                            <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{cls.grade}</span>
                          </CardDescription>
                        </div>
                        {isSubmittedToday && (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            aria-label="Submitted"
                          >
                            �?Submitted
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" aria-hidden="true" />
                        <span>
                          <span className="font-medium text-foreground">{studentCount}</span>{' '}
                          students
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" aria-hidden="true" />
                        <span>
                          <time dateTime={today}>
                            {new Date().toLocaleDateString('en-MY', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            })}
                          </time>
                        </span>
                      </div>

                      <Button
                        variant={isSubmittedToday ? 'outline' : 'default'}
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        aria-label={
                          isSubmittedToday
                            ? `View or edit attendance for ${cls.name}`
                            : `Mark attendance for ${cls.name}`
                        }
                      >
                        {isSubmittedToday ? 'View / Edit' : 'Mark Attendance'}
                        <ChevronRight className="ml-2 h-4 w-4" aria-hidden="true" />
                      </Button>
                    </CardContent>
                  </Card>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {!isLoading && classes.length > 0 && (
        <aside aria-label="Today's submission statistics">
          <Card className="bg-muted/50">
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
                  <span>
                    <span className="font-medium">{todaySubmissions.size}</span> Submitted
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-orange-500" aria-hidden="true" />
                  <span>
                    <span className="font-medium">{classes.length - todaySubmissions.size}</span>{' '}
                    Pending
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" aria-hidden="true" />
                  <span>
                    <span className="font-medium">{classes.length}</span> Total Classes
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      )}
    </div>
  );
}
