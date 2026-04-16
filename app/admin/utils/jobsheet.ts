/**
 * Generates a printable job sheet HTML document and opens it in a new window.
 * Completely standalone — no Next.js routing, no auth context dependency.
 * Optimised to fit on a SINGLE A4 page when printed / saved as PDF.
 */
export function openJobSheet(booking: any) {
  const requestNo = booking._id?.slice(-8).toUpperCase() || "N/A";
  const fullId = booking._id || "";
  const createdDate = booking.createdAt
    ? new Date(booking.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "N/A";
  const createdTime = booking.createdAt
    ? new Date(booking.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : "N/A";
  const serviceName = booking.serviceId?.name || "Appliance Repair";
  const serviceTitle = booking.serviceId?.title || serviceName;
  const customerName = booking.userId?.fullName || "—";
  const customerPhone = booking.contactPhone || booking.userId?.phone || "—";
  const customerEmail = booking.userId?.email || "—";
  const address = booking.addressData?.text || "—";
  const pincode = booking.addressData?.zip || "—";
  const description = booking.description || "";

  const brand = booking.productDetails?.brand || "—";
  const modelNo = booking.productDetails?.modelNumber || "—";
  const serialNo = booking.productDetails?.serialNumber || "—";
  const serviceType = booking.serviceType || "REPAIR";

  const techName = booking.technicianId?.name || "—";
  const visits = booking.visits || [];
  const v1 = visits.find((v: any) => v.visitOrder === 1) || {};
  const v2 = visits.find((v: any) => v.visitOrder === 2) || {};
  
  const allParts = visits.flatMap((v: any) => v.partsUsed || []);
  const partsHtml = allParts.map((p: any) => {
    const rawPrice = p.sparePartId?.price || "0";
    const numericPrice = p.cost || parseFloat(String(rawPrice).match(/(\d+)/)?.[1] || "0");
    const subtotal = numericPrice * (p.quantity || 1);
    
    return `
    <tr>
      <td class="lbl">${p.isThirdParty ? 'EXT' : p.sparePartId?.partNumber || ''}</td>
      <td>${p.isThirdParty ? p.partName : p.sparePartId?.name || ''}</td>
      <td>${p.isThirdParty ? p.vendor : p.sparePartId?.manufacturer || ''}</td>
      <td style="text-align:center;">${p.quantity || 1}</td>
      <td style="text-align:right;">${numericPrice}</td>
      <td style="text-align:right;">${subtotal.toFixed(2)}</td>
    </tr>`;
  }).join("") || `
    <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>
    <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>
    <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>
  `;
  const invoiceAmount = booking.invoiceData?.totalAmount ? `INR ${booking.invoiceData.totalAmount}` : "____________";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Job Sheet — #${requestNo}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 9.5px; line-height: 1.25; color: #1a1a1a; background: #fff; }

  @media print {
    body { background: #fff; }
    .no-print { display: none !important; }
    @page { size: A4; margin: 6mm; }
  }

  .bar {
    background: #111; color: #fff; padding: 10px 20px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .bar span { font-size: 14px; color: #ccc; }
  .bb {
    padding: 6px 16px; border-radius: 4px; border: none;
    font-size: 13px; font-weight: 600; cursor: pointer;
    margin-left: 10px;
  }
  .bp { background: #e0133a; color: #fff; }
  .bs { background: #333; color: #fff; border: 1px solid #555; }

  .page {
    padding: 10px;
    max-width: 210mm;
    margin: 0 auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #333;
  }
  
  th, td {
    border: 1px solid #333;
    padding: 3px 5px;
    vertical-align: top;
  }

  .no-border-table td {
    border: none;
    padding: 1px 0;
  }

  .logo-text {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
  }
  .logo-text b { color: #e0133a; }

  .flex-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .lbl {
    color: #4a4a4a;
    font-size: 8.5px;
  }

</style>
</head>
<body>
  <div class="bar no-print">
    <span>Job Sheet — #${requestNo}</span>
    <div>
      <button class="bb bp" onclick="window.print()">Print</button>
      <button class="bb bs" onclick="window.close()">Close</button>
    </div>
  </div>

  <div class="page">
    <!-- Header row -->
    <table>
      <tr>
        <td style="width:25%; text-align:center; vertical-align:middle; padding:10px;">
          <div class="logo-text">Fixxer<b>.</b></div>
        </td>
        <td style="width:50%; text-align:center; padding:8px;">
          <strong style="font-size: 12px; letter-spacing: 0.5px;">AUTHORIZED SERVICE PROVIDER</strong><br>
          <span style="font-size: 10px; font-weight: bold;">FIXXER SERVICE PLATFORM</span><br>
          <span style="color:#444;">A-12, TECH PARK, NEW DELHI<br>
          DELHI, 110001, INDIA</span>
        </td>
        <td style="width:25%; font-size:9px;">
          <table class="no-border-table">
            <tr><td class="lbl">Service Request Type:</td><td>Breakdown</td></tr>
            <tr><td class="lbl">Source:</td><td>Phone</td></tr>
            <tr><td class="lbl">Customer Type:</td><td>Normal</td></tr>
            <tr><td class="lbl">Dealer Name:</td><td></td></tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Product & Request Info -->
    <table style="border-top:none;">
      <tr>
        <td style="width:33.3%;">
          <table class="no-border-table" style="font-size:9px;">
            <tr><td class="lbl">Preferred Date:</td><td></td></tr>
            <tr><td class="lbl">Preferred Time:</td><td></td></tr>
            <tr><td class="lbl">Product Category:</td><td style="font-weight:bold;">${serviceName.toUpperCase()}</td></tr>
            <tr><td class="lbl">Product Sub Category:</td><td>${serviceTitle}</td></tr>
            <tr><td class="lbl">Brand:</td><td style="font-weight:bold;">${brand}</td></tr>
            <tr><td class="lbl">Model Number:</td><td>${modelNo}</td></tr>
            <tr><td class="lbl">Serial Number:</td><td>${serialNo}</td></tr>
            <tr><td class="lbl">Date of Purchase:</td><td></td></tr>
          </table>
        </td>
        <td style="width:33.3%;">
          <table class="no-border-table" style="font-size:9px;">
            <tr><td class="lbl">Service Request No:</td><td style="font-weight:bold; font-size:10px;">${requestNo}</td></tr>
            <tr><td class="lbl">Date:</td><td>${createdDate}</td></tr>
            <tr><td class="lbl">Time:</td><td>${createdTime}</td></tr>
            <tr><td class="lbl">Service Type:</td><td>Service under Contract</td></tr>
          </table>
        </td>
        <td style="width:33.4%;">
          <table class="no-border-table" style="font-size:9px;">
            <tr><td class="lbl" style="width:85px;">Asset:</td><td>${booking.jobDetails?.asset || ""}</td></tr>
            <tr><td class="lbl">Warranty Code & Desc:</td><td>${booking.jobDetails?.warrantyCode || ""} ${booking.jobDetails?.warrantyDesc ? `- ${booking.jobDetails.warrantyDesc}` : ""}</td></tr>
            <tr><td class="lbl">Sale Date:</td><td>${booking.jobDetails?.assetSaleDate || ""}</td></tr>
            <tr><td class="lbl">Expiry Date:</td><td>${booking.jobDetails?.assetExpiryDate || ""}</td></tr>
            <tr><td class="lbl">Contract Code & Desc:</td><td>${booking.jobDetails?.contractCode || ""} ${booking.jobDetails?.contractDesc ? `- ${booking.jobDetails.contractDesc}` : ""}</td></tr>
            <tr><td class="lbl">Start Date:</td><td>${booking.jobDetails?.contractStartDate || ""}</td></tr>
            <tr><td class="lbl">Expiry Date:</td><td>${booking.jobDetails?.contractExpiryDate || ""}</td></tr>
            <tr><td class="lbl">Visit Category:</td><td>${booking.jobDetails?.visitCategory || ""}</td></tr>
            <tr><td class="lbl">Invoice Number:</td><td>${booking.jobDetails?.invoiceNumber || ""}</td></tr>
            <tr><td class="lbl">UID No:</td><td style="font-size:8px; word-break:break-all;">${fullId}</td></tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Customer Info -->
    <table style="border-top:none;">
      <tr>
        <td>
          <table class="no-border-table" style="font-size:9.5px; width:100%;">
            <tr><td class="lbl" style="width:110px;">Name of Customer:</td><td style="font-weight:bold;">${customerName}</td></tr>
            <tr><td class="lbl">Account Address:</td><td>${address}</td></tr>
            <tr><td class="lbl">Pincode:</td><td>${pincode}</td></tr>
            <tr>
              <td colspan="2">
                <span class="lbl">Customer Contact:</span> <strong style="margin-right:20px;">${customerPhone}</strong>
                <span class="lbl">Customer calling No:</span> <strong style="margin-right:20px;">${customerPhone}</strong>
                <span class="lbl">Alternate Phone:</span>
              </td>
            </tr>
            <tr><td class="lbl">Nature of Complaint:</td><td>${description || '—'}</td></tr>
            <tr><td class="lbl">Special Instructions:</td><td></td></tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Job Details (Primary Findings) -->
    <table style="border-top:none;">
      <tr>
        <td style="width:50%;">
          <div class="lbl" style="margin-bottom:4px; font-weight:bold;">DIAGNOSIS / PROBLEM FOUND:</div>
          <div style="font-size:10px; min-height:30px;">${booking.jobDetails?.diagnosis || '—'}</div>
        </td>
        <td style="width:50%;">
          <div class="lbl" style="margin-bottom:4px; font-weight:bold;">WORK DONE / ACTION TAKEN:</div>
          <div style="font-size:10px; min-height:30px;">${booking.jobDetails?.workDone || '—'}</div>
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <div class="lbl" style="margin-bottom:4px; font-weight:bold;">RECOMMENDATIONS & NOTES:</div>
          <div style="font-size:10px;">${booking.jobDetails?.recommendations || '—'}</div>
        </td>
      </tr>
    </table>

    <!-- Visits -->
    <table style="border-top:none; text-align:left;">
      <tr style="background:#f9f9f9;">
        <td style="width:10%;" class="lbl">Visit No -1</td>
        <td style="width:25%;" class="lbl">${techName}</td>
        <td style="width:15%;" class="lbl">${v1.scheduledDate ? new Date(v1.scheduledDate).toLocaleDateString() : ""}</td>
        <td style="width:15%;" class="lbl">${v1.timeIn ? new Date(v1.timeIn).toLocaleTimeString() : ""}</td>
        <td style="width:35%;" class="lbl">${v1.timeOut ? new Date(v1.timeOut).toLocaleTimeString() : ""}</td>
      </tr>
      <tr style="background:#f9f9f9;">
        <td class="lbl">Visit No -2</td>
        <td class="lbl">${techName}</td>
        <td class="lbl">${v2.scheduledDate ? new Date(v2.scheduledDate).toLocaleDateString() : ""}</td>
        <td class="lbl">${v2.timeIn ? new Date(v2.timeIn).toLocaleTimeString() : ""}</td>
        <td class="lbl">${v2.timeOut ? new Date(v2.timeOut).toLocaleTimeString() : ""}</td>
      </tr>
    </table>

    <!-- Parts -->
    <table style="border-top:none;">
      <thead>
        <tr style="text-align:left; font-size:9px; background:#f9f9f9;">
          <th style="font-weight:normal; width:12%;" class="lbl">Part Code</th>
          <th style="font-weight:normal; width:28%;" class="lbl">Part Description</th>
          <th style="font-weight:normal; width:40%;" class="lbl">Def. Rec. Y/N / Defective Item Code and Serial No.</th>
          <th style="font-weight:normal; width:5%; text-align:center;" class="lbl">Qty</th>
          <th style="font-weight:normal; width:5%; text-align:right;" class="lbl">Rate</th>
          <th style="font-weight:normal; width:10%; text-align:right;" class="lbl">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${partsHtml}
      </tbody>
      <tfoot style="font-size:9px;">
        <tr>
          <td colspan="5" style="border-left:none; text-align:right;" class="lbl">Labour(Service) / Transportation charges (if any) :</td>
          <td style="text-align:right;">${booking.invoiceData?.serviceTotal || 0}</td>
        </tr>
        <tr>
          <td colspan="5" style="border-left:none; text-align:right; font-weight:bold; font-size:10px;">Total :</td>
          <td style="text-align:right;">${booking.invoiceData?.totalAmount || 0}</td>
        </tr>
      </tfoot>
    </table>

    <!-- Compressors -->
    <table style="border-top:none; font-size:9.5px;">
      <tr>
        <td style="width:50%; border-right:none; padding-bottom:12px;">
          <span class="lbl">Defective Compressor Item code:</span><br><br>
          <span class="lbl">Defective Compressor Serial Number:</span><br><br>
          <span class="lbl">Oil Charging Number:</span>
        </td>
        <td style="width:50%; border-left:none; padding-bottom:12px;">
          <span class="lbl">Replaced Compressor Item code:</span><br><br>
          <span class="lbl">Replaced Compressor Serial Number:</span><br>
        </td>
      </tr>
    </table>

    <!-- Reference -->
    <table style="border-top:none; font-size:9.5px;">
      <tr>
        <td style="padding:4px 5px;">
          <span class="lbl">Previous Call reference Case Number:</span> ${requestNo}, <span class="lbl">Created Date:</span> ${createdDate}, <span class="lbl">Action Code:</span> N/A
        </td>
      </tr>
    </table>

    <!-- Satisfaction -->
    <table style="border-top:none;">
      <tr>
        <td style="padding:8px 8px 12px 8px;">
          <div style="font-weight:bold; font-size:10px; margin-bottom: 4px;">I am Satisfied with the job done / repairs carried out on my products and same is working satisfactorily.</div>
          <div class="lbl">Customer Remarks :</div>
          <div style="margin-top:14px; font-weight:bold; font-size:10.5px;">On a scale of 0 to 10, how willing are you to recommend FIXXER SERVICES to your family and friends?</div>
          
          <div class="flex-row" style="margin-top:20px; font-size:10px;">
            <div>Customer Name : __________________________</div>
            <div>Customer Sign : __________________________</div>
            <div>Customer Happy Code : _________________</div>
          </div>
        </td>
      </tr>
    </table>

    <!-- Tear Line -->
    <div style="text-align:center; margin: 8px 0; font-size:9px; color:#666; display:flex; align-items:center; justify-content:center;">
      <span style="flex-grow:1; border-top:1px dashed #999;"></span>
      <span style="padding:0 12px; letter-spacing: 0.5px;">TEAR HERE (CUSTOMER COPY)</span>
      <span style="flex-grow:1; border-top:1px dashed #999;"></span>
    </div>

    <!-- Customer Copy -->
    <table style="font-size:9.5px;">
      <tr>
        <td style="padding:8px;">
          <div class="flex-row" style="margin-bottom:14px;">
            <div><span class="lbl">Customer Name :</span> <strong style="font-size:10px;">${customerName}</strong></div>
            <div><span class="lbl">Service Request No:</span> <strong style="font-size:11px;">${requestNo}</strong></div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="lbl">Job is done :</span> Yes / No
              <div class="logo-text" style="font-size:14px; margin-left:6px;">Fixxer<b>.</b></div>
            </div>
          </div>
          <div class="flex-row">
            <div><span class="lbl">Tech Name & Sign :</span> <strong style="font-size:11px;">${techName}</strong> ___________</div>
            <div><span class="lbl">Date :</span> __________________</div>
            <div><span class="lbl">Amount Collected :</span> <strong>${invoiceAmount}</strong></div>
          </div>
        </td>
      </tr>
    </table>

    <!-- Footer -->
    <table style="border:none; margin-top:4px; font-size:8.5px;">
      <tr>
        <td style="border:none; padding:0; line-height: 1.4;">
          <strong>Authorised Service Provider : FIXXER SERVICE PLATFORM</strong><br>
          <span style="color:#555;">Contact Center Number :</span> 1800-FIXX-NOW | Mobile Number Select 1 for Appliances Division<br>
          <span style="color:#555;">Website :</span> www.fixer.in | <span style="color:#555;">Fixxer Services Email ID :</span> support@fixer.in | <span style="color:#555;">WhatsApp :</span> +91 99999 99999<br>
          <div style="margin-top:2px; font-style: italic; color:#777;">Note: This is a record rendered and is for usage by Authorised service provider only.</div>
        </td>
      </tr>
    </table>

  </div>
</body>
</html>`;

  const printWindow = window.open("", "_blank", "width=900,height=800");
  if (!printWindow) {
    alert("Please allow popups for this site to print job sheets.");
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
}

export function openPartBill(order: any) {
  const orderNo = order._id?.slice(-8).toUpperCase() || "N/A";
  const createdDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "N/A";
  const customerName = order.contactData?.name || "—";
  const customerPhone = order.contactData?.phone || "—";
  const address = order.contactData?.address || "—";
  
  const itemsHtml = order.items?.map((item: any) => `
    <tr>
      <td style="padding:10px; border:1px solid #eee;">${item.partId?.name || 'Spare Part'}</td>
      <td style="padding:10px; border:1px solid #eee; text-align:center;">${item.quantity}</td>
      <td style="padding:10px; border:1px solid #eee; text-align:right;">${item.partId?.price || 'TBD'}</td>
    </tr>
  `).join("") || "<tr><td colspan='3' style='text-align:center; padding:20px;'>No items found</td></tr>";

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
  .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
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
      <p style="margin:5px 0 0 0;">Order #${orderNo}</p>
      <p style="margin:2px 0 0 0;">Date: ${createdDate}</p>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Shipping Address</div>
    <p style="margin:0; font-weight:bold;">${customerName}</p>
    <p style="margin:2px 0 0 0;">${address}</p>
    <p style="margin:2px 0 0 0;">Phone: ${customerPhone}</p>
  </div>
  <div class="section">
    <div class="section-title">Order Items</div>
    <table>
      <thead>
        <tr>
          <th>Item Description</th>
          <th style="text-align:center;">Qty</th>
          <th style="text-align:right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
  </div>
  <div class="footer">
    <p>Thank you for shopping with Fixxer. This is a computer-generated invoice.</p>
    <p>www.fixer.in | support@fixer.in</p>
  </div>
</body>
</html>`;

  const printWindow = window.open("", "_blank", "width=800,height=800");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

export function openRetailInvoice(booking: any) {
  const invoiceNo = booking._id?.slice(-8).toUpperCase() || "N/A";
  const date = booking.invoiceData?.generatedAt 
    ? new Date(booking.invoiceData.generatedAt).toLocaleDateString("en-IN") 
    : new Date().toLocaleDateString("en-IN");
  
  const customerName = booking.userId?.fullName || booking.userId?.name || booking.addressData?.name || "Valued Customer";
  const address = booking.addressData?.text || booking.addressData?.zip || "—";
  const phone = booking.contactPhone || booking.userId?.phone || "—";
  
  const brand = booking.productDetails?.brand || "—";
  const modelNo = booking.productDetails?.modelNumber || "—";
  const serialNo = booking.productDetails?.serialNumber || "—";
  
  const additionalCharges = booking.invoiceData?.additionalCharges || [];
  const visits = booking.visits || [];
  const allParts = visits.flatMap((v: any) => v.partsUsed || []);

  const itemsHtml = [
    // Service Fee
    `<tr>
      <td style="padding:12px; border:1px solid #eee;">
        <strong>${booking.serviceId?.name || 'Service'} Fee</strong><br>
        <span style="font-size:11px; color:#666;">${booking.serviceType || 'Repair'} Service for ${brand} ${modelNo}</span>
      </td>
      <td style="padding:12px; border:1px solid #eee; text-align:right;">₹${booking.invoiceData?.serviceTotal || 0}</td>
    </tr>`,
    // Spare Parts Row (Source of Truth)
    ...(booking.invoiceData?.spareParts || []).map((p: any) => `
    <tr>
      <td style="padding:12px; border:1px solid #eee;">
        <strong>${p.partName}</strong><br>
        <span style="font-size:11px; color:#666;">Qty: ${p.quantity} | ${p.isThirdParty ? 'Third Party' : 'Inventory'} Component</span>
      </td>
      <td style="padding:12px; border:1px solid #eee; text-align:right;">₹${p.cost * p.quantity}</td>
    </tr>`),
    // Additional Charges
    ...(booking.invoiceData?.additionalCharges || []).map((c: any) => `
    <tr>
      <td style="padding:12px; border:1px solid #eee;">
        <strong>${c.label}</strong>
      </td>
      <td style="padding:12px; border:1px solid #eee; text-align:right;">₹${c.amount}</td>
    </tr>
    `)
  ].filter(Boolean).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.5; font-size: 13px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 4px solid #f4f4f5; padding-bottom: 30px; }
  .logo { font-size: 32px; font-weight: 800; letter-spacing: -1px; }
  .logo b { color: #e0133a; }
  .invoice-label { text-align: right; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
  .section-title { font-weight: 800; text-transform: uppercase; font-size: 11px; color: #71717a; letter-spacing: 1px; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
  th { text-align: left; background: #f4f4f5; padding: 12px; font-weight: 700; border: 1px solid #e4e4e7; }
  .totals { margin-left: auto; width: 300px; border-top: 2px solid #1a1a1a; padding-top: 15px; }
  .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
  .grand-total { font-size: 20px; font-weight: 800; color: #e0133a; margin-top: 10px; border-top: 1px solid #e4e4e7; padding-top: 10px; }
  .footer { margin-top: 60px; padding-top: 30px; border-top: 1px solid #e4e4e7; font-size: 11px; color: #71717a; text-align: center; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 6px; background: #f4f4f5; font-weight: 700; font-size: 10px; text-transform: uppercase; }
  @media print { .no-print { display: none; } @page { margin: 0; } body { padding: 20mm; } }
</style>
</head>
<body>
  <div class="no-print" style="position: fixed; top: 20px; right: 20px; z-index: 100;">
    <button onclick="window.print()" style="padding: 12px 24px; background: #1a1a1a; color: #fff; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">Print / Save PDF</button>
  </div>

  <div class="header">
    <div>
      <div class="logo">Fixxer<b>.</b></div>
      <p style="margin-top: 8px; color: #71717a;">Reliable Repairs, Master Technicians.</p>
    </div>
    <div class="invoice-label">
      <h1 style="margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -1px;">Retail Invoice</h1>
      <p style="margin: 4px 0 0 0; font-weight: 700; font-size: 16px;">#${invoiceNo}</p>
      <p style="margin: 2px 0 0 0; font-weight: 500; color: #71717a;">Date: ${date}</p>
    </div>
  </div>

  <div class="grid">
    <div>
      <div class="section-title">Service Details</div>
      <p style="font-weight: 700; font-size: 15px; margin-bottom: 4px;">${booking.serviceId?.name} - ${booking.serviceType || 'Repair'}</p>
      <p style="color: #71717a;">Brand: <strong>${booking.productDetails?.brand || 'N/A'}</strong></p>
      <p style="color: #71717a;">Model: <strong>${booking.productDetails?.modelNumber || 'N/A'}</strong></p>
      <p style="color: #71717a;">Serial: <strong>${booking.productDetails?.serialNumber || 'N/A'}</strong></p>
    </div>
    <div>
      <div class="section-title">Billed To</div>
      <p style="font-weight: 700; font-size: 15px; margin-bottom: 4px;">${customerName}</p>
      <p style="color: #71717a; max-width: 250px;">${address}</p>
      <p style="margin-top: 8px; font-weight: 600;">Phone: ${phone}</p>
    </div>
  </div>

  <div class="section-title">Bill Items</div>
  <table>
    <thead>
      <tr>
        <th>Description of Service / Part</th>
        <th style="text-align:right;">Amount (INR)</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row">
      <span>Subtotal</span>
      <span>₹${booking.invoiceData?.totalAmount || 0}</span>
    </div>
    <div class="total-row" style="color: #71717a;">
      <span>Taxes (Included)</span>
      <span>₹0.00</span>
    </div>
    <div class="total-row grand-total">
      <span>Grand Total</span>
      <span>₹${booking.invoiceData?.totalAmount || 0}</span>
    </div>
  </div>

  <div style="margin-top: 50px; padding: 30px; background: #fdfdfd; border-radius: 20px; border: 1px solid #f1f1f1; position: relative; overflow: hidden;">
    <div style="position: absolute; top: -10px; right: -10px; opacity: 0.05;">
      <svg width="150" height="150" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#e0133a" stroke-width="2" />
        <text x="50" y="50" text-anchor="middle" dominant-baseline="middle" font-size="10" fill="#e0133a" font-weight="bold">FIXXER VERIFIED</text>
      </svg>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: flex-end; position: relative; z-index: 1;">
      <div style="flex: 1.5;">
        <div class="section-title">Service Guarantee</div>
        <div style="display: flex; items-center; gap: 10px; margin-top: 5px;">
           <span style="font-size: 24px; color: #10b981;">✓</span>
           <div>
             <p style="margin: 0; font-weight: 800; font-size: 15px; color: #1a1a1a;">
               ${booking.jobDetails?.warrantyPeriod || '60 Days'} Master Warranty
             </p>
             <p style="margin: 4px 0 0 0; color: #71717a; font-size: 11px; line-height: 1.4;">
               This warranty covers labor and genuine parts replaced during this service. 
               Keep this invoice for future claims.
             </p>
           </div>
        </div>
      </div>
      <div style="flex: 1; text-align: right;">
        <div class="section-title">Quality Assurance</div>
        <div style="margin: 15px 0 10px 0; display: inline-block;">
          <svg width="140" height="50" viewBox="0 0 140 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 35C30 30 50 15 70 20C90 25 110 40 130 30" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M15 42C40 38 65 25 90 30" stroke="#e0133a" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="3 3" />
            <circle cx="10" cy="35" r="2" fill="#1a1a1a" />
            <circle cx="130" cy="30" r="2" fill="#1a1a1a" />
          </svg>
        </div>
        <div style="font-weight: 900; font-size: 13px; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;">Master Technician</div>
        <div style="font-size: 10px; color: #e0133a; font-weight: 700; text-transform: uppercase;">Digital Signature Verified</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>&copy; 2026 Fixxer - Precision Home Services. All rights reserved.</p>
    <p style="font-weight: 600;">This is a computer generated tax invoice and does not require a physical signature.</p>
    <p>www.fixer.in | Support: support@fixer.in | Toll Free: 1800-FIXXER</p>
  </div>
</body>
</html>`;


  const printWindow = window.open("", "_blank", "width=900,height=850");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}


