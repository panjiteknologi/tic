"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface DialogInfoProps {
  open: boolean;
  title: string;
  description: string;
  variant?: "success" | "error" | "info";
  onOpenChange: (open: boolean) => void;
  onClose?: () => void;
}

export function DialogInfo({
  open,
  title,
  description,
  variant = "info",
  onOpenChange,
  onClose,
}: DialogInfoProps) {
  const iconStyle = "w-12 h-12";
  const iconMap = {
    success: (
      <div className="bg-green-100 rounded-full p-3 flex items-center justify-center mt-6 cursor-pointer">
        <CheckCircle className={cn(iconStyle, "text-green-600")} />
      </div>
    ),
    error: (
      <div className="bg-red-100 rounded-full p-3 flex items-center justify-center mt-6 cursor-pointer">
        <AlertTriangle className={cn(iconStyle, "text-red-600")} />
      </div>
    ),
    info: (
      <div className="bg-blue-100 rounded-full p-3 flex items-center justify-center mt-6 cursor-pointer">
        <Info className={cn(iconStyle, "text-blue-600")} />
      </div>
    ),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm space-y-4 text-center flex flex-col items-center justify-center max-h-[80vh] overflow-y-auto">
        {iconMap[variant]}
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-semibold text-center">
            {title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center whitespace-pre-line">
            {description}
          </p>
        </DialogHeader>
        <Button onClick={onClose}>Tutup</Button>
      </DialogContent>
    </Dialog>
  );
}
