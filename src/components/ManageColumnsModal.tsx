'use client'
import React, { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Checkbox, FormControlLabel, TextField, Stack } from '@mui/material'

export default function ManageColumnsModal({ open, onClose, columns, onToggle, onAdd, onDelete }: any) {
  const [key, setKey] = useState('');
  const [label, setLabel] = useState('');

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Manage Columns</DialogTitle>
      <DialogContent>
        {columns.map((c: any) => (
          <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FormControlLabel
              control={<Checkbox checked={c.visible} onChange={() => onToggle(c.key)} />}
              label={`${c.label} (${c.key})`}
            />
            <Button color="error" size="small" onClick={() => onDelete(c.key)}>
              Delete
            </Button>
          </div>
        ))}
        <Stack direction="row" spacing={1} mt={2}>
          <TextField size="small" placeholder="key (no spaces)" value={key} onChange={(e) => setKey(e.target.value)} />
          <TextField size="small" placeholder="label" value={label} onChange={(e) => setLabel(e.target.value)} />
          <Button onClick={() => { if (key && label) { onAdd({ key, label }); setKey(''); setLabel(''); } }}>
            Add Column
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
