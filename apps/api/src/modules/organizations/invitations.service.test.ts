import { BadRequestException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

const { db, insertValues, setRlsContext } = vi.hoisted(() => {
  const values = vi.fn();
  return {
    db: {
      insert: vi.fn(() => ({ values })),
      select: vi.fn(),
      transaction: vi.fn(),
    },
    insertValues: values,
    setRlsContext: vi.fn(),
  };
});

vi.mock("@concourse/database", () => ({ db, setRlsContext }));
vi.mock("./memberships.repository", () => ({
  MembershipsRepository: class MembershipsRepository {},
}));

import {
  hashInvitationToken,
  InvitationsService,
  normalizeInvitationEmail,
} from "./invitations.service";

describe("InvitationsService", () => {
  it("creates a hashed 14-day organization-member invitation token", async () => {
    insertValues.mockResolvedValue(undefined);
    db.transaction.mockImplementation(async (work) =>
      work({
        select: () => ({
          from: () => ({
            where: () => Promise.resolve([{ id: "user-id", email: "member@example.com" }]),
          }),
        }),
        insert: () => ({
          values: () => ({
            onConflictDoNothing: () => ({
              returning: () => Promise.resolve([{ id: "membership-id" }]),
            }),
          }),
        }),
      }),
    );
    const service = new InvitationsService();

    const invitation = await service.createOrganizationInvitation({
      organizationId: "organization-id",
      email: " MEMBER@EXAMPLE.COM ",
    });

    expect(invitation.token).not.toBe(hashInvitationToken(invitation.token));
    expect(insertValues).not.toHaveBeenCalled();
    expect(setRlsContext).toHaveBeenCalledWith(
      expect.anything(),
      "organization-id",
      undefined,
    );
    expect(db.transaction).toHaveBeenCalled();
    expect(
      db.transaction.mock.calls[0]?.[0],
    ).toEqual(expect.any(Function));
    await expect(
      db.transaction.mock.results[0]?.value,
    ).resolves.toEqual(expect.objectContaining({ token: invitation.token }));
  });

  it("rejects invalid invitation input", async () => {
    const service = new InvitationsService();

    await expect(
      service.createOrganizationInvitation({
        organizationId: "organization-id",
        email: "invalid",
      }),
    ).rejects.toThrow(BadRequestException);
    expect(normalizeInvitationEmail(" MEMBER@EXAMPLE.COM ")).toBe(
      "member@example.com",
    );
  });

  it("rejects used tokens during lookup", async () => {
    const service = new InvitationsService();
    db.select.mockReturnValue({
      from: () => ({
        where: () =>
          Promise.resolve([
            {
              kind: "invite",
              revokedAt: null,
              usedAt: new Date(),
              expiresAt: new Date(Date.now() + 60_000),
              payload: {
                type: "organization_membership",
                organizationId: "organization-id",
                role: "member",
                email: "member@example.com",
              },
            },
          ]),
      }),
    });

    await expect(service.lookup("used-token")).rejects.toThrow(
      BadRequestException,
    );
  });
});
