-- =====================================================
-- Schema: Apolo Sports — E-commerce
-- Motor: MySQL 8+
-- =====================================================

CREATE DATABASE IF NOT EXISTS apolo_sports
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE apolo_sports;

-- ---------------------------------------------------
-- Categorías (Hombre, Mujer, Accesorios, y subcategorías)
-- ---------------------------------------------------
CREATE TABLE categories (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  slug          VARCHAR(120) NOT NULL UNIQUE,
  parent_id     INT UNSIGNED NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------
-- Productos
-- ---------------------------------------------------
CREATE TABLE products (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id   INT UNSIGNED NOT NULL,
  brand         VARCHAR(100) NOT NULL DEFAULT 'Apolo Sports',
  name          VARCHAR(150) NOT NULL,
  slug          VARCHAR(180) NOT NULL UNIQUE,
  short_description VARCHAR(255),
  description   TEXT,
  base_price    DECIMAL(10,2) NOT NULL,
  offer_price   DECIMAL(10,2) NULL,               -- precio de oferta, opcional
  sku           VARCHAR(100) NOT NULL UNIQUE,        -- SKU a nivel producto (mockup lo maneja así en el form simple)
  featured      BOOLEAN NOT NULL DEFAULT FALSE,     -- "Producto Destacado" del mockup
  taxable       BOOLEAN NOT NULL DEFAULT FALSE,     -- "Impuesto Aplicable"
  visibility    ENUM('store_and_search','search_only','hidden') NOT NULL DEFAULT 'store_and_search',
  status        ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  INDEX idx_products_status (status),
  INDEX idx_products_visibility (visibility)
) ENGINE=InnoDB;

-- ---------------------------------------------------
-- Imágenes / video del producto
-- ---------------------------------------------------
CREATE TABLE product_media (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id    INT UNSIGNED NOT NULL,
  url           VARCHAR(500) NOT NULL,
  media_type    ENUM('image','video') NOT NULL DEFAULT 'image',
  sort_order    SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------
-- Variantes (talla + color) — cada una con su propio stock
-- Si el producto es "talla única", se crea una sola variante con size='UNICA'
-- ---------------------------------------------------
CREATE TABLE product_variants (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id          INT UNSIGNED NOT NULL,
  size                VARCHAR(20) NOT NULL,
  color               VARCHAR(40) NOT NULL DEFAULT 'Único',
  color_hex           VARCHAR(7) NULL,             -- para pintar el swatch en el frontend, ej. '#1a1a1a'
  stock               INT NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 5,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uq_product_size_color (product_id, size, color)
) ENGINE=InnoDB;

CREATE TABLE inventory_movements (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  variant_id    INT UNSIGNED NOT NULL,
  change_qty    INT NOT NULL,
  reason        ENUM('purchase_order','sale','return','adjustment','reservation','reservation_release') NOT NULL,
  reference_id  BIGINT UNSIGNED NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id)
) ENGINE=InnoDB;

-- ---------------------------------------------------
-- Clientes (rol "Usuario" del sitio público)
-- ---------------------------------------------------
CREATE TABLE customers (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(150) NOT NULL,
  phone         VARCHAR(30),
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE customer_addresses (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id   INT UNSIGNED NOT NULL,
  label         VARCHAR(50),
  address_line  VARCHAR(255) NOT NULL,
  city          VARCHAR(100) NOT NULL,
  department    VARCHAR(100) NOT NULL,
  is_default    BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tokens de recuperación de contraseña (para clientes y administradores)
CREATE TABLE password_reset_tokens (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  account_type  ENUM('customer','admin') NOT NULL,
  account_id    INT UNSIGNED NOT NULL,
  token_hash    VARCHAR(255) NOT NULL,          -- se guarda el hash del token, nunca el token en texto plano
  expires_at    DATETIME NOT NULL,
  used_at       DATETIME NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reset_account (account_type, account_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------
-- Administradores (rol "Administrador")
-- ---------------------------------------------------
CREATE TABLE admin_users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(150) NOT NULL,
  role          ENUM('owner','staff') NOT NULL DEFAULT 'staff',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------
-- Carrito persistente (uno activo por cliente)
-- ---------------------------------------------------
CREATE TABLE carts (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id   INT UNSIGNED NOT NULL UNIQUE,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE cart_items (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cart_id       INT UNSIGNED NOT NULL,
  variant_id    INT UNSIGNED NOT NULL,
  quantity      INT NOT NULL DEFAULT 1,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
  UNIQUE KEY uq_cart_variant (cart_id, variant_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------
-- Órdenes
-- ---------------------------------------------------
CREATE TABLE orders (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number    VARCHAR(30) NOT NULL UNIQUE,
  customer_id     INT UNSIGNED NULL,
  customer_email  VARCHAR(180) NOT NULL,
  status          ENUM('pending_payment','paid','processing','shipped','delivered','cancelled','refunded')
                    NOT NULL DEFAULT 'pending_payment',
  subtotal        DECIMAL(10,2) NOT NULL,
  shipping_cost   DECIMAL(10,2) NOT NULL DEFAULT 0,
  total           DECIMAL(10,2) NOT NULL,
  shipping_address_line VARCHAR(255) NOT NULL,
  shipping_city   VARCHAR(100) NOT NULL,
  shipping_department VARCHAR(100) NOT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  INDEX idx_orders_status (status),
  INDEX idx_orders_email (customer_email)
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id      BIGINT UNSIGNED NOT NULL,
  variant_id    INT UNSIGNED NOT NULL,
  product_name  VARCHAR(150) NOT NULL,
  size          VARCHAR(20) NOT NULL,
  color         VARCHAR(40) NOT NULL,
  unit_price    DECIMAL(10,2) NOT NULL,
  quantity      INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id)
) ENGINE=InnoDB;

-- ---------------------------------------------------
-- Pagos (Wompi)
-- ---------------------------------------------------
CREATE TABLE payments (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id          BIGINT UNSIGNED NOT NULL,
  provider          VARCHAR(30) NOT NULL DEFAULT 'wompi',
  provider_tx_id    VARCHAR(120) NOT NULL,
  payment_method    VARCHAR(30) NOT NULL,
  status            ENUM('pending','approved','declined','error','voided') NOT NULL DEFAULT 'pending',
  amount            DECIMAL(10,2) NOT NULL,
  raw_response      JSON NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  UNIQUE KEY uq_provider_tx (provider, provider_tx_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------
-- Datos iniciales de categorías, según los mockups (Hombre, Mujer, Accesorios)
-- ---------------------------------------------------
INSERT INTO categories (name, slug) VALUES
  ('Hombre', 'hombre'),
  ('Mujer', 'mujer'),
  ('Accesorios', 'accesorios');

INSERT INTO categories (name, slug, parent_id) VALUES
  ('Camisetas', 'camisetas-hombre', 1),
  ('Pantalonetas', 'pantalonetas-hombre', 1),
  ('Sudaderas', 'sudaderas-hombre', 1),
  ('Pantalones', 'pantalones-hombre', 1),
  ('Sets Deportivos', 'sets-deportivos-hombre', 1);
USE apolo_sports;

CREATE TABLE IF NOT EXISTS wishlist_items (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id   INT UNSIGNED NOT NULL,
  product_id    INT UNSIGNED NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uq_customer_product (customer_id, product_id)
) ENGINE=InnoDB;