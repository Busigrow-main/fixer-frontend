import {
  breakdownGstInvoice,
  type GstPriceMode,
  type GstSupplyType,
} from "@/app/lib/gst";

export type BillLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  amount?: number;
  taxableAmount?: number;
  taxAmount?: number;
};

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function normalizeBillLines(lineItems: Partial<BillLineItem>[] = []): BillLineItem[] {
  return lineItems.map((row) => {
    const quantity = Math.max(1, Number(row.quantity) || 1);
    const unitPrice = Math.max(0, Number(row.unitPrice) || 0);
    return {
      description: String(row.description || "").trim() || "Item",
      quantity,
      unitPrice,
      amount: Math.round(quantity * unitPrice * 100) / 100,
    };
  });
}

/**
 * Bill totals for GST-inclusive catalog prices.
 * Grand total stays the displayed amount; GST is reverse-calculated (Rule 35).
 */
export function computeBillTotals(
  lineItems: BillLineItem[],
  taxPercent = 0,
  options?: {
    priceMode?: GstPriceMode;
    supplyType?: GstSupplyType;
  },
) {
  const invoice = breakdownGstInvoice({
    lineItems: normalizeBillLines(lineItems),
    taxPercent,
    priceMode: options?.priceMode ?? "INCLUSIVE",
    supplyType: options?.supplyType ?? "INTRA",
  });

  return {
    lineItems: invoice.lineItems,
    subtotal: invoice.subtotal,
    taxAmount: invoice.taxAmount,
    totalAmount: invoice.totalAmount,
    taxableValue: invoice.taxableValue,
    cgstAmount: invoice.cgstAmount,
    sgstAmount: invoice.sgstAmount,
    igstAmount: invoice.igstAmount,
    cgstRate: invoice.cgstRate,
    sgstRate: invoice.sgstRate,
    igstRate: invoice.igstRate,
    priceMode: invoice.priceMode,
    supplyType: invoice.supplyType,
  };
}

export function buildDefaultBillLines(order: any): BillLineItem[] {
  if (order.orderType === "appliance" && order.applianceItem) {
    const item = order.applianceItem;
    return normalizeBillLines([
      {
        description: item.modelNumber
          ? `${item.name} (${item.modelNumber})`
          : item.name,
        quantity: item.quantity ?? 1,
        unitPrice: Number(item.price) || 0,
      },
    ]);
  }

  return normalizeBillLines(
    (order.items ?? []).map((row: any) => {
      const part = row.partId;
      const purchased = Number(row.priceAtPurchase);
      const pricePaise = typeof part?.price === "number" ? part.price : 0;
      return {
        description: part?.name || "Spare Part",
        quantity: row.quantity ?? 1,
        unitPrice: Number.isFinite(purchased) && purchased > 0
          ? purchased
          : Math.round((pricePaise / 100) * 100) / 100,
      };
    }),
  );
}
