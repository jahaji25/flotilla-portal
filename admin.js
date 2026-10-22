let db=null, currentItems=[];
const $=id=>document.getElementById(id);
const configured=()=>{const c=window.SITE_CONFIG||{};return window.supabase&&c.supabaseUrl?.startsWith("https://")&&!c.supabaseUrl.includes("YOUR-PROJECT")&&c.supabaseAnonKey&&!c.supabaseAnonKey.includes("YOUR_");};
function msg(id,text,isError=false){$(id).textContent=text;$(id).classList.toggle("error",isError);}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function resetForm(){$("contentForm").reset();$("itemId").value="";$("itemOrder").value=currentItems.length+1;$("itemPublished").checked=true;$("cancelEdit").classList.add("hidden");}
async function loadItems(){
 const {data,error}=await db.from("site_sections").select("*").order("sort_order");
 if(error){msg("saveMessage",error.message,true);return;}
 currentItems=data||[];
 $("contentList").innerHTML=currentItems.map(x=>`<article class="content-row"><div><strong>${esc(x.title)}</strong><small>${esc(x.slug)} · order ${x.sort_order} · ${x.published?"Published":"Draft"}</small><p>${esc(x.description)}</p></div><div class="row-actions"><button class="secondary-btn edit-btn" data-id="${esc(x.id)}">Edit</button><button class="danger-btn delete-btn" data-id="${esc(x.id)}">Delete</button></div></article>`).join("")||"<p>No sections yet.</p>";
}
async function showSession(){
 const {data:{session}}=await db.auth.getSession();
 $("authPanel").classList.toggle("hidden",!!session);$("editorPanel").classList.toggle("hidden",!session);
 if(session)await loadItems();
}
document.addEventListener("DOMContentLoaded",async()=>{
 if(!configured()){$("setupWarning").classList.remove("hidden");$("authPanel").classList.add("hidden");return;}
 db=window.supabase.createClient(window.SITE_CONFIG.supabaseUrl,window.SITE_CONFIG.supabaseAnonKey);
 $("loginForm").addEventListener("submit",async e=>{e.preventDefault();msg("authMessage","Signing in…");const {error}=await db.auth.signInWithPassword({email:$("email").value,password:$("password").value});if(error){msg("authMessage",error.message,true);return;}msg("authMessage","Signed in.");await showSession();});
 $("logoutBtn").addEventListener("click",async()=>{await db.auth.signOut();await showSession();});
 $("cancelEdit").addEventListener("click",resetForm);
 $("contentForm").addEventListener("submit",async e=>{
   e.preventDefault();const id=$("itemId").value;
   const item={title:$("itemTitle").value.trim(),slug:$("itemSlug").value.trim().toLowerCase().replace(/[^a-z0-9-]/g,"-"),description:$("itemDescription").value.trim(),icon:$("itemIcon").value.trim()||"•",sort_order:Number($("itemOrder").value),published:$("itemPublished").checked};
   const result=id?await db.from("site_sections").update(item).eq("id",id):await db.from("site_sections").insert(item);
   if(result.error){msg("saveMessage",result.error.message,true);return;}
   msg("saveMessage","Saved successfully.");resetForm();await loadItems();
 });
 $("contentList").addEventListener("click",async e=>{
   const id=e.target.dataset.id;if(!id)return;
   if(e.target.classList.contains("edit-btn")){const x=currentItems.find(i=>i.id===id);if(!x)return;$("itemId").value=x.id;$("itemTitle").value=x.title;$("itemSlug").value=x.slug;$("itemDescription").value=x.description;$("itemIcon").value=x.icon||"";$("itemOrder").value=x.sort_order;$("itemPublished").checked=x.published;$("cancelEdit").classList.remove("hidden");window.scrollTo({top:0,behavior:"smooth"});}
   if(e.target.classList.contains("delete-btn")&&confirm("Delete this section?")){const {error}=await db.from("site_sections").delete().eq("id",id);if(error)msg("saveMessage",error.message,true);else{msg("saveMessage","Section deleted.");await loadItems();}}
 });
 await showSession();db.auth.onAuthStateChange(()=>{setTimeout(showSession,0);});
});