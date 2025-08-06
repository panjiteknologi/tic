"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";

type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  handleAdd: () => void;
  isCreating: boolean;
  error?: boolean;
  editMode: boolean;
};

export function ProjectDialogForm({
  open,
  setOpen,
  name,
  setName,
  handleAdd,
  isCreating,
  error,
  editMode,
}: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) {
          setName("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>{"Add Project"}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editMode ? "Edit Project" : "Add New Project"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Enter project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button onClick={handleAdd} disabled={!name.trim() || isCreating}>
            {isCreating
              ? editMode
                ? "Saving..."
                : "Creating..."
              : editMode
              ? "Save Changes"
              : "Create Project"}
          </Button>
          {error && (
            <p className="text-sm text-red-500">
              {editMode
                ? "Failed to update project."
                : "Failed to add project."}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
