'use client';

import { Dispatch, SetStateAction } from 'react';
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

type GHGProtocolProjectFormData = {
  name: string;
  description: string;
  organizationName: string;
  location: string;
  reportingPeriodStart: Date;
  reportingPeriodEnd: Date;
  reportingYear: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  boundaryType: 'operational' | 'financial' | 'other';
  standardVersion: string;
};

interface GHGProtocolProjectDialogFormProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  formData: GHGProtocolProjectFormData;
  setFormData: Dispatch<SetStateAction<GHGProtocolProjectFormData>>;
  handleAdd: () => void;
  isCreating: boolean;
  error: any;
  editMode: boolean;
}

export function GHGProtocolProjectDialogForm({
  open,
  setOpen,
  formData,
  setFormData,
  handleAdd,
  isCreating,
  error,
  editMode
}: GHGProtocolProjectDialogFormProps) {
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
      location: '',
      reportingPeriodStart: startOfYear,
      reportingPeriodEnd: endOfYear,
      reportingYear: '2024',
      status: 'draft',
      boundaryType: 'operational',
      standardVersion: 'GHG Protocol Corporate Standard'
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
              {editMode
                ? 'Edit Project GHG Protocol'
                : 'Tambah Project GHG Protocol Baru'}
            </DialogTitle>
            <DialogDescription>
              {editMode
                ? 'Perbarui informasi project GHG Protocol'
                : 'Buat project GHG Protocol baru untuk inventaris emisi gas rumah kaca organisasi'}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="organizationName">Nama Organisasi</Label>
                <Input
                  id="organizationName"
                  placeholder="Nama organisasi"
                  value={formData.organizationName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      organizationName: e.target.value
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Lokasi</Label>
                <Input
                  id="location"
                  placeholder="Lokasi project"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
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
            </div>

            <div className="grid gap-2">
              <Label htmlFor="standardVersion">Versi Standar</Label>
              <Input
                id="standardVersion"
                type="text"
                value={formData.standardVersion}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    standardVersion: e.target.value
                  })
                }
                placeholder="GHG Protocol Corporate Standard"
              />
            </div>

            {/* Hidden field untuk reportingYear - default 2024 */}
            <input
              type="hidden"
              value={formData.reportingYear}
              onChange={() => {}}
            />

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
