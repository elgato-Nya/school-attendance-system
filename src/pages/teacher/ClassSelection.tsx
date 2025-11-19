import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ClassCard, ClassStatusBadge } from '@/components/shared/class';
import { Search, Loader2, Filter, BookOpen } from 'lucide-react';
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
        toast.error('Gagal memuatkan kelas');
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
        <h1 className="text-3xl font-bold tracking-tight">Pilih Kelas</h1>
        <p className="text-muted-foreground mt-2">
          Pilih kelas untuk menandakan kehadiran hari ini ({new Date().toLocaleDateString('ms-MY')})
        </p>
      </div>

      <section aria-label="Cari dan tapis kelas">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <label htmlFor="class-search" className="sr-only">
                  Cari kelas mengikut nama atau tingkatan
                </label>
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                  aria-hidden="true"
                />
                <Input
                  id="class-search"
                  type="search"
                  placeholder="Cari mengikut nama kelas atau tingkatan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  aria-describedby="search-help"
                />
                <span id="search-help" className="sr-only">
                  Mula menaip untuk menapis kelas mengikut nama atau tingkatan
                </span>
              </div>

              <div className="sm:w-48">
                <label htmlFor="grade-filter" className="sr-only">
                  Tapis mengikut tingkatan
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
                    aria-label="Tapis kelas mengikut tingkatan"
                  >
                    <option value="all">Semua Tingkatan</option>
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
              Menunjukkan {filteredClasses.length} daripada {classes.length} kelas
            </div>
          </CardContent>
        </Card>
      </section>

      {isLoading && (
        <div
          className="flex items-center justify-center py-12"
          role="status"
          aria-live="polite"
          aria-label="Memuatkan kelas"
        >
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
          <span className="ml-2 text-muted-foreground">Memuatkan kelas...</span>
        </div>
      )}

      {!isLoading && filteredClasses.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
            <p className="text-lg font-medium mb-2">Tiada kelas dijumpai</p>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              {searchQuery || selectedGrade !== 'all'
                ? 'Cuba laraskan kriteria carian atau penapis anda'
                : 'Tiada kelas tersedia dalam sistem. Sila hubungi pentadbir anda.'}
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
                Kosongkan Penapis
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {!isLoading && filteredClasses.length > 0 && (
        <section aria-label="Kelas yang tersedia">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
            {filteredClasses.map((cls) => {
              const isSubmittedToday = todaySubmissions.has(cls.id);
              const studentCount = cls.students?.length || 0;

              return (
                <article key={cls.id} className="group" role="listitem">
                  <ClassCard
                    name={cls.name}
                    grade={cls.grade}
                    studentCount={studentCount}
                    statusBadge={<ClassStatusBadge submitted={isSubmittedToday} />}
                    primaryAction={{
                      label: isSubmittedToday ? 'Lihat / Sunting' : 'Tandakan Kehadiran',
                      onClick: () => handleClassClick(cls.id),
                      variant: isSubmittedToday ? 'outline' : 'default',
                    }}
                    onClick={() => handleClassClick(cls.id)}
                  />
                </article>
              );
            })}
          </div>
        </section>
      )}

      {!isLoading && classes.length > 0 && (
        <aside aria-label="Statistik penyerahan hari ini">
          <Card className="bg-muted/50">
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
                  <span>
                    <span className="font-medium">{todaySubmissions.size}</span> Diserahkan
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-orange-500" aria-hidden="true" />
                  <span>
                    <span className="font-medium">{classes.length - todaySubmissions.size}</span>{' '}
                    Belum Selesai
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" aria-hidden="true" />
                  <span>
                    <span className="font-medium">{classes.length}</span> Jumlah Kelas
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
