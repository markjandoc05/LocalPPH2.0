"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useAuth } from "@/lib/auth/AuthContext";

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

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
      const res = await fetch('/api/admin/directory/categories', {
          method: 'POST',
          body: JSON.stringify({ action: 'list' }),
          headers
      });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchData();
    }
  }, [user]);

  const handleSubmit = async () => {
    const action = editingCategory ? 'update' : 'create';
    const data = editingCategory ? { ...formData, id: editingCategory.id } : formData;
    try {
      const headers = await getHeaders();
      await fetch('/api/admin/directory/categories', {
          method: 'POST',
          body: JSON.stringify({ action, data }),
          headers
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Failed to submit category:", err);
    }
  };

  const toggleStatus = async (id: string, status: boolean) => {
    try {
      const headers = await getHeaders();
      await fetch('/api/admin/directory/categories', {
          method: 'POST',
          body: JSON.stringify({ action: 'toggle-status', data: { id, status } }),
          headers
      });
      fetchData();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={() => { setEditingCategory(null); setFormData({ name: '', description: '' }); setIsModalOpen(true); }}>Add New Category</Button>
      </div>
      
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.slug}</TableCell>
                  <TableCell>
                      <Badge variant={c.status ? 'default' : 'danger'}>{c.status ? 'Active' : 'Inactive'}</Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingCategory(c); setFormData({ name: c.name, description: c.description || '' }); setIsModalOpen(true); }}>Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleStatus(c.id, !c.status)}>{c.status ? 'Deactivate' : 'Activate'}</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCategory ? 'Edit Category' : 'Add Category'} footer={<Button onClick={handleSubmit}>Save</Button>}>
          <div className="space-y-4">
              <label className="text-sm font-medium">Name</label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <label className="text-sm font-medium">Description</label>
              <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>
      </Modal>
    </div>
  );
}
