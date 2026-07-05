"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/lib/auth/AuthContext";

export default function RegionsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getHeaders = async (): Promise<Record<string, string>> => {
    if (!user) return { 'Content-Type': 'application/json' };
    const token = await user.getIdToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchData = async () => {
    if (!user) return;
    try {
      const headers = await getHeaders();
      const res = await fetch('/api/admin/directory/regions', {
          method: 'POST',
          body: JSON.stringify({ action: 'list' }),
          headers
      });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch regions:", err);
    }
  };

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchData();
    }
  }, [user]);

  const filteredItems = useMemo(() => {
      return items.filter(i => 
          (search === '' || i.name.toLowerCase().includes(search.toLowerCase())) &&
          (statusFilter === 'all' || (statusFilter === 'active' ? i.status : !i.status))
      );
  }, [items, search, statusFilter]);

  const handleSubmit = async () => {
    const action = editingItem ? 'update' : 'create';
    const data = editingItem ? { ...formData, id: editingItem.id } : formData;
    try {
      const headers = await getHeaders();
      await fetch('/api/admin/directory/regions', {
          method: 'POST',
          body: JSON.stringify({ action, data }),
          headers
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Failed to submit region:", err);
    }
  };

  const toggleStatus = async (id: string, status: boolean) => {
    try {
      const headers = await getHeaders();
      await fetch('/api/admin/directory/regions', {
          method: 'POST',
          body: JSON.stringify({ action: 'toggle-status', data: { id, status } }),
          headers
      });
      fetchData();
    } catch (err) {
      console.error("Failed to toggle region status:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Regions</h1>
        <Button onClick={() => { setEditingItem(null); setFormData({ name: '' }); setIsModalOpen(true); }}>Add New Region</Button>
      </div>
      
      <div className="flex gap-4">
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
          </Select>
      </div>
      
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>
                      <Badge variant={r.status ? 'default' : 'danger'}>{r.status ? 'Active' : 'Inactive'}</Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingItem(r); setFormData({ name: r.name }); setIsModalOpen(true); }}>Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleStatus(r.id, !r.status)}>{r.status ? 'Deactivate' : 'Activate'}</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Region' : 'Add Region'} footer={<Button onClick={handleSubmit}>Save</Button>}>
          <div className="space-y-4">
              <label className="text-sm font-medium">Name</label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
      </Modal>
    </div>
  );
}
