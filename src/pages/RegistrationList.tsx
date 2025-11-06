import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ConferenceLayout } from "@/components/layout/ConferenceLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Filter, FileText } from "lucide-react";
import ConferenceTopBar from "@/components/conference/ConferenceTopBar";

// Form field types
type FormFieldType = "text" | "email" | "multipleChoice" | "textarea" | "number";

type FormField = {
  id: string;
  label: string;
  type: FormFieldType;
  options?: string[]; // For multiple choice fields
};

type RegistrationData = {
  [fieldId: string]: string | string[];
};

type Registration = {
  id: string;
  stt: number;
  data: RegistrationData;
};

// Mock form fields structure
const formFields: FormField[] = [
  { id: "name", label: "Họ và tên", type: "text" },
  { id: "email", label: "Email", type: "email" },
  { id: "gender", label: "Giới tính", type: "multipleChoice", options: ["Nam", "Nữ", "Khác"] },
  { id: "transport", label: "Phương tiện di chuyển", type: "multipleChoice", options: ["Xe máy", "Xe buýt", "Ô tô", "Đi bộ", "Taxi"] },
  { id: "comments", label: "Ý kiến", type: "textarea" },
];

// Color mapping for badges
const badgeColors = [
  "bg-blue-100 text-blue-800 border-blue-200",
  "bg-green-100 text-green-800 border-green-200",
  "bg-yellow-100 text-yellow-800 border-yellow-200",
  "bg-purple-100 text-purple-800 border-purple-200",
  "bg-pink-100 text-pink-800 border-pink-200",
  "bg-indigo-100 text-indigo-800 border-indigo-200",
  "bg-red-100 text-red-800 border-red-200",
  "bg-orange-100 text-orange-800 border-orange-200",
];

const getBadgeColor = (index: number) => {
  return badgeColors[index % badgeColors.length];
};

