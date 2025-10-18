import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type Row = {
  id: string
  name: string
  email: string
  age: number
  role: string
  [key: string]: any
}

type TableState = {
  rows: Row[]
  columns: { key: string; label: string; visible: boolean }[]
  editing: { [id: string]: Partial<Row> }
  theme: 'light'|'dark'
}

const defaultColumns = [
  { key: 'name', label: 'Name', visible: true },
  { key: 'email', label: 'Email', visible: true },
  { key: 'age', label: 'Age', visible: true },
  { key: 'role', label: 'Role', visible: true }
]

// load from localStorage if available
const persisted = typeof window !== 'undefined' ? localStorage.getItem('ddtm_state') : null

const initialState: TableState = persisted
  ? JSON.parse(persisted)
  : {
      rows: [
        { id: '1', name: 'Alice Johnson', email: 'alice@example.com', age: 28, role: 'Developer' },
        { id: '2', name: 'Bob Smith', email: 'bob@example.com', age: 34, role: 'Designer' },
        { id: '3', name: 'Carol Davis', email: 'carol@example.com', age: 25, role: 'Product' }
      ],
      columns: defaultColumns,
      editing: {},
      theme: 'light'
    }

const slice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    setRows(state, action: PayloadAction<Row[]>) {
      state.rows = action.payload
    },
    addRow(state, action: PayloadAction<Row>) {
      state.rows.unshift(action.payload)
    },
    updateRow(state, action: PayloadAction<{ id: string; data: Partial<Row> }>) {
      const idx = state.rows.findIndex(r => r.id === action.payload.id)
      if (idx !== -1) {
        state.rows[idx] = { ...state.rows[idx], ...action.payload.data }
      }
    },
    deleteRow(state, action: PayloadAction<string>) {
      state.rows = state.rows.filter(r => r.id !== action.payload)
    },
    setColumns(state, action: PayloadAction<{ key: string; label: string; visible: boolean }[]>) {
      state.columns = action.payload
    },
    toggleColumn(state, action: PayloadAction<string>) {
      const col = state.columns.find(c => c.key === action.payload)
      if (col) col.visible = !col.visible
    },
    addColumn(state, action: PayloadAction<{ key: string; label: string }>) {
      state.columns.push({ ...action.payload, visible: true })
    },
   deleteColumn(state, action: PayloadAction<string>) {
  state.columns = state.columns.filter(c => c.key !== action.payload);
},
    setEditing(state, action: PayloadAction<{ id: string; data: Partial<Row> }>) {
      state.editing[action.payload.id] = action.payload.data
    },
    clearEditing(state) {
      state.editing = {}
    },
    applyAllEdits(state) {
      Object.keys(state.editing).forEach(id => {
        const idx = state.rows.findIndex(r => r.id === id)
        if (idx !== -1) {
          state.rows[idx] = { ...state.rows[idx], ...state.editing[id] }
        }
      })
      state.editing = {}
    },
    setTheme(state, action: PayloadAction<'light'|'dark'>) {
      state.theme = action.payload
    }
  }
})

export const {
  setRows, addRow, updateRow, deleteRow, setColumns,
  toggleColumn, addColumn, deleteColumn,
  setEditing, clearEditing, applyAllEdits, setTheme
} = slice.actions;

// persist on every change (simple)
export default function reducer(state = initialState, action: any) {
  const newState = (slice.reducer as any)(state, action)
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ddtm_state', JSON.stringify(newState))
    }
  } catch (e) {
    // ignore
  }
  return newState
}
