import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useInquiries } from '@/hooks/useInquiries'; // Fixed typo: useInquires -> useInquiries

export const InquiriesPage: React.FC = () => {
  const { inquiries, loading, error, updateInquiryStatus } = useInquiries();
  const [filterType, setFilterType] = useState<'All' | 'Become Seller' | 'Other' | 'Complaint'>('All');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'All' | 'Pending' | 'Solved with Success' | 'Solved with Fail' | 'Discussion'
  >('All');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesType = filterType === 'All' || inquiry.messageType === filterType;
    const matchesDate = filterDate
      ? format(new Date(inquiry.createdAt), 'yyyy-MM-dd') === filterDate
      : true;
    const matchesStatus = filterStatus === 'All' || inquiry.status === filterStatus;
    return matchesType && matchesDate && matchesStatus;
  });

  const handleStatusChange = async (
    inquiryId: string,
    newStatus: 'Pending' | 'Solved with Success' | 'Solved with Fail' | 'Discussion'
  ) => {
    const validStatuses = ['Pending', 'Solved with Success', 'Solved with Fail', 'Discussion'] as const;
    if (!validStatuses.includes(newStatus)) {
      toast.error('Invalid status selected');
      return;
    }

    setIsUpdating(inquiryId);
    try {
      await updateInquiryStatus(inquiryId, newStatus);
      toast.success('Inquiry status updated successfully');
    } catch (err: any) {
      toast.error(`Failed to update status: ${err.message}`);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleFilterTypeChange = (value: string) => {
    setFilterType(value as 'All' | 'Become Seller' | 'Other' | 'Complaint');
  };

  const handleFilterStatusChange = (value: string) => {
    setFilterStatus(value as 'All' | 'Pending' | 'Solved with Success' | 'Solved with Fail' | 'Discussion');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <p>Loading inquiries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Inquiries</h2>
        <p className="text-muted-foreground">
          Manage customer inquiries, update statuses, and filter by type, date, or status.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inquiry Filters</CardTitle>
          <CardDescription>Filter inquiries by type, date, or status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="space-y-2 flex-1">
              <label htmlFor="filterType" className="text-sm font-medium">
                Inquiry Type
              </label>
              <Select value={filterType} onValueChange={handleFilterTypeChange}>
                <SelectTrigger id="filterType">
                  <SelectValue placeholder="Select inquiry type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Become Seller">Become Seller</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Complaint">Complaint</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex-1">
              <label htmlFor="filterDate" className="text-sm font-medium">
                Date
              </label>
              <Input
                id="filterDate"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
            <div className="space-y-2 flex-1">
              <label htmlFor="filterStatus" className="text-sm font-medium">
                Status
              </label>
              <Select value={filterStatus} onValueChange={handleFilterStatusChange}>
                <SelectTrigger id="filterStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Solved with Success">Solved with Success</SelectItem>
                  <SelectItem value="Solved with Fail">Solved with Fail</SelectItem>
                  <SelectItem value="Discussion">Discussion</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inquiry List</CardTitle>
          <CardDescription>View and manage all inquiries.</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredInquiries.length === 0 ? (
            <p className="text-muted-foreground">No inquiries found.</p>
          ) : (
            <div className="space-y-4">
              {filteredInquiries.map((inquiry) => (
                <Card key={inquiry.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p>
                        <strong>Name:</strong> {inquiry.name}
                      </p>
                      <p>
                        <strong>Email:</strong> {inquiry.email}
                      </p>
                      <p>
                        <strong>Mobile:</strong> {inquiry.mobile}
                      </p>
                      <p>
                        <strong>Type:</strong> {inquiry.messageType}
                      </p>
                      <p>
                        <strong>Date:</strong>{' '}
                        {format(new Date(inquiry.createdAt), 'PPp')}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Message:</strong> {inquiry.message}
                      </p>
                      <div className="mt-2">
                        <label htmlFor={`status-${inquiry.id}`} className="text-sm font-medium">
                          Status
                        </label>
                        <Select
                          value={inquiry.status || 'Pending'}
                          onValueChange={(value) =>
                            handleStatusChange(
                              inquiry.id,
                              value as 'Pending' | 'Solved with Success' | 'Solved with Fail' | 'Discussion'
                            )
                          }
                          disabled={isUpdating === inquiry.id}
                        >
                          <SelectTrigger id={`status-${inquiry.id}`}>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Solved with Success">Solved with Success</SelectItem>
                            <SelectItem value="Solved with Fail">Solved with Fail</SelectItem>
                            <SelectItem value="Discussion">Discussion</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};