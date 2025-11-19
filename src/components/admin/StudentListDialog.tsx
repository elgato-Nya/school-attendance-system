/**
 * Enhanced Student List Dialog with Mobile Support
 * Read-only view with link to Student Management for editing
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import type { Class } from '@/types';
import { Search, Users, Phone, User, Settings } from 'lucide-react';

interface StudentListDialogProps {
  classItem: Class | null;
}

export function StudentListDialog({ classItem }: StudentListDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!classItem) return null;

  // Filter students based on search
  const filteredStudents = classItem.students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.guardianName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DialogContent className="w-[calc(100%-2rem)] max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0">
      {/* Header */}
      <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-xl sm:text-2xl truncate">
              Murid dalam {classItem.name}
            </DialogTitle>
            <DialogDescription className="mt-1">
              <Badge variant="secondary" className="text-xs">
                Tingkatan {classItem.grade} • {classItem.students.length}{' '}
                {classItem.students.length === 1 ? 'murid' : 'murid'}
              </Badge>
            </DialogDescription>
          </div>
          <Button asChild size="sm" className="w-full sm:w-auto">
            <Link to="/admin/students" aria-label="Urus semua murid">
              <Settings className="h-4 w-4 mr-2" aria-hidden="true" />
              Urus Murid
            </Link>
          </Button>
        </div>
      </DialogHeader>

      {/* Search Bar */}
      <div className="px-4 sm:px-6 py-3 border-b bg-muted/20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari murid atau penjaga..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Cari murid"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        {filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
            <h3 className="text-lg font-medium mb-2">
              {searchQuery ? 'Tiada murid dijumpai' : 'Belum ada murid'}
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              {searchQuery
                ? 'Cuba laraskan carian anda'
                : 'Mulakan dengan menambah murid dalam Pengurusan Murid'}
            </p>
            {!searchQuery && (
              <Button asChild size="sm">
                <Link
                  to="/admin/students"
                  aria-label="Pergi ke Pengurusan Murid untuk tambah murid"
                >
                  <Settings className="h-4 w-4 mr-2" aria-hidden="true" />
                  Pergi ke Pengurusan Murid
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Nama Murid</TableHead>
                    <TableHead>Nombor IC</TableHead>
                    <TableHead>Penjaga</TableHead>
                    <TableHead>Hubungan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student, index) => (
                    <TableRow key={student.icNumber}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="font-mono text-sm">{student.icNumber}</TableCell>
                      <TableCell>{student.guardianName}</TableCell>
                      <TableCell>{student.guardianContact}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3">
              {filteredStudents.map((student, index) => (
                <div key={student.icNumber} className="border rounded-lg p-4 space-y-2 bg-card">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <h4 className="font-medium truncate">{student.name}</h4>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{student.icNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">{student.guardianName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span>{student.guardianContact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer with Summary */}
      {filteredStudents.length > 0 && (
        <div className="px-4 sm:px-6 py-3 border-t bg-muted/20">
          <p className="text-sm text-muted-foreground">
            Memapar {filteredStudents.length} daripada {classItem.students.length}{' '}
            {filteredStudents.length === 1 ? 'murid' : 'murid'}
          </p>
        </div>
      )}
    </DialogContent>
  );
}
