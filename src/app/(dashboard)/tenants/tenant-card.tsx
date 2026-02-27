"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Home, Calendar, ArrowRight, UserCircle } from "lucide-react";
import Link from "next/link";

export function TenantCard({ tenant }: any) {
  return (
    <Card className="border-none shadow-md hover:shadow-xl transition-all group overflow-hidden bg-card/50 backdrop-blur-sm">
      <CardContent className="p-0">
        <div className="h-1.5 w-full bg-primary/20 group-hover:bg-primary transition-colors" />
        <div className="p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/10 shadow-inner">
                {tenant.profile_url ? (
                  <img src={tenant.profile_url} className="h-full w-full object-cover" alt={tenant.name} />
                ) : (
                  <UserCircle className="h-6 w-6 text-primary/40" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">{tenant.name}</h3>
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {tenant.phone}
                </p>
              </div>
            </div>
            <Badge variant={tenant.is_active ? "default" : "secondary"} className="text-[10px] rounded-lg px-2">
              {tenant.is_active ? "ACTIVE" : "OUT"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 py-3 border-y border-dashed border-muted">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Property</p>
              <p className="text-sm font-bold flex items-center gap-1">
                <Home className="h-3.5 w-3.5 text-primary" /> {tenant.flats?.flat_code}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Joined</p>
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
            className="w-full h-11 rounded-xl group-hover:bg-primary group-hover:text-white transition-all font-bold"
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
