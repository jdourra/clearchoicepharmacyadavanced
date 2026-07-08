export function messageSubjectForType(
  messageType: string,
  orderNumber: string
): string {
  const labels: Record<string, string> = {
    prescription_ready: "Prescription ready",
    payment_request: "Payment request",
    mobile_pay_link: "Pay on your phone",
    missing_prescription_info: "Prescription information needed",
    shipped: "Order shipped",
    delivered: "Order delivered",
    custom: "Message from pharmacy",
  }
  const label = labels[messageType] || "Message from pharmacy"
  return `${label} — Order #${orderNumber}`
}
