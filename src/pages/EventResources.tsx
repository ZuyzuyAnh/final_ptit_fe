import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ConferenceLayout } from "@/components/layout/ConferenceLayout";
import ConferenceTopBar from "@/components/conference/ConferenceTopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Upload } from "lucide-react";
import { useApi } from "@/hooks/use-api";

type ResourceType = "FILE" | "MAPS";

type ResourceItem = {
  id: number;
  event_id?: string | null;
  session_id?: number | null;
  resource_type: ResourceType;
  name: string;
  url_source: string;
  description?: string | null;
  created_at?: string;
};

const normalizeResourceList = (res: any): ResourceItem[] => {
  const raw = res?.data ?? res ?? null;
  const container = raw?.data ?? raw;
  if (Array.isArray(container)) return container as ResourceItem[];
  if (Array.isArray(container?.data)) return container.data as ResourceItem[];
  return [];
};

const EventResources = () => {
  const { id } = useParams<{ id: string }>();
  const { api, safeRequest } = useApi();

  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [resourceType, setResourceType] = useState<ResourceType>("FILE");
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const canSubmit = useMemo(() => {
    return !!id && !!file && (name.trim().length > 0 || file.name.trim().length > 0);
  }, [id, file, name]);

  const loadResources = async () => {
    if (!id) return;
    const res = await safeRequest(() => api.get(`/organizer/resources/event/${id}`));
    if (res === undefined) return;
    setResources(normalizeResourceList(res));
  };

  useEffect(() => {
    loadResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCreate = async () => {
    if (!id || !file) return;

    const fd = new FormData();
    fd.append("event_id", id);
    fd.append("resource_type", resourceType);
    fd.append("name", (name || file.name).trim());
    if (description.trim().length > 0) fd.append("description", description.trim());

    if (resourceType === "FILE") {
      fd.append("file", file);
    } else {
      fd.append("maps", file);
    }

    setLoading(true);
    const ok = await safeRequest(() => api.post("/organizer/resources", fd));
    setLoading(false);

    if (ok !== undefined) {
      setName("");
      setDescription("");
      setFile(null);
      await loadResources();
    }
  };

  const handleDelete = async (resourceId: number) => {
    const ok = await safeRequest(() => api.delete(`/organizer/resources/${resourceId}`));
    if (ok !== undefined) {
      setResources((prev) => prev.filter((r) => r.id !== resourceId));
    }
  };

  return (
    <ConferenceLayout>
      <ConferenceTopBar title="Tài nguyên" />
      <div className="px-6 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Thêm tài nguyên cho sự kiện</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Loại tài nguyên</Label>
                <Select value={resourceType} onValueChange={(v) => setResourceType(v as ResourceType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FILE">Tệp</SelectItem>
                    <SelectItem value="MAPS">Bản đồ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Tên tài nguyên</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mặc định: tên tệp"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả (không bắt buộc)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>{resourceType === "MAPS" ? "Tệp bản đồ" : "Tệp"}</Label>
              <Input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file && <div className="text-sm text-muted-foreground">Đã chọn: {file.name}</div>}
            </div>

            <div className="flex justify-end">
              <Button onClick={handleCreate} disabled={!canSubmit || loading}>
                <Upload className="h-4 w-4 mr-2" />
                Thêm tài nguyên
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách tài nguyên</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {resources.length === 0 ? (
              <div className="text-sm text-muted-foreground">Chưa có tài nguyên.</div>
            ) : (
              resources.map((r) => (
                <div key={r.id} className="flex items-start justify-between gap-4 p-3 border rounded-lg">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{r.name}</div>
                    {r.description ? (
                      <div className="text-sm text-muted-foreground line-clamp-2">{r.description}</div>
                    ) : null}
                    <a
                      href={r.url_source}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary hover:underline break-all"
                    >
                      {r.url_source}
                    </a>
                    <div className="text-xs text-muted-foreground mt-1">Loại: {r.resource_type}</div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(r.id)}
                    aria-label="Xóa tài nguyên"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </ConferenceLayout>
  );
};

export default EventResources;
