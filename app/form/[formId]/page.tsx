import { supabaseServer } from "@/lib/supabaseServer";
import ClientForm from "./ClientForm";

export default async function Page({ params }: { params: { formId: string } }) {
  const formId = params.formId;
  const sb = supabaseServer();

  // Get the form + agent branding
  const { data: f } = await sb
    .from("forms")
    .select("id, agent_id")
    .eq("id", formId)
    .single();

  let brandColor: string | null = null;
  let logoUrl: string | null = null;
  let displayName: string | null = null;

  if (f?.agent_id) {
    const { data: a } = await sb
      .from("agents")
      .select("display_name, brand_color, logo_url")
      .eq("id", f.agent_id)
      .single();
    brandColor = a?.brand_color ?? null;
    logoUrl = a?.logo_url ?? null;
    displayName = a?.display_name ?? null;
  }

  const accent = brandColor ?? "#111";

  return (
    <main style={{ maxWidth: 760, margin: "32px auto", padding: "0 16px" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        {logoUrl ? <img src={logoUrl} alt="logo" style={{ height: 40, width: "auto" }} /> : null}
        <h1 style={{ margin: 0 }}>{displayName ?? "Buyer Preferences"}</h1>
      </header>

      <style>{`
        :root { --accent: ${accent}; }
        .btn-primary { background: var(--accent); color:#fff; border:none; }
        .btn-primary:hover { filter: brightness(.95); }
        .link-accent { color: var(--accent); }
      `}</styl
