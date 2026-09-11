# Frontend — Apolo Sports (sitio público)

React + Vite + Tailwind CSS. Consume la API del backend (`apolo-sports-backend`).

## Instalación

```bash
npm install
cp .env.example .env
# Confirma que VITE_API_URL apunte a tu backend (por defecto http://localhost:4000/api)
```

## Ejecutar en desarrollo

```bash
npm run dev
```

Con el backend corriendo en `localhost:4000`, abre `http://localhost:5173`.

## Estructura

- `src/api/` — funciones que llaman a cada grupo de endpoints del backend
- `src/context/AuthContext.jsx` — sesión de cliente (token en localStorage)
- `src/context/CartContext.jsx` — estado del carrito, sincronizado con el backend
- `src/components/` — Header, Footer, Logo, ProductCard (reutilizables)
- `src/pages/` — una página por ruta

## Páginas construidas

| Ruta | Página |
|---|---|
| `/` | Home |
| `/categoria/:slug` | Catálogo por categoría (hombre, mujer, accesorios) con subcategorías |
| `/buscar?q=` | Resultados de búsqueda |
| `/producto/:slug` | Ficha de producto — selección de talla/color, agregar al carrito |
| `/carrito` | Carrito + formulario de envío para crear la orden |
| `/login`, `/registro` | Autenticación de cliente |
| `/olvide-contrasena`, `/restablecer-contrasena` | Recuperación de contraseña |
| `/mis-pedidos`, `/pedido/:id` | Historial y confirmación de pedido |

## Decisiones de diseño

- **Paleta y tipografía**: replican la identidad de tus mockups (azul marino `#0A1830`, acento azul `#1E7FE8`, Barlow Condensed para títulos + Inter para texto), definidas en `tailwind.config.js`.
- **Logo**: usé una marca geométrica propia en `src/components/Logo.jsx` en vez de reproducir la ilustración del husky de tus mockups (es arte con derechos del cliente/diseñador original). Reemplázalo por el archivo real cuando lo tengas — es un solo componente, no toca el resto del layout.
- **Imágenes de producto**: el sitio muestra `thumbnail_url` / `media` que vienen del backend (subidas desde el panel admin). Sin productos con imágenes cargadas todavía, las tarjetas muestran un placeholder con el texto "APOLO".

## Pendiente antes de producción

- **Checkout con Wompi**: el flujo actual crea la orden y la deja en `pending_payment`, pero el widget de pago de Wompi (`/api/payments/checkout-signature`) todavía no está conectado en el frontend — es el siguiente paso natural.
- Validación de formularios más completa (actualmente solo usa `required` de HTML).
- Página de favoritos (el ícono de corazón en `ProductCard` está de adorno por ahora, no persiste nada).
