import { AdminLayout } from "@/components/layout/AdminLayout";
import { StatCard } from "@/components/admin/StatCard";
import { PieChartCard } from "@/components/admin/PieChartCard";
import { BarChartCard } from "@/components/admin/BarChartCard";
import { SummaryTableCard } from "@/components/admin/SummaryTableCard";
import { Users, Calendar, UserCheck } from "lucide-react";

const AdminDashboard = () => {
  // Mock data for pie chart
  const genderData = [
    { name: "Nam", value: 60, color: "hsl(var(--primary))" },
    { name: "Nữ", value: 40, color: "hsl(var(--foreground))" },
  ];

  // Mock data for bar chart
  const peakHoursData = [
    { name: "08:00", value: 30 },
    { name: "09:00", value: 55 },
    { name: "10:00", value: 85 },
    { name: "11:00", value: 60 },
    { name: "12:00", value: 75 },
    { name: "13:00", value: 95 },
    { name: "14:00", value: 45 },
    { name: "15:00", value: 25 },
  ];

  // Mock data for summary table
  const summaryData = [
    {
      id: 1,
      title: "Hội nghị Khởi nghiệp Sáng tạo 2025",
      count: "100,000 lượt đăng ký",
      subtitle: "từ hôm nay",
    },
    {
      id: 2,
      title: "Hội nghị Công nghệ Số Việt Nam 2025",
      count: "50,000 lượt đăng ký",
      subtitle: "từ hôm nay",
    },
    {
      id: 3,
      title: "Hội nghị STEM 2025",
      count: "2,000 lượt đăng ký",
      subtitle: "từ hôm nay",
    },
  ];

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <PieChartCard 
            title="Thống kê giới tính tham dự" 
            data={genderData} 
          />
          <BarChartCard 
            title="Thống kê giờ cao điểm" 
            data={peakHoursData} 
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <StatCard 
              title="Sự kiện đang mở" 
              value="4" 
              icon={Calendar} 
            />
            <StatCard 
              title="Số khách hàng" 
              value="2" 
              icon={Users} 
            />
          </div>
          
          <StatCard 
            title="Sự kiện đã tổ chức" 
            value="100" 
            icon={UserCheck} 
          />

          <SummaryTableCard 
            title="Thống kê tổng quan" 
            items={summaryData}
            linkText="Xem tất cả"
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
