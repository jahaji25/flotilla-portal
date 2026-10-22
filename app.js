const defaultSections = [
 {title:"Operations",slug:"operations",description:"Operation-related public information and reference pages.",icon:"⚓",sort_order:1},
 {title:"General Information",slug:"general-information",description:"General reference information, berth details and navigation resources.",icon:"🧭",sort_order:2},
 {title:"Organization",slug:"organization",description:"Organization overview and approved staff directory information.",icon:"◈",sort_order:3},
 {title:"Ships / Crafts",slug:"ships-crafts",description:"Individual ship and craft profile pages.",icon:"🚢",sort_order:4},
 {title:"Gallery",slug:"gallery",description:"Photo collections, events and approved media.",icon:"▧",sort_order:5},
 {title:"Weather",slug:"weather",description:"Weather-related reference information and links.",icon:"☁",sort_order:6},
 {title:"Events",slug:"events",description:"Announcements, upcoming events and forecasts.",icon:"▦",sort_order:7},
 {title:"Watch Online",slug:"watch-online",description:"A placeholder for an approved online viewing service.",icon:"▶",sort_order:8}
];
function escapeHtml(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function renderCards(items){
 const root=document.getElementById("sectionCards"); if(!root)return;
 root.innerHTML=items.map(x=>`<article class="section-card" id="${escapeHtml(x.slug)}"><div class="card-icon">${escapeHtml(x.icon||"•")}</div><h3>${escapeHtml(x.title)}</h3><p>${escapeHtml(x.description)}</p><a href="#${escapeHtml(x.slug)}" aria-label="Open ${escapeHtml(x.title)} section">Explore section <span>→</span></a></article>`).join("");
}
document.addEventListener("DOMContentLoaded",async()=>{
 document.getElementById("year").textContent=new Date().getFullYear();
 document.getElementById("mobileToggle").addEventListener("click",()=>document.getElementById("mainNav").classList.toggle("nav-open"));
 renderCards(defaultSections);
 const cfg=window.SITE_CONFIG||{};
 if(window.supabase&&cfg.supabaseUrl?.startsWith("https://")&&!cfg.supabaseUrl.includes("YOUR-PROJECT")&&cfg.supabaseAnonKey&&!cfg.supabaseAnonKey.includes("YOUR_")){
   try{const client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey);const {data,error}=await client.from("site_sections").select("title,slug,description,icon,sort_order").eq("published",true).order("sort_order");if(!error&&data?.length)renderCards(data);}catch(e){console.warn("Using demo content:",e.message);}
 }
});