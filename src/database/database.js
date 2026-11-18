
import {open} from 'react-native-nitro-sqlite';

const db =
  globalThis.__sweetCrumbsDatabase ??
  (globalThis.__sweetCrumbsDatabase = open({
    name: 'sweetcrumbs.sqlite',
  }));
  
let databaseReady = false;
let initializationPromise = null;

// Initial products are added only when the Products table is empty.
const DEFAULT_PRODUCTS = [
  {name: 'Chocolate Cake', category: 'Cakes', price: 1800, quantity: 12, emoji: '🍰'},
  {name: 'Vanilla Cupcake', category: 'Cupcakes', price: 150, quantity: 30, emoji: '🧁'},
  {name: 'Glazed Donut', category: 'Donuts', price: 120, quantity: 4, emoji: '🍩'},
  {name: 'Milk Bread', category: 'Bread', price: 180, quantity: 18, emoji: '🍞'},
  {name: 'Butter Biscuit', category: 'Cookies', price: 90, quantity: 5, emoji: '🍪'},
  {name: 'Cream Pastry', category: 'Pastries', price: 220, quantity: 2, emoji: '🥐'},
];

export async function initDatabase() {
  if (databaseReady) {
    return;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    await db.executeAsync(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        customer TEXT,
        subtotal REAL NOT NULL,
        discount REAL NOT NULL,
        total REAL NOT NULL
      )
    `);

    await db.executeAsync(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT NOT NULL,
        name TEXT NOT NULL,
        qty INTEGER NOT NULL,
        total REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id)
      )
    `);

    await db.executeAsync(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        emoji TEXT NOT NULL
      )
    `);

    const countResult = await db.executeAsync(
      'SELECT COUNT(*) AS count FROM products',
    );

    const productCount = countResult.rows._array[0].count;

    if (productCount === 0) {
      for (const product of DEFAULT_PRODUCTS) {
        await db.executeAsync(
          `INSERT INTO products
           (name, category, price, quantity, emoji)
           VALUES (?, ?, ?, ?, ?)`,
          [
            product.name,
            product.category,
            product.price,
            product.quantity,
            product.emoji,
          ],
        );
      }
    }

    databaseReady = true;
  })();

  try {
    await initializationPromise;
  } catch (error) {
    initializationPromise = null;
    throw error;
  }
}

// ---------------- PRODUCTS ----------------

// Get all products
export async function getProducts() {
  await initDatabase();

  const result = await db.executeAsync(
    'SELECT * FROM products ORDER BY id ASC',
  );

  return result.rows._array;
}

// Add a product
export async function addProduct(product) {
  await initDatabase();

  await db.executeAsync(
    `INSERT INTO products
     (name, category, price, quantity, emoji)
     VALUES (?, ?, ?, ?, ?)`,
    [
      product.name,
      product.category,
      product.price,
      product.quantity,
      product.emoji,
    ],
  );

  const result = await db.executeAsync(
    'SELECT * FROM products WHERE id = last_insert_rowid()',
  );

  return result.rows._array[0];
}

// Update a product
export async function updateProduct(id, product) {
  await initDatabase();

  await db.executeAsync(
    `UPDATE products
     SET name = ?, category = ?, price = ?, quantity = ?, emoji = ?
     WHERE id = ?`,
    [
      product.name,
      product.category,
      product.price,
      product.quantity,
      product.emoji,
      id,
    ],
  );
}

// Delete a product
export async function deleteProduct(id) {
  await initDatabase();

  await db.executeAsync(
    'DELETE FROM products WHERE id = ?',
    [id],
  );
}

// Change stock quantity
export async function changeProductStock(id, amount) {
  await initDatabase();

  await db.executeAsync(
    `UPDATE products
     SET quantity = MAX(0, quantity + ?)
     WHERE id = ?`,
    [amount, id],
  );
}

// ---------------- ORDERS ----------------

// Save order and its items together
export async function saveOrder(order) {
  await initDatabase();

  await db.transaction(async tx => {
    await tx.executeAsync(
      `INSERT INTO orders
       (id, date, created_at, customer, subtotal, discount, total)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        order.id,
        order.date,
        new Date().toISOString(),
        order.customer,
        order.subtotal,
        order.discount,
        order.total,
      ],
    );

    for (const item of order.items) {
      await tx.executeAsync(
        `INSERT INTO order_items
         (order_id, name, qty, total)
         VALUES (?, ?, ?, ?)`,
        [order.id, item.name, item.qty, item.total],
      );
    }
  });

  return order;
}

// Get latest five orders
export async function getRecentOrders() {
  await initDatabase();

  const result = await db.executeAsync(`
    SELECT
      orders.id,
      orders.customer,
      orders.total,
      orders.created_at,
      (
        SELECT COUNT(*)
        FROM order_items
        WHERE order_items.order_id = orders.id
      ) AS items_count
    FROM orders
    ORDER BY orders.created_at DESC
    LIMIT 5
  `);

  return result.rows._array;
}

// Get all orders for Sales History
export async function getAllOrders() {
  await initDatabase();

  const result = await db.executeAsync(`
    SELECT *
    FROM orders
    ORDER BY created_at DESC
  `);

  const orders = result.rows._array;

  for (const order of orders) {
    const itemsResult = await db.executeAsync(
      `SELECT name, qty, total
       FROM order_items
       WHERE order_id = ?`,
      [order.id],
    );

    order.items = itemsResult.rows._array;
  }

  return orders;
}

// Get one order with its items for Receipt
export async function getOrderById(id) {
  await initDatabase();

  const result = await db.executeAsync(
    'SELECT * FROM orders WHERE id = ?',
    [String(id)],
  );

  const order = result.rows._array[0];

  if (!order) {
    return null;
  }

  const itemsResult = await db.executeAsync(
    `SELECT name, qty, total
     FROM order_items
     WHERE order_id = ?`,
    [String(id)],
  );

  order.items = itemsResult.rows._array;

  return order;
}

// ---------------- DASHBOARD ----------------

// Get actual dashboard figures
export async function getDashboardStats() {
  await initDatabase();

  const ordersResult = await db.executeAsync(`
    SELECT
      COUNT(*) AS totalOrders,
      COALESCE(
        SUM(
          CASE
            WHEN date(created_at, 'localtime') = date('now', 'localtime')
            THEN total
            ELSE 0
          END
        ),
        0
      ) AS todaySales,
      COALESCE(
        SUM(
          CASE
            WHEN date(created_at, 'localtime') = date('now', 'localtime')
            THEN 1
            ELSE 0
          END
        ),
        0
      ) AS todayOrders
    FROM orders
  `);

  const productsResult = await db.executeAsync(
    'SELECT COUNT(*) AS totalProducts FROM products',
  );

  return {
    ...ordersResult.rows._array[0],
    totalProducts: productsResult.rows._array[0].totalProducts,
  };
}
