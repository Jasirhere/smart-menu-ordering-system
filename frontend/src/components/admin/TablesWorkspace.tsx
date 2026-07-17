"use client";

import { useState } from "react";

import ExistingTables from "@/components/admin/ExistingTables";
import TableQrGenerator from "@/components/admin/TableQrGenerator";

export default function TablesWorkspace() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <section className="mt-10 grid gap-6 lg:grid-cols-[380px_1fr]">
      <TableQrGenerator
        onTableCreated={() => {
          setRefreshKey((currentKey) => currentKey + 1);
        }}
      />

      <ExistingTables refreshKey={refreshKey} />
    </section>
  );
}