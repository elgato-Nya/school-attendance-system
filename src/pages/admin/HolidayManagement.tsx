/**
 * Enhanced Holiday Management Page with Table View and Search
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  getAllHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} from '@/services/holiday.service';
import type { Holiday, HolidayFormData } from '@/types';
import { HolidayFormDialog } from '@/components/admin/HolidayFormDialog';
import { LoadingSpinner } from '@/components/admin/LoadingSpinner';
import { toast, parseError } from '@/utils/toast';
import { Plus, Search, Edit, Trash2, MoreVertical, Upload, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';

export function HolidayManagement() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYear, setFilterYear] = useState<string>('2025');
  const [filterType, setFilterType] = useState<string>('all');

  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<HolidayFormData>({
    date: '',
    name: '',
    type: 'public',
    isRecurring: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadHolidays();
  }, []);

  const loadHolidays = async () => {
    setLoading(true);
    try {
      const data = await getAllHolidays();
      setHolidays(data);
    } catch (error) {
      console.error('Load holidays error:', error);
      toast.error('Gagal memuatkan cuti');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.date) {
      errors.date = 'Tarikh diperlukan';
    }

    if (!formData.name.trim()) {
      errors.name = 'Nama cuti diperlukan';
    }

    if (!formData.type) {
      errors.type = 'Jenis diperlukan';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Sila betulkan ralat borang');
      return;
    }

    const loadingToast = toast.loading(isEditing ? 'Mengemaskini cuti...' : 'Mencipta cuti...');

    try {
      if (isEditing && editingId) {
        await updateHoliday(editingId, formData);
        toast.dismiss(loadingToast);
        toast.success('Cuti berjaya dikemaskini!');
      } else {
        await createHoliday(formData);
        toast.dismiss(loadingToast);
        toast.success('Cuti berjaya dicipta!');
      }

      setFormOpen(false);
      resetForm();
      loadHolidays();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Submit holiday error:', error);
      toast.error(parseError(error));
    }
  };

  const handleEdit = (holiday: Holiday) => {
    setIsEditing(true);
    setEditingId(holiday.id!);
    setFormData({
      date: holiday.date,
      name: holiday.name,
      type: holiday.type,
      isRecurring: holiday.isRecurring,
    });
    setFormOpen(true);
  };

  const handleDelete = (holidayId: string) => {
    setHolidayToDelete(holidayId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!holidayToDelete) return;

    const loadingToast = toast.loading('Memadam cuti...');

    try {
      await deleteHoliday(holidayToDelete);
      toast.dismiss(loadingToast);
      toast.success('Cuti berjaya dipadam!');
      setDeleteDialogOpen(false);
      setHolidayToDelete(null);
      loadHolidays();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Delete holiday error:', error);
      toast.error(parseError(error));
    }
  };

  const handleImportJSON = async () => {
    const loadingToast = toast.loading('Mengimport cuti dari JSON...');

    try {
      const response = await fetch('/data/malaysia-holidays-2025.json');
      if (!response.ok) {
        throw new Error('Failed to fetch JSON file');
      }

      const data = await response.json();

      for (const holiday of data.holidays) {
        try {
          await createHoliday({
            date: holiday.date,
            name: holiday.name,
            type: holiday.type || 'public',
            isRecurring: holiday.isRecurring || false,
          });
        } catch (error) {
          console.error(`Failed to import ${holiday.name}:`, error);
        }
      }

      toast.dismiss(loadingToast);
      toast.success('Cuti berjaya diimport!');
      loadHolidays();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Import holidays error:', error);
      toast.error('Gagal mengimport cuti');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      date: '',
      name: '',
      type: 'public',
      isRecurring: false,
    });
    setFormErrors({});
  };

  // Get available years from holidays
  const availableYears = Array.from(new Set(holidays.map((h) => h.date.substring(0, 4)))).sort(
    (a, b) => b.localeCompare(a)
  );

  if (availableYears.length > 0 && !availableYears.includes(filterYear)) {
    availableYears.unshift(filterYear);
  }

  // Filter holidays
  const filteredHolidays = holidays
    .filter((holiday) => {
      const matchesYear = filterYear === 'all' || holiday.date.startsWith(filterYear);
      const matchesType = filterType === 'all' || holiday.type === filterType;
      const matchesSearch =
        holiday.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        holiday.date.includes(searchQuery);
      return matchesYear && matchesType && matchesSearch;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'public':
        return 'default';
      case 'school':
        return 'secondary';
      case 'event':
        return 'outline';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <LoadingSpinner message="Memuatkan cuti..." />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Pengurusan Cuti</h1>
          <p className="text-sm text-muted-foreground">Urus cuti sekolah dan cuti umum</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                <MoreVertical className="h-4 w-4 mr-2" />
                Lagi
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleImportJSON}>
                <Upload className="h-4 w-4 mr-2" />
                Import dari JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={() => {
              resetForm();
              setFormOpen(true);
            }}
            className="flex-1 sm:flex-initial"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Cuti
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari cuti..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Cari cuti"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tahun</SelectItem>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Jenis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Jenis</SelectItem>
              <SelectItem value="public">Umum</SelectItem>
              <SelectItem value="school">Sekolah</SelectItem>
              <SelectItem value="event">Acara</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Holidays Table */}
      {filteredHolidays.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-lg bg-muted/20">
          <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Tiada cuti dijumpai</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            {searchQuery || filterYear !== 'all' || filterType !== 'all'
              ? 'Cuba laraskan carian atau penapis anda'
              : 'Mulakan dengan menambah cuti pertama anda'}
          </p>
          {!searchQuery && filterYear === 'all' && filterType === 'all' && (
            <Button
              onClick={() => {
                resetForm();
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Cuti Pertama
            </Button>
          )}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Tarikh</TableHead>
                  <TableHead>Nama Cuti</TableHead>
                  <TableHead className="hidden sm:table-cell w-[120px]">Jenis</TableHead>
                  <TableHead className="hidden md:table-cell text-center w-[100px]">
                    Berulang
                  </TableHead>
                  <TableHead className="text-right w-[100px]">Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHolidays.map((holiday) => (
                  <TableRow key={holiday.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-sm">{format(new Date(holiday.date), 'dd MMM')}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(holiday.date), 'yyyy')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{holiday.name}</p>
                        <div className="sm:hidden mt-1">
                          <Badge variant={getTypeColor(holiday.type)} className="text-xs">
                            {holiday.type}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={getTypeColor(holiday.type)}>{holiday.type}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-center">
                      {holiday.isRecurring ? (
                        <Badge variant="outline" className="text-xs">
                          Ya
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Tidak</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(holiday)}
                          aria-label={`Sunting ${holiday.name}`}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Sunting</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(holiday.id!)}
                          className="text-destructive hover:text-destructive"
                          aria-label={`Padam ${holiday.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Padam</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Summary */}
      {filteredHolidays.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Menunjukkan {filteredHolidays.length} daripada {holidays.length}{' '}
          {filteredHolidays.length === 1 ? 'cuti' : 'cuti'}
        </div>
      )}

      {/* Holiday Form Dialog */}
      <HolidayFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        formData={formData}
        formErrors={formErrors}
        isEditing={isEditing}
        onSubmit={handleSubmit}
        onChange={setFormData}
        onReset={resetForm}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Padam Cuti</AlertDialogTitle>
            <AlertDialogDescription>
              Adakah anda pasti mahu memadam cuti ini? Tindakan ini tidak boleh dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setHolidayToDelete(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Padam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
