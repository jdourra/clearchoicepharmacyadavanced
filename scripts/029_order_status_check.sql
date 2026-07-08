-- Align orders.status with admin pharmacy workflow (pending, shipped, delivered, etc.)
-- Fixes: violates check constraint "order_status_check" / "orders_status_check" when setting shipped/delivered

ALTER TABLE orders DROP CONSTRAINT IF EXISTS order_status_check;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'pending',
    'pending_rx',
    'processing',
    'ready',
    'shipped',
    'delivered',
    'completed',
    'problem',
    'cancelled'
  ));
