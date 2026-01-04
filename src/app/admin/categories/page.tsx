import { getCategories } from "@/actions/admin-products-actions"
import { deleteCategory, addCategory } from "@/actions/category-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, FolderPlus } from "lucide-react"

export default async function CategoryPage() {
  const categories = await getCategories()

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-black">Category Management</h1>

      <form action={async (formData) => {
        "use server"
        const name = formData.get("name") as string
        if (name) await addCategory(name)
      }} className="flex gap-2">
        <Input name="name" placeholder="New Category Name (e.g. Perfumes)" required />
        <Button type="submit"><FolderPlus className="mr-2 h-4 w-4" /> Add</Button>
      </form>

      <div className="bg-white border rounded-2xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 font-bold uppercase text-[10px] tracking-widest text-gray-500">
            <tr>
              <th className="p-4">Category Name</th>
              <th className="p-4">Slug</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((cat) => (
              <tr key={cat.value} className="hover:bg-gray-50">
                <td className="p-4 font-bold">{cat.label}</td>
                <td className="p-4 text-gray-400 font-mono text-xs">{cat.value}</td>
                <td className="p-4 text-right">
                  <form action={deleteCategory.bind(null, cat.value)}>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}