export type BillLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  amount?: number;
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

export function computeBillTotals(
  lineItems: BillLineItem[],
  taxPercent = 0,
): { lineItems: BillLineItem[]; subtotal: number; taxAmount: number; totalAmount: number } {
  const normalized = normalizeBillLines(lineItems);
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
