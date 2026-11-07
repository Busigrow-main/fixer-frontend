import { describe, expect, it } from "vitest";
import {
  FIXXER_AC_SERVICE_SAC,
  FIXXER_SERVICE_GST_PERCENT,
  FIXXER_SERVICE_SAC,
  fixxerServiceSac,
  readServiceInvoiceGst,
  serviceGstBillTotalsHtml,
  serviceGstJobSheetRows,
} from "./gst";

describe("Fixxer service GST (frontend)", () => {
  it("picks SAC 998713 for AC and 998715 otherwise at 18%", () => {
    expect(FIXXER_SERVICE_GST_PERCENT).toBe(18);
    expect(fixxerServiceSac("Refrigerator")).toBe(FIXXER_SERVICE_SAC);
    expect(fixxerServiceSac("ac-repair")).toBe(FIXXER_AC_SERVICE_SAC);
  });

  it("reads backend invoice GST breakdown", () => {
    const gst = readServiceInvoiceGst({
      taxableValue: 1000,
      taxPercent: 18,
      taxAmount: 180,
      cgstAmount: 90,
      sgstAmount: 90,
      igstAmount: 0,
      sacCode: "998713",
      supplyType: "INTRA",
      totalAmount: 1180,
    });
    expect(gst?.taxAmount).toBe(180);
    expect(gst?.cgstAmount).toBe(90);
    expect(gst?.sacCode).toBe("998713");
  });

  it("renders GST rows for job sheet and retail bill", () => {
    const inv = {
      taxableValue: 1000,
      taxPercent: 18,
      taxAmount: 180,
      cgstAmount: 90,
      sgstAmount: 90,
      igstAmount: 0,
      sacCode: "998715",
      supplyType: "INTRA" as const,
    };
    expect(serviceGstJobSheetRows(inv)).toContain("Taxable value");
    expect(serviceGstJobSheetRows(inv)).toContain("CGST");
    expect(serviceGstBillTotalsHtml(inv)).toContain("SAC");
    expect(serviceGstBillTotalsHtml(inv)).toContain("SGST");
  });
});
