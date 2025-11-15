/**
 * Holiday Management Page
 * Refactored with separated components for better maintainability
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
import { HolidayFilters } from '@/components/admin/HolidayFilters';
import { HolidayList } from '@/components/admin/HolidayList';
import { LoadingSpinner } from '@/components/admin/LoadingSpinner';
import { toast, parseError } from '@/utils/toast';
import { Calendar, Plus, Upload, MoreVertical, Filter } from 'lucide-react';

export function HolidayManagement() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [filteredHolidays, setFilteredHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    applyFilters();
  }, [holidays, filterYear, filterType]);

  const loadHolidays = async () => {
    setLoading(true);
    try {
      const data = await getAllHolidays();
      setHolidays(data);
    } catch (error) {
      console.error('Load holidays error:', error);
      toast.error('Failed to load holidays');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...holidays];

    // Filter by year
    if (filterYear !== 'all') {
      filtered = filtered.filter((h) => h.date.startsWith(filterYear));
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((h) => h.type === filterType);
    }

    // Sort by date
    filtered.sort((a, b) => a.date.localeCompare(b.date));

    setFilteredHolidays(filtered);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.date) {
      errors.date = 'Date is required';
    }

    if (!formData.name.trim()) {
      errors.name = 'Holiday name is required';
    }

    if (!formData.type) {
      errors.type = 'Type is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix form errors');
      return;
    }

    const loadingToast = toast.loading(isEditing ? 'Updating holiday...' : 'Creating holiday...');

    try {
      if (isEditing && editingId) {
        await updateHoliday(editingId, formData);
        toast.dismiss(loadingToast);
        toast.success('Holiday updated successfully!');
      } else {
        await createHoliday(formData);
        toast.dismiss(loadingToast);
        toast.success('Holiday created successfully!');
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

    const loadingToast = toast.loading('Deleting holiday...');

    try {
      await deleteHoliday(holidayToDelete);
      toast.dismiss(loadingToast);
      toast.success('Holiday deleted successfully!');
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
    const loadingToast = toast.loading('Importing holidays from JSON...');

    try {
      const response = await fetch('/data/malaysia-holidays-2025.json');
      if (!response.ok) {
        throw new Error('Failed to fetch JSON file');
      }

      const data = await response.json();
      const importedCount = data.holidays.length;

      // Import each holiday
      for (const holiday of data.holidays) {
        try {
          await createHoliday(holiday);
        } catch (error) {
          console.error('Error importing holiday:', holiday.name, error);
        }
      }

      toast.dismiss(loadingToast);
      toast.success(`Successfully imported ${importedCount} holidays!`);
      loadHolidays();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Import JSON error:', error);
      toast.error('Failed to import holidays. Make sure the JSON file exists.');
    }
  };

  const resetForm = () => {
    setFormData({
      date: '',
      name: '',
      type: 'public',
      isRecurring: false,
    });
    setFormErrors({});
    setIsEditing(false);
    setEditingId(null);
  };

  const handleAddNew = () => {
    resetForm();
    setFormOpen(true);
  };

  // Get available years from holidays
  const availableYears = Array.from(new Set(holidays.map((h) => h.date.split('-')[0]))).sort();

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            Holiday Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage school holidays and public holidays
          </p>
        </div>

        {/* Desktop: Action Buttons */}
        <div className="hidden sm:flex gap-2">
          <Button
            variant="outline"
            onClick={handleImportJSON}
            aria-label="Import Malaysia 2025 holidays"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Malaysia 2025
          </Button>
          <Button onClick={handleAddNew} aria-label="Add holiday">
            <Plus className="h-4 w-4 mr-2" />
            Add Holiday
          </Button>
        </div>

        {/* Mobile: Dropdown Menu for Actions */}
        <div className="flex sm:hidden gap-2">
          <Button onClick={handleAddNew} className="flex-1" aria-label="Add holiday">
            <Plus className="h-4 w-4 mr-2" />
            Add Holiday
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="More actions">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleImportJSON}>
                <Upload className="h-4 w-4 mr-2" />
                Import Malaysia 2025
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filters */}
      {/* Mobile: Sheet for Filters */}
      <div className="block md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Filter Holidays ({filteredHolidays.length} of {holidays.length})
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[60vh]">
            <SheetHeader>
              <SheetTitle>Filter Holidays</SheetTitle>
              <SheetDescription>Filter by year and type</SheetDescription>
            </SheetHeader>
            <div className="py-6">
              <HolidayFilters
                filterYear={filterYear}
                filterType={filterType}
                availableYears={availableYears}
                totalHolidays={holidays.length}
                filteredCount={filteredHolidays.length}
                onYearChange={setFilterYear}
                onTypeChange={setFilterType}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Inline Filters */}
      <div className="hidden md:block">
        <HolidayFilters
          filterYear={filterYear}
          filterType={filterType}
          availableYears={availableYears}
          totalHolidays={holidays.length}
          filteredCount={filteredHolidays.length}
          onYearChange={setFilterYear}
          onTypeChange={setFilterType}
        />
      </div>

      {/* Holiday List */}
      <HolidayList
        holidays={filteredHolidays}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={handleAddNew}
      />

      {/* Form Dialog */}
      <HolidayFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleSubmit}
        isEditing={isEditing}
        formErrors={formErrors}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Holiday</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this holiday? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default HolidayManagement;
