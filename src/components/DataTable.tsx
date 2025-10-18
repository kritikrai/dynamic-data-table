'use client'
import React, { useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import {
  Paper, Table, TableHead, TableRow, TableCell, TableBody, TablePagination,
  IconButton, TextField, Button, Stack, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material'
import { Delete, Edit, UploadFile, Download, ViewColumn } from '@mui/icons-material'
import { deleteRow, setRows, toggleColumn, addColumn, setEditing, clearEditing, applyAllEdits, updateRow, deleteColumn } from '../store/tableSlice'
import ManageColumnsModal from './ManageColumnsModal'
import Papa from 'papaparse'
import { saveAs } from 'file-saver'
import { useForm, Controller } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'

function visibleColumns(columns: { key: string; label: string; visible: boolean }[]) {
  return columns.filter(c => c.visible)
}

export default function DataTable() {
  const dispatch = useDispatch()
  const rows = useSelector((s: RootState) => s.table.rows)
  const columns = useSelector((s: RootState) => s.table.columns)
  const editing = useSelector((s: RootState) => s.table.editing)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage] = useState(10)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc')
  const [openManage, setOpenManage] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{open:boolean;id?:string}>({open:false})
  const [importError, setImportError] = useState<string|null>(null)

  const visibleCols = useMemo(() => visibleColumns(columns), [columns])

  // filtering
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()
    let out = rows.filter(r => {
      if (!s) return true
      return visibleCols.some(c => {
        const v = (r[c.key] ?? '').toString().toLowerCase()
        return v.includes(s)
      })
    })
    if (sortKey) {
      out = out.sort((a,b) => {
        const A = (a[sortKey] ?? '').toString().toLowerCase()
        const B = (b[sortKey] ?? '').toString().toLowerCase()
        if (A < B) return sortDir === 'asc' ? -1 : 1
        if (A > B) return sortDir === 'asc' ? 1 : -1
        return 0
      })
    }
    return out
  }, [rows, search, visibleCols, sortKey, sortDir])

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(s => s === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  // pagination slice
  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  // import CSV
  const onImport = (file?: File) => {
    if (!file) return
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        if (results.errors && results.errors.length) {
          setImportError(results.errors.map(e => e.message).join('; '))
          return
        }
        const parsed = results.data as any[]
        // validate basic format: must include name,email,age,role or at least some columns
        const normalized = parsed.map((r: any, i: number) => ({
          id: uuidv4(),
          name: r.name ?? r.Name ?? '',
          email: r.email ?? r.Email ?? '',
          age: Number(r.age ?? r.Age ?? 0) || 0,
          role: r.role ?? r.Role ?? '',
          ...r
        }))
        dispatch(setRows(normalized))
        setImportError(null)
      },
      error: (err) => {
        setImportError(String(err))
      }
    })
  }

  const onExport = () => {
    const visibleKeys = visibleCols.map(c=>c.key)
    const data = filtered.map(r=>{
      const o: any = {}
      visibleKeys.forEach(k=> o[k] = r[k])
      return o
    })
    const csv = Papa.unparse(data)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, 'export.csv')
  }

  // inline editing handlers
  const handleDoubleClick = (id: string, key: string) => {
    // prefill editing for row
    const row = rows.find(r=>r.id===id)
    if (!row) return
    dispatch(setEditing({ id, data: { [key]: row[key] } }))
  }

  const { control, handleSubmit, reset } = useForm()

  const onSaveAll = () => {
    dispatch(applyAllEdits())
  }
  const onCancelAll = () => {
    dispatch(clearEditing())
  }

  return (
    <Paper style={{ padding: 16 }}>
      <Stack direction="row" spacing={2} alignItems="center" style={{ marginBottom: 12 }}>
        <TextField size="small" placeholder="Global search..." value={search} onChange={e=>{ setSearch(e.target.value); setPage(0) }} />
        <Button variant="contained" startIcon={<ViewColumn />} onClick={()=>setOpenManage(true)}>Manage Columns</Button>
        <Button variant="outlined" component="label" startIcon={<UploadFile />}>
          Import CSV
          <input hidden type="file" accept=".csv" onChange={e=> onImport(e.target.files?.[0])} />
        </Button>
        <Button variant="outlined" startIcon={<Download />} onClick={onExport}>Export CSV</Button>
        <div style={{ flex: 1 }} />
        <Button color="primary" onClick={onSaveAll}>Save All</Button>
        <Button color="warning" onClick={onCancelAll}>Cancel All</Button>
      </Stack>

      {importError && <div style={{ color: 'red' }}>{importError}</div>}

      <Table size="small">
        <TableHead>
          <TableRow>
            {visibleCols.map(col=>(
              <TableCell key={col.key} onClick={()=>handleSort(col.key)} style={{ cursor: 'pointer' }}>
                {col.label}{sortKey===col.key ? (sortDir==='asc' ? ' ▲' : ' ▼') : ''}
              </TableCell>
            ))}
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.map(row=>(
            <TableRow key={row.id}>
              {visibleCols.map(col=>{
                const val = row[col.key]
                const isEditing = editing[row.id] && (editing[row.id][col.key] !== undefined)
                return (
                  <TableCell key={col.key} onDoubleClick={()=>handleDoubleClick(row.id, col.key)}>
                    {isEditing ? (
                      <input
                        value={editing[row.id][col.key]}
                        onChange={(e)=> dispatch(setEditing({ id: row.id, data: { ...editing[row.id], [col.key]: e.target.value } }))}
                      />
                    ) : String(val ?? '')}
                  </TableCell>
                )
              })}
              <TableCell>
                <Tooltip title="Edit"><IconButton size="small" onClick={()=>{
                  // simple inline edit toggle: prefill all fields into editing
                  const r = rows.find(x=>x.id===row.id)
                  if (r) dispatch(setEditing({ id: row.id, data: { ...r } }))
                }}><Edit /></IconButton></Tooltip>
                <Tooltip title="Delete"><IconButton size="small" onClick={()=> setConfirmDelete({open:true,id:row.id})}><Delete /></IconButton></Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        onPageChange={(e, p)=> setPage(p)}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10]}
      />

      <ManageColumnsModal
  open={openManage}
  onClose={() => setOpenManage(false)}
  columns={columns}
  onToggle={(key) => dispatch(toggleColumn(key))}
  onAdd={(payload) => dispatch(addColumn(payload))}
  onDelete={(key) => dispatch(deleteColumn(key))}
/>


      <Dialog open={confirmDelete.open} onClose={()=>setConfirmDelete({open:false})}>
        <DialogTitle>Confirm delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this row?</DialogContent>
        <DialogActions>
          <Button onClick={()=>setConfirmDelete({open:false})}>Cancel</Button>
          <Button color="error" onClick={()=>{
            if (confirmDelete.id) dispatch(deleteRow(confirmDelete.id))
            setConfirmDelete({open:false})
          }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
