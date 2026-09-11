import { useEffect, useState } from "react";
import { getCategories, createCategory } from "../api/admin";

function slugify(text) {
  return text.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => getCategories().then(setCategories).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const rootCategories = categories.filter((c) => !c.parent_id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await createCategory({ name, slug: slugify(name), parentId: parentId || null });
      setName("");
      setParentId("");
      load();
    } catch (err) {
      setError(err.response?.data?.error || "No pudimos crear la categoría.");
    }
  };

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-apolo-navy mb-6">Categorías</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6">
          {loading ? (
            <p className="text-apolo-steel">Cargando…</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-apolo-steel border-b">
                  <th className="pb-2">Nombre</th>
                  <th className="pb-2">Slug</th>
                  <th className="pb-2">Categoría padre</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} className="border-b border-apolo-navy/5">
                    <td className="py-2 font-medium text-apolo-navy">{c.name}</td>
                    <td className="py-2 text-apolo-steel">{c.slug}</td>
                    <td className="py-2 text-apolo-steel">
                      {categories.find((p) => p.id === c.parent_id)?.name || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 h-fit">
          <h2 className="font-medium text-apolo-navy mb-4">Nueva categoría</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              required
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm"
            />
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Sin categoría padre (raíz)</option>
              {rootCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button className="w-full bg-apolo-blue hover:bg-apolo-blue-light text-white font-semibold py-2.5 rounded-lg transition-colors">
              Crear categoría
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
