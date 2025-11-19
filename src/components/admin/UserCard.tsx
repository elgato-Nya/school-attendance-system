/**
 * User card component - displays user info with actions
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { User } from '@/types';

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  return (
    <Card className="hover-elevation-lg border-l-4 border-l-accent">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              {user.name}
              {user.isSuperAdmin && (
                <Badge
                  variant="default"
                  className="bg-gradient-to-r from-purple-600 to-purple-700 shadow-elevation-sm"
                >
                  Super Admin
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          {!user.isSuperAdmin && (
            <Badge
              variant={user.role === 'admin' ? 'default' : 'secondary'}
              className="shadow-elevation-sm"
            >
              {user.role === 'admin' ? 'Admin' : 'Guru'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {user.role === 'teacher' && (
            <div className="text-sm bg-muted/50 p-3 rounded-lg">
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
                Kelas Ditugaskan
              </p>
              <p className="font-medium text-foreground">
                {user.assignedClasses.length > 0
                  ? `${user.assignedClasses.length} kelas`
                  : 'Tiada kelas ditugaskan'}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(user)}>
              Sunting
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(user.id)}>
              Padam
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
