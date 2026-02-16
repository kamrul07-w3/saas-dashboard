import { generateCSV } from "@/lib/csv";

describe("generateCSV", () => {
  it("generates CSV with header and rows", () => {
    const data = [
      { name: "Alice", email: "alice@example.com" },
      { name: "Bob", email: "bob@example.com" },
    ];
    const result = generateCSV(data, ["name", "email"]);
    expect(result).toBe(
      "name,email\nAlice,alice@example.com\nBob,bob@example.com"
    );
  });

  it("escapes fields containing commas", () => {
    const data = [{ name: "Doe, John", email: "john@example.com" }];
    const result = generateCSV(data, ["name", "email"]);
    // Header row has plain column names, data row has escaped value
    expect(result).toBe('name,email\n"Doe, John",john@example.com');
  });

  it("escapes fields containing double quotes", () => {
    const data = [{ name: 'He said "hello"', email: "a@b.com" }];
    const result = generateCSV(data, ["name", "email"]);
    expect(result).toContain('"He said ""hello"""');
  });

  it("escapes fields containing newlines", () => {
    const data = [{ note: "line1\nline2" }];
    const result = generateCSV(data, ["note"]);
    expect(result).toBe('note\n"line1\nline2"');
  });

  it("handles empty data array", () => {
    const result = generateCSV([], ["name", "email"]);
    expect(result).toBe("name,email");
  });

  it("handles null and undefined values", () => {
    const data = [{ name: null, email: undefined }];
    const result = generateCSV(
      data as unknown as Record<string, unknown>[],
      ["name", "email"]
    );
    expect(result).toBe("name,email\n,");
  });

  it("handles missing columns in data", () => {
    const data = [{ name: "Alice" }];
    const result = generateCSV(data, ["name", "email"]);
    expect(result).toBe("name,email\nAlice,");
  });

  it("generates correct output for numeric values", () => {
    const data = [{ name: "Plan A", mrr: 99.99 }];
    const result = generateCSV(data, ["name", "mrr"]);
    expect(result).toBe("name,mrr\nPlan A,99.99");
  });
});
