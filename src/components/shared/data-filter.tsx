"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DataFilter({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  buildings,
  selectedBuilding,
  onBuildingChange,
  statusOptions,
  selectedStatus,
  onStatusChange,
  onClear
}: any) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-11 bg-card border-none shadow-sm rounded-xl"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={selectedBuilding} onValueChange={onBuildingChange}>
          <SelectTrigger className="w-[160px] h-11 bg-card border-none shadow-sm rounded-xl">
            <SelectValue placeholder="All Buildings" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Buildings</SelectItem>
            {buildings?.map((b: any) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {statusOptions && (
          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[140px] h-11 bg-card border-none shadow-sm rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statusOptions.map((opt: any) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button variant="ghost" onClick={onClear} className="h-11 px-3 rounded-xl text-muted-foreground" aria-label="Clear filters">
          <FilterX className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
