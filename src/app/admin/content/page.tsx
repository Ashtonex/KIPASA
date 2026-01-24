"use client"

import { useActionState, useEffect, useState } from "react"
import { updateSiteContent } from "@/actions/content-actions"
import { createClient } from "@/lib/supabase/client"
import { Upload, Link as LinkIcon, Image as ImageIcon, Sparkles, Loader2, CheckCircle2 } from "lucide-react"

// --- THE FORM COMPONENT ---
function ContentForm({ initialData, slug, title, icon: Icon }: any) {
  const [state, formAction, isPending] = useActionState(updateSiteContent, null)

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border-none overflow-hidden transition-all mb-10">
      <section className="p-5 md:p-8"> {/* Adjusted padding for mobile */}

        {/* Header Section: Stacks on mobile, row on desktop */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${slug === 'hero-banner' ? 'text-blue-600' : 'text-amber-500'}`} />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{title}</h2>
          </div>

          {/* Status Messages */}
          <div className="min-h-[20px]">
            {state?.success && (
              <div className="flex items-center gap-2 text-green-600 text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-right-4">
                <CheckCircle2 className="w-4 h-4" /> Sync_Complete
              </div>
            )}
            {state?.error && (
              <div className="text-red-500 text-[10px] font-bold uppercase">
                Error: {state.error}
              </div>
            )}
          </div>
        </div>

        <form action={formAction} className="space-y-6">
          {/* --- CRITICAL HIDDEN INPUTS --- */}
          <input type="hidden" name="slug" value={slug} />

          {/* This prevents the image from being deleted if you only update text */}
          <input type="hidden" name="current_image_url" value={initialData?.image_url || ""} />

          {/* Grid: 1 column on mobile, 2 on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Transmission Title</label>
              <input
                name="title"
                defaultValue={initialData?.title || ""}
                className="w-full p-4 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-600 rounded-2xl transition-all outline-none font-bold"
              />
            </div>
            {slug === "hero-banner" && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Action Button Text</label>
                <input
                  name="button_text"
                  defaultValue={initialData?.button_text || ""}
                  className="w-full p-4 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-600 rounded-2xl transition-all outline-none font-bold"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">
              {slug === "hero-banner" ? "Global Broadcast Message" : "Sector Meta Description"}
            </label>
            <textarea
              name="subtitle"
              defaultValue={initialData?.subtitle || ""}
              className="w-full p-4 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-600 rounded-2xl h-24 transition-all outline-none resize-none font-bold"
            />
          </div>

          {slug === "hero-banner" && (
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Visual Asset Selection</label>

              {initialData?.image_url && (
                <div className="relative rounded-[1.5rem] overflow-hidden border-none aspect-[21/9] mb-4 shadow-inner bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={initialData.image_url} alt="Current Banner" className="object-cover w-full h-full" />
                </div>
              )}

              {/* Upload Grid: Stacks on mobile */}
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
                    defaultValue={initialData?.image_url || ""}
                    placeholder="https://..."
                    className="w-full p-3 bg-white border border-slate-100 rounded-xl text-xs font-mono outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full md:w-auto bg-slate-900 text-white font-black py-4 px-12 rounded-2xl hover:bg-blue-600 active:scale-95 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Processing_Push</>
            ) : (
              "Apply Configuration"
            )}
          </button>
        </form>
      </section>
    </div>
  )
}

// --- MAIN PAGE COMPONENT ---
export default function ContentManagementPage() {
  const [content, setContent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from("site_content")
        .select("*")
        .in("slug", ["hero-banner", "just-for-you"])

      if (data) setContent(data)
      setLoading(false)
    }
    fetchData()
  }, [])

  const hero = content?.find(c => c.slug === "hero-banner")
  const justForYou = content?.find(c => c.slug === "just-for-you")

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-10">
      <header>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 uppercase">Site Pipeline</h1>
        <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest mt-1">Status: <span className="text-blue-600">Configuration_Active</span></p>
      </header>

      {/* NOTE: The 'key' prop is VITAL. 
        When data loads, 'hero?.updated_at' changes, forcing the component to re-render 
        and actually populate the 'defaultValue' fields. 
      */}
      <ContentForm
        key={`hero-${hero?.updated_at || 'new'}`}
        initialData={hero}
        slug="hero-banner"
        title="Main Hero Banner"
        icon={ImageIcon}
      />

      <ContentForm
        key={`jfy-${justForYou?.updated_at || 'new'}`}
        initialData={justForYou}
        slug="just-for-you"
        title="Curated Sector"
        icon={Sparkles}
      />
    </div>
  )
}