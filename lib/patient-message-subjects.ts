export function messageSubjectForType(
  messageType: string,
  orderNumber: string
): string {
  const labels: Record<string, string> = {
    prescription_ready: "Prescription ready",
    payment_request: "Payment request",
    shipped: "Order shipped",
    delivered: "Order delivered",
    custom: "Message from pharmacy",
  }
  const label = labels[messageType] || "Message from pharmacy"
  return `${label} — Order #${orderNumber}`
}
