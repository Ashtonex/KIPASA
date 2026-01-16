import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { NewsletterForm } from "@/components/feature/NewsletterForm"
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, Camera } from "lucide-react"

export async function Footer() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from("categories")
    .select("name, slug")
    .limit(5)

  return (
    <footer className="w-full bg-black text-white border-t border-white/10 mt-auto">
      {/* CHANGED BELOW: 
        1. Added 'flex flex-col items-center' to the parent 
        2. Switched 'container' to 'w-full max-w-7xl' for more reliable centering
      */}
      <div className="w-full max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:gap-12">
          
          {/* Column 1: Brand, Socials & Newsletter */}
          <div className="space-y-6">
            <div>
                <h3 className="text-2xl font-bold tracking-tight text-white">Kipasa Store</h3>
                <p className="text-sm text-gray-400 mt-2 max-w-xs">
                  Zimbabwe's premium online shopping destination. Quality products, delivered fast to your door.
                </p>
            </div>

            <div className="flex gap-4">
                <Link href="#" className="p-2 bg-white/10 rounded-full hover:bg-yellow-400 hover:text-black transition-colors">
                  <Facebook className="h-4 w-4" />
                </Link>
                <Link href="#" className="p-2 bg-white/10 rounded-full hover:bg-yellow-400 hover:text-black transition-colors">
                  <Instagram className="h-4 w-4" />
                </Link>
                <Link href="#" className="p-2 bg-white/10 rounded-full hover:bg-yellow-400 hover:text-black transition-colors">
                  <Twitter className="h-4 w-4" />
                </Link>
            </div>

            <div className="pt-2">
              <h4 className="mb-3 text-sm font-semibold text-white">Join our family</h4>
              <NewsletterForm />
            </div>
          </div>

          {/* Column 2: Dynamic Categories */}
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-400">Shop</h3>
            <ul className="space-y-3 text-sm">
              <li>
                  <Link href="/products" className="text-gray-300 hover:text-yellow-400 transition-colors">
                    New Arrivals
                  </Link>
              </li>
              {categories?.map((cat) => (
                <li key={cat.slug}>
                  <Link 
                    href={`/products?category=${cat.slug}`} 
                    className="text-gray-300 hover:text-yellow-400 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                  <Link href="/products?sort=sale" className="text-yellow-400 font-medium hover:underline">
                    Flash Sales
                  </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-400">Support</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/account" className="text-gray-300 hover:text-yellow-400 transition-colors">My Account</Link></li>
              <li><Link href="/account/orders" className="text-gray-300 hover:text-yellow-400 transition-colors">Track My Order</Link></li>
              <li><Link href="/returns" className="text-gray-300 hover:text-yellow-400 transition-colors">Returns Policy</Link></li>
              <li><Link href="/shipping" className="text-gray-300 hover:text-yellow-400 transition-colors">Shipping Info</Link></li>
              
              <li className="pt-4 border-t border-white/5">
                <Link 
                  href="/admin/staff/scanner" 
                  className="flex items-center gap-2 text-gray-500 hover:text-yellow-400 transition-colors text-xs italic"
                >
                  <Camera className="h-3 w-3" />
                  Staff Collection Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-400">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-gray-300">
                <MapPin className="h-5 w-5 text-yellow-400 shrink-0" />
                <span>Mutare CBD Office,<br />Manicaland, Zimbabwe</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <Phone className="h-5 w-5 text-yellow-400 shrink-0" />
                <span>+263 77 690 5673</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <Mail className="h-5 w-5 text-yellow-400 shrink-0" />
                <span>support@kipasa.co.zw</span>
              </li>
            </ul>
          </div>

        </div>
        
        {/* Bottom Copyright */}
        <div className="mt-12 border-t border-white/10 pt-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Kipasa Store. By Flectere.
          </p>
          <div className="flex gap-6 text-xs text-gray-500">
             <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
             <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}