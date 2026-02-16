import {
  loginSchema,
  signupSchema,
  createCustomerSchema,
  updateCustomerSchema,
  paginationSchema,
} from "@/lib/validations";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("signupSchema", () => {
  const validData = {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    confirmPassword: "password123",
  };

  it("accepts valid signup data", () => {
    const result = signupSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 2 characters", () => {
    const result = signupSchema.safeParse({ ...validData, name: "J" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = signupSchema.safeParse({ ...validData, email: "bad" });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 8 characters", () => {
    const result = signupSchema.safeParse({
      ...validData,
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = signupSchema.safeParse({
      ...validData,
      confirmPassword: "different123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = signupSchema.safeParse({ ...validData, name: "" });
    expect(result.success).toBe(false);
  });
});

describe("createCustomerSchema", () => {
  it("accepts valid customer data", () => {
    const result = createCustomerSchema.safeParse({
      name: "Acme Corp",
      email: "acme@example.com",
      company: "Acme",
      status: "ACTIVE",
      mrr: 100,
    });
    expect(result.success).toBe(true);
  });

  it("applies defaults for status and mrr", () => {
    const result = createCustomerSchema.safeParse({
      name: "Acme Corp",
      email: "acme@example.com",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("ACTIVE");
      expect(result.data.mrr).toBe(0);
    }
  });

  it("rejects empty name", () => {
    const result = createCustomerSchema.safeParse({
      name: "",
      email: "acme@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = createCustomerSchema.safeParse({
      name: "Acme",
      email: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative mrr", () => {
    const result = createCustomerSchema.safeParse({
      name: "Acme",
      email: "acme@example.com",
      mrr: -10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = createCustomerSchema.safeParse({
      name: "Acme",
      email: "acme@example.com",
      status: "INVALID",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid statuses", () => {
    for (const status of ["ACTIVE", "INACTIVE", "CHURNED"]) {
      const result = createCustomerSchema.safeParse({
        name: "Acme",
        email: "acme@example.com",
        status,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe("updateCustomerSchema", () => {
  it("accepts partial update with just name", () => {
    const result = updateCustomerSchema.safeParse({ name: "Updated" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object (no updates)", () => {
    const result = updateCustomerSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects invalid email in update", () => {
    const result = updateCustomerSchema.safeParse({ email: "bad" });
    expect(result.success).toBe(false);
  });

  it("rejects negative mrr in update", () => {
    const result = updateCustomerSchema.safeParse({ mrr: -5 });
    expect(result.success).toBe(false);
  });

  it("accepts valid partial update with multiple fields", () => {
    const result = updateCustomerSchema.safeParse({
      name: "New Name",
      status: "CHURNED",
      mrr: 250,
    });
    expect(result.success).toBe(true);
  });
});

describe("paginationSchema", () => {
  it("applies defaults when no params given", () => {
    const result = paginationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.perPage).toBe(20);
    }
  });

  it("coerces string values to numbers", () => {
    const result = paginationSchema.safeParse({ page: "3", perPage: "10" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.perPage).toBe(10);
    }
  });

  it("rejects page less than 1", () => {
    const result = paginationSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects perPage greater than 100", () => {
    const result = paginationSchema.safeParse({ perPage: 101 });
    expect(result.success).toBe(false);
  });

  it("rejects negative perPage", () => {
    const result = paginationSchema.safeParse({ perPage: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer page", () => {
    const result = paginationSchema.safeParse({ page: 1.5 });
    expect(result.success).toBe(false);
  });
});
