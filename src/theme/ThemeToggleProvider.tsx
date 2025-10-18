'use client'
import React, { createContext, useContext, useMemo, useState, ReactNode, useEffect } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { setTheme } from '../store/tableSlice'
import { CssBaseline, IconButton } from '@mui/material'
import { Brightness4, Brightness7 } from '@mui/icons-material'

const ToggleContext = createContext({ toggle: ()=>{} })

export default function ThemeToggleProvider({ children }: { children: ReactNode }) {
  const themeFromStore = useSelector((s: RootState) => s.table.theme)
  const dispatch = useDispatch()
  const theme = useMemo(() => createTheme({
    palette: {
      mode: themeFromStore === 'dark' ? 'dark' : 'light',
    }
  }), [themeFromStore])

  return (
    <ThemeProvider theme={theme}>
      <div style={{ padding: 8 }}>
        <IconButton onClick={() => dispatch(setTheme(themeFromStore === 'dark' ? 'light' : 'dark'))} size="small">
          {themeFromStore === 'dark' ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </div>
      {children}
    </ThemeProvider>
  )
}
