"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  GraduationCap,
  Building,
  Calendar,
  FileText,
  MapPin,
  Award,
  Clock
} from "lucide-react";
import { registrationService, Registration } from "@/lib/services/registrationService";
import { toast } from "sonner";
import Link from "next/link";

export default function RegistrationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const registrationId = parseInt(params.slug as string, 10);

  // State
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch registration details
  const fetchRegistrationDetails = useCallback(async () => {
    try {
      setLoading(true);
      const registrationData = await registrationService.getRegistrationById(registrationId);
      setRegistration(registrationData);
    } catch (error) {
      console.error("Error fetching registration details:", error);
      toast.error("Unable to load registration details");
      router.push("/admin/members/registrations");
    } finally {
      setLoading(false);
    }
  }, [registrationId, router]);

  useEffect(() => {
    if (!registrationId || isNaN(registrationId)) {
      toast.error("Invalid registration ID");
      router.push("/admin/members/registrations");
      return;
    }

    fetchRegistrationDetails();
  }, [registrationId, router, fetchRegistrationDetails]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-64 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main content skeleton */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              </div>
              
              {/* Sidebar skeleton */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Registration not found
            </h1>
            <Link href="/admin/registrations">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to registrations
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/admin/registrations">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to registrations
              </Button>
            </Link>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Registration Details
            </h1>
            <p className="text-gray-600">
              Detailed information for registration #{registration.id}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {registration.full_name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Student ID</label>
                      <p className="text-lg">
                        <Badge variant="outline" className="text-sm">
                          {registration.student_id}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-lg flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {registration.email}
                      </p>
                    </div>
                    {registration.phone_number && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone Number</label>
                        <p className="text-lg flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {registration.phone_number}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Academic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Academic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">University</label>
                      <p className="text-lg flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        {registration.university}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Major</label>
                      <p className="text-lg">{registration.major}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Year of Study</label>
                      <p className="text-lg">
                        <Badge>Year {registration.year_of_study}</Badge>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Division</label>
                      <p className="text-lg">
                        <Badge variant="secondary">{registration.division}</Badge>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Blockchain Areas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Interested Blockchain Areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {registration.blockchainAreas.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {registration.blockchainAreas.map((area) => (
                        <Badge 
                          key={area.id} 
                          variant="outline"
                          className="text-sm py-1 px-3"
                        >
                          {area.blockchainArea?.name || 'Unknown Area'}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No blockchain areas specified</p>
                  )}
                </CardContent>
              </Card>

              {/* Experience & Motivation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Experience & Motivation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {registration.blockchain_experience && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Blockchain Experience
                      </label>
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {registration.blockchain_experience}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Reason for Joining
                    </label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {registration.reason}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Registration Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Registration Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Registration ID</label>
                    <p className="text-lg font-semibold">#{registration.id}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Submitted</label>
                    <p className="text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatDate(registration.created_at)}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        Pending Review
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Blockchain Areas</span>
                    <span className="font-semibold">
                      {registration.blockchainAreas.length}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Has Experience</span>
                    <span className="font-semibold">
                      {registration.blockchain_experience ? 'Yes' : 'No'}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Contact Info</span>
                    <span className="font-semibold">
                      {registration.phone_number ? 'Complete' : 'Email Only'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="default">
                    Approve Registration
                  </Button>
                  <Button className="w-full" variant="outline">
                    Request More Info
                  </Button>
                  <Button className="w-full" variant="destructive">
                    Reject Registration
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}