/**
 * Class card component - displays class info with actions
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Class, User } from '@/types';

interface ClassCardProps {
  classItem: Class;
  teachers: User[];
  onViewStudents: (classItem: Class) => void;
  onDelete: (classId: string) => void;
}

export function ClassCard({ classItem, teachers, onViewStudents, onDelete }: ClassCardProps) {
  return (
    <Card className="hover-elevation-lg border-l-4 border-l-accent">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{classItem.name}</CardTitle>
            <p className="text-sm text-muted-foreground">Tingkatan {classItem.grade}</p>
          </div>
          <Badge className="bg-accent text-accent-foreground shadow-elevation-sm">
            {classItem.students.length} murid
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm bg-muted/50 p-3 rounded-lg">
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Guru</p>
            <p className="font-medium text-foreground">
              {teachers.find((t) => t.id === classItem.teacherRep)?.name || 'T/A'}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onViewStudents(classItem)}
            >
              Lihat Murid
            </Button>

            <Button variant="destructive" size="sm" onClick={() => onDelete(classItem.id)}>
              Padam
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
