import { AdminLayout } from "@/components/layout/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "admin" | "user" | "organizer";
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      fullName: "getsg",
      email: "funlesthwa@ptit.edu.vn",
      phone: "0384 132 687",
      role: "admin",
    },
    {
      id: "2",
      fullName: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      phone: "0912 345 678",
      role: "user",
    },
    {
      id: "3",
      fullName: "Trần Thị B",
      email: "tranthib@example.com",
      phone: "0923 456 789",
      role: "organizer",
    },
    {
      id: "4",
      fullName: "Lê Văn C",
      email: "levanc@example.com",
      phone: "0934 567 890",
      role: "user",
    },
    {
      id: "5",
      fullName: "Phạm Thị D",
      email: "phamthid@example.com",
      phone: "0945 678 901",
      role: "organizer",
    },
  ]);

  const getRoleBadge = (role: User["role"]) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-primary text-primary-foreground hover:bg-primary">
            Admin
          </Badge>
        );
      case "organizer":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            Tổ chức
          </Badge>
        );
      case "user":
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
            Người dùng
          </Badge>
        );
    }
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Search and Create Button */}
        <div className="flex gap-4 items-center justify-between">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Nhập tên, email hoặc SĐT để tìm kiếm"
                className="pl-10"
              />
            </div>
            <select className="px-4 py-2 border rounded-lg bg-background text-sm">
              <option>Chọn vai trò để tìm kiếm</option>
              <option>Admin</option>
              <option>Tổ chức</option>
              <option>Người dùng</option>
            </select>
          </div>
          <Button className="bg-primary hover:bg-primary/90">TẠO MỚI</Button>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-foreground text-background">
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    HỌ VÀ TÊN
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    EMAIL
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    SỐ ĐIỆN THOẠI
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    VAI TRÒ
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    HÀNH ĐỘNG
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`border-b hover:bg-muted/50 ${
                      index % 2 === 0 ? "bg-background" : "bg-muted/20"
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-medium">
                      {user.fullName}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm">{user.phone}</td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteUser(user.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Hiển thị 1 - 5 trên tổng 5 bản ghi
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                className="w-8 h-8 p-0 rounded-full"
              >
                1
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
