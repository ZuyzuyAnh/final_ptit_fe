import { useState, useEffect } from "react";
import { Upload, UserPlus, Plus, X, MapPin, MoreVertical } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/ui/button";
import { MultiSelectTag } from "@/components/common/MultiSelectTag";
import { ConferenceLayout } from "@/components/layout/ConferenceLayout";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Speaker {
  id: string;
  name: string;
  workplace: string;
  description: string;
  avatar: File | null;
  avatarPreview: string | null;
}

const EditConference = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);
  const [editingSpeakerId, setEditingSpeakerId] = useState<string | null>(null);
  const [speakerForm, setSpeakerForm] = useState({
    name: "",
    workplace: "",
    description: "",
    avatar: null as File | null,
    avatarPreview: null as string | null,
  });
  
  // Mock conference data - in real app, fetch from API using id
  const mockConferenceData = {
    title: "Hội nghị Công nghệ Số Việt Nam 2025",
    description: "Hội nghị Công nghệ Số Việt Nam 2025 là sự kiện thường niên quy tụ các chuyên gia, doanh nghiệp và sinh viên yêu thích công nghệ.",
    category: "technology",
    startDate: "2025-10-04",
    startTime: "09:00",
    endDate: "2025-10-05",
    endTime: "17:00",
    location: "Trung tâm hội nghị Quốc Gia, TP. Hà Nội",
    maxRegistrations: "100000",
    socialLinks: ["https://facebook.com/hoinghi", "https://twitter.com/hoinghi"],
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    maxRegistrations: "",
    socialLinks: [""] as string[],
  });

  // Load conference data on mount
  useEffect(() => {
    // In real app, fetch conference data from API
    setFormData({
      title: mockConferenceData.title,
      description: mockConferenceData.description || "",
      category: mockConferenceData.category,
      startDate: mockConferenceData.startDate,
      startTime: mockConferenceData.startTime,
      endDate: mockConferenceData.endDate,
      endTime: mockConferenceData.endTime,
      location: mockConferenceData.location,
      maxRegistrations: mockConferenceData.maxRegistrations,
      socialLinks: mockConferenceData.socialLinks.length > 0 ? mockConferenceData.socialLinks : [""],
    });
    setThumbnailPreview(mockConferenceData.image);
  }, [id]);

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSocialLinkChange = (index: number, value: string) => {
    const newLinks = [...formData.socialLinks];
    newLinks[index] = value;
    setFormData({ ...formData, socialLinks: newLinks });
  };

  const handleAddSocialLink = () => {
    setFormData({
      ...formData,
      socialLinks: [...formData.socialLinks, ""],
    });
  };

  const handleRemoveSocialLink = (index: number) => {
    if (formData.socialLinks.length > 1) {
      const newLinks = formData.socialLinks.filter((_, i) => i !== index);
      setFormData({ ...formData, socialLinks: newLinks });
    }
  };

  const handleSpeakerAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSpeakerForm({ ...speakerForm, avatar: file, avatarPreview: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenSpeakerModal = (speakerId?: string) => {
    if (speakerId) {
      const speaker = speakers.find((s) => s.id === speakerId);
      if (speaker) {
        setEditingSpeakerId(speakerId);
        setSpeakerForm({
          name: speaker.name,
          workplace: speaker.workplace,
          description: speaker.description,
          avatar: speaker.avatar,
          avatarPreview: speaker.avatarPreview,
        });
      }
    } else {
      setEditingSpeakerId(null);
      setSpeakerForm({
        name: "",
        workplace: "",
        description: "",
        avatar: null,
        avatarPreview: null,
      });
    }
    setIsSpeakerModalOpen(true);
  };

  const handleCloseSpeakerModal = () => {
    setIsSpeakerModalOpen(false);
    setEditingSpeakerId(null);
    setSpeakerForm({
      name: "",
      workplace: "",
      description: "",
      avatar: null,
      avatarPreview: null,
    });
  };

  const handleSaveSpeaker = () => {
    if (!speakerForm.name.trim() || !speakerForm.workplace.trim()) {
      return;
    }

    if (editingSpeakerId) {
      // Update existing speaker
      setSpeakers(
        speakers.map((speaker) =>
          speaker.id === editingSpeakerId
            ? {
                ...speaker,
                name: speakerForm.name,
                workplace: speakerForm.workplace,
                description: speakerForm.description,
                avatar: speakerForm.avatar,
                avatarPreview: speakerForm.avatarPreview,
              }
            : speaker
        )
      );
    } else {
      // Add new speaker
      const newSpeaker: Speaker = {
        id: Date.now().toString(),
        name: speakerForm.name,
        workplace: speakerForm.workplace,
        description: speakerForm.description,
        avatar: speakerForm.avatar,
        avatarPreview: speakerForm.avatarPreview,
      };
      setSpeakers([...speakers, newSpeaker]);
    }
    handleCloseSpeakerModal();
  };

  const handleDeleteSpeaker = () => {
    if (editingSpeakerId) {
      setSpeakers(speakers.filter((speaker) => speaker.id !== editingSpeakerId));
      handleCloseSpeakerModal();
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Update conference data via API
    console.log("Updating conference:", { ...formData, thumbnail, speakers });
    navigate(`/conference/${id}`);
  };

  const handleDelete = () => {
    if (confirm("Bạn có chắc chắn muốn xóa hội nghị này?")) {
      // TODO: Delete conference via API
      console.log("Deleting conference:", id);
      navigate("/dashboard");
    }
  };

  return (
    <ConferenceLayout sidebarTitle="Hội nghị Công nghệ Số Việt Nam 2025">
      <div className="px-6 py-6">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="font-heading text-4xl font-bold mb-8">Chỉnh sửa hội nghị</h1>

        {/* Main layout */}
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 bg-card rounded-xl p-8 space-y-6 shadow-sm"
          >
            {/* Upload */}
            <div
              className="border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center py-10 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => document.getElementById("thumbnail-input")?.click()}
            >
              <input
                id="thumbnail-input"
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="hidden"
              />
              {thumbnailPreview ? (
                <div className="space-y-2">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <p className="text-sm text-muted-foreground">Nhấn để thay đổi hình ảnh</p>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Tải hình ảnh mới ở đây</p>
                </>
              )}
            </div>

            {/* Name */}
            <Input
              label="Tên hội nghị *"
              placeholder="Nhập tên của hội nghị tại đây..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Mô tả hội nghị</Label>
              <Textarea
                placeholder="Nhập mô tả về hội nghị..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            {/* Social Links */}
            <div className="space-y-2">
              <Label className="text-base font-medium">
                Thông tin liên hệ *
              </Label>
              {formData.socialLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="Nhập URL (ví dụ: https://facebook.com/...)"
                    value={link}
                    onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                    className="flex-1"
                  />
                  {formData.socialLinks.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSocialLink(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSocialLink}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm liên kết
              </Button>
            </div>

            {/* Category */}
            <MultiSelectTag
              label="Thể loại của hội nghị"
              placeholder="Chọn thể loại"
              options={[
                { value: "technology", label: "Công nghệ" },
                { value: "education", label: "Giáo dục" },
                { value: "business", label: "Kinh doanh" },
              ]}
              value={formData.category ? formData.category.split(",") : []}
              onChange={(selected) =>
                setFormData({ ...formData, category: selected.join(",") })
              }
            />

            {/* Max Registrations */}
            <Input
              label="Số lượng người tham gia tối đa *"
              type="number"
              placeholder="Nhập số lượng tại đây"
              value={formData.maxRegistrations}
              onChange={(e) => setFormData({ ...formData, maxRegistrations: e.target.value })}
              required
            />

            {/* Time */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Thời gian *</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Từ</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Đến</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Địa điểm tổ chức *</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Trung tâm hội nghị Quốc Gia, TP. Hà Nội"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  className="flex-1"
                />
                <Button type="button" variant="outline">
                  <MapPin className="h-4 w-4 mr-2" />
                  Chọn trên Map
                </Button>
              </div>
            </div>

            <div className="flex justify-between gap-4 pt-4">
              <Button type="button" variant="destructive" onClick={handleDelete}>
                Xóa hội nghị
              </Button>
              <Button type="submit" className="px-8">
                Lưu thông tin
              </Button>
            </div>
          </form>

          {/* Right Reviewer Section */}
          <div className="flex flex-col">
            <div className="bg-card rounded-xl p-8 shadow-sm h-fit flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-medium text-lg">Danh sách diễn giả</h2>
                <Button variant="secondary" onClick={() => handleOpenSpeakerModal()}>
                  <UserPlus className="w-5 h-5 text-muted-foreground" />
                  Thêm diễn giả
                </Button>
              </div>

              {speakers.length === 0 ? (
                <div className="flex-1 flex flex-col items-center 
                justify-center text-center text-muted-foreground border 
                border-t-2 border-b-2 border-r-0 border-l-0 py-28">
                  <div className="mb-3">
                    <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
                  </div>
                  <p>Hãy thêm diễn giả sẽ tham gia và phát trong hội nghị</p>
                </div>
              ) : (
                <div className="space-y-4 border-t pt-4">
                  {speakers.map((speaker) => (
                    <div
                      key={speaker.id}
                      className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-16 w-16">
                        {speaker.avatarPreview ? (
                          <AvatarImage src={speaker.avatarPreview} alt={speaker.name} />
                        ) : (
                          <AvatarFallback>{getInitials(speaker.name)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base truncate">{speaker.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{speaker.workplace}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenSpeakerModal(speaker.id)}
                        className="flex-shrink-0"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Speaker Modal */}
      <Dialog open={isSpeakerModalOpen} onOpenChange={setIsSpeakerModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSpeakerId ? "Chỉnh sửa diễn giả" : "Thêm diễn giả"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
            {/* Left Column - Form Fields */}
            <div className="md:col-span-2 space-y-4">
              {/* Speaker Name */}
              <div className="space-y-2">
                <Label className="text-base font-medium">
                  Họ và tên diễn giả <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="Nguyễn Văn A"
                  value={speakerForm.name}
                  onChange={(e) => setSpeakerForm({ ...speakerForm, name: e.target.value })}
                  required
                />
              </div>

              {/* Workplace */}
              <div className="space-y-2">
                <Label className="text-base font-medium">
                  Vị trí, nơi công tác <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="CEO Công ty ABC Tech"
                  value={speakerForm.workplace}
                  onChange={(e) => setSpeakerForm({ ...speakerForm, workplace: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Giới thiệu, mô tả</Label>
                <Textarea
                  placeholder="Với hơn 15 năm kinh nghiệm trong phát triển hệ thống AI cho doanh nghiệp, ông Nguyễn Văn A sẽ chia sẻ về các xu hướng công nghệ đang định hình tương lai trí tuệ nhân tạo tại Việt Nam."
                  value={speakerForm.description}
                  onChange={(e) => setSpeakerForm({ ...speakerForm, description: e.target.value })}
                  rows={6}
                />
              </div>
            </div>

            {/* Right Column - Avatar Upload */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Ảnh đại diện</Label>
              <div
                className="border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center aspect-square cursor-pointer hover:border-primary transition-colors"
                onClick={() => document.getElementById("speaker-avatar-input")?.click()}
              >
                <input
                  id="speaker-avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handleSpeakerAvatarUpload}
                  className="hidden"
                />
                {speakerForm.avatarPreview ? (
                  <div className="w-full h-full p-2">
                    <img
                      src={speakerForm.avatarPreview}
                      alt="Speaker avatar preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Tải hình ảnh mới ở đây</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <div>
              {editingSpeakerId && (
                <Button variant="destructive" onClick={handleDeleteSpeaker}>
                  Xóa diễn giả
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCloseSpeakerModal}>
                Hủy
              </Button>
              <Button onClick={handleSaveSpeaker} disabled={!speakerForm.name.trim() || !speakerForm.workplace.trim()}>
                Lưu thông tin
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConferenceLayout>
  );
};

export default EditConference;

