"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Award,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Youtube,
  ExternalLink,
  UserCheck,
  UserX,
  Calendar,
  Hash
} from "lucide-react";
import { memberService, Member } from "@/lib/services/memberService";
import { toast } from "sonner";
import Link from "next/link";

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = parseInt(params.slug as string, 10);
  
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch member data
  const fetchMember = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await memberService.getMemberById(memberId);
      setMember(data);
    } catch (error) {
      console.error("Error fetching member:", error);
      setError("Unable to load member details. Please try again.");
      toast.error("Unable to load member details");
    } finally {
      setLoading(false);
    }
  };

  // Delete member function
  const handleDelete = async () => {
    if (!member) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete member "${member.full_name}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      await memberService.deleteMember(member.id);
      toast.success("Member deleted successfully");
      router.push("/admin/members");
    } catch (error) {
      console.error("Error deleting member:", error);
      toast.error("Unable to delete member. Please try again.");
    }
  };

  // Toggle member status
  const toggleStatus = async () => {
    if (!member) return;
    
    try {
      const updatedMember = await memberService.updateMember(member.id, {
        is_active: !member.is_active
      });
      setMember(updatedMember);
      toast.success(`Member ${updatedMember.is_active ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error("Error updating member status:", error);
      toast.error("Unable to update member status");
    }
  };

  // Get social media icon
  const getSocialIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();
    switch (platformLower) {
      case 'facebook':
        return <Facebook className="w-4 h-4" />;
      case 'twitter':
        return <Twitter className="w-4 h-4" />;
      case 'instagram':
        return <Instagram className="w-4 h-4" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />;
      case 'github':
        return <Github className="w-4 h-4" />;
      case 'youtube':
        return <Youtube className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    const loadMember = async () => {
      if (memberId && !isNaN(memberId)) {
        await fetchMember();
      } else {
        setError("Invalid member ID");
        setLoading(false);
      }
    };
    
    loadMember();
  }, [memberId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="w-8 h-8" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-20 h-20 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Member Details</h1>
        </div>

        {/* Error State */}
        <Card>
          <CardContent className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Member not found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {error || "The member you're looking for doesn't exist or has been removed."}
            </p>
            <div className="mt-6">
              <Link href="/admin/members">
                <Button className="bg-[#004987] hover:bg-[#003b6d]">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Members
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Member Details</h1>
            <p className="text-gray-600 mt-1">View and manage member information</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleStatus}
            className={member.is_active ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
          >
            {member.is_active ? (
              <>
                <UserX className="w-4 h-4 mr-1" />
                Deactivate
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 mr-1" />
                Activate
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="text-yellow-600 hover:text-yellow-700"
            asChild
          >
            <Link href={`/admin/members/${member.id}/edit`}>
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Link>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Section */}
              <div className="flex items-start space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={member.avatar_url} alt={member.full_name} />
                  <AvatarFallback className="bg-[#004987] text-white text-2xl font-semibold">
                    {member.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{member.full_name}</h2>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={member.is_active 
                        ? "bg-green-100 text-green-800 border-green-200" 
                        : "bg-red-100 text-red-800 border-red-200"
                      }>
                        {member.is_active ? "Active" : "Inactive"}
                      </Badge>
                      {member.role && (
                        <Badge variant="outline">
                          {member.role.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {member.bio && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Biography</h3>
                      <p className="text-gray-600 leading-relaxed">{member.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Links */}
          {member.socials && member.socials.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Social Media
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {member.socials.map((social) => (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {getSocialIcon(social.platform)}
                      <span className="font-medium text-gray-900 capitalize">
                        {social.platform}
                      </span>
                      <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Member Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Member ID</span>
                  <span className="text-sm text-gray-900">#{member.id}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Status</span>
                  <Badge className={member.is_active 
                    ? "bg-green-100 text-green-800 border-green-200" 
                    : "bg-red-100 text-red-800 border-red-200"
                  }>
                    {member.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                
                {member.role && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Role</span>
                      <Badge variant="outline">
                        <Award className="w-3 h-3 mr-1" />
                        {member.role.name}
                      </Badge>
                    </div>
                  </>
                )}
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Display Order</span>
                  <span className="text-sm text-gray-900">#{member.display_order}</span>
                </div>
                
                {member.board_id && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Board ID</span>
                      <span className="text-sm text-gray-900">#{member.board_id}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={toggleStatus}
              >
                {member.is_active ? (
                  <>
                    <UserX className="w-4 h-4 mr-2" />
                    Deactivate Member
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Activate Member
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href={`/admin/members/${member.id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Member
                </Link>
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Member
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
