'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { contactService, Contact, PaginatedContactsResponse } from '@/lib/services/contactService';
import { notificationService } from '@/lib/services/notificationService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

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
} from '@/components/ui/alert-dialog';
import { Eye, Trash2, ChevronLeft, ChevronRight, Mail, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  
  const ITEMS_PER_PAGE = 10;

  const fetchContacts = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await contactService.getAllContacts({
        page,
        limit: ITEMS_PER_PAGE,
      });

      if (Array.isArray(response)) {
        // Backward compatibility - no pagination
        setContacts(response);
        setTotal(response.length);
        setTotalPages(1);
        setCurrentPage(1);
      } else {
        // Paginated response
        const paginatedResponse = response as PaginatedContactsResponse;
        setContacts(paginatedResponse.contacts);
        setTotal(paginatedResponse.total);
        setTotalPages(paginatedResponse.totalPages);
        setCurrentPage(paginatedResponse.page);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      notificationService.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleting(id);
      await contactService.deleteContact(id);
      notificationService.success('Contact deleted successfully');
      
      // Refresh the current page, or go to previous page if current becomes empty
      const newTotal = total - 1;
      const newTotalPages = Math.ceil(newTotal / ITEMS_PER_PAGE);
      const pageToLoad = currentPage > newTotalPages ? Math.max(1, newTotalPages) : currentPage;
      
      await fetchContacts(pageToLoad);
    } catch (error) {
      console.error('Error deleting contact:', error);
      notificationService.error('Failed to delete contact');
    } finally {
      setDeleting(null);
    }
  };



  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchContacts(page);
    }
  };

  useEffect(() => {
    fetchContacts(1);
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Contacts Management</CardTitle>
            <p className="text-muted-foreground mt-1">
              Manage contact form submissions from your website
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {total} total contacts
          </Badge>
        </CardHeader>

        <CardContent>
          {contacts.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No contacts found</h3>
              <p className="text-muted-foreground">
                Contact form submissions will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Contacts Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Name</TableHead>
                      <TableHead className="w-[200px]">Email</TableHead>
                      <TableHead className="w-[250px]">Subject</TableHead>
                      <TableHead className="w-[300px]">Message</TableHead>
                      <TableHead className="w-[150px]">Date</TableHead>
                      <TableHead className="w-[150px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">
                          {contact.full_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {contact.email}
                        </TableCell>
                        <TableCell>
                          {truncateText(contact.subject, 30)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {truncateText(contact.message, 40)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(contact.created_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* View Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/contacts/${contact.id}`)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {/* Delete Button */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  disabled={deleting === contact.id}
                                >
                                  {deleting === contact.id ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the contact from{' '}
                                    <strong>{contact.full_name}</strong>? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(contact.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
                    {Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total} contacts
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="h-8 w-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>


    </div>
  );
}
