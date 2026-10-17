"use client";

import { useEffect, useState } from "react";
import { Archive, Edit, Loader2, Plus, Trash2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  recruitmentCampaignService,
  type RecruitmentCampaign,
  type RecruitmentCampaignPayload,
  type RecruitmentCampaignStatus,
} from "@/lib/services/recruitmentCampaignService";

type FormState = {
  title: string;
  slug: string;
  description: string;
  opens_at: string;
  closes_at: string;
  status: RecruitmentCampaignStatus;
  is_visible: boolean;
  external_form_url: string;
};

const emptyForm: FormState = {
  title: "",
  slug: "",
  description: "",
  opens_at: "",
  closes_at: "",
  status: "draft",
  is_visible: true,
  external_form_url: "",
};

const toLocalDateTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export default function RecruitmentCampaignsPage() {
  const [campaigns, setCampaigns] = useState<RecruitmentCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RecruitmentCampaign | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setCampaigns(await recruitmentCampaignService.getAll());
    } catch (error) {
      console.error(error);
      toast.error("Failed to load recruitment campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCampaigns();
  }, []);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (campaign: RecruitmentCampaign) => {
    setEditing(campaign);
    setForm({
      title: campaign.title,
      slug: campaign.slug,
      description: campaign.description ?? "",
      opens_at: toLocalDateTime(campaign.opens_at),
      closes_at: toLocalDateTime(campaign.closes_at),
      status: campaign.status,
      is_visible: campaign.is_visible,
      external_form_url: campaign.external_form_url ?? "",
    });
    setDialogOpen(true);
  };

  const buildPayload = (): RecruitmentCampaignPayload => ({
    title: form.title.trim(),
    slug: form.slug.trim(),
    description: form.description.trim() || null,
    opens_at: form.opens_at
      ? new Date(form.opens_at).toISOString()
      : null,
    closes_at: form.closes_at
      ? new Date(form.closes_at).toISOString()
      : null,
    status: form.status,
    is_visible: form.is_visible,
    external_form_url: form.external_form_url.trim() || null,
  });

  const save = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error("Title and slug are required");
      return;
    }

    if (
      form.opens_at &&
      form.closes_at &&
      new Date(form.opens_at) >= new Date(form.closes_at)
    ) {
      toast.error("Closing time must be after opening time");
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload();

      if (editing) {
        await recruitmentCampaignService.update(editing.id, payload);
        toast.success("Recruitment campaign updated");
      } else {
        await recruitmentCampaignService.create(payload);
        toast.success("Recruitment campaign created");
      }

      setDialogOpen(false);
      await loadCampaigns();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save recruitment campaign");
    } finally {
      setSaving(false);
    }
  };

  const archive = async (campaign: RecruitmentCampaign) => {
    if (!window.confirm(`Archive ${campaign.title}?`)) return;

    try {
      await recruitmentCampaignService.update(campaign.id, {
        status: "archived",
        is_visible: false,
      });
      toast.success("Recruitment campaign archived");
      await loadCampaigns();
    } catch (error) {
      console.error(error);
      toast.error("Failed to archive recruitment campaign");
    }
  };

  const remove = async (campaign: RecruitmentCampaign) => {
    if (!window.confirm(`Delete ${campaign.title}?`)) return;

    try {
      await recruitmentCampaignService.remove(campaign.id);
      toast.success("Recruitment campaign deleted");
      await loadCampaigns();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete recruitment campaign");
    }
  };

  return (
    <div className="container mx-auto max-w-6xl space-y-6 py-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Recruitment Campaigns</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Control when recruitment opens, closes and which campaign receives applications.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New campaign
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No recruitment campaigns yet.
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex flex-col justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{campaign.title}</h3>
                      <span className="rounded-full border px-2 py-0.5 text-xs">
                        {campaign.status}
                      </span>
                      {!campaign.is_visible && (
                        <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                          hidden
                        </span>
                      )}
                      {campaign.has_been_published && campaign.status === "draft" && (
                        <span className="rounded-full border px-2 py-0.5 text-xs text-amber-700">
                          published history
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      /{campaign.slug}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {campaign.opens_at
                        ? `Opens ${new Date(campaign.opens_at).toLocaleString()}`
                        : "No opening time"}
                      {" · "}
                      {campaign.closes_at
                        ? `Closes ${new Date(campaign.closes_at).toLocaleString()}`
                        : "No closing time"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(campaign)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    {campaign.status === "draft" && !campaign.has_been_published ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={() => void remove(campaign)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    ) : campaign.status !== "archived" && campaign.status !== "draft" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void archive(campaign)}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </Button>
                    ) : null}
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
            <DialogTitle>
              {editing ? "Edit recruitment campaign" : "New recruitment campaign"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-5 py-2 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(event) => update("title", event.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Slug</Label>
              <Input
                value={form.slug}
                placeholder="recruitment-2026"
                onChange={(event) =>
                  update(
                    "slug",
                    event.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]+/g, "-")
                      .replace(/^-+|-+$/g, ""),
                  )
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea
                rows={4}
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Opens at</Label>
              <Input
                type="datetime-local"
                value={form.opens_at}
                onChange={(event) => update("opens_at", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Closes at</Label>
              <Input
                type="datetime-local"
                value={form.closes_at}
                onChange={(event) => update("closes_at", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={form.status}
                disabled={editing?.status === "archived"}
                onChange={(event) =>
                  update(
                    "status",
                    event.target.value as RecruitmentCampaignStatus,
                  )
                }
              >
                {(!editing || editing.status === "draft") && (
                  <option value="draft">Draft</option>
                )}
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex items-end gap-3 pb-2">
              <Switch
                id="campaign-visible"
                checked={form.is_visible}
                onCheckedChange={(checked) => update("is_visible", checked)}
              />
              <Label htmlFor="campaign-visible">Visible on public site</Label>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>External form URL (optional)</Label>
              <Input
                value={form.external_form_url}
                placeholder="https://..."
                onChange={(event) =>
                  update("external_form_url", event.target.value)
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