// Mock registration data
const mockRegistrations: Registration[] = [
  {
    id: "1",
    stt: 1,
    data: {
      name: "Nguyễn Minh Khang",
      email: "khang.nguyen@example.com",
      gender: "Nam",
      transport: "Xe máy",
      comments: "Nên tổ chức sớm hơn 30 phút.",
    },
  },
  {
    id: "2",
    stt: 2,
    data: {
      name: "Trần Thị Thu Hà",
      email: "ha.tran@example.com",
      gender: "Nữ",
      transport: "Xe buýt",
      comments: "Không có ý kiến, cảm ơn ban tổ chức.",
    },
  },
  {
    id: "3",
    stt: 3,
    data: {
      name: "Lê Văn Đức",
      email: "duc.le@example.com",
      gender: "Nam",
      transport: "Ô tô",
      comments: "Mong có thêm bãi gửi xe miễn phí.",
    },
  },
  {
    id: "4",
    stt: 4,
    data: {
      name: "Phạm Thị Mai",
      email: "mai.pham@example.com",
      gender: "Nữ",
      transport: "Đi bộ",
      comments: "Mọi thứ đều ổn, rất chuyên nghiệp.",
    },
  },
  {
    id: "5",
    stt: 5,
    data: {
      name: "Hoàng Văn Nam",
      email: "nam.hoang@example.com",
      gender: "Nam",
      transport: "Xe máy",
      comments: "Rất tuyệt vời!",
    },
  },
  {
    id: "6",
    stt: 6,
    data: {
      name: "Võ Thị Lan",
      email: "lan.vo@example.com",
      gender: "Nữ",
      transport: "Taxi",
      comments: "Cảm ơn ban tổ chức.",
    },
  },
  {
    id: "7",
    stt: 7,
    data: {
      name: "Đỗ Văn Hùng",
      email: "hung.do@example.com",
      gender: "Nam",
      transport: "Xe buýt",
      comments: "Hy vọng có thêm nhiều sự kiện như vậy.",
    },
  },
  {
    id: "8",
    stt: 8,
    data: {
      name: "Bùi Thị Hoa",
      email: "hoa.bui@example.com",
      gender: "Nữ",
      transport: "Ô tô",
      comments: "",
    },
  },
  {
    id: "9",
    stt: 9,
    data: {
      name: "Ngô Văn Tuấn",
      email: "tuan.ngo@example.com",
      gender: "Nam",
      transport: "Xe máy",
      comments: "Tốt!",
    },
  },
  {
    id: "10",
    stt: 10,
    data: {
      name: "Dương Thị Linh",
      email: "linh.duong@example.com",
      gender: "Nữ",
      transport: "Đi bộ",
      comments: "Rất hài lòng.",
    },
  },
  {
    id: "11",
    stt: 11,
    data: {
      name: "Nguyễn Văn Hải",
      email: "hai.nguyen@example.com",
      gender: "Nam",
      transport: "Xe máy",
      comments: "Tuyệt vời!",
    },
  },
  {
    id: "12",
    stt: 12,
    data: {
      name: "Trần Thị Ngọc",
      email: "ngoc.tran@example.com",
      gender: "Nữ",
      transport: "Taxi",
      comments: "Rất chuyên nghiệp.",
    },
  },
  {
    id: "13",
    stt: 13,
    data: {
      name: "Lê Thị Bình",
      email: "binh.le@example.com",
      gender: "Nữ",
      transport: "Xe buýt",
      comments: "Cảm ơn!",
    },
  },
  {
    id: "14",
    stt: 14,
    data: {
      name: "Phạm Văn Cường",
      email: "cuong.pham@example.com",
      gender: "Nam",
      transport: "Ô tô",
      comments: "Hy vọng có thêm nhiều sự kiện.",
    },
  },
  {
    id: "15",
    stt: 15,
    data: {
      name: "Hoàng Thị Dung",
      email: "dung.hoang@example.com",
      gender: "Nữ",
      transport: "Đi bộ",
      comments: "Rất hài lòng.",
    },
  },
  {
    id: "16",
    stt: 16,
    data: {
      name: "Võ Văn Em",
      email: "em.vo@example.com",
      gender: "Nam",
      transport: "Xe máy",
      comments: "Tốt lắm!",
    },
  },
  {
    id: "17",
    stt: 17,
    data: {
      name: "Đỗ Thị Phượng",
      email: "phuong.do@example.com",
      gender: "Nữ",
      transport: "Xe buýt",
      comments: "",
    },
  },
  {
    id: "18",
    stt: 18,
    data: {
      name: "Bùi Văn Giang",
      email: "giang.bui@example.com",
      gender: "Nam",
      transport: "Taxi",
      comments: "Rất tốt!",
    },
  },
  {
    id: "19",
    stt: 19,
    data: {
      name: "Ngô Thị Hạnh",
      email: "hanh.ngo@example.com",
      gender: "Nữ",
      transport: "Ô tô",
      comments: "Cảm ơn ban tổ chức rất nhiều.",
    },
  },
  {
    id: "20",
    stt: 20,
    data: {
      name: "Dương Văn Long",
      email: "long.duong@example.com",
      gender: "Nam",
      transport: "Xe máy",
      comments: "Tuyệt!",
    },
  },
  {
    id: "21",
    stt: 21,
    data: {
      name: "Nguyễn Thị Minh",
      email: "minh.nguyen2@example.com",
      gender: "Nữ",
      transport: "Đi bộ",
      comments: "Rất chuyên nghiệp.",
    },
  },
  {
    id: "22",
    stt: 22,
    data: {
      name: "Trần Văn Quang",
      email: "quang.tran@example.com",
      gender: "Nam",
      transport: "Xe buýt",
      comments: "Tốt lắm!",
    },
  },
  {
    id: "23",
    stt: 23,
    data: {
      name: "Lê Thị Thanh",
      email: "thanh.le@example.com",
      gender: "Nữ",
      transport: "Taxi",
      comments: "Cảm ơn!",
    },
  },
  {
    id: "24",
    stt: 24,
    data: {
      name: "Phạm Văn Sơn",
      email: "son.pham@example.com",
      gender: "Nam",
      transport: "Ô tô",
      comments: "Rất tuyệt!",
    },
  },
  {
    id: "25",
    stt: 25,
    data: {
      name: "Hoàng Thị Uyên",
      email: "uyen.hoang@example.com",
      gender: "Nữ",
      transport: "Xe máy",
      comments: "Hy vọng có thêm nhiều sự kiện.",
    },
  },
];

