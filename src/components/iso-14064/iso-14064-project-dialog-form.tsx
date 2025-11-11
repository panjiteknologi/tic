'use client';

import { Dispatch, SetStateAction, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

type ISO14064ProjectFormData = {
  name: string;
  description: string;
  organizationName: string;
  reportingPeriodStart: Date;
  reportingPeriodEnd: Date;
  reportingYear: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  boundaryType: 'operational' | 'financial' | 'other';
  standardVersion: string;
};

interface ISO14064ProjectDialogFormProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  formData: ISO14064ProjectFormData;
  setFormData: Dispatch<SetStateAction<ISO14064ProjectFormData>>;
  handleAdd: () => void;
  isCreating: boolean;
  error: any;
  editMode: boolean;
}

export function ISO14064ProjectDialogForm({
  open,
  setOpen,
  formData,
  setFormData,
  handleAdd,
  isCreating,
  error,
  editMode
}: ISO14064ProjectDialogFormProps) {
  const currentYear = new Date().getFullYear();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAdd();
  };

  const resetForm = () => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear(), 11, 31);

    setFormData({
      name: '',
      description: '',
      organizationName: '',
      reportingPeriodStart: startOfYear,
      reportingPeriodEnd: endOfYear,
      reportingYear: currentYear.toString(),
      status: 'draft',
      boundaryType: 'operational',
      standardVersion: '14064-1:2018'
    });
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen && !editMode) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Tambah Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editMode ? 'Edit Project ISO 14064-1:2018' : 'Tambah Project ISO 14064-1:2018 Baru'}
            </DialogTitle>
            <DialogDescription>
              {editMode
                ? 'Perbarui informasi project ISO 14064-1:2018'
                : 'Buat project ISO 14064-1:2018 baru untuk inventaris emisi gas rumah kaca organisasi'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Nama Project <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Masukkan nama project"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                placeholder="Masukkan deskripsi project (opsional)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="organizationName">Nama Organisasi</Label>
              <Input
                id="organizationName"
                placeholder="Nama organisasi"
                value={formData.organizationName}
                onChange={(e) =>
                  setFormData({ ...formData, organizationName: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="reportingPeriodStart">
                  Periode Mulai <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reportingPeriodStart"
                  type="date"
                  value={
                    formData.reportingPeriodStart instanceof Date
                      ? formData.reportingPeriodStart
                          .toISOString()
                          .split('T')[0]
                      : formData.reportingPeriodStart
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reportingPeriodStart: new Date(e.target.value)
                    })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="reportingPeriodEnd">
                  Periode Selesai <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reportingPeriodEnd"
                  type="date"
                  value={
                    formData.reportingPeriodEnd instanceof Date
                      ? formData.reportingPeriodEnd.toISOString().split('T')[0]
                      : formData.reportingPeriodEnd
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reportingPeriodEnd: new Date(e.target.value)
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="reportingYear">
                  Tahun Pelaporan <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reportingYear"
                  type="text"
                  placeholder="2024"
                  value={formData.reportingYear}
                  onChange={(e) =>
                    setFormData({ ...formData, reportingYear: e.target.value })
                  }
                  maxLength={4}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(
                    value: 'draft' | 'active' | 'completed' | 'archived'
                  ) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="boundaryType">Tipe Batas Organisasi</Label>
                <Select
                  value={formData.boundaryType}
                  onValueChange={(
                    value: 'operational' | 'financial' | 'other'
                  ) => setFormData({ ...formData, boundaryType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe batas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="standardVersion">Versi Standar</Label>
                <Input
                  id="standardVersion"
                  type="text"
                  value={formData.standardVersion}
                  onChange={(e) =>
                    setFormData({ ...formData, standardVersion: e.target.value })
                  }
                  placeholder="14064-1:2018"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error.message}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isCreating}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !formData.name.trim()}
            >
              {isCreating
                ? editMode
                  ? 'Memperbarui...'
                  : 'Membuat...'
                : editMode
                ? 'Perbarui'
                : 'Buat Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

