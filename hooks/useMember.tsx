import { useState } from 'react';
import { memberService, type Member } from '@/lib/services/memberService';
import { UploadService } from '@/lib/services/uploadService';
import { toast } from 'sonner';

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

export const useMember = () => {
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleInputChange = (
    field: string,
    value: any,
    formData: MemberFormData,
    setFormData: React.Dispatch<React.SetStateAction<MemberFormData>>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle image upload
  const handleImageUpload = async (
    file: File,
    field: string | undefined,
    setUploading: React.Dispatch<React.SetStateAction<boolean>>,
    setFormData: React.Dispatch<React.SetStateAction<MemberFormData>>
  ) => {
    try {
      setUploading(true);
      
      // Store the file to be uploaded later
      setFormData(prev => ({
        ...prev,
        image_file: file
      }));
      
      toast.success('Image selected successfully');
    } catch (error) {
      console.error('Error selecting image:', error);
      toast.error('Failed to select image');
    } finally {
      setUploading(false);
    }
  };

  // Handle social media
  const handleAddSocial = (
    formData: MemberFormData,
    setFormData: React.Dispatch<React.SetStateAction<MemberFormData>>
  ) => {
    setFormData(prev => ({
      ...prev,
      socials: [...prev.socials, { platform: '', url: '' }]
    }));
  };

  const handleDeleteSocial = (
    index: number,
    formData: MemberFormData,
    setFormData: React.Dispatch<React.SetStateAction<MemberFormData>>
  ) => {
    setFormData(prev => ({
      ...prev,
      socials: prev.socials.filter((_, i) => i !== index)
    }));
  };

  const handleSocialChange = (
    index: number,
    field: keyof MemberSocial,
    value: string,
    formData: MemberFormData,
    setFormData: React.Dispatch<React.SetStateAction<MemberFormData>>
  ) => {
    setFormData(prev => ({
      ...prev,
      socials: prev.socials.map((social, i) => 
        i === index ? { ...social, [field]: value } : social
      )
    }));
  };

  // Normalize member data for API
  const normalizeMemberData = (data: MemberFormData) => {
    const result: any = {
      full_name: data.full_name.trim(),
      avatar_url: data.avatar_url.trim() || undefined,
      bio: data.bio.trim() || undefined,
      board_id: data.board_id || undefined,
      display_order: data.display_order,
      is_active: data.is_active,
      socials: data.socials || [], // Include socials array
    };

    // Handle role: prioritize role_name over role_id
    if (data.role_name.trim()) {
      result.role_name = data.role_name.trim();
    } else if (data.role_id) {
      result.role_id = data.role_id;
    }

    return result;
  };

  // Create member
  const createMember = async (formData: MemberFormData) => {
    try {
      setLoading(true);
      
      const memberData = {
        ...normalizeMemberData(formData),
        ...(formData.image_file && { image_file: formData.image_file })
      };
      
      const result = await memberService.createMember(memberData);
      
      return result;
    } catch (error) {
      console.error('Error creating member:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update member
  const updateMember = async (id: number, formData: MemberFormData) => {
    try {
      setLoading(true);
      
      const memberData = {
        ...normalizeMemberData(formData),
        ...(formData.image_file && { image_file: formData.image_file })
      };
      
      const result = await memberService.updateMember(id, memberData);
      
      return result;
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createMember,
    updateMember,
    handleInputChange,
    handleImageUpload,
    handleAddSocial,
    handleDeleteSocial,
    handleSocialChange,
    normalizeMemberData,
  };
};