const RegistrationList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter registrations based on search query
  const filteredRegistrations = useMemo(() => {
    if (!searchQuery.trim()) return mockRegistrations;

    const query = searchQuery.toLowerCase();
    return mockRegistrations.filter((reg) => {
      // Search in all string fields
      return Object.values(reg.data).some((value) => {
        if (typeof value === "string") {
          return value.toLowerCase().includes(query);
        }
        return false;
      });
    });
  }, [searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRegistrations = filteredRegistrations.slice(startIndex, endIndex);

  // Display form field value based on type
  const renderFieldValue = (field: FormField, value: string | string[] | undefined) => {
    if (!value) return "-";

    if (field.type === "multipleChoice") {
      const values = Array.isArray(value) ? value : [value];
      return (
        <div className="flex flex-wrap gap-1">
          {values.map((v, idx) => {
            const optionIndex = field.options?.indexOf(v) ?? idx;
            return (
              <Badge key={idx} variant="outline" className={getBadgeColor(optionIndex)}>
                {v}
              </Badge>
            );
          })}
        </div>
      );
    }

    // For text, email, textarea, number - just display as text
    return <span className="text-sm">{value}</span>;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterClick = () => {
    // TODO: Implement filter dialog
    console.log("Filter clicked");
  };

  const handleFormManagementClick = () => {
    navigate(`/conference/${id}/form`);
  };

  return (
    <ConferenceLayout>
      <div className="px-6 py-6">
        <div className="space-y-4">
        {/* Search and Filter Bar */}
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleFormManagementClick}>
            <FileText className="h-4 w-4 mr-2" />
            Form đăng ký
          </Button>
          <Button variant="outline" onClick={handleFilterClick}>
            <Filter className="h-4 w-4 mr-2" />
            Lọc
          </Button>
          <Input
            placeholder="Nhập tên cần tìm kiếm..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="flex-1 max-w-md"
          />
        </div>

        {/* Table Sheet View */}
        <div className="rounded-lg border bg-white">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="min-w-[60px] font-medium">STT</TableHead>
                  {formFields.map((field) => (
                    <TableHead key={field.id} className="min-w-[150px] font-medium">
                      {field.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRegistrations.length > 0 ? (
                  paginatedRegistrations.map((registration, index) => (
                    <TableRow key={registration.id}>
                      <TableCell className="font-medium">{startIndex + index + 1}</TableCell>
                      {formFields.map((field) => (
                        <TableCell key={field.id}>
                          {renderFieldValue(field, registration.data[field.id])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={formFields.length + 1} className="text-center py-8 text-muted-foreground">
                      Không tìm thấy kết quả
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex justify-center pt-4">
            <Pagination>
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage - 1);
                      }}
                    />
                  </PaginationItem>
                )}

                {/* Build page numbers to show */}
                {(() => {
                  const pages: (number | "ellipsis")[] = [];
                  
                  if (totalPages <= 7) {
                    // Show all pages if 7 or fewer
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // Always show first page
                    pages.push(1);
                    
                    if (currentPage > 4) {
                      pages.push("ellipsis");
                    }
                    
                    // Show pages around current
                    const start = Math.max(2, currentPage - 1);
                    const end = Math.min(totalPages - 1, currentPage + 1);
                    
                    for (let i = start; i <= end; i++) {
                      if (i !== 1 && i !== totalPages) {
                        pages.push(i);
                      }
                    }
                    
                    if (currentPage < totalPages - 3) {
                      pages.push("ellipsis");
                    }
                    
                    // Always show last page
                    if (totalPages > 1) {
                      pages.push(totalPages);
                    }
                  }
                  
                  return pages.map((page, idx) => {
                    if (page === "ellipsis") {
                      return (
                        <PaginationItem key={`ellipsis-${idx}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={page === currentPage}
                          onClick={(e) => {
                            e.preventDefault();
                            if (page !== currentPage) {
                              handlePageChange(page);
                            }
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  });
                })()}

                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage + 1);
                      }}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
        </div>
      </div>
    </ConferenceLayout>
  );
};

export default RegistrationList;

