import { headers } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

export default async function AgentQR({ params }: { params: { agentId: string } }) {
  const sb = supabaseServer();
  const { data: form } = await sb
    .from("forms").select("id").eq("agent_id", params.agentId)
    .order("created_at", { ascending: true }).limit(1).single();
  if (!form) return <main><h1>QR</h1><p>No form found for this agent.</p></main>;

  const h = headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const url = `${origin}/form/${form.id}`;
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(url)}`;

  return (
    <main style={{maxWidth:600, margin:"40px auto", textAlign:"center"}}>
      <h1>Buyer Form QR</h1>
      <p style={{opacity:.7}}>{url}</p>
      <img src={qr} alt="QR" width={320} height={320}/>
      <p style={{marginTop:12}}><a href={qr} download={`buyer-form-${form.id}.png`}>Download PNG</a></p>
    </main>
  );
}
