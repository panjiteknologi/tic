"use client";

import { Dispatch, SetStateAction } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ISCCProjectFormData = {
  name: string;
  description: string;
  productType: 'biodiesel' | 'bioethanol' | 'biomass' | 'biomethane' | 'bio_jet_fuel' | 'other';
  feedstockType: 'palm_oil' | 'corn' | 'sugarcane' | 'used_cooking_oil' | 'wheat' | 'rapeseed' | 'soybean' | 'waste' | 'other';
  productionVolume: string;
  lhv: string;
  lhvUnit: 'MJ/kg' | 'MJ/liter';
};

interface ISCCProjectDialogFormProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  formData: ISCCProjectFormData;
  setFormData: Dispatch<SetStateAction<ISCCProjectFormData>>;
  handleAdd: () => void;
  isCreating: boolean;
  error: any;
  editMode: boolean;
}

const productTypeOptions = [
  { value: 'biodiesel', label: 'Biodiesel' },
  { value: 'bioethanol', label: 'Bioethanol' },
  { value: 'biomass', label: 'Biomass' },
  { value: 'biomethane', label: 'Biomethane' },
  { value: 'bio_jet_fuel', label: 'Bio Jet Fuel' },
  { value: 'other', label: 'Lainnya' },
];

const feedstockTypeOptions = [
  { value: 'palm_oil', label: 'Minyak Kelapa Sawit' },
  { value: 'corn', label: 'Jagung' },
  { value: 'sugarcane', label: 'Tebu' },
  { value: 'used_cooking_oil', label: 'Minyak Jelantah' },
  { value: 'wheat', label: 'Gandum' },
  { value: 'rapeseed', label: 'Rapeseed' },
  { value: 'soybean', label: 'Kedelai' },
  { value: 'waste', label: 'Limbah' },
  { value: 'other', label: 'Lainnya' },
];

export function ISCCProjectDialogForm({
  open,
  setOpen,
  formData,
  setFormData,
  handleAdd,
  isCreating,
  error,
  editMode,
}: ISCCProjectDialogFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAdd();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      productType: 'biodiesel',
      feedstockType: 'palm_oil',
      productionVolume: "",
      lhv: "",
      lhvUnit: 'MJ/kg',
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
              {editMode ? "Edit Project ISCC" : "Tambah Project ISCC Baru"}
            </DialogTitle>
            <DialogDescription>
              {editMode
                ? "Perbarui informasi project ISCC"
                : "Buat project ISCC baru untuk analisis emisi karbon"}
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
                <Label htmlFor="productType">
                  Tipe Produk <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.productType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, productType: value as ISCCProjectFormData['productType'] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe produk" />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="feedstockType">
                  Tipe Feedstock <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.feedstockType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, feedstockType: value as ISCCProjectFormData['feedstockType'] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe feedstock" />
                  </SelectTrigger>
                  <SelectContent>
                    {feedstockTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="productionVolume">Volume Produksi (ton/tahun)</Label>
                <Input
                  id="productionVolume"
                  type="number"
                  step="0.01"
                  placeholder="Contoh: 1000"
                  value={formData.productionVolume}
                  onChange={(e) =>
                    setFormData({ ...formData, productionVolume: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="lhv">LHV (Lower Heating Value)</Label>
                <Input
                  id="lhv"
                  type="number"
                  step="0.0001"
                  placeholder="Contoh: 37.5"
                  value={formData.lhv}
                  onChange={(e) =>
                    setFormData({ ...formData, lhv: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lhvUnit">Unit LHV</Label>
              <Select
                value={formData.lhvUnit}
                onValueChange={(value) =>
                  setFormData({ ...formData, lhvUnit: value as 'MJ/kg' | 'MJ/liter' })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MJ/kg">MJ/kg</SelectItem>
                  <SelectItem value="MJ/liter">MJ/liter</SelectItem>
                </SelectContent>
              </Select>
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
            <Button type="submit" disabled={isCreating || !formData.name.trim() || !formData.productType || !formData.feedstockType}>
              {isCreating
                ? editMode
                  ? "Memperbarui..."
                  : "Membuat..."
                : editMode
                ? "Perbarui"
                : "Buat Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

