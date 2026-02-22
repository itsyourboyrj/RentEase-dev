export const translations = {
  en: {
    dashboard: "Dashboard",
    buildings: "Buildings",
    flats: "Flats",
    tenants: "Tenants",
    billing: "Billing",
    settings: "Settings",
    total_dues: "Total Dues",
    active_tenants: "Active Tenants",
    generate_bill: "Generate Bill",
    pay_now: "Pay Now",
    rent_invoice: "Rent Invoice",
    whatsapp_msg: (name: string, month: string, amount: string) =>
      `Hi ${name}, your rent for ${month} is ₹${amount}. Please find the invoice attached.`,
  },
  hi: {
    dashboard: "डैशबोर्ड",
    buildings: "इमारतें",
    flats: "फ्लैट्स",
    tenants: "किरायेदार",
    billing: "बिलिंग",
    settings: "सेटिंग्स",
    total_dues: "कुल बकाया",
    active_tenants: "सक्रिय किरायेदार",
    generate_bill: "बिल बनाएं",
    pay_now: "अभी भुगतान करें",
    rent_invoice: "किराया चालान",
    whatsapp_msg: (name: string, month: string, amount: string) =>
      `नमस्ते ${name}, ${month} के लिए आपका किराया ₹${amount} है। कृपया संलग्न चालान देखें।`,
  },
};
