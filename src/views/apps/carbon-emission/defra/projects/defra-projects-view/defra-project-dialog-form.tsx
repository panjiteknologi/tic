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
import { trpc } from '@/trpc/react';

type DEFRAProjectFormData = {
  name: string;
  description: string;
  organizationName: string;
  reportingPeriodStart: Date;
  reportingPeriodEnd: Date;
  defraYear: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
};

interface DEFRAProjectDialogFormProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  formData: DEFRAProjectFormData;
  setFormData: Dispatch<SetStateAction<DEFRAProjectFormData>>;
  handleAdd: () => void;
  isCreating: boolean;
  error: any;
  editMode: boolean;
}

export function DEFRAProjectDialogForm({
  open,
  setOpen,
  formData,
  setFormData,
  handleAdd,
  isCreating,
  error,
  editMode
}: DEFRAProjectDialogFormProps) {
  // Fetch available years from database
  const { data: availableYearsData, isLoading: yearsLoading } =
    trpc.defraEmissionFactors.getAvailableYears.useQuery(undefined, {
      enabled: open // Only fetch when dialog is open
    });

  const availableYears = availableYearsData?.years || [];
  const currentYear = new Date().getFullYear();

  // Set default year to first available year or current year
  useEffect(() => {
    if (!editMode && open && availableYears.length > 0) {
      // If form doesn't have a valid year, set it to first available year
      if (!formData.defraYear || !availableYears.includes(formData.defraYear)) {
        const defaultYear = availableYears[0] || currentYear.toString();
        setFormData((prev) => ({
          ...prev,
          defraYear: defaultYear
        }));
      }
    }
  }, [
    open,
    availableYears,
    editMode,
    formData.defraYear,
    currentYear,
    setFormData
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAdd();
  };

  const resetForm = () => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear(), 11, 31);

    // Use first available year or current year as default
    const defaultYear =
      availableYears.length > 0 ? availableYears[0] : currentYear.toString();

    setFormData({
      name: '',
      description: '',
      organizationName: '',
      reportingPeriodStart: startOfYear,
      reportingPeriodEnd: endOfYear,
      defraYear: defaultYear,
      status: 'draft'
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
              {editMode ? 'Edit Project DEFRA' : 'Tambah Project DEFRA Baru'}
            </DialogTitle>
            <DialogDescription>
              {editMode
                ? 'Perbarui informasi project DEFRA'
                : 'Buat project DEFRA baru untuk analisis emisi karbon'}
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
                <Label htmlFor="defraYear">
                  DEFRA Year <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.defraYear}
                  onValueChange={(value) =>
                    setFormData({ ...formData, defraYear: value })
                  }
                  disabled={yearsLoading || availableYears.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        yearsLoading
                          ? 'Memuat tahun...'
                          : availableYears.length === 0
                          ? 'Tidak ada data'
                          : 'Pilih tahun'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.length > 0 ? (
                      availableYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        {yearsLoading
                          ? 'Memuat...'
                          : 'Tidak ada tahun tersedia'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {availableYears.length === 0 && !yearsLoading && (
                  <p className="text-xs text-muted-foreground">
                    Belum ada emission factors. Silakan seed data terlebih
                    dahulu.
                  </p>
                )}
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
