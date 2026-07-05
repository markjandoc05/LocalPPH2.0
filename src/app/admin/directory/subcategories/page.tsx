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

export default function SubcategoriesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', categoryId: '' });
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
      const res = await fetch('/api/admin/directory/subcategories', {
          method: 'POST',
          body: JSON.stringify({ action: 'list' }),
          headers
      });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);

      const catRes = await fetch('/api/admin/directory/categories', {
          method: 'POST',
          body: JSON.stringify({ action: 'options' }),
          headers
      });
      const catData = await catRes.json();
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (err) {
      console.error("Failed to fetch subcategories data:", err);
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
      await fetch('/api/admin/directory/subcategories', {
          method: 'POST',
          body: JSON.stringify({ action, data }),
          headers
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Failed to submit subcategory:", err);
    }
  };

  const toggleStatus = async (id: string, status: boolean) => {
    try {
      const headers = await getHeaders();
      await fetch('/api/admin/directory/subcategories', {
          method: 'POST',
          body: JSON.stringify({ action: 'toggle-status', data: { id, status } }),
          headers
      });
      fetchData();
    } catch (err) {
      console.error("Failed to toggle subcategory status:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Subcategories</h1>
        <Button onClick={() => { setEditingItem(null); setFormData({ name: '', categoryId: '' }); setIsModalOpen(true); }}>Add New Subcategory</Button>
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
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.categoryName}</TableCell>
                  <TableCell>
                      <Badge variant={s.status ? 'default' : 'danger'}>{s.status ? 'Active' : 'Inactive'}</Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingItem(s); setFormData({ name: s.name, categoryId: s.categoryId || '' }); setIsModalOpen(true); }}>Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleStatus(s.id, !s.status)}>{s.status ? 'Deactivate' : 'Activate'}</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Subcategory' : 'Add Subcategory'} footer={<Button onClick={handleSubmit}>Save</Button>}>
          <div className="space-y-4">
              <label className="text-sm font-medium">Name</label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <label className="text-sm font-medium">Category</label>
              <Select value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})}>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
          </div>
      </Modal>
    </div>
  );
}
