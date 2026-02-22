"use client";

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 12, fontFamily: 'Helvetica' },
  header: { marginBottom: 20, borderBottom: 1, paddingBottom: 10 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#4F46E5' },
  section: { marginBottom: 15 },
  label: { color: '#6B7280', marginBottom: 2 },
  value: { fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: 1, fontSize: 16, fontWeight: 'bold' },
  footer: { marginTop: 50, textAlign: 'center', color: '#9CA3AF', fontSize: 10 }
});

export function InvoicePDF({ bill, tenant }: { bill: any, tenant: any }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>RENT INVOICE</Text>
          <Text>{bill.billing_month}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Tenant</Text>
          <Text style={styles.value}>{tenant.name}</Text>
          <Text>{tenant.flats.buildings.name} - {tenant.flats.flat_code}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text>Monthly Rent</Text>
            <Text>₹{bill.rent_amount.toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <Text>Electricity ({bill.current_reading - bill.previous_reading} units)</Text>
            <Text>₹{bill.electricity_amount.toLocaleString()}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>TOTAL DUE</Text>
            <Text>₹{bill.total_amount.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Meter Readings</Text>
          <Text>Prev: {bill.previous_reading} | Current: {bill.current_reading}</Text>
        </View>

        <Text style={styles.footer}>Thank you for your prompt payment!</Text>
      </Page>
    </Document>
  );
}
