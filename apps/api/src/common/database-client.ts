import { db } from "@concourse/database";

export const DATABASE_CLIENT = Symbol("DATABASE_CLIENT");
export type DatabaseClient = typeof db;
