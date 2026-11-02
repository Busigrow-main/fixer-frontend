export type BillLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  amount?: number;
};

export function normalizeBillLines(
  lineItems: Array<Partial<BillLineItem>>,
  fallbackQuantity = 1,
): BillLineItem[] {
  const defaultQuantity = Math.max(1, Number(fallbackQuantity) || 1);

  return lineItems.map((row) => ({
    description: row.description ?? "",
    quantity: Math.max(1, Number(row.quantity) || defaultQuantity),
    unitPrice: Math.max(0, Number(row.unitPrice) || 0),
    ...(row.amount != null ? { amount: Number(row.amount) || 0 } : {}),
  }));
}

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function computeBillTotals(
  lineItems: BillLineItem[],
  taxPercent = 0,
): { lineItems: BillLineItem[]; subtotal: number; taxAmount: number; totalAmount: number } {
  const normalized = lineItems.map((row) => ({
    ...row,
    amount: Math.round(row.quantity * row.unitPrice * 100) / 100,
  }));
  const subtotal = normalized.reduce((sum, row) => sum + (row.amount ?? 0), 0);
  const taxAmount = Math.round(subtotal * (taxPercent / 100) * 100) / 100;
  const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;
  return { lineItems: normalized, subtotal, taxAmount, totalAmount };
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

  return normalizeBillLines((order.items ?? []).map((row: any) => {
    const part = row.partId;
    const pricePaise = typeof part?.price === "number" ? part.price : 0;
    return {
      description: part?.name || "Spare Part",
      quantity: row.quantity ?? 1,
      unitPrice: Math.round((pricePaise / 100) * 100) / 100,
    };
  }));
}
