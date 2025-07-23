// admin/pages/Reviews.tsx
"use client"
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    const { data } = await supabase.from("reviews").select("*");
    setReviews(data);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const toggleApproval = async (id, approved) => {
    await supabase.from("reviews").update({ approved: !approved }).eq("id", id);
    fetchReviews();
  };

  const deleteReview = async (id) => {
    await supabase.from("reviews").delete().eq("id", id);
    fetchReviews();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
      <table className="w-full border">
        <thead>
          <tr>
            <th>Name</th><th>Message</th><th>Rating</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r) => (
            <tr key={r.id}>
              <td>{r.customer_name}</td>
              <td>{r.message}</td>
              <td>{r.rating}</td>
              <td>{r.approved ? "Approved" : "Pending"}</td>
              <td>
                <Button onClick={() => toggleApproval(r.id, r.approved)}>
                  {r.approved ? "Unapprove" : "Approve"}
                </Button>
                <Button variant="destructive" onClick={() => deleteReview(r.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
