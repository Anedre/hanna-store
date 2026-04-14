"use client";

import { useState, useEffect } from "react";
import { Mail, MailOpen, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

export default function AdminMensajes() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/messages");
      const json = await res.json();
      if (json.success) setMessages(json.data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function markAsRead(id: string) {
    await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read: true }),
    });
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-cream-900">Mensajes de Contacto</h1>
        <p className="text-sm text-cream-500 mt-1">
          {messages.length} mensajes, {unreadCount} sin leer
        </p>
      </div>

      <div className="space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i} className="p-5 animate-pulse">
              <div className="h-4 bg-cream-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-cream-200 rounded w-full" />
            </Card>
          ))
        ) : messages.length === 0 ? (
          <Card className="p-8 text-center">
            <Mail className="h-10 w-10 text-cream-300 mx-auto mb-3" />
            <p className="text-cream-500">No hay mensajes todavia</p>
          </Card>
        ) : (
          messages.map((msg) => (
            <Card
              key={msg.id}
              className={`p-5 cursor-pointer transition-all hover:shadow-md ${
                !msg.read ? "border-l-4 border-l-hanna-500 bg-hanna-50/30" : ""
              }`}
              onClick={() => {
                setSelected(selected === msg.id ? null : msg.id);
                if (!msg.read) markAsRead(msg.id);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.read ? "bg-cream-100" : "bg-hanna-100"
                  }`}>
                    {msg.read ? (
                      <MailOpen className="h-5 w-5 text-cream-400" />
                    ) : (
                      <Mail className="h-5 w-5 text-hanna-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm ${msg.read ? "text-cream-700" : "font-semibold text-cream-900"}`}>
                        {msg.subject}
                      </h3>
                      {!msg.read && <Badge variant="default" size="sm">Nuevo</Badge>}
                    </div>
                    <p className="text-xs text-cream-500 mt-0.5">
                      {msg.name} &middot; {msg.email}
                      {msg.phone && ` · ${msg.phone}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-cream-400 shrink-0">
                  <Clock className="h-3 w-3" />
                  {formatDate(msg.createdAt)}
                </div>
              </div>

              {selected === msg.id && (
                <div className="mt-4 pt-4 border-t border-cream-200">
                  <p className="text-sm text-cream-700 leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <a
                      href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                      className="text-xs text-hanna-600 font-medium hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Responder por email
                    </a>
                    {msg.phone && (
                      <a
                        href={`https://wa.me/51${msg.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-600 font-medium hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
