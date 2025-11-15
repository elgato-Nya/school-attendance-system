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
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Upload,
  CalendarDays,
} from 'lucide-react';
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
      toast.error('Failed to load holidays');
    } finally {
      setLoading(false);
    }
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
      toast.success('Holidays imported successfully!');
      loadHolidays();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Import holidays error:', error);
      toast.error('Failed to import holidays');
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
    return <LoadingSpinner message="Loading holidays..." />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Holiday Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage school holidays and public holidays
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                <MoreVertical className="h-4 w-4 mr-2" />
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleImportJSON}>
                <Upload className="h-4 w-4 mr-2" />
                Import from JSON
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
            Add Holiday
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search holidays..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search holidays"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="school">School</SelectItem>
              <SelectItem value="event">Event</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Holidays Table */}
      {filteredHolidays.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-lg bg-muted/20">
          <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No holidays found</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            {searchQuery || filterYear !== 'all' || filterType !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first holiday'}
          </p>
          {!searchQuery && filterYear === 'all' && filterType === 'all' && (
            <Button
              onClick={() => {
                resetForm();
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Holiday
            </Button>
          )}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead>Holiday Name</TableHead>
                  <TableHead className="hidden sm:table-cell w-[120px]">Type</TableHead>
                  <TableHead className="hidden md:table-cell text-center w-[100px]">
                    Recurring
                  </TableHead>
                  <TableHead className="text-right w-[100px]">Actions</TableHead>
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
                          Yes
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(holiday)}
                          aria-label={`Edit ${holiday.name}`}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(holiday.id!)}
                          className="text-destructive hover:text-destructive"
                          aria-label={`Delete ${holiday.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
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
          Showing {filteredHolidays.length} of {holidays.length}{' '}
          {filteredHolidays.length === 1 ? 'holiday' : 'holidays'}
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
            <AlertDialogTitle>Delete Holiday</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this holiday? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setHolidayToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
