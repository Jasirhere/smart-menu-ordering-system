"use client";

import { useState } from "react";

import ExistingTables from "@/components/admin/ExistingTables";
import TableQrGenerator from "@/components/admin/TableQrGenerator";

export default function TablesWorkspace() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <section className="mt-10 flex w-full min-w-0 flex-col gap-6">
      <TableQrGenerator
        onTableCreated={() => {
          setRefreshKey((currentKey) => currentKey + 1);
        }}
      />

      <ExistingTables refreshKey={refreshKey} />
    </section>
  );
}