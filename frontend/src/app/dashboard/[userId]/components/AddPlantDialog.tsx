"use client";

import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Input,
  Label,
  Field,
} from "@fluentui/react-components";
import { LeafOneRegular } from "@fluentui/react-icons";
import { useState } from "react";

interface AddPlantDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, species: string) => void;
}

export default function AddPlantDialog({ open, onClose, onAdd }: AddPlantDialogProps) {
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), species.trim() || "Unknown");
    setName("");
    setSpecies("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(_, d) => { if (!d.open) onClose(); }}>
      <DialogSurface className="max-w-md!">
        <DialogBody>
          <DialogTitle className="flex items-center gap-2">
            <LeafOneRegular className="text-accent" />
            Add a New Plant
          </DialogTitle>

          <DialogContent className="flex flex-col gap-4 pt-4">
            <Field label={<Label weight="semibold">Plant Name</Label>} required>
              <Input
                placeholder="e.g. Bedroom Monstera"
                value={name}
                onChange={(_, d) => setName(d.value)}
                appearance="outline"
              />
            </Field>

            <Field label={<Label weight="semibold">Species</Label>}>
              <Input
                placeholder="e.g. Monstera Deliciosa"
                value={species}
                onChange={(_, d) => setSpecies(d.value)}
                appearance="outline"
              />
            </Field>
          </DialogContent>

          <DialogActions>
            <Button appearance="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button appearance="primary" onClick={handleSubmit} disabled={!name.trim()}>
              Add Plant
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
