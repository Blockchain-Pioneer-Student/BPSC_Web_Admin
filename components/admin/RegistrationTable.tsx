"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Eye, Trash2 } from "lucide-react";
import { Registration } from "@/lib/services/registrationService";

interface RegistrationTableProps {
  registrations: Registration[];
  onViewDetails: (registration: Registration) => void;
  onDelete: (registration: Registration) => void;
  searchTerm: string;
  filterByUniversity: string;
  filterByDivision: string;
  filterByYear: string;
}

export function RegistrationTable({
  registrations,
  onViewDetails,
  onDelete,
  searchTerm,
  filterByUniversity,
  filterByDivision,
  filterByYear,
}: RegistrationTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasActiveFilters = searchTerm || 
    (filterByUniversity && filterByUniversity !== "all") || 
    (filterByDivision && filterByDivision !== "all") || 
    (filterByYear && filterByYear !== "all");

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Student ID</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>University</TableHead>
            <TableHead>Division</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Blockchain Areas</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-12">
                <div className="flex flex-col items-center justify-center">
                  <div className="text-gray-500 text-lg mb-2">
                    {hasActiveFilters 
                      ? "No registrations match your filters" 
                      : "No registrations found"
                    }
                  </div>
                  <div className="text-gray-400 text-sm">
                    {hasActiveFilters 
                      ? "Try adjusting your search criteria" 
                      : "Registration applications will appear here"
                    }
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            registrations.map((registration) => (
              <TableRow 
                key={registration.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">
                      {registration.full_name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {registration.major}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono">
                    {registration.student_id}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600">
                  <div className="flex flex-col">
                    <span>{registration.email}</span>
                    {registration.phone_number && (
                      <span className="text-sm text-gray-400">
                        {registration.phone_number}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{registration.university}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {registration.division}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    Year {registration.year_of_study}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {registration.blockchainAreas.length === 0 ? (
                      <span className="text-gray-400 text-sm">None</span>
                    ) : (
                      <>
                        {registration.blockchainAreas.slice(0, 2).map((area) => (
                          <Badge 
                            key={area.id} 
                            variant="outline"
                            className="text-xs"
                          >
                            {area.blockchainArea?.name || 'Unknown'}
                          </Badge>
                        ))}
                        {registration.blockchainAreas.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{registration.blockchainAreas.length - 2} more
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDate(registration.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(registration)}
                      className="hover:bg-[#004987] hover:text-white transition-colors duration-200"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Registration</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the registration from{" "}
                            <span className="font-semibold">{registration.full_name}</span>{" "}
                            ({registration.student_id})? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(registration)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}