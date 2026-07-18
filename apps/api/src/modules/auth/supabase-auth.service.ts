import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient } from "@supabase/supabase-js";

export type SupabaseIdentity = { id: string; email: string };
@Injectable()
export class SupabaseAuthService {
  constructor(private readonly config: ConfigService) {}
  async sendMagicLink(email: string, redirectPath = "/auth/callback") {
    const origin = this.config.get<string>("supabase.publicWebOrigin");
    if (!origin) throw new Error("API_PUBLIC_WEB_ORIGIN is missing.");
    if (!redirectPath.startsWith("/") || redirectPath.startsWith("//")) {
      throw new Error("Magic Link redirect must be a local path.");
    }
    const { error } = await this.client().auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin.replace(/\/$/, "")}${redirectPath}`,
      },
    });
    if (error) throw error;
  }
  async identity(accessToken: string): Promise<SupabaseIdentity | undefined> {
    const { data, error } = await this.client().auth.getUser(accessToken);
    return error || !data.user?.email
      ? undefined
      : { id: data.user.id, email: data.user.email.toLowerCase() };
  }
  private client() {
    const url = this.config.get<string>("supabase.url"),
      key = this.config.get<string>("supabase.serviceRoleKey");
    if (!url || !key) throw new Error("Supabase configuration is missing.");
    return createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
}
