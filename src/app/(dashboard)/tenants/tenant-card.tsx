"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Home, Calendar, ArrowRight, UserCircle } from "lucide-react";
import Link from "next/link";
import { DeleteButton } from "@/components/shared/delete-button";

export function TenantCard({ tenant }: any) {
  return (
    <Card className="surface-card rounded-2xl shadow-sm transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg group overflow-hidden">
      <CardContent className="p-0">
        <div className="p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/10">
                {tenant.profile_url ? (
                  <img src={tenant.profile_url} className="h-full w-full object-cover" alt={tenant.name} />
                ) : (
                  <UserCircle className="h-6 w-6 text-primary/40" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-base leading-tight">{tenant.name}</h3>
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {tenant.phone}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant={tenant.is_active ? "default" : "secondary"} className="text-[10px] rounded-lg px-2">
                {tenant.is_active ? "ACTIVE" : "OUT"}
              </Badge>
              <DeleteButton table="tenants" id={tenant.id} label={tenant.name} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 py-3 border-y border-border">
            <div className="space-y-1">
              <p className="text-[11px] uppercase font-medium text-muted-foreground tracking-wide">Property</p>
              <p className="text-sm font-bold flex items-center gap-1">
                <Home className="h-3.5 w-3.5 text-primary" /> {tenant.flats?.flat_code}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] uppercase font-medium text-muted-foreground tracking-wide">Joined</p>
              <p className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {(() => {
                  const d = tenant.join_date ? new Date(tenant.join_date) : null;
                  return d && !isNaN(d.getTime()) ? d.toLocaleDateString('en-IN') : "—";
                })()}
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            className="w-full h-10 rounded-xl font-medium"
            asChild
          >
            <Link href={`/tenants/${tenant.id}`}>
              View Profile <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
