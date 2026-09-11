import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getProduct, createProduct, updateProduct, getCategories,
  addVariant, updateVariant, deleteVariant, uploadProductImages, deleteProductImage,
} from "../api/admin";

function slugify(text) {
  return text.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const EMPTY_FORM = {
  categoryId: "", name: "", slug: "", shortDescription: "", description: "",
  basePrice: "", offerPrice: "", sku: "", featured: false, taxable: false, status: "draft",
};

export default function ProductForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [product, setProduct] = useState(null); // solo existe una vez creado (para poder agregar variantes/imágenes)
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCategories().then(setCategories);
    if (isEditing) {
      getProduct(id).then((p) => {
        setProduct(p);
        setForm({
          categoryId: p.category_id, name: p.name, slug: p.slug,
          shortDescription: p.short_description || "", description: p.description || "",
          basePrice: p.base_price, offerPrice: p.offer_price || "", sku: p.sku,
          featured: !!p.featured, taxable: !!p.taxable, status: p.status,
        });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const handleNameChange = (name) => {
    setForm((f) => ({ ...f, name, slug: isEditing ? f.slug : slugify(name) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const payload = {
        ...form,
        categoryId: Number(form.categoryId),
        basePrice: Number(form.basePrice),
        offerPrice: form.offerPrice ? Number(form.offerPrice) : null,
      };
      if (isEditing) {
        const updated = await updateProduct(id, payload);
        setProduct(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        const created = await createProduct(payload);
        navigate(`/productos/${created.id}`, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || "No pudimos guardar el producto.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-apolo-steel">Cargando…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/productos" className="text-sm text-apolo-steel hover:text-apolo-navy">← Volver a Productos</Link>
          <h1 className="font-display font-bold text-3xl text-apolo-navy">
            {isEditing ? "Editar producto" : "Productos - Añadir Nuevo (+)"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 space-y-4">
          <h2 className="font-medium text-apolo-navy">Información del Producto</h2>

          <div>
            <label className="text-xs text-apolo-steel mb-1 block">Nombre del Producto</label>
            <input
              required
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-apolo-steel mb-1 block">Descripción corta</label>
            <input
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
              className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-apolo-steel mb-1 block">Descripción larga</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {isEditing && <ImagesSection product={product} onUpdated={setProduct} />}
          {isEditing && <VariantsSection product={product} onUpdated={setProduct} />}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 space-y-4">
            <h2 className="font-medium text-apolo-navy">Precios y SKU</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-apolo-steel mb-1 block">Precio Base ($)</label>
                <input
                  required type="number" min="0"
                  value={form.basePrice}
                  onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                  className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-apolo-steel mb-1 block">Precio de Oferta ($)</label>
                <input
                  type="number" min="0"
                  value={form.offerPrice}
                  onChange={(e) => setForm({ ...form, offerPrice: e.target.value })}
                  className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-apolo-steel mb-1 block">SKU</label>
              <input
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 space-y-4">
            <h2 className="font-medium text-apolo-navy">Categoría y Estado</h2>
            <div>
              <label className="text-xs text-apolo-steel mb-1 block">Categoría</label>
              <select
                required
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.parent_id ? `— ${c.name}` : c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-apolo-steel mb-1 block">Estado</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border border-apolo-navy/20 rounded-lg px-3 py-2 text-sm"
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
                <option value="archived">Archivado</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-apolo-navy">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              Producto Destacado
            </label>
            <label className="flex items-center gap-2 text-sm text-apolo-navy">
              <input type="checkbox" checked={form.taxable} onChange={(e) => setForm({ ...form, taxable: e.target.checked })} />
              Impuesto Aplicable
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {saved && <p className="text-sm text-green-600 font-medium">✓ Cambios guardados</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-apolo-blue hover:bg-apolo-blue-light disabled:opacity-50 text-white font-semibold py-3 rounded-full transition-colors"
          >
            {saving ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear producto y continuar"}
          </button>
          {!isEditing && (
            <p className="text-xs text-apolo-steel text-center">
              Después de crear el producto podrás agregar tallas, colores, stock e imágenes.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

function ImagesSection({ product, onUpdated }) {
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setError(null);
    try {
      await uploadProductImages(product.id, files);
      const refreshed = await getProduct(product.id);
      onUpdated(refreshed);
    } catch (err) {
      setError(err.response?.data?.error || "No pudimos subir las imágenes.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (mediaId) => {
    setDeletingId(mediaId);
    setError(null);
    try {
      await deleteProductImage(mediaId);
      const refreshed = await getProduct(product.id);
      onUpdated(refreshed);
    } catch (err) {
      setError(err.response?.data?.error || "No pudimos borrar la imagen.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="pt-4 border-t border-apolo-navy/10">
      <h2 className="font-medium text-apolo-navy mb-3">Multimedia</h2>
      <div className="flex flex-wrap gap-3 mb-3">
        {product.media?.map((m) => (
          <div key={m.id} className="relative group w-20 h-20">
            <img src={m.url} alt="" className="w-full h-full object-cover rounded-lg border border-apolo-navy/10" />
            <button
              type="button"
              onClick={() => handleDelete(m.id)}
              disabled={deletingId === m.id}
              title="Eliminar imagen"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
            >
              {deletingId === m.id ? "…" : "✕"}
            </button>
          </div>
        ))}
      </div>
      <label className="inline-block border-2 border-dashed border-apolo-navy/20 rounded-lg px-6 py-4 text-sm text-apolo-steel cursor-pointer hover:border-apolo-blue">
        {uploading ? "Subiendo…" : "Arrastrar y soltar o examinar (JPG/PNG, máx. 5MB)"}
        <input type="file" accept="image/jpeg,image/png" multiple hidden onChange={handleFiles} disabled={uploading} />
      </label>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}

function VariantsSection({ product, onUpdated }) {
  const [form, setForm] = useState({ size: "", color: "Único", colorHex: "#0A1830", stock: 0 });
  const [error, setError] = useState(null);

  const refresh = async () => onUpdated(await getProduct(product.id));

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await addVariant(product.id, { ...form, stock: Number(form.stock) });
      setForm({ size: "", color: "Único", colorHex: "#0A1830", stock: 0 });
      refresh();
    } catch (err) {
      setError(err.response?.data?.error || "No pudimos agregar la variante.");
    }
  };

  const handleStockChange = async (variantId, stock) => {
    await updateVariant(variantId, { stock: Number(stock) });
    refresh();
  };

  const handleRemove = async (variantId) => {
    await deleteVariant(variantId);
    refresh();
  };

  return (
    <div className="pt-4 border-t border-apolo-navy/10">
      <h2 className="font-medium text-apolo-navy mb-3">Stock por talla y color</h2>

      {product.variants.length > 0 && (
        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="text-left text-apolo-steel border-b">
              <th className="pb-2">Talla</th>
              <th className="pb-2">Color</th>
              <th className="pb-2">Stock</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {product.variants.map((v) => (
              <tr key={v.id} className="border-b border-apolo-navy/5">
                <td className="py-2 font-medium text-apolo-navy">{v.size}</td>
                <td className="py-2 flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: v.color_hex || "#ccc" }} />
                  {v.color}
                </td>
                <td className="py-2">
                  <input
                    type="number" min="0" defaultValue={v.stock}
                    onBlur={(e) => handleStockChange(v.id, e.target.value)}
                    className="w-20 border border-apolo-navy/20 rounded px-2 py-1"
                  />
                </td>
                <td className="py-2 text-right">
                  <button type="button" onClick={() => handleRemove(v.id)} className="text-red-600 text-xs hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="grid grid-cols-4 gap-2 items-end">
        <div>
          <label className="text-xs text-apolo-steel mb-1 block">Talla</label>
          <input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="M" className="w-full border border-apolo-navy/20 rounded-lg px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="text-xs text-apolo-steel mb-1 block">Color</label>
          <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="Negro" className="w-full border border-apolo-navy/20 rounded-lg px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="text-xs text-apolo-steel mb-1 block">Stock</label>
          <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full border border-apolo-navy/20 rounded-lg px-2 py-1.5 text-sm" />
        </div>
        <button type="button" onClick={handleAdd} className="bg-apolo-navy text-white text-sm font-medium py-1.5 rounded-lg">+ Agregar</button>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}