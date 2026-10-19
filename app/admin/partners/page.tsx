"use client";

import { useEffect, useState } from "react";
import { Edit, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  partnerService,
  type Partner,
  type PartnerPayload,
  type PartnerStatus,
  type PartnerType,
} from "@/lib/services/partnerService";
import { UploadService } from "@/lib/services/uploadService";

const emptyForm: PartnerPayload = {
  name: "",
  logo: "",
  type: "community",
  description: "",
  website: "",
  email: "",
  phone: "",
  address: "",
  display_order: 0,
  status: "active",
};

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [form, setForm] = useState<PartnerPayload>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadPartners = async () => {
    try {
      setLoading(true);
      setPartners(await partnerService.getAllPartners());
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách đối tác");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPartners();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (partner: Partner) => {
    setEditing(partner);
    setForm({
      name: partner.name,
      logo: partner.logo,
      type: partner.type,
      description: partner.description,
      website: partner.website ?? "",
      email: partner.email ?? "",
      phone: partner.phone ?? "",
      address: partner.address ?? "",
      display_order: partner.display_order ?? 0,
      status: partner.status,
    });
    setDialogOpen(true);
  };

  const update = <K extends keyof PartnerPayload>(
    key: K,
    value: PartnerPayload[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const uploadLogo = async (file?: File) => {
    if (!file) return;

    try {
      setUploading(true);
      const result = await UploadService.uploadImage(file);
      update("logo", result.url);
      toast.success("Đã tải logo");
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải logo");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.name.trim() || !form.logo.trim() || !form.description.trim()) {
      toast.error("Vui lòng nhập tên, logo và mô tả");
      return;
    }

    try {
      setSaving(true);
      const payload: PartnerPayload = {
        ...form,
        name: form.name.trim(),
        logo: form.logo.trim(),
        description: form.description.trim(),
        website: form.website?.trim() || "",
        email: form.email?.trim() || "",
        phone: form.phone?.trim() || "",
        address: form.address?.trim() || "",
      };

      if (editing) {
        await partnerService.updatePartner(editing.id, payload);
        toast.success("Đã cập nhật đối tác");
      } else {
        await partnerService.createPartner(payload);
        toast.success("Đã thêm đối tác");
      }
      setDialogOpen(false);
      await loadPartners();
    } catch (error) {
      console.error(error);
      toast.error("Không thể lưu đối tác");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (partner: Partner) => {
    if (!window.confirm(`Xóa đối tác ${partner.name}?`)) return;

    try {
      await partnerService.deletePartner(partner.id);
      toast.success("Đã xóa đối tác");
      await loadPartners();
    } catch (error) {
      console.error(error);
      toast.error("Không thể xóa đối tác");
    }
  };

  return (
    <div className="container mx-auto max-w-6xl space-y-6 py-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Đối tác</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý logo, liên kết, thông tin liên hệ và trạng thái hiển thị.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm đối tác
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mạng lưới đối tác</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : partners.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Chưa có đối tác nào.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="flex gap-4 rounded-lg border p-4"
                >
                  <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded border bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{partner.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {partner.type} · {partner.status} · order {partner.display_order ?? 0}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEdit(partner)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-600"
                          onClick={() => void remove(partner)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {partner.description}
                    </p>
                    {partner.website && (
                      <p className="mt-2 truncate text-xs text-muted-foreground">
                        {partner.website}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Chỉnh sửa đối tác" : "Thêm đối tác"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-5 py-2 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Tên đối tác</Label>
              <Input
                value={form.name}
                placeholder="Ví dụ: Project Catalyst"
                onChange={(event) => update("name", event.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Đường dẫn logo</Label>
              <Input
                value={form.logo}
                placeholder="https://ten-mien-doi-tac.vn/logo.png"
                onChange={(event) => update("logo", event.target.value)}
              />
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Tải logo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(event) =>
                    void uploadLogo(event.target.files?.[0])
                  }
                />
              </label>
            </div>

            <div className="space-y-2">
              <Label>Nhóm đối tác</Label>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={form.type}
                onChange={(event) =>
                  update("type", event.target.value as PartnerType)
                }
              >
                <option value="academic">Học thuật</option>
                <option value="business">Doanh nghiệp</option>
                <option value="community">Cộng đồng</option>
                <option value="government">Cơ quan</option>
                <option value="technology">Công nghệ</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={form.status}
                onChange={(event) =>
                  update("status", event.target.value as PartnerStatus)
                }
              >
                <option value="active">Đang hiển thị</option>
                <option value="inactive">Tạm ẩn</option>
                <option value="pending">Chờ duyệt</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Thứ tự hiển thị</Label>
              <Input
                type="number"
                min={0}
                value={form.display_order}
                onChange={(event) =>
                  update("display_order", Number(event.target.value) || 0)
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Mô tả</Label>
              <Textarea
                rows={4}
                value={form.description}
                placeholder="Mô tả ngắn về vai trò của đối tác với câu lạc bộ"
                onChange={(event) => update("description", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={form.website ?? ""}
                placeholder="https://ten-mien-doi-tac.vn"
                onChange={(event) => update("website", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Email liên hệ</Label>
              <Input
                type="email"
                value={form.email ?? ""}
                placeholder="lienhe@doitac.vn"
                onChange={(event) => update("email", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input
                value={form.phone ?? ""}
                placeholder="0325 045 633"
                onChange={(event) => update("phone", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Địa chỉ</Label>
              <Input
                value={form.address ?? ""}
                placeholder="Địa chỉ văn phòng"
                onChange={(event) => update("address", event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => void save()} disabled={saving || uploading}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu đối tác
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
