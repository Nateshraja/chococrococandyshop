import { useState, useEffect } from "react";
import { supabase } from "../../supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  Users,
  DollarSign,
  Gift,
  LogOut,
  ExternalLink,
  FileSpreadsheet,
  Image
} from "lucide-react";
import { Link } from "react-router-dom";
import * as XLSX from 'xlsx';

interface CustomRequest {
  id: string;
  orderid: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  chocolateType: string;
  quantity: number;
  estimatedCost: number;
  purpose: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  createdAt: string;
  uploadedImageUrl?: string;
  remarks?: string;
}

const AdminDashboard = () => {
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<CustomRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<CustomRequest | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fetch orders from Supabase
  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          orderid,
          customer_name,
          customer_email,
          customer_phone,
          chocolate_type,
          quantity,
          total_amount,
          purpose,
          remarks,
          image_url,
          status,
          created_at
        `)
        .order("created_at", { ascending: false });
      console.log("Fetched orders:", data);
      if (error) {
        // Optionally handle error (toast, etc.)
        setRequests([]);
        setFilteredRequests([]);
        return;
      }

      // Map Supabase data to CustomRequest interface
      const mapped = (data || []).map((order: any) => ({
        id: order.id,
        orderid: order.orderid,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        chocolateType: order.chocolate_type,
        quantity: order.quantity,
        estimatedCost: order.total_amount,
        purpose: order.purpose,
        status: order.status || "Pending",
        createdAt: order.created_at,
        uploadedImageUrl: order.image_url,
        remarks: order.remarks,
      }));
      setRequests(mapped);
      setFilteredRequests(mapped);
    };

    fetchOrders();
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = requests;

    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.orderid && request.orderid.toLowerCase().includes(searchTerm.toLowerCase())) ||
        request.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
  }, [requests, searchTerm, statusFilter]);

  const downloadExcel = () => {
    const excelData = filteredRequests.map(request => ({
      'Order ID': request.orderid,
      'Customer Name': request.customerName,
      'Customer Email': request.customerEmail,
      'Customer Phone': request.customerPhone,
      'Chocolate Type': request.chocolateType,
      'Quantity': request.quantity,
      'Estimated Cost': `$${request.estimatedCost}`,
      'Purpose': request.purpose,
      'Status': request.status,
      'Date': new Date(request.createdAt).toLocaleDateString(),
      'Remarks': request.remarks || 'No special instructions'
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    
    // Auto-adjust column widths
    const colWidths = Object.keys(excelData[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    ws['!cols'] = colWidths;
    
    XLSX.writeFile(wb, `choco-wrap-orders-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const downloadRequest = (request: CustomRequest) => {
    const requestData = {
      orderId: request.orderid,
      customerDetails: {
        name: request.customerName,
        email: request.customerEmail,
        phone: request.customerPhone
      },
      orderDetails: {
        chocolateType: request.chocolateType,
        quantity: request.quantity,
        estimatedCost: request.estimatedCost,
        purpose: request.purpose,
        remarks: request.remarks || 'No special instructions'
      },
      orderDate: new Date(request.createdAt).toLocaleDateString(),
      status: request.status
    };

    const dataStr = JSON.stringify(requestData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `order-${request.orderid}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadImage = async (imageUrl: string, orderId: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get file extension from URL or default to jpg
      const urlParts = imageUrl.split('.');
      const extension = urlParts.length > 1 ? urlParts[urlParts.length - 1].split('?')[0] : 'jpg';
      
      link.download = `order-${orderId}-image.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Processing: "bg-blue-100 text-blue-800 border-blue-200",
      Completed: "bg-green-100 text-green-800 border-green-200",
      Cancelled: "bg-red-100 text-red-800 border-red-200"
    };
    return variants[status as keyof typeof variants] || variants.Pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="w-4 h-4" />;
      case 'Processing': return <Package className="w-4 h-4" />;
      case 'Completed': return <CheckCircle className="w-4 h-4" />;
      case 'Cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const updateRequestStatus = async (id: string, newStatus: string) => {
    setRequests(prev => prev.map(request => 
      request.id === id ? { ...request, status: newStatus as any } : request
    ));
    await supabase.from("orders").update({ status: newStatus }).eq("id", id);
  };

  const calculateStats = () => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'Pending').length;
    const processing = requests.filter(r => r.status === 'Processing').length;
    const completed = requests.filter(r => r.status === 'Completed').length;
    const totalRevenue = requests
      .filter(r => r.status === 'Completed')
      .reduce((sum, r) => sum + r.estimatedCost, 0);
    
    return { total, pending, processing, completed, totalRevenue };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage ChocoWrap customization requests</p>
          </div>
          <div className="flex space-x-3">
            <Link to="/">
              <Button variant="outline" className="flex items-center space-x-2">
                <ExternalLink className="w-4 h-4" />
                <span>Visit Site</span>
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="flex items-center space-x-2">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Processing</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-green-600">${stats.totalRevenue}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by customer name, email, or order ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={downloadExcel} className="flex items-center space-x-2 bg-green-600 hover:bg-green-700">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export to Excel</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gift className="w-5 h-5" />
              <span>Customization Requests ({filteredRequests.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-3 font-semibold">Order ID</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Product</th>
                    <th className="pb-3 font-semibold">Image</th>
                    <th className="pb-3 font-semibold">Quantity</th>
                    <th className="pb-3 font-semibold">Cost</th>
                    <th className="pb-3 font-semibold">Purpose</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 font-mono text-sm">{request.orderid}</td>
                      <td className="py-4">
                        <div>
                          <div className="font-medium">{request.customerName}</div>
                          <div className="text-sm text-gray-500">{request.customerEmail}</div>
                        </div>
                      </td>
                      <td className="py-4">{request.chocolateType}</td>
                      <td className="py-4">
                        {request.uploadedImageUrl ? (
                          <div className="flex items-center space-x-2">
                            <img 
                              src={request.uploadedImageUrl} 
                              alt="Product preview"
                              className="w-12 h-12 rounded object-cover cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setPreviewImage(request.uploadedImageUrl!)}
                            />
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setPreviewImage(request.uploadedImageUrl!)}
                                className="p-1"
                                title="View full size"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => downloadImage(request.uploadedImageUrl!, request.orderid)}
                                className="p-1"
                                title="Download image"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-400">
                            <Image className="w-4 h-4 mr-1" />
                            <span className="text-sm">No image</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4">{request.quantity}</td>
                      <td className="py-4 font-semibold">${request.estimatedCost}</td>
                      <td className="py-4">{request.purpose}</td>
                      <td className="py-4">
                        <Badge className={getStatusBadge(request.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(request.status)}
                            <span>{request.status}</span>
                          </div>
                        </Badge>
                      </td>
                      <td className="py-4 text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadRequest(request)}
                            title="Download Request"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Select
                            value={request.status}
                            onValueChange={(value) => updateRequestStatus(request.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Processing">Processing</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRequests.length === 0 && (
              <div className="text-center py-12">
                <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No requests found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Image Preview Modal */}
        {previewImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="max-w-4xl max-h-[90vh] relative">
              <Button 
                variant="ghost" 
                onClick={() => setPreviewImage(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300"
              >
                ✕ Close
              </Button>
              <img 
                src={previewImage} 
                alt="Full size preview"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Request Detail Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Request Details - {selectedRequest.orderid}</CardTitle>
                  <Button variant="ghost" onClick={() => setSelectedRequest(null)}>
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Customer Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {selectedRequest.customerName}</p>
                      <p><strong>Email:</strong> {selectedRequest.customerEmail}</p>
                      <p><strong>Phone:</strong> {selectedRequest.customerPhone}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Order Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Product:</strong> {selectedRequest.chocolateType}</p>
                      <p><strong>Quantity:</strong> {selectedRequest.quantity}</p>
                      <p><strong>Purpose:</strong> {selectedRequest.purpose}</p>
                      <p><strong>Cost:</strong> ${selectedRequest.estimatedCost}</p>
                    </div>
                  </div>
                </div>

                {selectedRequest.remarks && (
                  <div>
                    <h4 className="font-semibold mb-2">Special Instructions</h4>
                    <p className="text-sm bg-gray-50 p-3 rounded">{selectedRequest.remarks}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button 
                    className="flex items-center space-x-2"
                    onClick={() => downloadRequest(selectedRequest)}
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Request</span>
                  </Button>
                  <Select
                    value={selectedRequest.status}
                    onValueChange={(value) => {
                      updateRequestStatus(selectedRequest.id, value);
                      setSelectedRequest({ ...selectedRequest, status: value as any });
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Processing">Processing</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
