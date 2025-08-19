import React from "react";
import ClientForm from "./ClientForm";
import { supabaseServer } from "@/lib/supabaseServer";

export default async function Page({ params }: { params: { formId: string } }) {
  const { formId } = params;
  const sb = supabaseServer();

  // Fetch form -> agent branding
  const { data: f } = await sb
    .from("forms")
    .select("agent_id")
    .eq("id", formId)
    .single();

  let accent = "#111";
  let logoUrl: string | null = null;
  let displayName = "Buyer Preferences";

  if (f?.agent_id) {
    const { data: a } = await sb
      .from("agents")
      .select("display_name, brand_color, logo_url")
      .eq("id", f.agent_id)
      .single();
    if (a?.brand_color) accent = a.brand_color;
    if (a?.logo_url) logoUrl = a.logo_url;
    if (a?.display_name) displayName = a.display_name;
  }

  return (
    <div style={{ maxWidth: 760, margin: "32px auto", padding: "0 16px" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        {logoUrl ? <img src={logoUrl} alt="logo" style={{ height: 40, width: "auto" }} /> : null}
        <h1 style={{ margin: 0 }}>{displayName}</h1>
      </header>

      <ClientForm formId={formId} accent={accent} />

      <p style={{ marginTop: 16, fontSize: 12, opacity: 0.7 }}>
        Powered by Buyer Preference Link
      </p>
    </div>
  );
}
