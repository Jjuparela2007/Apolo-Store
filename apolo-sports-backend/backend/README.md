# Backend — Apolo Sports

API REST en Node.js + Express + MySQL: autenticación (clientes y administradores),
catálogo con inventario por talla/color, subida de imágenes, carrito persistente,
órdenes y pagos con Wompi.

## Instalación

```bash
npm install
cp .env.example .env
# Edita .env con tus credenciales de MySQL, Wompi y SMTP
```

Crea la base de datos:

```bash
mysql -u root -p < ../database/schema.sql
```

## Ejecutar en desarrollo

```bash
npm run dev
```

## Estructura

- `src/config/db.js` — pool de conexión a MySQL
- `src/config/upload.js` — configuración de multer (subida de imágenes, valida JPG/PNG y tamaño máx. 5MB)
- `src/models/` — queries a la base de datos
- `src/controllers/` — lógica de cada endpoint
- `src/routes/` — definición de rutas
- `src/middleware/` — auth (cliente y admin por separado), validaciones, manejo de errores
- `src/services/wompi.service.js` — firma de integridad y verificación de webhook de Wompi
- `src/services/email.service.js` — recuperación de contraseña y confirmación de pedidos

## Endpoints

### Autenticación — Cliente (`/api/auth`)
| Método | Ruta | Descripción |
|---|---|---|
| POST | /register | Registro con validación de email y contraseña segura |
| POST | /login | Devuelve JWT de cliente |
| POST | /forgot-password | Envía correo con enlace de recuperación |
| POST | /reset-password | Cambia la contraseña con el token del correo |

### Autenticación — Administrador (`/api/admin/auth`)
Mismos endpoints que cliente, pero sobre `admin_users` (no hay `/register` público a propósito).

### Catálogo (`/api/products`, `/api/categories`)
| Método | Ruta | Auth |
|---|---|---|
| GET | /api/products?category=&search=&page= | No |
| GET | /api/products/slug/:slug | No |
| POST | /api/products | Admin |
| PUT | /api/products/:id | Admin |
| DELETE | /api/products/:id | Admin (owner) |
| POST | /api/products/:id/variants | Admin |
| POST | /api/products/:id/images | Admin — multipart/form-data, campo `images` |

### Carrito (`/api/cart`) — requiere sesión de cliente
GET `/`, POST `/items`, PUT `/items/:itemId`, DELETE `/items/:itemId`

### Órdenes
- Cliente (`/api/orders`): POST `/` (checkout desde el carrito), GET `/` (historial), GET `/:id`
- Admin (`/api/admin/orders`): GET `/`, GET `/:id`

### Pagos (`/api/payments`)
- POST `/checkout-signature` (cliente) — firma para abrir el widget de Wompi
- POST `/webhook` — Wompi confirma el pago aquí; se valida su firma antes de actuar

## Flujo de compra

1. Cliente arma su carrito (`POST /api/cart/items`).
2. `POST /api/orders` convierte el carrito en una orden y **reserva** el stock (transacción con bloqueo de fila).
3. `POST /api/payments/checkout-signature` da la firma para el widget de Wompi.
4. Wompi confirma vía `POST /api/payments/webhook` → único lugar donde la orden pasa a `paid`, y se envía el correo de confirmación.
5. Si el pago es rechazado, el stock reservado se libera automáticamente.

## Pendiente antes de producción

- Crear el primer `admin_user` manualmente (sin endpoint público de registro, a propósito).
- Configurar la URL del webhook en el dashboard de Wompi.
- Configurar SMTP real (Gmail con contraseña de aplicación, SendGrid, etc.) — sin esto, los correos solo se simulan en consola.
- Política de expiración para órdenes `pending_payment` que nunca se pagan.
