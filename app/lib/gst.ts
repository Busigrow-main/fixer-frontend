/** Client-side mirror of backend CGST Rule 35 GST engine (inclusive by default). */

export type GstPriceMode = "INCLUSIVE" | "EXCLUSIVE";
export type GstSupplyType = "INTRA" | "INTER";

export const STANDARD_GST_RATES = [0, 5, 12, 18, 28] as const;

/** Fixxer appliance service — Notification 11/2017 heading 9987 residual @ 18%. */
export const FIXXER_SERVICE_SAC = "998715";
export const FIXXER_AC_SERVICE_SAC = "998713";
export const FIXXER_SERVICE_GST_PERCENT = 18;

export function fixxerServiceSac(serviceNameOrSlug?: string | null): string {
  const key = String(serviceNameOrSlug || "").toLowerCase();
  if (/\bac\b|air.?cond/.test(key)) return FIXXER_AC_SERVICE_SAC;
  return FIXXER_SERVICE_SAC;
}

export type ServiceInvoiceGst = {
  taxableValue: number;
  taxPercent: number;
  taxAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  sacCode?: string;
  supplyType: GstSupplyType;
};

/** Read GST fields already computed by the backend invoice engine. */
export function readServiceInvoiceGst(invoiceData?: {
  taxableValue?: number;
  taxPercent?: number;
  taxAmount?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  sacCode?: string;
  supplyType?: string;
  totalAmount?: number;
  serviceTotal?: number;
  partsTotal?: number;
  additionalCharges?: { amount?: number }[];
} | null): ServiceInvoiceGst | null {
  if (!invoiceData) return null;
  const taxAmount = Number(invoiceData.taxAmount) || 0;
  const taxPercent =
    Number(invoiceData.taxPercent) ||
    (taxAmount > 0 ? FIXXER_SERVICE_GST_PERCENT : 0);
  if (taxAmount <= 0 && !invoiceData.taxableValue && !invoiceData.sacCode) {
    return null;
  }
  const supplyType: GstSupplyType =
    invoiceData.supplyType === "INTER" ? "INTER" : "INTRA";
  return {
    taxableValue: Number(invoiceData.taxableValue) || 0,
    taxPercent,
    taxAmount,
    cgstAmount: Number(invoiceData.cgstAmount) || 0,
    sgstAmount: Number(invoiceData.sgstAmount) || 0,
    igstAmount: Number(invoiceData.igstAmount) || 0,
    sacCode: invoiceData.sacCode || undefined,
    supplyType,
  };
}

