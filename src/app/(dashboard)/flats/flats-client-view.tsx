"use client";

import { useState } from "react";
import { FlatCard } from "./flat-card";
import { DataFilter } from "@/components/shared/data-filter";

function deriveFlatStatus(flat: any): string {
  return flat.status || (flat.tenants?.some((t: any) => t.is_active) ? "Occupied" : "Vacant");
}

export function FlatsClientView({ flats, buildings }: { flats: any[]; buildings: any[] }) {
  const [search, setSearch] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = flats.filter(flat => {
    const status = deriveFlatStatus(flat);
    const matchesSearch = (flat.flat_code ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesBuilding = buildingFilter === "all" || flat.building_id === buildingFilter;
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    return matchesSearch && matchesBuilding && matchesStatus;
  });

  return (
    <>
      {/* Summary Bar */}
      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold whitespace-nowrap">
          <div className="h-2 w-2 rounded-full bg-indigo-500" />
          {flats.filter(f => deriveFlatStatus(f) === "Occupied").length} Occupied
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold whitespace-nowrap">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          {flats.filter(f => deriveFlatStatus(f) === "Vacant").length} Vacant
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-xs font-bold whitespace-nowrap">
          <div className="h-2 w-2 rounded-full bg-amber-500" />
          {flats.filter(f => deriveFlatStatus(f) === "Booked").length} Booked
        </div>
      </div>

      <DataFilter
        searchPlaceholder="Search by flat code..."
        searchValue={search}
        onSearchChange={setSearch}
        buildings={buildings}
        selectedBuilding={buildingFilter}
        onBuildingChange={setBuildingFilter}
        statusOptions={["Occupied", "Vacant", "Booked"]}
        selectedStatus={statusFilter}
        onStatusChange={setStatusFilter}
        onClear={() => { setSearch(""); setBuildingFilter("all"); setStatusFilter("all"); }}
      />

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No flats match your filters.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((flat) => {
            const activeTenant = flat.tenants?.find((t: any) => t.is_active);
            return <FlatCard key={flat.id} flat={flat} tenant={activeTenant} />;
          })}
        </div>
      )}
    </>
  );
}
