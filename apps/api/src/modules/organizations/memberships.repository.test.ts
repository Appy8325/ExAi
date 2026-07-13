import { describe, expect, it, vi } from "vitest";

const { db, setRlsContext, tx } = vi.hoisted(() => {
  const tx = {
    select: () => ({
      from: () => ({ where: () => Promise.resolve([undefined]) }),
    }),
  };
  return {
    db: { transaction: vi.fn((work) => work(tx)) },
    setRlsContext: vi.fn(),
    tx,
  };
});

vi.mock("@concourse/database", () => ({ db, setRlsContext }));

import { MembershipsRepository } from "./memberships.repository";

describe("MembershipsRepository", () => {
  it("establishes RLS context for authorization lookups", async () => {
    const repository = new MembershipsRepository();

    await repository.findByOrganizationAndUser("organization-id", "user-id");

    expect(setRlsContext).toHaveBeenCalledWith(tx, "organization-id", "user-id");
  });
});
