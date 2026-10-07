import { describe, expect, it } from "vitest";
import { quoteTotals } from "./mock";

describe("quote totals", () => {
  it("applies discount before 20% VAT", () => {
    const t = quoteTotals({ lines: [{ id: "1", desc: "", qty: 2, price: 1000 }], discount: 10, tva: 20 });
    expect(t.sub).toBe(2000);
    expect(t.ht).toBe(1800);
    expect(t.tva).toBe(360);
    expect(t.ttc).toBe(2160);
  });
});
