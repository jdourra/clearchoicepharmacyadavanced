"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Message } from "@/lib/auth-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Pill,
  LogOut,
  MessageSquare,
} from "lucide-react"

export default function AdminMessagesPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      const meRes = await fetch("/api/admin/me", { credentials: "include" })
      if (!meRes.ok) {
        router.push("/admin/login")
        return
      }
      const messagesRes = await fetch("/api/admin/messages", { credentials: "include" })
      if (messagesRes.ok) {
        const data = await messagesRes.json()
        const msgList: Message[] = data.messages || []
        setMessages(msgList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
      }
    } catch {
      router.push("/admin/login")
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await fetch("/api/auth/staff-signout", { method: "POST", credentials: "include" })
    router.push("/admin/login")
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
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">Clear Choice Pharmacy - Admin</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</Link>
            <Link href="/admin/orders" className="text-sm font-medium hover:text-primary transition-colors">Orders</Link>
            <Link href="/admin/customers" className="text-sm font-medium hover:text-primary transition-colors">Customers</Link>
            <Link href="/admin/messages" className="text-sm font-medium text-primary">Messages</Link>
          </nav>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Message History</h1>
            <p className="text-muted-foreground mt-1">View all messages sent to patients</p>
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
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <MessageSquare className="h-4 w-4" />
                            {msg.subject && (
                              <Badge variant="outline">
                                {msg.subject.replace("_", " ")}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(msg.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{msg.body}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
