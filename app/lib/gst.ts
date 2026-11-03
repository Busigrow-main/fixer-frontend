/** Client-side mirror of backend CGST Rule 35 GST engine (inclusive by default). */

export type GstPriceMode = "INCLUSIVE" | "EXCLUSIVE";
export type GstSupplyType = "INTRA" | "INTER";

export const STANDARD_GST_RATES = [0, 5, 12, 18, 28] as const;

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
