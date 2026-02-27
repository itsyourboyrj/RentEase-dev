"use client";

import { Document, Page, Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer';

// Standard Font Setup
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#374151',
    backgroundColor: '#FFFFFF'
  },

  // Header section
  buildingName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 20,
    color: '#111827',
    letterSpacing: 2
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },

  invoiceTitle: {
    fontSize: 32,
    fontWeight: 'black',
    color: '#111827',
    marginBottom: 10,
    letterSpacing: -1
  },

  metaText: {
    fontSize: 9,
    marginBottom: 3,
    color: '#4B5563'
  },

  metaValue: {
    fontWeight: 'bold',
    color: '#111827'
  },

  logoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },

  // Table Styling
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
    alignItems: 'center'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 12,
    alignItems: 'center'
  },
  tableRowLast: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 15,
    alignItems: 'center'
  },

  // Column Widths
  col1: { width: '18%', paddingLeft: 10 }, // Bill Type
  col2: { width: '15%', textAlign: 'center' }, // Current Month
  col3: { width: '15%', textAlign: 'center' }, // Previous
  col4: { width: '12%', textAlign: 'center' }, // Total Unit
  col5: { width: '12%', textAlign: 'center' }, // Rate
  col6: { width: '13%', textAlign: 'center' }, // Calculation
  col7: { width: '15%', textAlign: 'right', paddingRight: 10 }, // Amount

  headerLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#6B7280',
    letterSpacing: 0.5
  },

  rowValue: {
    fontSize: 9,
    color: '#1F2937'
  },

  // Footer Section
  footer: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  paymentInfo: {
    width: '60%'
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827'
  },

  qrCode: {
    width: 90,
    height: 90,
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },

  payButton: {
    marginTop: 15,
    backgroundColor: '#4F46E5',
    color: 'white',
    padding: '8 15',
    borderRadius: 6,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    textDecoration: 'none',
    width: 120
  },

  signatureSection: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },

  signatureLine: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
    marginTop: 10,
    paddingTop: 5,
    textAlign: 'center'
  },

  handwritten: {
    fontFamily: 'Courier', // Simulating a signature look
    fontSize: 16,
    marginBottom: 5,
    color: '#1F2937',
    fontStyle: 'italic'
  }
});

