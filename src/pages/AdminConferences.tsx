import { AdminLayout } from "@/components/layout/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Trash2 } from "lucide-react";
import { useState } from "react";

interface Conference {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  venue: string;
  organizer: string;
  contact: string;
  status: "ongoing" | "upcoming" | "ended";
  isVisible: boolean;
}

const AdminConferences = () => {
  const [conferences, setConferences] = useState<Conference[]>([
    {
      id: "1",
      name: "DemoNews",
      startDate: "11:49 04-10-2025",
      endDate: "11:00 31-10-2025",
      venue: "IEC",
      organizer: "iec_booth",
      contact: "0384 132 688",
      status: "ongoing",
      isVisible: true,
    },
    {
      id: "2",
      name: "test",
      startDate: "15:11 11-08-2025",
      endDate: "00:00 31-08-2025",
      venue: "IEC",
      organizer: "iec_booth",
      contact: "0384 132 688",
      status: "ended",
      isVisible: true,
    },
    {
      id: "3",
      name: "123",
      startDate: "15:34 11-08-2025",
      endDate: "00:00 30-07-2026",
      venue: "IEC",
      organizer: "iec_booth",
      contact: "0384 132 688",
      status: "ongoing",
      isVisible: true,
    },
    {
      id: "4",
      name: "demo",
      startDate: "15:54 09-08-2025",
      endDate: "00:08 01-08-2026",
      venue: "IEC",
      organizer: "iec_booth",
      contact: "0384 132 688",
      status: "ongoing",
      isVisible: true,
    },
    {
      id: "5",
      name: "test_face",
      startDate: "17:40 06-08-2025",
      endDate: "00:00 29-11-2025",
      venue: "IEC",
      organizer: "iec_booth",
      contact: "0384 132 688",
      status: "ongoing",
      isVisible: true,
    },
    {
      id: "6",
      name: "DemoGame",
      startDate: "09:51 04-08-2025",
      endDate: "00:00 01-10-2025",
      venue: "IEC",
      organizer: "iec_booth",
      contact: "0384 132 688",
      status: "ended",
      isVisible: true,
    },
    {
      id: "7",
      name: "Testestestestestest",
      startDate: "21:17 02-08-2025",
      endDate: "23:59 09-08-2025",
      venue: "PTIT IEC",
      organizer: "iec_booth",
      contact: "0384 132 688",
      status: "ended",
      isVisible: true,
    },
  ]);

  const getStatusBadge = (status: Conference["status"]) => {
    switch (status) {
      case "ongoing":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Đang diễn ra
          </Badge>
        );
      case "ended":
        return (
          <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-100">
            Đã kết thúc
          </Badge>
        );
      case "upcoming":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            Sắp diễn ra
          </Badge>
        );
    }
  };

  const toggleVisibility = (id: string) => {
    setConferences(
      conferences.map((conf) =>
        conf.id === id ? { ...conf, isVisible: !conf.isVisible } : conf
      )
    );
  };

  const deleteConference = (id: string) => {
    setConferences(conferences.filter((conf) => conf.id !== id));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Nhập tên sự kiện, đối tác hoặc địa điểm để tìm kiếm"
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Ngày bắt đầu
            </Button>
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Ngày kết thúc
            </Button>
            <select className="px-4 py-2 border rounded-lg bg-background text-sm">
              <option>Chọn trạng thái</option>
              <option>Đang diễn ra</option>
              <option>Sắp diễn ra</option>
              <option>Đã kết thúc</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-foreground text-background">
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    TÊN SỰ KIỆN
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    THỜI GIAN BẮT ĐẦU
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    THỜI GIAN KẾT THÚC
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    ĐỊA ĐIỂM
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    ĐỐI TÁC
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    TRẠNG THÁI
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    KHOÁ/MỞ KHOÁ
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    HÀNH ĐỘNG
                  </th>
                </tr>
              </thead>
              <tbody>
                {conferences.map((conference, index) => (
                  <tr
                    key={conference.id}
                    className={`border-b hover:bg-muted/50 ${
                      index % 2 === 0 ? "bg-background" : "bg-muted/20"
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-medium">
                      {conference.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {conference.startDate}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {conference.endDate}
                    </td>
                    <td className="px-6 py-4 text-sm">{conference.venue}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="text-muted-foreground">
                        {conference.organizer}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {conference.contact}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(conference.status)}
                    </td>
                    <td className="px-6 py-4">
                      <Switch
                        checked={conference.isVisible}
                        onCheckedChange={() => toggleVisibility(conference.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteConference(conference.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Hiển thị 1 - 7 trên tổng 7 bản ghi
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                className="w-8 h-8 p-0 rounded-full"
              >
                1
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 rounded-full"
              >
                2
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 rounded-full"
              >
                3
              </Button>
              <span className="text-muted-foreground">...</span>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 rounded-full"
              >
                10
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminConferences;
