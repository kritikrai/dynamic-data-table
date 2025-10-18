'use client';
import '../styles/globals.css';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { CssBaseline } from '@mui/material';
import ThemeToggleProvider from '../theme/ThemeToggleProvider';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          <ThemeToggleProvider>
            <CssBaseline />
            {children}
          </ThemeToggleProvider>
        </Provider>
      </body>
    </html>
  );
}
