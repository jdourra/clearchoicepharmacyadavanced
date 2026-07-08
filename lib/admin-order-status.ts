export function getOrderStatusBadgeClass(status: string): string {
  const statusStyles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    ready: "bg-green-100 text-green-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  }
  return statusStyles[status] || "bg-gray-100 text-gray-800"
}
