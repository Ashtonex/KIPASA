import { createClient } from "@/lib/supabase/server"
import { updateSiteContent } from "@/actions/content-actions"
import { Upload, Link as LinkIcon, Image as ImageIcon, Sparkles } from "lucide-react"

export default async function ContentManagementPage() {
  const supabase = await createClient()
  
  // Fetch both the Hero Banner and the Just For You section data
  const { data: content } = await supabase
    .from("site_content")
    .select("*")
    .in("slug", ["hero-banner", "just-for-you"])

  const hero = content?.find(c => c.slug === "hero-banner")
  const justForYou = content?.find(c => c.slug === "just-for-you")

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-gray-900">Site Content Manager</h1>
        <p className="text-muted-foreground">Manage your Mutare storefront banners and promotional sections.</p>
      </header>

      {/* --- SECTION 1: MAIN HERO BANNER --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <section className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b">
            <ImageIcon className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-gray-800">Main Hero Banner</h2>
          </div>
          
          <form action={updateSiteContent} className="space-y-6">
            <input type="hidden" name="slug" value="hero-banner" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Main Title</label>
                <input 
                  name="title" 
                  defaultValue={hero?.title} 
                  placeholder="e.g., Welcome to Kipasa"
                  className="w-full p-3 bg-gray-50 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl transition-all outline-none" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Button Text</label>
                <input 
                  name="button_text" 
                  defaultValue={hero?.button_text} 
                  placeholder="e.g., Shop Now"
                  className="w-full p-3 bg-gray-50 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl transition-all outline-none" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Subtitle / Flash Deal Promo Text</label>
              <textarea 
                name="subtitle" 
                defaultValue={hero?.subtitle} 
                placeholder="Flash Deal Promo Text..." 
                className="w-full p-3 bg-gray-50 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl h-24 transition-all outline-none resize-none" 
              />
            </div>
            
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-700">Banner Image Selection</label>
              
              {/* Current Preview */}
              {hero?.image_url && (
                <div className="relative rounded-2xl overflow-hidden border border-gray-100 aspect-[21/9] mb-4">
                  <img src={hero.image_url} alt="Current Banner" className="object-cover w-full h-full" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group cursor-pointer">
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all">
                    <Upload className="w-8 h-8 text-gray-400 mb-2 group-hover:text-primary" />
                    <span className="text-sm font-bold text-gray-600">Upload from Device</span>
                    <input type="file" name="banner_file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>

                <div className="flex flex-col justify-center p-6 bg-gray-50 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <LinkIcon className="w-4 h-4" />
                    <span className="text-sm font-bold">Or paste Image URL</span>
                  </div>
                  <input 
                    name="image_url" 
                    defaultValue={hero?.image_url} 
                    placeholder="https://..." 
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-primary" 
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full md:w-auto bg-black text-white font-black py-4 px-10 rounded-2xl hover:bg-gray-800 active:scale-95 transition-all shadow-lg shadow-black/10">
              Save Banner Changes
            </button>
          </form>
        </section>
      </div>

      {/* --- SECTION 2: JUST FOR YOU EDITOR --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <section className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-gray-800">"Just For You" Section</h2>
          </div>
          
          <form action={updateSiteContent} className="space-y-6">
            <input type="hidden" name="slug" value="just-for-you" />
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Section Title</label>
              <input 
                name="title" 
                defaultValue={justForYou?.title || "Just For You"} 
                className="w-full p-3 bg-gray-50 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Section Description</label>
              <textarea 
                name="subtitle" 
                defaultValue={justForYou?.subtitle || "Curated picks based on what you love."} 
                className="w-full p-3 bg-gray-50 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl h-24 transition-all outline-none resize-none"
              />
            </div>

            <button 
              type="submit" 
              className="w-full md:w-auto bg-black text-white font-black py-4 px-10 rounded-2xl hover:bg-gray-800 active:scale-95 transition-all shadow-lg shadow-black/10"
            >
              Update "Just For You" Text
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}