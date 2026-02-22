"use client";
import { Document, Page, Text, View, StyleSheet, Link, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: 'Helvetica', color: '#1F2937' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, borderBottom: 2, borderBottomColor: '#4F46E5', paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#4F46E5' },
  grid: { flexDirection: 'row', marginBottom: 20 },
  col: { flex: 1 },
  label: { fontSize: 9, textTransform: 'uppercase', color: '#6B7280', marginBottom: 2 },
  bold: { fontWeight: 'bold', fontSize: 12 },
  table: { marginTop: 20 },
  tableHeader: { flexDirection: 'row', borderBottom: 1, borderBottomColor: '#E5E7EB', paddingBottom: 5, marginBottom: 10 },
  tableRow: { flexDirection: 'row', marginBottom: 8 },
  cellMain: { flex: 3 },
  cellRight: { flex: 1, textAlign: 'right' },
  totalBox: { marginTop: 20, padding: 15, backgroundColor: '#F3F4F6', borderRadius: 4 },
  upiBtn: { marginTop: 20, padding: 10, backgroundColor: '#10B981', color: 'white', textAlign: 'center', borderRadius: 4, fontWeight: 'bold', textDecoration: 'none' }
});

export function InvoicePDF({ bill, tenant, owner }: { bill: any, tenant: any, owner: any }) {
  const upiUrl = `upi://pay?pa=${owner?.upi_id}&pn=${owner?.full_name}&am=${bill.total_amount}&cu=INR`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>INVOICE</Text>
            <Text>#{bill.id.slice(0, 8)}</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={styles.bold}>{owner?.full_name}</Text>
            <Text>{owner?.phone}</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.col}>
            <Text style={styles.label}>Bill To:</Text>
            <Text style={styles.bold}>{tenant.name}</Text>
            <Text>{tenant.flats.buildings.name}</Text>
            <Text>Flat: {tenant.flats.flat_code}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Billing Period:</Text>
            <Text>{bill.billing_month}</Text>
            {bill.billing_start_date && bill.billing_end_date && (
              <Text style={{ fontSize: 9, color: '#6B7280' }}>
                {new Date(bill.billing_start_date).toLocaleDateString()} – {new Date(bill.billing_end_date).toLocaleDateString()}
              </Text>
            )}
            <Text style={styles.label}>Invoice Date:</Text>
            <Text>{new Date(bill.created_at).toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.cellMain}>Description</Text>
            <Text style={styles.cellRight}>Amount</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cellMain}>Monthly Room Rent</Text>
            <Text style={styles.cellRight}>₹{bill.rent_amount}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cellMain}>
              Electricity: {bill.current_reading - bill.previous_reading} units
              (Prev: {bill.previous_reading} - Curr: {bill.current_reading})
            </Text>
            <Text style={styles.cellRight}>₹{bill.electricity_amount}</Text>
          </View>
        </View>

        <View style={styles.totalBox}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Total Amount Due</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#4F46E5' }}>₹{bill.total_amount}</Text>
          </View>
        </View>

        {owner?.upi_qr_url && (
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Text style={styles.label}>Scan to Pay / भुगतान के लिए स्कैन करें</Text>
            <Image src={owner.upi_qr_url} style={{ width: 100, height: 100 }} />
          </View>
        )}

        <Link style={styles.upiBtn} src={upiUrl}>
          CLICK TO PAY NOW / अभी भुगतान करें
        </Link>

        <Text style={{ marginTop: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 9 }}>
          This is a computer generated invoice. No signature required.
        </Text>
      </Page>
    </Document>
  );
}
