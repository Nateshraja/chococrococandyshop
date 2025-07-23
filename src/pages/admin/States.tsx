// admin/pages/States.tsx
"use client"
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function StatesPage() {
  const [states, setStates] = useState([]);
  const [name, setName] = useState("");
  const [charge, setCharge] = useState("");
  const [editId, setEditId] = useState(null);

  const fetchStates = async () => {
    const { data } = await supabase.from("states").select("*");
    setStates(data);
  };

  useEffect(() => {
    fetchStates();
  }, []);

  const handleSubmit = async () => {
    if (!name || !charge) return;
    if (editId) {
      await supabase.from("states").update({ name, delivery_charge: charge }).eq("id", editId);
    } else {
      await supabase.from("states").insert({ name, delivery_charge: charge });
    }
    setName(""); setCharge(""); setEditId(null);
    fetchStates();
  };

  const handleEdit = (state) => {
    setName(state.name);
    setCharge(state.delivery_charge);
    setEditId(state.id);
  };

  const handleDelete = async (id) => {
    await supabase.from("states").delete().eq("id", id);
    fetchStates();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4 font-semibold">Manage States</h2>
      <div className="flex gap-2 mb-4">
        <Input placeholder="State Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Delivery Charge" value={charge} onChange={(e) => setCharge(e.target.value)} />
        <Button onClick={handleSubmit}>{editId ? "Update" : "Add"}</Button>
      </div>
      <table className="w-full border">
        <thead>
          <tr><th>State</th><th>Charge</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {states.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.delivery_charge}</td>
              <td>
                <Button onClick={() => handleEdit(s)}>Edit</Button>
                <Button variant="destructive" onClick={() => handleDelete(s.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
