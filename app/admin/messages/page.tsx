"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { AdminMessageWithContext } from "@/lib/auth-types"
import { staffAuthFetch } from "@/lib/staff-session"
import { AdminHeader } from "@/components/admin-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare,
  Phone,
  User,
  Package,
  ArrowRight,
} from "lucide-react"

function getMessageHref(msg: AdminMessageWithContext): string | null {
  if (msg.order_id) return `/admin/orders/${msg.order_id}`
  if (msg.patientId) return `/admin/customers/${msg.patientId}`
  return null
}

export default function AdminMessagesPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<AdminMessageWithContext[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      const meRes = await staffAuthFetch("/api/admin/me")
      if (!meRes.ok) {
        router.push("/admin/login")
        return
      }
      const messagesRes = await staffAuthFetch("/api/admin/messages")
      if (messagesRes.ok) {
        const data = await messagesRes.json()
        const msgList: AdminMessageWithContext[] = data.messages || []
        setMessages(
          msgList.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        )
      }
    } catch {
      router.push("/admin/login")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <AdminHeader />

      <main className="flex-1 py-8">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Message History</h1>
            <p className="text-muted-foreground mt-1">
              View messages sent to patients — click a row to open the related order or customer
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Messages ({messages.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No messages sent yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => {
                    const href = getMessageHref(msg)

                    return (
                      <div
                        key={msg.id}
                        role={href ? "link" : undefined}
                        tabIndex={href ? 0 : undefined}
                        onClick={() => {
                          if (href) router.push(href)
                        }}
                        onKeyDown={(e) => {
                          if (href && (e.key === "Enter" || e.key === " ")) {
                            e.preventDefault()
                            router.push(href)
                          }
                        }}
                        className={`p-4 border rounded-lg transition-colors ${
                          href
                            ? "hover:bg-muted/50 hover:border-primary/40 cursor-pointer"
                            : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <MessageSquare className="h-4 w-4 shrink-0" />
                              {msg.subject ? (
                                <Badge variant="outline">
                                  {msg.subject.replace(/_/g, " ")}
                                </Badge>
                              ) : null}
                              <span className="text-xs text-muted-foreground">
                                {new Date(msg.created_at).toLocaleString()}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mb-3">
                              {msg.patientName ? (
                                <span className="flex items-center gap-1 text-foreground font-medium">
                                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                                  {msg.patientName}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">Unknown patient</span>
                              )}
                              {msg.patientPhone ? (
                                <a
                                  href={`tel:${msg.patientPhone}`}
                                  className="flex items-center gap-1 text-primary hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Phone className="h-3.5 w-3.5" />
                                  {msg.patientPhone}
                                </a>
                              ) : (
                                <span className="text-muted-foreground">No phone</span>
                              )}
                              {msg.order_id && msg.orderNumber ? (
                                <span className="flex items-center gap-1">
                                  <Package className="h-3.5 w-3.5 text-muted-foreground" />
                                  Order #{msg.orderNumber}
                                  {msg.orderStatus ? (
                                    <Badge variant="secondary" className="text-xs ml-1">
                                      {msg.orderStatus}
                                    </Badge>
                                  ) : null}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">No linked order</span>
                              )}
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2">{msg.body}</p>

                            <div className="flex flex-wrap gap-2 mt-3">
                              {msg.order_id ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Link href={`/admin/orders/${msg.order_id}`}>View order</Link>
                                </Button>
                              ) : null}
                              {msg.patientId ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Link href={`/admin/customers/${msg.patientId}`}>View customer</Link>
                                </Button>
                              ) : null}
                            </div>
                          </div>
                          {href ? (
                            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