export function InvoicePDF({ bill, tenant, owner }: any) {
  const currentReading = Number(bill.current_reading) || 0;
  const previousReading = Number(bill.previous_reading) || 0;
  const units = currentReading - previousReading;
  const upiUrl = `upi://pay?pa=${encodeURIComponent(owner?.upi_id ?? '')}&pn=${encodeURIComponent(owner?.full_name ?? '')}&am=${encodeURIComponent(bill.total_amount ?? 0)}&cu=INR`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Building Name Top Center */}
        <Text style={styles.buildingName}>{tenant?.flats?.buildings?.name || 'NAME OF THE BUILDING'}</Text>

        {/* Header Metadata */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.metaText}>Invoice no: <Text style={styles.metaValue}>#{bill?.id?.slice(0, 5) ?? '-----'}</Text></Text>
            <Text style={styles.metaText}>Issuer Flat No: <Text style={styles.metaValue}>Flat - {tenant?.flats?.flat_code}</Text></Text>
            <Text style={styles.metaText}>Issued to: <Text style={styles.metaValue}>{tenant?.name}</Text></Text>
            <Text style={styles.metaText}>Phone no: <Text style={styles.metaValue}>{tenant?.phone}</Text></Text>
            <Text style={styles.metaText}>Bill date: <Text style={styles.metaValue}>{new Date(bill.created_at).toLocaleDateString()}</Text></Text>
          </View>

          <View style={styles.logoPlaceholder}>
             {/* Replace with actual image if available */}
             <Text style={{ fontSize: 8, color: '#9CA3AF' }}>LOGO OF</Text>
             <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#4F46E5' }}>RENTEASE</Text>
          </View>
        </View>

        {/* Grid Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.col1, styles.headerLabel]}>Bill Type</Text>
            <Text style={[styles.col2, styles.headerLabel]}>Curr Month{"\n"}(Reading Date)</Text>
            <Text style={[styles.col3, styles.headerLabel]}>Prev Month{"\n"}(Reading Date)</Text>
            <Text style={[styles.col4, styles.headerLabel]}>Total Unit</Text>
            <Text style={[styles.col5, styles.headerLabel]}>Rate(₹)</Text>
            <Text style={[styles.col6, styles.headerLabel]}>Calculation</Text>
            <Text style={[styles.col7, styles.headerLabel]}>Amount</Text>
          </View>

          {/* Electricity Row */}
          <View style={styles.tableRow}>
            <Text style={[styles.col1, styles.rowValue, { fontWeight: 'bold' }]}>ELECTRICITY BILL</Text>
            <Text style={[styles.col2, styles.rowValue]}>{bill.current_reading}</Text>
            <Text style={[styles.col3, styles.rowValue]}>{bill.previous_reading}</Text>
            <Text style={[styles.col4, styles.rowValue]}>{units}</Text>
            <Text style={[styles.col5, styles.rowValue]}>{tenant?.flats?.buildings?.electricity_rate}</Text>
            <Text style={[styles.col6, styles.rowValue, { fontSize: 7 }]}>({units} units * {tenant?.flats?.buildings?.electricity_rate})</Text>
            <Text style={[styles.col7, styles.rowValue, { fontWeight: 'bold' }]}>₹{(bill.electricity_amount ?? 0).toLocaleString()}</Text>
          </View>

          {/* Monthly Rent Row */}
          <View style={styles.tableRow}>
            <Text style={[styles.col1, styles.rowValue, { fontWeight: 'bold' }]}>MONTHLY RENT</Text>
            <Text style={[{ width: '67%', textAlign: 'center', color: '#D1D5DB' }]}>-</Text>
            <Text style={[styles.col7, styles.rowValue, { fontWeight: 'bold' }]}>₹{(bill.rent_amount ?? 0).toLocaleString()}</Text>
          </View>

          {/* Total Row */}
          <View style={styles.tableRowLast}>
            <Text style={[styles.col1, { fontSize: 11, fontWeight: 'bold', color: '#111827' }]}>TOTAL</Text>
            <View style={{ width: '70%' }} />
            <Text style={[styles.col7, { fontSize: 12, fontWeight: 'bold', color: '#4F46E5' }]}>₹{(bill.total_amount ?? 0).toLocaleString()}</Text>
          </View>
        </View>

        {/* Footer Payment & Signature */}
        <View style={styles.footer}>
          <View style={styles.paymentInfo}>
            <Text style={styles.sectionTitle}>Payment info:</Text>
            <Text style={styles.metaText}>UPI ID: <Text style={styles.metaValue}>{owner?.upi_id}</Text></Text>
            <Text style={styles.metaText}>Name of owner: <Text style={styles.metaValue}>{owner?.full_name}</Text></Text>

            {owner?.upi_qr_url && (
              <Image src={owner.upi_qr_url} style={styles.qrCode} />
            )}

            <Link src={upiUrl} style={styles.payButton}>PAY NOW</Link>
          </View>

          <View style={styles.signatureSection}>
            <Text style={styles.handwritten}>{owner?.full_name}</Text>
            <View style={styles.signatureLine}>
              <Text style={[styles.headerLabel, { fontSize: 8 }]}>BUILDING ADMIN SIGNATURE</Text>
            </View>
          </View>
        </View>

        {/* Legal Disclaimer */}
        <Text style={{ position: 'absolute', bottom: 30, left: 30, right: 30, textAlign: 'center', fontSize: 7, color: '#9CA3AF' }}>
          This is a computer-generated document representing the rental agreement and utilities for the specified period. Generated by RentEase.
        </Text>
      </Page>
    </Document>
  );
}
