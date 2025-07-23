import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_KEY!
);

const OrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [newOrder, setNewOrder] = useState<any>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    shipping_address: "",
    chocolate_type: "",
    chocolate_size: "",
    quantity: 1,
    purpose: "",
    custom_purpose: "",
    remarks: "",
    status: "Pending",
    order_image_url: "",
  });

  const [editMode, setEditMode] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setOrders(data);
  };

  const handleChange = (field: string, value: string) => {
    setNewOrder((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleAddOrUpdate = async () => {
    if (editMode) {
      await supabase.from("orders").update(newOrder).eq("id", editMode);
    } else {
      await supabase.from("orders").insert([newOrder]);
    }
    setNewOrder({
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      shipping_address: "",
      chocolate_type: "",
      chocolate_size: "",
      quantity: 1,
      purpose: "",
      custom_purpose: "",
      remarks: "",
      status: "Pending",
      order_image_url: "",
    });
    setEditMode(null);
    fetchOrders();
  };

  const handleEdit = (order: any) => {
    setNewOrder(order);
    setEditMode(order.id);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("orders").delete().eq("id", id);
    fetchOrders();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    fetchOrders();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Orders Management</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add New Order</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <h3 className="text-xl font-semibold mb-4">
              {editMode ? "Edit Order" : "Add New Order"}
            </h3>
            <div className="grid gap-3">
              <Input
                placeholder="Name"
                value={newOrder.customer_name}
                onChange={(e) => handleChange("customer_name", e.target.value)}
              />
              <Input
                placeholder="Email"
                value={newOrder.customer_email}
                onChange={(e) => handleChange("customer_email", e.target.value)}
              />
              <Input
                placeholder="Phone"
                value={newOrder.customer_phone}
                onChange={(e) => handleChange("customer_phone", e.target.value)}
              />
              <Textarea
                placeholder="Shipping Address"
                value={newOrder.shipping_address}
                onChange={(e) => handleChange("shipping_address", e.target.value)}
              />
              <Input
                placeholder="Chocolate Type"
                value={newOrder.chocolate_type}
                onChange={(e) => handleChange("chocolate_type", e.target.value)}
              />
              <Input
                placeholder="Size"
                value={newOrder.chocolate_size}
                onChange={(e) => handleChange("chocolate_size", e.target.value)}
              />
              <Input
                type="number"
                placeholder="Quantity"
                value={newOrder.quantity}
                onChange={(e) => handleChange("quantity", e.target.value)}
              />
              <Input
                placeholder="Purpose"
                value={newOrder.purpose}
                onChange={(e) => handleChange("purpose", e.target.value)}
              />
              {newOrder.purpose === "custom" && (
                <Input
                  placeholder="Custom Purpose"
                  value={newOrder.custom_purpose}
                  onChange={(e) => handleChange("custom_purpose", e.target.value)}
                />
              )}
              <Textarea
                placeholder="Remarks"
                value={newOrder.remarks}
                onChange={(e) => handleChange("remarks", e.target.value)}
              />
              <Button onClick={handleAddOrUpdate}>
                {editMode ? "Update" : "Add"} Order
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Order #{order.id}</CardTitle>
              <div className="space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(order)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(order.id)}>
                  Delete
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p><b>Name:</b> {order.customer_name}</p>
                <p><b>Email:</b> {order.customer_email}</p>
                <p><b>Phone:</b> {order.customer_phone}</p>
                <p><b>Address:</b> {order.shipping_address}</p>
                <p><b>Chocolates:</b> {order.chocolate_type} - {order.chocolate_size} (x{order.quantity})</p>
                <p><b>Purpose:</b> {order.purpose === 'custom' ? order.custom_purpose : order.purpose}</p>
                <p><b>Remarks:</b> {order.remarks}</p>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select defaultValue={order.status} onValueChange={(val) => handleStatusChange(order.id, val)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                {order.order_image_url && (
                  <div>
                    <Label>Uploaded Image</Label>
                    <img
                      src={order.order_image_url}
                      alt="Order"
                      className="w-full max-w-xs rounded border mt-2"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
