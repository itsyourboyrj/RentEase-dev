"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataFilter } from "@/components/shared/data-filter";
import { AddTenantModal } from "./add-tenant-modal";
import { TenantCard } from "./tenant-card";
import { BoutiqueEmptyState } from "@/components/shared/empty-state";
import { Loader2, Users } from "lucide-react";

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("Active");

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        const [buildingsRes, tenantsRes] = await Promise.all([
          supabase.from("buildings").select("id, name"),
          supabase.from("tenants").select(`*, flats (*, buildings (*))`).order("created_at", { ascending: false }),
        ]);

        if (buildingsRes.error) {
          console.error("Failed to load buildings:", buildingsRes.error.message);
        } else {
          setBuildings(buildingsRes.data || []);
        }

        if (tenantsRes.error) {
          console.error("Failed to load tenants:", tenantsRes.error.message);
        } else {
          setTenants(tenantsRes.data || []);
        }
      } catch (err) {
        console.error("Unexpected error loading data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredTenants = tenants.filter(t => {
    const safeName = (t.name ?? "").toLowerCase();
    const safePhone = t.phone ?? "";
    const safeFlatCode = (t.flats?.flat_code ?? "").toLowerCase();
    const searchLower = (search ?? "").toLowerCase();
    const matchesSearch =
      safeName.includes(searchLower) ||
      safePhone.includes(search) ||
      safeFlatCode.includes(searchLower);
    const matchesBuilding = buildingFilter === "all" || t.flats?.building_id === buildingFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "Active" ? (t.is_active ?? false) : !(t.is_active ?? false));
    return matchesSearch && matchesBuilding && matchesStatus;
  });

  if (loading) return (
    <div className="p-20 flex justify-center">
      <Loader2 className="animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Tenants</h1>
          <p className="text-muted-foreground">Detailed resident directory</p>
        </div>
        <AddTenantModal buildings={buildings} vacantFlats={[]} />
      </div>

      <DataFilter
        searchPlaceholder="Search by name, phone or flat..."
        searchValue={search}
        onSearchChange={setSearch}
        buildings={buildings}
        selectedBuilding={buildingFilter}
        onBuildingChange={setBuildingFilter}
        statusOptions={["Active", "Checked Out"]}
        selectedStatus={statusFilter}
        onStatusChange={setStatusFilter}
        onClear={() => { setSearch(""); setBuildingFilter("all"); setStatusFilter("Active"); }}
      />

      {tenants.length === 0 ? (
        <BoutiqueEmptyState
          icon={Users}
          title="Your Tenant List is Empty"
          description="Once you have buildings and flats, you can onboard your first tenant here."
        />
      ) : filteredTenants.length === 0 ? (
        <div className="text-center py-20 text-slate-500 font-medium">No tenants match your filters.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenants.map(tenant => (
            <TenantCard key={tenant.id} tenant={tenant} />
          ))}
        </div>
      )}
    </div>
  );
}
