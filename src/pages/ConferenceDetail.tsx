import { ConferenceLayout } from "@/components/layout/ConferenceLayout";
import { ConferenceHeader } from "@/components/conference/ConferenceHeader";
import { ConferenceStats } from "@/components/conference/ConferenceStats";
import { ConferenceThumbnail } from "@/components/conference/ConferenceThumbnail";
import { ConferenceSchedule } from "@/components/conference/ConferenceSchedule";
import { useParams } from "react-router-dom";
import { ConferenceStatisticCard } from "@/components/conference/ConferenceStatisticCard";
import ConferenceTopBar from "@/components/conference/ConferenceTopBar";



const ConferenceDetail = () => {
  const conference = {
    title: "Hội nghị Công nghệ Số Việt Nam 2025",
    startDate: "09:00, ngày 03/11/2025",
    endDate: "17:00, ngày 05/11/2025",
    location: "Trung tâm hội nghị Quốc Gia, TP. Hà Nội",
    // ISO timestamps for countdown logic
    startAt: "2025-11-03T09:00:00+07:00",
    endAt: "2025-11-05T17:00:00+07:00",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
    stats: {
      checkedIn: 100,
      registered: 1000,
      participation: "1%",
    },
  };

  const schedule = [
    {
      time: "09:00 - 10:00",
      title: "Xu hướng AI trong 5 năm tới",
      description:
        "Tập trung vào việc ứng dụng AI trong các lĩnh vực quản lý, y tế, và sản xuất.",
      room: "Phòng A1",
      speakers: ["Nguyễn Văn A", "Trần Thị B"],
    },
    {
      time: "10:00 - 12:00",
      title: "Điện toán đám mây & Hạ tầng số bền vững",
      description:
        "Giải pháp tối ưu hạ tầng đám mây, tiết kiệm chi phí và bảo mật.",
      room: "Phòng A2",
      speakers: ["Lê Văn C"],
    },
  ];

  const genderStats = [
    { label: "Nam", percentage: 70 },
    { label: "Nữ", percentage: 30 },
  ];

  const ageGroups = [
    { range: "18-25", value: 40 },
    { range: "26-35", value: 60 },
    { range: "36-45", value: 55 },
    { range: "46-60", value: 35 },
  ];

  const { id } = useParams();

  return (
    <ConferenceLayout>
      <div className="px-6 py-6">
        <ConferenceTopBar title={conference.title}/>
          <div id="dashboard" className="space-y-8">
          {/* Top grid: Left quick info + stats, Right thumbnail */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-14 items-stretch">
            <div className="xl:col-span-7 space-y-3">
              <ConferenceHeader conference={conference} />
              <ConferenceStats stats={conference.stats} />
            </div>
            <div className="xl:col-span-5">
              <ConferenceThumbnail image={conference.image} />
            </div>
          </div>

          {/* Schedule + Charts */}
          <div id="schedule" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ConferenceSchedule
              schedule={[
                {
                  time: "09:00 - 10:00",
                  title: "Xu hướng AI trong 5 năm tới",
                  speaker: "Nguyễn Văn A",
                  room: "Phòng A1",
                },
                {
                  time: "10:00 - 12:00",
                  title: "Điện toán đám mây và hạ tầng bền vững",
                  speaker: "Trần Thị B",
                  room: "Phòng A2",
                },
                {
                  time: "13:30 - 14:30",
                  title: "Bảo mật hệ thống trong kỷ nguyên AI",
                  speaker: "Lê Văn C",
                  room: "Phòng B1",
                },
              ]}
            />
            <ConferenceStatisticCard
              type="pie"
              title="Thống kê giới tính tham dự"
              data={genderStats.map((g) => ({ name: g.label, value: g.percentage }))}
              nameField="name"
              valueField="value"
              height={280}
            />
          </div>

          {/* Peak hours bar chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ConferenceStatisticCard 
              type="bar"
              title="Thống kê giờ cao điểm"
              data={[
                { hour: "08:00", count: 30 },
                { hour: "09:00", count: 50 },
                { hour: "10:00", count: 85 },
                { hour: "11:00", count: 55 },
                { hour: "12:00", count: 75 },
                { hour: "13:00", count: 110 },
                { hour: "14:00", count: 10 },
                { hour: "15:00", count: 30 },
              ]}
              xField="hour"
              yField="count"
              height={400}
              grid
            />
          </div>

          {/* Anchor placeholders for future sections */}
          <div id="registrations" />
          <div id="edit" />
        </div>
      </div>
    </ConferenceLayout>
  );
};

export default ConferenceDetail;
