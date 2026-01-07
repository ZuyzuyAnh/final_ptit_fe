import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useApi } from "@/hooks/use-api";
import {
  systemUserApi,
  roleApi,
  organizerApi,
  type Organizer,
} from "@/lib/rbacApi";
import type { Role, SystemUser } from "@/types/rbac";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SystemUserRolesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userName?: string;
  onSaved?: () => void;
}

export const SystemUserRolesDialog = ({
  open,
  onOpenChange,
  userId,
  userName,
  onSaved,
}: SystemUserRolesDialogProps) => {
  const { safeRequest } = useApi();
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<Set<string>>(new Set());
  const [originalRoles, setOriginalRoles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [userOrganizerId, setUserOrganizerId] = useState<string | undefined>(
    undefined
  );

  // Organizer selection for organizer-scoped roles
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [selectedOrganizerId, setSelectedOrganizerId] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    if (open && userId) {
      loadData();
      loadOrganizers();
    }
  }, [open, userId]);

  const loadData = async () => {
    setLoading(true);
    await safeRequest(async () => {
      if (userId) {
        // Load user details to get organizer_id
        const user = await systemUserApi.getById(userId);
        setUserOrganizerId(user.organizer_id);
        setSelectedOrganizerId(user.organizer_id); // Default to user's organizer

        // Load all roles with has_role field for this user
        const rolesResponse = await roleApi.list({
          limit: 1000,
          user_id: userId,
        });
        setAllRoles(rolesResponse.items || []);

        // Extract roles that user already has
        const roleIds = new Set(
          rolesResponse.items?.filter((r) => r.has_role).map((r) => r._id) || []
        );
        setUserRoles(roleIds);
        setOriginalRoles(roleIds);
      }
    });
    setLoading(false);
  };

  const loadOrganizers = async () => {
    await safeRequest(async () => {
      const response = await organizerApi.list({
        page: 1,
        limit: 100,
      });
      setOrganizers(response.organizers || []);
    });
  };

  const toggleRole = (roleId: string) => {
    setUserRoles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(roleId)) {
        newSet.delete(roleId);
      } else {
        newSet.add(roleId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (!userId) return;

    // Check if user is assigning organizer-scoped roles without selecting an organizer
    const addedRoles = Array.from(userRoles).filter(
      (id) => !originalRoles.has(id)
    );
    const hasOrganizerScopedRoles = addedRoles.some((roleId) => {
      const role = allRoles.find((r) => r._id === roleId);
      return role?.scope === "ORGANIZER";
    });

    if (hasOrganizerScopedRoles && !selectedOrganizerId) {
      toast.error("Vui lòng chọn tổ chức cho vai trò phạm vi ORGANIZER");
      return;
    }

    await safeRequest(async () => {
      const toAdd = Array.from(userRoles).filter(
        (id) => !originalRoles.has(id)
      ) as string[];
      const toRemove = Array.from(originalRoles).filter(
        (id) => !userRoles.has(id)
      ) as string[];

      if (toAdd.length > 0) {
        await systemUserApi.assignRoles(userId, toAdd, selectedOrganizerId);
      }
      if (toRemove.length > 0) {
        await systemUserApi.removeRoles(userId, toRemove, selectedOrganizerId);
      }

      toast.success("Cập nhật vai trò thành công");
      onSaved?.();
      onOpenChange(false);
    });
  };

  const getScopeBadge = (scope: string) => {
    return scope === "GLOBAL" ? (
      <Badge className="bg-purple-100 text-purple-700 text-xs">GLOBAL</Badge>
    ) : (
      <Badge className="bg-blue-100 text-blue-700 text-xs">ORGANIZER</Badge>
    );
  };

  const hasOrganizerScopedSelection = Array.from(userRoles).some((roleId) => {
    const role = allRoles.find((r) => r._id === roleId);
    return role?.scope === "ORGANIZER" && !originalRoles.has(roleId);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quản lý vai trò: {userName || "Người dùng"}</DialogTitle>
          <DialogDescription>
            Chọn các vai trò để gán cho người dùng này
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Đang tải...
          </div>
        ) : (
          <div className="space-y-4">
            {/* Organizer Selection - shown when organizer-scoped roles are selected */}
            {hasOrganizerScopedSelection && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <Label className="text-sm font-semibold mb-2 block">
                  Chọn tổ chức cho vai trò phạm vi ORGANIZER *
                </Label>
                <Select
                  value={selectedOrganizerId || ""}
                  onValueChange={(value) =>
                    setSelectedOrganizerId(value || undefined)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn tổ chức..." />
                  </SelectTrigger>
                  <SelectContent>
                    {organizers.map((org) => (
                      <SelectItem key={org._id} value={org._id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{org.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {org.email}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  Vai trò phạm vi ORGANIZER yêu cầu chọn tổ chức cụ thể
                </p>
              </div>
            )}

            <div className="space-y-2">
              {allRoles.map((role) => (
                <div
                  key={role._id}
                  className="flex items-start space-x-3 p-3 hover:bg-muted rounded border"
                >
                  <Checkbox
                    id={role._id}
                    checked={userRoles.has(role._id)}
                    onCheckedChange={() => toggleRole(role._id)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={role._id} className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{role.name}</span>
                        {getScopeBadge(role.scope)}
                        {role.is_system_role && (
                          <Badge variant="secondary" className="text-xs">
                            Hệ thống
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 font-mono">
                        {role.code}
                      </div>
                      {role.description && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {role.description}
                        </div>
                      )}
                      {role.permissions && role.permissions.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {role.permissions.length} quyền
                        </div>
                      )}
                    </Label>
                  </div>
                </div>
              ))}

              {allRoles.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  Không có vai trò nào
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            Lưu ({userRoles.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
