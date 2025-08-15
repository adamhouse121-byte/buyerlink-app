import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request, { params }: { params:{agentId:string} }) {
  const body = await req.json().catch(()=> ({}));
  const { password, display_name, email, brand_color, logo_url } = body || {};
  if (!password || password !== process.env.MAKER_PASSWORD) {
    return new Response(JSON.stringify({ ok:false, error:"Unauthorized" }), { status:401 });
  }
  const sb = supabaseServer();
  const { error } = await sb
    .from("agents")
    .update({ display_name, email, brand_color, logo_url })
    .eq("id", params.agentId);
  if (error) return new Response(JSON.stringify({ ok:false, error:error.message }), { status:400 });
  return new Response(JSON.stringify({ ok:true }), { status:200 });
}
