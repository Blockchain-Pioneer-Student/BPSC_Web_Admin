'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { contactService, Contact } from '@/lib/services/contactService';
import { notificationService } from '@/lib/services/notificationService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { ArrowLeft, Mail, Calendar, User, MessageSquare, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const contactId = parseInt(params.id as string, 10);

  const fetchContact = useCallback(async () => {
    try {
      setLoading(true);
      const response = await contactService.getContactById(contactId);
      setContact(response);
    } catch (error) {
      console.error('Error fetching contact:', error);
      notificationService.error('Failed to load contact details');
      router.push('/admin/contacts');
    } finally {
      setLoading(false);
    }
  }, [contactId, router]);

  const handleDelete = async () => {
    if (!contact) return;

    try {
      setDeleting(true);
      await contactService.deleteContact(contact.id);
      notificationService.success('Contact deleted successfully');
      router.push('/admin/contacts');
    } catch (error) {
      console.error('Error deleting contact:', error);
      notificationService.error('Failed to delete contact');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'EEEE, MMMM dd, yyyy \'at\' HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notificationService.success(`${type} copied to clipboard`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      notificationService.error('Failed to copy to clipboard');
    }
  };

  useEffect(() => {
    if (contactId && !isNaN(contactId)) {
      fetchContact();
    } else {
      router.push('/admin/contacts');
    }
  }, [contactId, router, fetchContact]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading contact details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Contact not found</h3>
            <p className="text-muted-foreground mb-4">
              The contact you&apos;re looking for doesn&apos;t exist or has been deleted.
            </p>
            <Button onClick={() => router.push('/admin/contacts')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contacts
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/contacts')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contacts
            </Button>
          </div>
          <h1 className="text-2xl font-bold">Contact Details</h1>
          <p className="text-muted-foreground">
            Contact form submission from {contact.full_name}
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={deleting}
              className="gap-2"
            >
              {deleting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b border-current"></div>
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete Contact
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Contact</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this contact from{' '}
                <strong>{contact.full_name}</strong>? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Contact Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{contact.full_name}</CardTitle>
                <p className="text-muted-foreground text-sm mt-1">
                  Contact Form Submission
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(contact.created_at)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </label>
                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium">{contact.full_name}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium break-all">{contact.email}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(contact.email, 'Email')}
                    className="mt-2 h-8 text-xs"
                  >
                    Copy Email
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Submitted On
                </label>
                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium">{formatDate(contact.created_at)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Contact ID
                </label>
                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium">#{contact.id}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Subject */}
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Subject
            </label>
            <div className="mt-2 p-4 bg-muted/50 rounded-lg">
              <p className="font-medium text-lg">{contact.subject}</p>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Message
            </label>
            <div className="mt-2 p-4 bg-muted/50 rounded-lg border-l-4 border-primary/20">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {contact.message}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(contact.message, 'Message')}
              className="mt-2 h-8 text-xs"
            >
              Copy Message
            </Button>
          </div>

          {/* Actions */}
          <Separator />
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Contact submitted {formatDate(contact.created_at)}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(contact.email, 'Email')}
              >
                Copy Email
              </Button>
              <Button
                onClick={() => window.open(`mailto:${contact.email}?subject=Re: ${contact.subject}`)}
              >
                <Mail className="h-4 w-4 mr-2" />
                Reply via Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
