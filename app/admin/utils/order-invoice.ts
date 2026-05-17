/** E-commerce style tax invoice (Flipkart / Amazon inspired) for print & PDF. */

const SELLER = {
  name: "Fixxer Service Platform",
  address: "Kolkata, West Bengal, India",
  gstin: "19AABCF1234A1Z5",
  pan: "AABCF1234A",
  phone: "+91 70047 71388",
  email: "support@fixer.in",
  website: "www.fixer.in",
};

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatOrderInr(amount: number): string {
  return `₹${Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatInrPlain(amount: number): string {
  return Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Indian numbering — amount in words for invoice footer. */
function amountInWords(num: number): string {
  const n = Math.round(num * 100) / 100;
  const rupees = Math.floor(n);
  const paise = Math.round((n - rupees) * 100);

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function twoDigits(x: number): string {
    if (x < 20) return ones[x];
    return `${tens[Math.floor(x / 10)]}${x % 10 ? ` ${ones[x % 10]}` : ""}`.trim();
  }

  function threeDigits(x: number): string {
    if (x === 0) return "";
    if (x < 100) return twoDigits(x);
    return `${ones[Math.floor(x / 100)]} Hundred${x % 100 ? ` ${twoDigits(x % 100)}` : ""}`.trim();
  }

  function convertWhole(x: number): string {
    if (x === 0) return "Zero";
    const parts: string[] = [];
    const crore = Math.floor(x / 10000000);
    const lakh = Math.floor((x % 10000000) / 100000);
    const thousand = Math.floor((x % 100000) / 1000);
    const remainder = x % 1000;
    if (crore) parts.push(`${threeDigits(crore)} Crore`);
    if (lakh) parts.push(`${threeDigits(lakh)} Lakh`);
    if (thousand) parts.push(`${threeDigits(thousand)} Thousand`);
    if (remainder) parts.push(threeDigits(remainder));
    return parts.join(" ").trim();
  }

  let words = `${convertWhole(rupees)} Rupees`;
  if (paise > 0) words += ` and ${convertWhole(paise)} Paise`;
  return `${words} Only`;
}

type LineRow = {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  hsn?: string;
};

function resolveLineItems(order: any): LineRow[] {
  const inv = order.invoiceData;
  if (inv?.lineItems?.length) {
    return inv.lineItems.map((row: LineRow) => ({
      description: row.description,
      quantity: row.quantity,
      unitPrice: row.unitPrice,
      amount: row.amount ?? row.quantity * row.unitPrice,
      hsn: row.hsn ?? (order.orderType === "appliance" ? "8415" : "9987"),
    }));
  }
  if (order.orderType === "appliance" && order.applianceItem) {
    const a = order.applianceItem;
    const unit = Number(a.price) || 0;
    const qty = a.quantity ?? 1;
    return [
      {
        description: `${a.name}${a.modelNumber ? ` (${a.modelNumber})` : ""}`,
        quantity: qty,
        unitPrice: unit,
        amount: unit * qty,
        hsn: "8415",
      },
    ];
  }
  return (order.items ?? []).map((item: any) => {
    const pricePaise = typeof item.partId?.price === "number" ? item.partId.price : 0;
    const unit = Math.round((pricePaise / 100) * 100) / 100;
    const qty = item.quantity ?? 1;
    return {
      description: item.partId?.name || "Spare Part",
      quantity: qty,
      unitPrice: unit,
      amount: unit * qty,
      hsn: "9987",
    };
  });
}

/** Print tax invoice for spare-part or appliance shop orders. */
export function openOrderInvoice(order: any) {
  const orderId = order._id?.slice(-8).toUpperCase() || "N/A";
  const invoiceNo = `FX-${invoiceDateCode(order)}-${orderId}`;
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
  const invoiceDate = order.invoiceData?.finalizedAt
    ? new Date(order.invoiceData.finalizedAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : orderDate;

  const customerName = escapeHtml(order.contactData?.name || "—");
  const customerPhone = escapeHtml(order.contactData?.phone || "—");
  const customerEmail = escapeHtml(order.contactData?.email || "");
  const address = escapeHtml(order.contactData?.address || "—");
  const orderTypeLabel =
    order.orderType === "appliance" ? "Appliance Enquiry" : "Spare Parts";

  const inv = order.invoiceData;
  const lines = resolveLineItems(order);
  const subtotal = inv?.subtotal ?? lines.reduce((s, r) => s + r.amount, 0);
  const taxPercent = inv?.taxPercent ?? 0;
  const taxAmount = inv?.taxAmount ?? Math.round(subtotal * (taxPercent / 100) * 100) / 100;
  const totalAmount = inv?.totalAmount ?? subtotal + taxAmount;
  const halfGst = taxAmount / 2;
  const cgstRate = taxPercent ? taxPercent / 2 : 0;
  const sgstRate = taxPercent ? taxPercent / 2 : 0;

  const isPaid = order.paymentStatus === "PAID" || order.isBilled;
  const paymentMode = isPaid ? "Paid" : "Pending";

  const itemsHtml = lines
    .map((row, index) => {
      const lineShare = subtotal > 0 ? row.amount / subtotal : 0;
      const lineCgst = Math.round(lineShare * halfGst * 100) / 100;
      const lineSgst = Math.round(lineShare * halfGst * 100) / 100;
      const lineTotal = Math.round((row.amount + lineCgst + lineSgst) * 100) / 100;

      return `
        <tr>
          <td class="c">${index + 1}</td>
          <td class="l">${escapeHtml(row.description)}</td>
          <td class="c">${escapeHtml(row.hsn)}</td>
          <td class="c">${row.quantity}</td>
          <td class="r">${formatInrPlain(row.unitPrice)}</td>
          <td class="r">${formatInrPlain(row.amount)}</td>
          <td class="c">${cgstRate ? `${cgstRate}%` : "—"}</td>
          <td class="r">${cgstRate ? formatInrPlain(lineCgst) : "—"}</td>
          <td class="c">${sgstRate ? `${sgstRate}%` : "—"}</td>
          <td class="r">${sgstRate ? formatInrPlain(lineSgst) : "—"}</td>
          <td class="r b">${formatInrPlain(lineTotal)}</td>
        </tr>`;
    })
    .join("");

  const notesBlock = inv?.notes
    ? `<div class="notes"><strong>Remarks:</strong> ${escapeHtml(inv.notes)}</div>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Tax Invoice ${invoiceNo}</title>
<style>
  * { box-sizing: border-box; }
  @page { size: A4; margin: 12mm; }
  body {
    margin: 0;
    padding: 0;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11px;
    color: #212121;
    background: #fff;
    line-height: 1.45;
  }
  .no-print {
    padding: 12px 16px;
    background: #f1f3f6;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .no-print button {
    padding: 8px 20px;
    font-size: 13px;
    font-weight: 600;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .btn-primary { background: #2874f0; color: #fff; }
  .btn-secondary { background: #fff; color: #212121; border: 1px solid #d4d5d9 !important; }
  .page { padding: 16px 20px 24px; max-width: 210mm; margin: 0 auto; }
  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #212121;
    padding-bottom: 12px;
    margin-bottom: 16px;
  }
  .brand { font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
  .brand span { color: #c8102e; }
  .doc-title { text-align: right; }
  .doc-title h1 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .doc-title .sub { font-size: 11px; color: #565959; margin-top: 4px; }
  .badge-paid {
    display: inline-block;
    margin-top: 8px;
    padding: 3px 10px;
    background: #e7f8ee;
    color: #108934;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    border: 1px solid #b7ebc6;
    border-radius: 2px;
  }
  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }
  .meta-box {
    border: 1px solid #d4d5d9;
    padding: 10px 12px;
    background: #fafafa;
  }
  .meta-box h3 {
    margin: 0 0 8px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #878787;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 6px;
  }
  .meta-box p { margin: 3px 0; font-size: 11px; }
  .meta-box .name { font-weight: 700; font-size: 12px; color: #212121; }
  .invoice-meta {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: #d4d5d9;
    border: 1px solid #d4d5d9;
    margin-bottom: 16px;
  }
  .invoice-meta div {
    background: #fff;
    padding: 8px 10px;
  }
  .invoice-meta label {
    display: block;
    font-size: 9px;
    text-transform: uppercase;
    color: #878787;
    font-weight: 600;
    margin-bottom: 2px;
  }
  .invoice-meta strong { font-size: 11px; }
  table.items {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 12px;
    font-size: 10px;
  }
  table.items th {
    background: #f0f0f0;
    border: 1px solid #d4d5d9;
    padding: 8px 6px;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 9px;
    color: #565959;
    text-align: center;
  }
  table.items td {
    border: 1px solid #e0e0e0;
    padding: 8px 6px;
    vertical-align: top;
  }
  table.items td.l { text-align: left; }
  table.items td.c { text-align: center; }
  table.items td.r { text-align: right; white-space: nowrap; }
  table.items td.b { font-weight: 700; }
  table.items tbody tr:nth-child(even) { background: #fafafa; }
  .summary-wrap {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 16px;
  }
  table.summary {
    width: 320px;
    border-collapse: collapse;
    font-size: 11px;
  }
  table.summary td {
    padding: 6px 10px;
    border: 1px solid #e0e0e0;
  }
  table.summary td:first-child { color: #565959; }
  table.summary td:last-child { text-align: right; font-weight: 600; }
  table.summary tr.grand td {
    background: #212121;
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    border-color: #212121;
  }
  .amount-words {
    border: 1px dashed #d4d5d9;
    padding: 10px 12px;
    margin-bottom: 16px;
    font-size: 11px;
    background: #fffde7;
  }
  .amount-words strong { color: #212121; }
  .notes {
    font-size: 10px;
    color: #565959;
    margin-bottom: 16px;
    padding: 8px 10px;
    background: #f9f9f9;
    border-left: 3px solid #2874f0;
  }
  .footer {
    border-top: 1px solid #d4d5d9;
    padding-top: 12px;
    font-size: 9px;
    color: #878787;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .footer h4 {
    margin: 0 0 6px;
    font-size: 9px;
    text-transform: uppercase;
    color: #565959;
  }
  .sign {
    margin-top: 24px;
    text-align: right;
  }
  .sign .line {
    display: inline-block;
    border-top: 1px solid #212121;
    min-width: 180px;
    padding-top: 4px;
    font-size: 10px;
    font-weight: 600;
  }
  @media print {
    .no-print { display: none !important; }
    .page { padding: 0; max-width: none; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
  <div class="no-print">
    <button class="btn-primary" onclick="window.print()">Print / Save as PDF</button>
    <button class="btn-secondary" onclick="window.close()">Close</button>
    <span style="font-size:12px;color:#565959;">Use &quot;Save as PDF&quot; in the print dialog for a PDF copy.</span>
  </div>

  <div class="page">
    <div class="top-bar">
      <div class="brand">Fixxer<span>.</span></div>
      <div class="doc-title">
        <h1>Tax Invoice</h1>
        <div class="sub">Original for Recipient</div>
        ${isPaid ? '<div class="badge-paid">Payment Received</div>' : ""}
      </div>
    </div>

    <div class="invoice-meta">
      <div><label>Invoice Number</label><strong>${invoiceNo}</strong></div>
      <div><label>Order ID</label><strong>${orderId}</strong></div>
      <div><label>Invoice Date</label><strong>${invoiceDate}</strong></div>
      <div><label>Order Date</label><strong>${orderDate}</strong></div>
      <div><label>Order Type</label><strong>${orderTypeLabel}</strong></div>
      <div><label>Payment Status</label><strong>${paymentMode}</strong></div>
      <div><label>Place of Supply</label><strong>West Bengal</strong></div>
      <div><label>Supply Type</label><strong>Intra-State (B2C)</strong></div>
    </div>

    <div class="meta-grid">
      <div class="meta-box">
        <h3>Sold By</h3>
        <p class="name">${escapeHtml(SELLER.name)}</p>
        <p>${escapeHtml(SELLER.address)}</p>
        <p><strong>GSTIN:</strong> ${SELLER.gstin}</p>
        <p><strong>PAN:</strong> ${SELLER.pan}</p>
        <p>Phone: ${SELLER.phone}</p>
        <p>Email: ${SELLER.email}</p>
      </div>
      <div class="meta-box">
        <h3>Bill To / Ship To</h3>
        <p class="name">${customerName}</p>
        <p>${address}</p>
        <p>Phone: ${customerPhone}</p>
        ${customerEmail ? `<p>Email: ${customerEmail}</p>` : ""}
        ${
          order.contactData?.preferredDate
            ? `<p><strong>Preferred visit:</strong> ${escapeHtml(order.contactData.preferredDate)}${order.contactData.preferredTime ? ` ${escapeHtml(order.contactData.preferredTime)}` : ""}</p>`
            : ""
        }
      </div>
    </div>

    <table class="items">
      <thead>
        <tr>
          <th style="width:28px">#</th>
          <th style="text-align:left">Description</th>
          <th style="width:48px">HSN</th>
          <th style="width:36px">Qty</th>
          <th style="width:72px">Unit Price (₹)</th>
          <th style="width:80px">Taxable (₹)</th>
          <th style="width:44px">CGST</th>
          <th style="width:64px">Amt (₹)</th>
          <th style="width:44px">SGST</th>
          <th style="width:64px">Amt (₹)</th>
          <th style="width:72px">Total (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml || '<tr><td colspan="11" style="text-align:center;padding:20px;">No line items</td></tr>'}
      </tbody>
    </table>

    <div class="summary-wrap">
      <table class="summary">
        <tr><td>Taxable Value</td><td>₹${formatInrPlain(subtotal)}</td></tr>
        ${
          taxAmount > 0
            ? `
        <tr><td>CGST @ ${cgstRate}%</td><td>₹${formatInrPlain(halfGst)}</td></tr>
        <tr><td>SGST @ ${sgstRate}%</td><td>₹${formatInrPlain(halfGst)}</td></tr>
        <tr><td>Total Tax</td><td>₹${formatInrPlain(taxAmount)}</td></tr>`
            : `<tr><td>GST</td><td>₹0.00</td></tr>`
        }
        <tr class="grand"><td>Grand Total</td><td>₹${formatInrPlain(totalAmount)}</td></tr>
      </table>
    </div>

    <div class="amount-words">
      <strong>Amount in words:</strong> ${amountInWords(totalAmount)}
    </div>

    ${notesBlock}

    <div class="footer">
      <div>
        <h4>Declaration</h4>
        <p>We declare that this invoice shows the actual price of the goods/services described and that all particulars are true and correct. This is a computer-generated invoice and does not require a physical signature unless stamped by the seller.</p>
        <p style="margin-top:8px;">Subject to Kolkata jurisdiction. E. &amp; O.E.</p>
      </div>
      <div>
        <h4>Customer Support</h4>
        <p>${SELLER.website} · ${SELLER.email}</p>
        <p>${SELLER.phone}</p>
        <p style="margin-top:8px;">For returns, warranty, or service queries, quote Invoice <strong>${invoiceNo}</strong> and Order <strong>${orderId}</strong>.</p>
      </div>
    </div>

    <div class="sign">
      <div class="line">For ${escapeHtml(SELLER.name)}</div>
      <div style="font-size:9px;color:#878787;margin-top:4px;">Authorised Signatory</div>
    </div>
  </div>
</body>
</html>`;

  const printWindow = window.open("", "_blank", "width=920,height=1100");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
  }
}

function invoiceDateCode(order: { invoiceData?: { finalizedAt?: string }; createdAt?: string }): string {
  const d = order.invoiceData?.finalizedAt
    ? new Date(order.invoiceData.finalizedAt)
    : order.createdAt
      ? new Date(order.createdAt)
      : new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}
