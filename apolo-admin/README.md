# Panel de administración — Apolo Sports

React + Vite + Tailwind + Recharts. Proyecto separado del sitio público, consume la misma API del backend.

## Instalación

```bash
npm install
cp .env.example .env
```

## Ejecutar

```bash
npm run dev
```

Abre `http://localhost:5174` (o el puerto que indique la terminal — puede chocar con el 5173 del sitio público si ambos corren a la vez, Vite asigna el siguiente disponible automáticamente).

## ⚠️ Requiere un parche en el backend

Mientras construía este panel encontré que el endpoint de productos no permitía ver
borradores/archivados desde el admin (`GET /api/products` siempre filtraba por
`status=published`). Lo arreglé en 2 archivos del backend — **aplica este cambio en tu
`apolo-sports-backend` ya instalado** antes de usar la lista de Productos del panel:

**`backend/src/models/Product.js`** — en el método `findAll`, reemplaza:
```js
const conditions = ["p.status = ?"];
const params = [status];
```
por:
```js
const conditions = [];
const params = [];
if (status) {
  conditions.push("p.status = ?");
  params.push(status);
}
```
Y donde arma el `WHERE` en las dos queries (el SELECT y el COUNT), usa una variable
`whereClause` que sea `conditions.length ? \`WHERE ${conditions.join(" AND ")}\` : ""`
en vez del `WHERE ${conditions.join(" AND ")}` fijo — así no se rompe cuando no hay
ningún filtro.

**`backend/src/controllers/product.controller.js`** — en `listProducts`, cambia:
```js
status: status || "published",
```
por:
```js
const resolvedStatus = status === "all" ? null : status || "published";
// ...
status: resolvedStatus,
```

Si prefieres, dile a Claude "aplica el parche de Product.js que mencionaste" en tu próxima
conversación y te da los archivos completos ya corregidos para copiar y pegar directo.

## Páginas

| Ruta | Página |
|---|---|
| `/login` | Login de administrador |
| `/` | Dashboard — pedidos por estado, alertas de stock bajo, pedidos recientes |
| `/categorias` | Ver y crear categorías |
| `/productos` | Listado con búsqueda y filtro de estado |
| `/productos/nuevo`, `/productos/:id` | Crear/editar producto, variantes (talla/color/stock), imágenes |
| `/pedidos`, `/pedidos/:id` | Listado y detalle de pedidos |

## Nota sobre el Dashboard

El gráfico de "Rendimiento de ventas mensual" de tu mockup necesita datos agregados por
mes que el backend actual no calcula — en vez de inventar números falsos, el dashboard
muestra **datos reales**: pedidos por estado (gráfica de pastel), alertas de stock bajo,
e ingresos totales de pedidos pagados. Si quieres la gráfica de tendencia mensual más
adelante, se puede agregar un endpoint de reportes en el backend que agrupe pedidos por mes.

## Pendiente

- Gestión de usuarios/roles de administrador desde la UI (hoy se crean por script, ver `create-admin.js` del backend).
- Módulo de Marketing y Reportes del sidebar (el mockup los mostraba, no se construyeron aún).
- El listado de pedidos en el backend devuelve máximo 20 sin paginación real conectada en la UI todavía.
