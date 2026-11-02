"use client";

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 38,
    paddingHorizontal: 42,
    paddingBottom: 48,
    fontFamily: "Helvetica",
    fontSize: 8,
    color: "#172033",
    backgroundColor: "#FFFFFF",
  },
  brand: { color: "#2563EB", fontSize: 9, fontWeight: "bold", letterSpacing: 1.5 },
  title: { marginTop: 5, fontSize: 22, fontWeight: "bold" },
  month: { marginTop: 4, fontSize: 12, fontWeight: "bold", color: "#475569" },
  reportDate: { marginTop: 3, color: "#64748B", fontSize: 8 },
  divider: { marginTop: 12, marginBottom: 16, borderBottomWidth: 1.5, borderBottomColor: "#172033" },
  summary: { flexDirection: "row", gap: 8, marginBottom: 18 },
  summaryCard: { flexGrow: 1, flexBasis: 0, padding: 10, borderRadius: 5, backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0" },
  summaryLabel: { fontSize: 7, fontWeight: "bold", color: "#64748B", letterSpacing: 0.5 },
  summaryValue: { marginTop: 7, fontSize: 13, fontWeight: "bold" },
  summaryNote: { marginTop: 3, fontSize: 7, color: "#64748B" },
  pendingCard: { backgroundColor: "#FFF7F7", borderColor: "#FECACA" },
  pendingLabel: { color: "#B91C1C" },
  pendingValue: { color: "#B91C1C" },
  sectionTitle: { marginBottom: 7, fontSize: 11, fontWeight: "bold" },
  tableHeader: { flexDirection: "row", alignItems: "center", paddingVertical: 8, backgroundColor: "#F1F5F9", borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#CBD5E1" },
  tableHeaderText: { fontSize: 6.5, fontWeight: "bold", color: "#334155", textAlign: "right" },
  room: { width: "6%", textAlign: "left" },
  tenant: { width: "16%", textAlign: "left", paddingRight: 3 },
  reading: { width: "11%" },
  units: { width: "7%" },
  rate: { width: "7%" },
  electricity: { width: "12%" },
  rent: { width: "10%" },
  total: { width: "10%" },
  status: { width: "10%" },
  tableRow: { flexDirection: "row", alignItems: "center", paddingVertical: 7, borderBottomWidth: 0.5, borderBottomColor: "#E2E8F0" },
  shadedRow: { backgroundColor: "#F8FAFC" },
  cell: { fontSize: 6.5, textAlign: "right", color: "#1E293B" },
  roomValue: { fontWeight: "bold", textAlign: "left" },
  tenantValue: { textAlign: "left", paddingRight: 3 },
  totalValue: { fontWeight: "bold" },
  totalRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderTopWidth: 1.5, borderBottomWidth: 1.5, borderColor: "#172033", backgroundColor: "#F8FAFC" },
  rateNote: { marginTop: 7, color: "#64748B", fontSize: 7, fontStyle: "italic" },
  collectionStatus: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16, padding: 10, backgroundColor: "#FFF7ED", borderWidth: 1, borderColor: "#FED7AA", borderLeftWidth: 3, borderLeftColor: "#EA580C", borderRadius: 4 },
  collectionHeading: { marginBottom: 4, color: "#C2410C", fontSize: 8, fontWeight: "bold" },
  collectionText: { color: "#9A3412", fontSize: 7, lineHeight: 1.4 },
  dueBadge: { paddingVertical: 4, paddingHorizontal: 6, color: "#B91C1C", backgroundColor: "#FEE2E2", borderRadius: 3, fontSize: 7, fontWeight: "bold" },
  footer: { position: "absolute", left: 42, right: 42, bottom: 22, flexDirection: "row", justifyContent: "space-between", paddingTop: 7, borderTopWidth: 0.5, borderTopColor: "#CBD5E1", color: "#64748B", fontSize: 7 },
});

