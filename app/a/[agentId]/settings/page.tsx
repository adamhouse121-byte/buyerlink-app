import { supabaseServer } from "@/lib/supabaseServer";
import SettingsClient from "./settings.client";

export default async function Settings({
  params,
}: { params: { agentId: string } }) {
  const sb = supabaseServer();
  const { agentId } = params;

  const { data: agent } = await sb
    .from("agents")
    .select("id,display_name,email,brand_color,logo_url")
    .eq("id", agentId)
    .single();

  const { data: forms } = await sb
    .from("forms")
    .select("id,name")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: true });

  return (
    <SettingsClient
      agentId={agentId}
      agent={agent || null}
      forms={forms || []}
    />
  );
}
