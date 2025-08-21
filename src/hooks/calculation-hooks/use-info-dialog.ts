import { useState } from "react";

type Variant = "success" | "error" | "info";

export function useInfoDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [variant, setVariant] = useState<Variant>("info");

  const show = (v: Variant, t: string, d: string) => {
    setVariant(v);
    setTitle(t);
    setDesc(d);
    setOpen(true);
  };

  const hide = () => setOpen(false);

  return { open, setOpen, title, desc, variant, show, hide };
}