function amount(value: unknown) {
  return Number(value ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function monthLabel(month: string) {
  const date = new Date(month + "-01T12:00:00");
  return Number.isNaN(date.getTime())
    ? month
    : date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function getStatus(bill: any) {
  if (bill.status === "Advance Paid" || bill.status === "Cancelled") return bill.status;
  return bill.is_paid ? "Paid" : bill.status || "Due";
}

function getPending(bill: any) {
  const status = getStatus(bill).toLowerCase();
  if (status === "paid" || status === "advance paid" || status === "cancelled") return 0;
  const total = Number(bill.total_amount ?? 0);
  const paid = Number(bill.paid_amount ?? 0);
  return Math.max(0, Number(bill.remaining_balance ?? total - paid));
}

export function CollectionReportPDF({ bills, billingMonth }: { bills: any[]; billingMonth: string }) {
  const sortedBills = [...bills].sort((a, b) =>
    String(a.tenants?.flats?.flat_code ?? "").localeCompare(
      String(b.tenants?.flats?.flat_code ?? ""),
      undefined,
      { numeric: true }
    )
  );
  const billableBills = sortedBills.filter((bill) => getStatus(bill).toLowerCase() !== "cancelled");
  const totalGoal = billableBills.reduce((sum, bill) => sum + Number(bill.total_amount ?? 0), 0);
  const totalPending = billableBills.reduce((sum, bill) => sum + getPending(bill), 0);
  const totalCollected = Math.max(0, totalGoal - totalPending);
  const totalUnits = billableBills.reduce(
    (sum, bill) => sum + Math.max(0, Number(bill.current_reading ?? 0) - Number(bill.previous_reading ?? 0)),
    0
  );
  const totalElectricity = billableBills.reduce((sum, bill) => sum + Number(bill.electricity_amount ?? 0), 0);
  const totalRent = billableBills.reduce((sum, bill) => sum + Number(bill.rent_amount ?? 0), 0);
  const statuses = sortedBills.reduce<Record<string, number>>((counts, bill) => {
    const status = getStatus(bill);
    counts[status] = (counts[status] ?? 0) + 1;
    return counts;
  }, {});
  const statusSummary = Object.entries(statuses)
    .map(([status, count]) => count + " " + status.toUpperCase())
    .join("  |  ");
  const dueCount = sortedBills.filter((bill) => getPending(bill) > 0).length;
  const rates = Array.from(
    new Set(
      sortedBills
        .map((bill) => bill.tenants?.flats?.buildings?.electricity_rate)
        .filter((value) => value != null)
        .map(Number)
    )
  );

  return (
    <Document title={"RentEase Collection Report - " + monthLabel(billingMonth)}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>RENT EASE</Text>
        <Text style={styles.title}>Collection Report</Text>
        <Text style={styles.month}>{monthLabel(billingMonth)}</Text>
        <Text style={styles.reportDate}>
          Report date: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </Text>
        <View style={styles.divider} />

        <View style={styles.summary}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>TOTAL GOAL</Text>
            <Text style={styles.summaryValue}>Rs. {amount(totalGoal)}</Text>
            <Text style={styles.summaryNote}>Expected this month</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>COLLECTED</Text>
            <Text style={styles.summaryValue}>Rs. {amount(totalCollected)}</Text>
            <Text style={styles.summaryNote}>
              {totalGoal ? Math.round((totalCollected / totalGoal) * 100) + "% of goal" : "0% of goal"}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.pendingCard]}>
            <Text style={[styles.summaryLabel, styles.pendingLabel]}>PENDING</Text>
            <Text style={[styles.summaryValue, styles.pendingValue]}>Rs. {amount(totalPending)}</Text>
            <Text style={[styles.summaryNote, styles.pendingLabel]}>{sortedBills.length} monthly bills</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Detailed breakdown</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.room]}>ROOM</Text>
          <Text style={[styles.tableHeaderText, styles.tenant]}>TENANT</Text>
          <Text style={[styles.tableHeaderText, styles.reading]}>PREVIOUS{"\n"}UNIT</Text>
          <Text style={[styles.tableHeaderText, styles.reading]}>THIS MONTH{"\n"}UNIT</Text>
          <Text style={[styles.tableHeaderText, styles.units]}>UNITS{"\n"}USED</Text>
          <Text style={[styles.tableHeaderText, styles.rate]}>RATE</Text>
          <Text style={[styles.tableHeaderText, styles.electricity]}>ELECTRICITY</Text>
          <Text style={[styles.tableHeaderText, styles.rent]}>RENT</Text>
          <Text style={[styles.tableHeaderText, styles.total]}>TOTAL{"\n"}BILL</Text>
          <Text style={[styles.tableHeaderText, styles.status]}>STATUS</Text>
        </View>

        {sortedBills.map((bill, index) => {
          const tenant = bill.tenants;
          const previous = Number(bill.previous_reading ?? 0);
          const current = Number(bill.current_reading ?? 0);
          const units = Math.max(0, current - previous);
          const rate = tenant?.flats?.buildings?.electricity_rate;
          return (
            <View
              key={bill.id ?? tenant?.id ?? index}
              style={[styles.tableRow, index % 2 === 1 ? styles.shadedRow : {}]}
              wrap={false}
            >
              <Text style={[styles.cell, styles.room, styles.roomValue]}>{tenant?.flats?.flat_code ?? "-"}</Text>
              <Text style={[styles.cell, styles.tenant, styles.tenantValue]}>{tenant?.name ?? "Unknown"}</Text>
              <Text style={[styles.cell, styles.reading]}>{amount(previous)}</Text>
              <Text style={[styles.cell, styles.reading]}>{amount(current)}</Text>
              <Text style={[styles.cell, styles.units]}>{amount(units)}</Text>
              <Text style={[styles.cell, styles.rate]}>{rate == null ? "-" : "Rs. " + amount(rate)}</Text>
              <Text style={[styles.cell, styles.electricity]}>Rs. {amount(bill.electricity_amount)}</Text>
              <Text style={[styles.cell, styles.rent]}>Rs. {amount(bill.rent_amount)}</Text>
              <Text style={[styles.cell, styles.total, styles.totalValue]}>Rs. {amount(bill.total_amount)}</Text>
              <Text style={[styles.cell, styles.status]}>{getStatus(bill)}</Text>
            </View>
          );
        })}

        <View style={styles.totalRow} wrap={false}>
          <Text style={[styles.cell, styles.room, styles.roomValue]}>TOTAL</Text>
          <Text style={[styles.cell, styles.tenant]} />
          <Text style={[styles.cell, styles.reading]} />
          <Text style={[styles.cell, styles.reading]} />
          <Text style={[styles.cell, styles.units, styles.totalValue]}>{amount(totalUnits)}</Text>
          <Text style={[styles.cell, styles.rate]} />
          <Text style={[styles.cell, styles.electricity, styles.totalValue]}>Rs. {amount(totalElectricity)}</Text>
          <Text style={[styles.cell, styles.rent, styles.totalValue]}>Rs. {amount(totalRent)}</Text>
          <Text style={[styles.cell, styles.total, styles.totalValue]}>Rs. {amount(totalGoal)}</Text>
          <Text style={[styles.cell, styles.status]} />
        </View>

        <Text style={styles.rateNote}>
          {rates.length === 1
            ? "Electricity rate: Rs. " + amount(rates[0]) + " / unit"
            : "Electricity rates are shown per room."}
        </Text>
        <View style={styles.collectionStatus} wrap={false}>
          <View>
            <Text style={styles.collectionHeading}>COLLECTION STATUS</Text>
            <Text style={styles.collectionText}>{statusSummary || "No bills for this month."}</Text>
            <Text style={styles.collectionText}>
              Pending amount for {monthLabel(billingMonth)}: Rs. {amount(totalPending)}
            </Text>
          </View>
          <Text style={styles.dueBadge}>{dueCount} DUE</Text>
        </View>

        <View style={styles.footer} fixed>
          <Text>Generated via RentEase</Text>
          <Text render={({ pageNumber, totalPages }) => "Page " + pageNumber + " of " + totalPages} />
        </View>
      </Page>
    </Document>
  );
}
