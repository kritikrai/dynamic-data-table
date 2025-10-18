'use client';
import dynamic from 'next/dynamic';

const DataTable = dynamic(() => import('../components/DataTable'), { ssr: false });

export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Dynamic Data Table Manager</h1>
      <DataTable />
    </main>
  );
}
