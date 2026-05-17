function formatOrderInr(amount: number): string {
  return `₹${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/** Print tax invoice for spare-part or appliance shop orders (uses saved invoiceData when billed). */
export function openOrderInvoice(order: any) {
  const orderNo = order._id?.slice(-8).toUpperCase() || "N/A";
  const invoiceDate = order.invoiceData?.finalizedAt
    ? new Date(order.invoiceData.finalizedAt).toLocaleDateString("en-IN")
    : order.createdAt
      ? new Date(order.createdAt).toLocaleDateString("en-IN")
      : "N/A";
  const customerName = order.contactData?.name || "—";
  const customerPhone = order.contactData?.phone || "—";
  const customerEmail = order.contactData?.email || "";
  const address = order.contactData?.address || "—";
  const orderLabel =
    order.orderType === "appliance" ? "Appliance Enquiry" : "Spare Parts Order";

  const inv = order.invoiceData;
  let itemsHtml: string;

  if (inv?.lineItems?.length) {
    itemsHtml = inv.lineItems
      .map(
        (row: {
          description: string;
          quantity: number;
          unitPrice: number;
          amount: number;
        }) => `
    <tr>
      <td style="padding:10px; border:1px solid #eee;">${row.description}</td>
      <td style="padding:10px; border:1px solid #eee; text-align:center;">${row.quantity}</td>
      <td style="padding:10px; border:1px solid #eee; text-align:right;">${formatOrderInr(row.unitPrice)}</td>
      <td style="padding:10px; border:1px solid #eee; text-align:right; font-weight:bold;">${formatOrderInr(row.amount)}</td>
    </tr>`,
      )
      .join("");
  } else if (order.orderType === "appliance" && order.applianceItem) {
    const a = order.applianceItem;
    const unit = a.price ? formatOrderInr(a.price) : "TBD";
    itemsHtml = `
    <tr>
      <td style="padding:10px; border:1px solid #eee;">${a.name}${a.modelNumber ? ` (${a.modelNumber})` : ""}</td>
      <td style="padding:10px; border:1px solid #eee; text-align:center;">${a.quantity ?? 1}</td>
      <td style="padding:10px; border:1px solid #eee; text-align:right;">${unit}</td>
      <td style="padding:10px; border:1px solid #eee; text-align:right;">${unit}</td>
    </tr>`;
  } else {
    itemsHtml =
      order.items
        ?.map((item: any) => {
          const pricePaise = item.partId?.price;
          const unit =
            typeof pricePaise === "number"
              ? formatOrderInr(pricePaise / 100)
              : "TBD";
          return `
    <tr>
      <td style="padding:10px; border:1px solid #eee;">${item.partId?.name || "Spare Part"}</td>
      <td style="padding:10px; border:1px solid #eee; text-align:center;">${item.quantity}</td>
      <td style="padding:10px; border:1px solid #eee; text-align:right;">${unit}</td>
      <td style="padding:10px; border:1px solid #eee; text-align:right;">${unit}</td>
    </tr>`;
        })
        .join("") ||
      "<tr><td colspan='4' style='text-align:center; padding:20px;'>No items</td></tr>";
  }

  const subtotal = inv?.subtotal != null ? formatOrderInr(inv.subtotal) : "—";
  const taxRow =
    inv?.taxAmount > 0
      ? `<tr><td colspan="3" style="padding:8px;text-align:right;">GST (${inv.taxPercent}%)</td><td style="padding:8px;text-align:right;">${formatOrderInr(inv.taxAmount)}</td></tr>`
      : "";
  const total =
    inv?.totalAmount != null
      ? formatOrderInr(inv.totalAmount)
      : "As per quotation";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6; }
  .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
  .logo { font-size: 28px; font-weight: 800; }
  .logo b { color: #e0133a; }
  .invoice-info { text-align: right; }
  .section { margin-bottom: 30px; }
  .section-title { font-weight: bold; text-transform: uppercase; font-size: 12px; color: #666; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; background: #f9f9f9; padding: 10px; border: 1px solid #eee; }
  .totals td { border: none; }
  .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
  .paid { display:inline-block; background:#dcfce7; color:#166534; padding:4px 12px; border-radius:999px; font-size:11px; font-weight:bold; margin-top:8px; }
  @media print { .no-print { display: none; } }
</style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px;">
    <button onclick="window.print()" style="padding: 10px 20px; background: #000; color: #fff; border: none; border-radius: 5px; cursor: pointer;">Print Invoice</button>
  </div>
  <div class="header">
    <div class="logo">Fixxer<b>.</b></div>
    <div class="invoice-info">
      <h1 style="margin:0; font-size:24px;">TAX INVOICE</h1>
      <p style="margin:5px 0 0 0;">${orderLabel} #${orderNo}</p>
      <p style="margin:2px 0 0 0;">Date: ${invoiceDate}</p>
      ${order.paymentStatus === "PAID" || order.isBilled ? '<span class="paid">PAYMENT RECEIVED</span>' : ""}
    </div>
  </div>
  <div class="section">
    <div class="section-title">Bill To</div>
    <p style="margin:0; font-weight:bold;">${customerName}</p>
    <p style="margin:2px 0 0 0;">${address}</p>
    <p style="margin:2px 0 0 0;">Phone: ${customerPhone}</p>
    ${customerEmail ? `<p style="margin:2px 0 0 0;">Email: ${customerEmail}</p>` : ""}
  </div>
  <div class="section">
    <div class="section-title">Line Items</div>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align:center;">Qty</th>
          <th style="text-align:right;">Rate</th>
          <th style="text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
      <tfoot class="totals">
        <tr><td colspan="3" style="padding:12px 8px;text-align:right;font-weight:bold;">Subtotal</td><td style="padding:12px 8px;text-align:right;">${subtotal}</td></tr>
        ${taxRow}
        <tr><td colspan="3" style="padding:12px 8px;text-align:right;font-weight:bold;font-size:16px;">Total</td><td style="padding:12px 8px;text-align:right;font-weight:bold;font-size:16px;">${total}</td></tr>
      </tfoot>
    </table>
    ${inv?.notes ? `<p style="margin-top:16px;font-size:13px;color:#555;"><strong>Notes:</strong> ${inv.notes}</p>` : ""}
  </div>
  <div class="footer">
    <p>Thank you for choosing Fixxer. This is a computer-generated invoice.</p>
    <p>www.fixer.in | support@fixer.in</p>
  </div>
</body>
</html>`;

  const printWindow = window.open("", "_blank", "width=800,height=900");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
