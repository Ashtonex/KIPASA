import { createClient } from "@/lib/supabase/server"
import { updateSiteContent } from "@/actions/content-actions"
import { Upload, Link as LinkIcon, Image as ImageIcon, Sparkles } from "lucide-react"

export default async function ContentManagementPage() {
  const supabase = await createClient()
  
  const { data: content } = await supabase
    .from("site_content")
    .select("*")
    .in("slug", ["hero-banner", "just-for-you"])

  const hero = content?.find(c => c.slug === "hero-banner")
  const justForYou = content?.find(c => c.slug === "just-for-you")

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">Site Pipeline</h1>
        <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest mt-1">Status: <span className="text-blue-600">Configuration_Active</span></p>
      </header>

      {/* --- SECTION 1: MAIN HERO BANNER --- */}
      <div className="bg-white rounded-[2rem] shadow-xl border-none overflow-hidden transition-all">
        <section className="p-8">
          <div className="flex items-center gap-2 mb-8 pb-4 border-b border-slate-50">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Main Hero Banner</h2>
          </div>
          
          {/* FIX: Wrapped action to satisfy TypeScript Promise<void> requirement */}
          <form action={async (formData) => { await updateSiteContent(formData); }} className="space-y-6">
            <input type="hidden" name="slug" value="hero-banner" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Transmission Title</label>
                <input 
                  name="title" 
                  defaultValue={hero?.title} 
                  className="w-full p-4 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-600 rounded-2xl transition-all outline-none font-bold" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Action Button Text</label>
                <input 
                  name="button_text" 
                  defaultValue={hero?.button_text} 
                  className="w-full p-4 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-600 rounded-2xl transition-all outline-none font-bold" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Global Broadcast Message</label>
              <textarea 
                name="subtitle" 
                defaultValue={hero?.subtitle} 
                className="w-full p-4 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-600 rounded-2xl h-24 transition-all outline-none resize-none font-bold" 
              />
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Visual Asset Selection</label>
              
              {hero?.image_url && (
                <div className="relative rounded-[1.5rem] overflow-hidden border-none aspect-[21/9] mb-4 shadow-inner">
                  <img src={hero.image_url} alt="Current Banner" className="object-cover w-full h-full" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group cursor-pointer">
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-100 rounded-2xl hover:border-blue-600 hover:bg-blue-50 transition-all">
                    <Upload className="w-8 h-8 text-slate-300 mb-2 group-hover:text-blue-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Upload_Asset</span>
                    <input type="file" name="banner_file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>

                <div className="flex flex-col justify-center p-6 bg-slate-50 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <LinkIcon className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">External_Hash_URL</span>
                  </div>
                  <input 
                    name="image_url" 
                    defaultValue={hero?.image_url} 
                    className="w-full p-3 bg-white border border-slate-100 rounded-xl text-xs font-mono outline-none focus:border-blue-600" 
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full md:w-auto bg-slate-900 text-white font-black py-4 px-12 rounded-2xl hover:bg-blue-600 active:scale-95 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-[11px]">
              Apply Configuration
            </button>
          </form>
        </section>
      </div>

      {/* --- SECTION 2: JUST FOR YOU EDITOR --- */}
      <div className="bg-white rounded-[2rem] shadow-xl border-none overflow-hidden transition-all">
        <section className="p-8">
          <div className="flex items-center gap-2 mb-8 pb-4 border-b border-slate-50">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Curated Sector</h2>
          </div>
          
          {/* FIX: Wrapped action to satisfy TypeScript Promise<void> requirement */}
          <form action={async (formData) => { await updateSiteContent(formData); }} className="space-y-6">
            <input type="hidden" name="slug" value="just-for-you" />
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Sector Label</label>
              <input 
                name="title" 
                defaultValue={justForYou?.title || "Just For You"} 
                className="w-full p-4 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-600 rounded-2xl transition-all outline-none font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Sector Meta Description</label>
              <textarea 
                name="subtitle" 
                defaultValue={justForYou?.subtitle || "Curated picks based on what you love."} 
                className="w-full p-4 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-600 rounded-2xl h-24 transition-all outline-none resize-none font-bold"
              />
            </div>

            <button 
              type="submit" 
              className="w-full md:w-auto bg-slate-900 text-white font-black py-4 px-12 rounded-2xl hover:bg-amber-600 active:scale-95 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-[11px]"
            >
              Update Curated Sector
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}