function inrPlain(amount: number): string {
  return Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/** Job-sheet `<tfoot>` rows (table with amount in last column). */
export function serviceGstJobSheetRows(
  invoiceData?: Parameters<typeof readServiceInvoiceGst>[0],
): string {
  const gst = readServiceInvoiceGst(invoiceData);
  if (!gst || gst.taxAmount <= 0) return "";
  const half = gst.taxPercent / 2;
  const taxRows =
    gst.igstAmount > 0
      ? `<tr>
          <td colspan="5" style="border-left:none; text-align:right;" class="lbl">IGST ${gst.taxPercent}% (added) :</td>
          <td style="text-align:right;">${inrPlain(gst.igstAmount)}</td>
        </tr>`
      : `<tr>
          <td colspan="5" style="border-left:none; text-align:right;" class="lbl">CGST ${half}% (added) :</td>
          <td style="text-align:right;">${inrPlain(gst.cgstAmount)}</td>
        </tr>
        <tr>
          <td colspan="5" style="border-left:none; text-align:right;" class="lbl">SGST ${half}% (added) :</td>
          <td style="text-align:right;">${inrPlain(gst.sgstAmount)}</td>
        </tr>`;
  return `
        <tr>
          <td colspan="5" style="border-left:none; text-align:right;" class="lbl">SAC ${gst.sacCode || FIXXER_SERVICE_SAC} :</td>
          <td style="text-align:right;">—</td>
        </tr>
        <tr>
          <td colspan="5" style="border-left:none; text-align:right;" class="lbl">Taxable value (pre-GST) :</td>
          <td style="text-align:right;">${inrPlain(gst.taxableValue)}</td>
        </tr>
        ${taxRows}`;
}

/** Retail bill totals block (flex rows). */
export function serviceGstBillTotalsHtml(
  invoiceData?: Parameters<typeof readServiceInvoiceGst>[0],
): string {
  const gst = readServiceInvoiceGst(invoiceData);
  if (!gst || gst.taxAmount <= 0) return "";
  const half = gst.taxPercent / 2;
  const taxRows =
    gst.igstAmount > 0
      ? `<div class="total-row"><span>IGST ${gst.taxPercent}%</span><span>₹${inrPlain(gst.igstAmount)}</span></div>`
      : `<div class="total-row"><span>CGST ${half}%</span><span>₹${inrPlain(gst.cgstAmount)}</span></div>
    <div class="total-row"><span>SGST ${half}%</span><span>₹${inrPlain(gst.sgstAmount)}</span></div>`;
  return `
    ${gst.sacCode ? `<div class="total-row"><span>SAC</span><span>${gst.sacCode}</span></div>` : ""}
    <div class="total-row"><span>Taxable value</span><span>₹${inrPlain(gst.taxableValue)}</span></div>
    ${taxRows}`;
}

export function roundMoney(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Tax = Inclusive × Rate / (100 + Rate) */
export function extractInclusiveTax(inclusiveAmount: number, taxPercent: number) {
  const inclusive = Math.max(0, Number(inclusiveAmount) || 0);
  const rate = Math.max(0, Number(taxPercent) || 0);
  if (inclusive === 0 || rate === 0) {
    return { taxableAmount: roundMoney(inclusive), taxAmount: 0 };
  }
  const taxAmount = roundMoney((inclusive * rate) / (100 + rate));
  return { taxableAmount: roundMoney(inclusive - taxAmount), taxAmount };
}

export function breakdownGstInvoice(input: {
  lineItems: { description?: string; quantity: number; unitPrice: number }[];
  taxPercent?: number;
  priceMode?: GstPriceMode;
  supplyType?: GstSupplyType;
}) {
  const taxPercent = Math.max(0, Number(input.taxPercent) || 0);
  const priceMode: GstPriceMode = input.priceMode === "EXCLUSIVE" ? "EXCLUSIVE" : "INCLUSIVE";
  const supplyType: GstSupplyType = input.supplyType === "INTER" ? "INTER" : "INTRA";

  const lineItems = (input.lineItems || []).map((row) => {
    const quantity = Math.max(1, Number(row.quantity) || 1);
    const unitPrice = Math.max(0, Number(row.unitPrice) || 0);
    const lineGross = roundMoney(quantity * unitPrice);

    let taxableAmount: number;
    let taxAmount: number;
    let amount: number;

    if (priceMode === "EXCLUSIVE") {
      taxableAmount = lineGross;
      taxAmount = roundMoney((lineGross * taxPercent) / 100);
      amount = roundMoney(taxableAmount + taxAmount);
    } else {
      const extracted = extractInclusiveTax(lineGross, taxPercent);
      taxableAmount = extracted.taxableAmount;
      taxAmount = extracted.taxAmount;
      amount = lineGross;
    }

    const cgstAmount = supplyType === "INTRA" ? roundMoney(taxAmount / 2) : 0;
    const sgstAmount = supplyType === "INTRA" ? roundMoney(taxAmount - cgstAmount) : 0;
    const igstAmount = supplyType === "INTER" ? taxAmount : 0;

    return {
      description: String(row.description || "").trim() || "Item",
      quantity,
      unitPrice,
      amount,
      taxableAmount,
      taxAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
    };
  });

  const taxableValue = roundMoney(lineItems.reduce((sum, row) => sum + row.taxableAmount, 0));
  const taxAmount = roundMoney(lineItems.reduce((sum, row) => sum + row.taxAmount, 0));
  const totalAmount = roundMoney(lineItems.reduce((sum, row) => sum + row.amount, 0));
  const cgstAmount = supplyType === "INTRA" ? roundMoney(taxAmount / 2) : 0;
  const sgstAmount = supplyType === "INTRA" ? roundMoney(taxAmount - cgstAmount) : 0;
  const igstAmount = supplyType === "INTER" ? taxAmount : 0;

  return {
    priceMode,
    supplyType,
    taxPercent,
    lineItems,
    taxableValue,
    subtotal: taxableValue,
    taxAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalAmount,
    cgstRate: supplyType === "INTRA" && taxPercent ? taxPercent / 2 : 0,
    sgstRate: supplyType === "INTRA" && taxPercent ? taxPercent / 2 : 0,
    igstRate: supplyType === "INTER" ? taxPercent : 0,
  };
}
