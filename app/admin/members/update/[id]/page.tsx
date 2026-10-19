"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, User, Loader2, Upload, X, Plus } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { memberService, type Member } from "@/lib/services/memberService";
import { boardService, type Board } from "@/lib/services/boardService";
import { roleService, type Role } from "@/lib/services/roleService";
import { useMember } from "@/hooks/useMember";

interface MemberSocial {
  platform: string;
  url: string;
}

interface MemberFormData {
  full_name: string;
  avatar_url: string;
  bio: string;
  board_id: number | null;
  role_id: number | null;
  role_name: string;
  display_order: number;
  is_active: boolean;
  image_file?: File;
  socials: MemberSocial[];
}

export default function EditMemberPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;
  
  const {
    updateMember,
    loading: memberLoading,
    handleInputChange: hookHandleInputChange,
    handleImageUpload: hookHandleImageUpload,
    handleAddSocial: hookHandleAddSocial,
    handleDeleteSocial: hookHandleDeleteSocial,
    handleSocialChange: hookHandleSocialChange,
  } = useMember();
  
  // Form state
  const [formData, setFormData] = useState<MemberFormData>({
    full_name: "",
    avatar_url: "",
    bio: "",
    board_id: null,
    role_id: null,
    role_name: "",
    display_order: 0,
    is_active: true,
    image_file: undefined,
    socials: [],
  });

  // Loading and data states
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [boards, setBoards] = useState<Board[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [member, setMember] = useState<Member | null>(null);

  // Load member data, boards and roles
  useEffect(() => {
    const loadData = async () => {
      try {
        setPageLoading(true);
        const [memberData, boardsData, rolesData] = await Promise.all([
          memberService.getMemberById(Number(memberId)),
          boardService.getAllBoards(),
          roleService.getAllRoles(),
        ]);
        
        setMember(memberData);
        setBoards(boardsData);
        setRoles(rolesData);
        
        // Set form data with existing member data
        setFormData({
          full_name: memberData.full_name || "",
          avatar_url: memberData.avatar_url || "",
          bio: memberData.bio || "",
          board_id: memberData.board_id || null,
          role_id: memberData.role_id || null,
          role_name: memberData.role?.name || "",
          display_order: memberData.display_order || 0,
          is_active: memberData.is_active ?? true,
          image_file: undefined,
          socials: memberData.socials?.map(s => ({ platform: s.platform, url: s.url })) || [],
        });
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Unable to load member data");
        router.push("/admin/members");
      } finally {
        setPageLoading(false);
      }
    };

    if (memberId) {
      loadData();
    }
  }, [memberId, router]);

  // Handle input changes
  const handleInputChange = (field: keyof MemberFormData, value: any) => {
    hookHandleInputChange(field, value, formData, setFormData);
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    await hookHandleImageUpload(file, undefined, setUploading, setFormData);
  };

  // Handle social media
  const handleAddSocial = () => {
    hookHandleAddSocial(formData, setFormData);
  };

  const handleDeleteSocial = (index: number) => {
    hookHandleDeleteSocial(index, formData, setFormData);
  };

  const handleSocialChange = (index: number, field: keyof MemberSocial, value: string) => {
    hookHandleSocialChange(index, field, value, formData, setFormData);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name.trim()) {
      toast.error("Full name is required");
      return;
    }

    try {
      setSaving(true);
      
      await updateMember(Number(memberId), formData);
      toast.success("Member updated successfully");
      router.push("/admin/members");
    } catch (error) {
      console.error("Error updating member:", error);
      toast.error("Unable to update member. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Show loading spinner while page is loading
  if (pageLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/members">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Chỉnh sửa thành viên</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/members">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa thành viên</h1>
          <p className="text-gray-600 mt-1">Update member information and settings</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Member Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  placeholder="Nguyễn Văn An"
                  required
                />
              </div>

              {/* Avatar Upload */}
              <div className="space-y-4">
                <Label>Ảnh đại diện</Label>
                
                {/* Current Avatar Display */}
                {(formData.image_file || formData.avatar_url) && (
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border border-gray-200">
                    <Image
                      src={formData.image_file ? URL.createObjectURL(formData.image_file) : formData.avatar_url}
                      alt="Member avatar"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange("image_file", undefined);
                        if (!member?.avatar_url) {
                          handleInputChange("avatar_url", "");
                        }
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                
                {/* Upload Button */}
                <div>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("avatar-upload")?.click()}
                    disabled={uploading}
                    className="gap-2"
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {uploading ? "Uploading..." : "Upload Avatar"}
                  </Button>
                </div>

                {/* Manual URL Input */}
                <div className="space-y-2">
                  <Label htmlFor="avatar_url">Or enter avatar URL</Label>
                  <Input
                    id="avatar_url"
                    type="url"
                    value={formData.avatar_url}
                    onChange={(e) => handleInputChange("avatar_url", e.target.value)}
                  placeholder="https://ten-mien-cua-ban.vn/anh-dai-dien.jpg"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Một vài dòng giới thiệu về thành viên"
                  rows={4}
                />
              </div>

              {/* Board and Role Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Board */}
                <div className="space-y-2">
                  <Label htmlFor="board_id">Ban phụ trách</Label>
                  <Select
                    value={formData.board_id?.toString() || "none"}
                    onValueChange={(value) => handleInputChange("board_id", value === "none" ? null : parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ban phụ trách" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Chưa phân ban</SelectItem>
                      {boards.map((board) => (
                        <SelectItem key={board.id} value={board.id.toString()}>
                          {board.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role">Chức vụ</Label>
                  <div className="space-y-2">
                    <Input
                      id="role_name"
                      type="text"
                      placeholder="Ví dụ: Phó chủ nhiệm"
                      value={formData.role_name}
                      onChange={(e) => {
                        handleInputChange("role_name", e.target.value);
                        // Clear role_id when typing custom role
                        if (e.target.value.trim() !== '') {
                          handleInputChange("role_id", null);
                        }
                      }}
                    />
                    <Select
                      value={formData.role_id?.toString() || "none"}
                      onValueChange={(value) => {
                        if (value === "none") {
                          handleInputChange("role_id", null);
                        } else {
                          const selectedRole = roles.find(r => r.id.toString() === value);
                          handleInputChange("role_id", parseInt(value));
                          handleInputChange("role_name", selectedRole?.name || "");
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Hoặc chọn chức vụ đã có" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Chưa chọn chức vụ</SelectItem>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Enter a new role name above or select an existing role below. New roles will be created automatically.
                    </p>
                  </div>
                </div>
              </div>

              {/* Display Order */}
              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => handleInputChange("display_order", parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                />
              </div>

              {/* Social Media Links */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Social Media Links</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddSocial}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Social
                  </Button>
                </div>
                
                {formData.socials.map((social, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Platform</Label>
                        <div className="space-y-2">
                          <Select
                            value={social.platform}
                            onValueChange={(value) => {
                              if (value === 'custom') {
                                // Clear platform to allow custom entry
                                handleSocialChange(index, "platform", "");
                              } else {
                                handleSocialChange(index, "platform", value);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="facebook">Facebook</SelectItem>
                              <SelectItem value="instagram">Instagram</SelectItem>
                              <SelectItem value="twitter">Twitter</SelectItem>
                              <SelectItem value="x">X (Twitter)</SelectItem>
                              <SelectItem value="linkedin">LinkedIn</SelectItem>
                              <SelectItem value="github">GitHub</SelectItem>
                              <SelectItem value="youtube">YouTube</SelectItem>
                              <SelectItem value="tiktok">TikTok</SelectItem>
                              <SelectItem value="discord">Discord</SelectItem>
                              <SelectItem value="telegram">Telegram</SelectItem>
                              <SelectItem value="whatsapp">WhatsApp</SelectItem>
                              <SelectItem value="reddit">Reddit</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="dev.to">Dev.to</SelectItem>
                              <SelectItem value="codepen">CodePen</SelectItem>
                              <SelectItem value="stackoverflow">Stack Overflow</SelectItem>
                              <SelectItem value="behance">Behance</SelectItem>
                              <SelectItem value="dribbble">Dribbble</SelectItem>
                              <SelectItem value="figma">Figma</SelectItem>
                              <SelectItem value="twitch">Twitch</SelectItem>
                              <SelectItem value="spotify">Spotify</SelectItem>
                              <SelectItem value="soundcloud">SoundCloud</SelectItem>
                              <SelectItem value="website">Website</SelectItem>
                              <SelectItem value="blog">Blog</SelectItem>
                              <SelectItem value="portfolio">Portfolio</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="custom">Custom Platform...</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Enter custom platform name"
                            value={social.platform}
                            onChange={(e) => handleSocialChange(index, "platform", e.target.value)}
                            className="text-sm"
                          />
                          <p className="text-xs text-gray-500">
                            Select from dropdown or enter custom platform name above
                          </p>
                        </div>
                      </div>
                        <div className="space-y-2">
                          <Label>URL</Label>
                          <Input
                            value={social.url}
                            onChange={(e) => handleSocialChange(index, "url", e.target.value)}
                            placeholder={social.platform 
                              ? social.platform === 'email' 
                              ? 'thanhvien@bpsclub.com' 
                              : `https://${social.platform}.com/ten-nguoi-dung`
                            : 'https://duong-dan-trang-ca-nhan'
                            }
                          />
                          {social.platform && (
                            <p className="text-xs text-gray-400">
                              {social.platform === 'email' 
                                ? 'Enter email address' 
                                : `Enter your ${social.platform} profile URL`
                              }
                            </p>
                          )}
                        </div>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSocial(index)}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              {/* Status */}
              <div className="flex items-center space-x-3 p-4 border rounded-lg">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="is_active" className="text-sm font-medium">
                    Active Status
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {formData.is_active 
                      ? "This member is currently active and visible" 
                      : "This member is inactive and hidden from public view"
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                type="submit"
                disabled={saving || memberLoading}
                className="bg-[#004987] hover:bg-[#003b6d] gap-2"
              >
                {(saving || memberLoading) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {(saving || memberLoading) ? "Updating..." : "Update Member"}
              </Button>
              
              <Link href="/admin/members">
                <Button type="button" variant="outline" className="w-full sm:w-auto">
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
