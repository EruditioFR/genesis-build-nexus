import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Eye, Trash2, Check, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read: boolean;
  created_at: string;
}

export default function AdminContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setMessages(data);
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase.from("contact_messages").update({ read: true }).eq("id", id);
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
  };

  const deleteMessage = async (id: string) => {
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (!error) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selected?.id === id) setSelected(null);
      toast.success("Message supprimé");
    }
  };

  const openMessage = (msg: ContactMessage) => {
    setSelected(msg);
    if (!msg.read) markAsRead(msg.id);
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Mail className="h-6 w-6 text-primary" />
          Messages de contact
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">{unreadCount} non lu{unreadCount > 1 ? "s" : ""}</Badge>
          )}
        </h1>
        <Button variant="outline" size="sm" onClick={fetchMessages} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Rafraîchir
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Chargement…</div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Aucun message de contact</div>
          ) : (
            <>
              {/* Mobile card layout */}
              <div className="lg:hidden divide-y">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 cursor-pointer ${!msg.read ? "bg-primary/5" : ""}`}
                    onClick={() => openMessage(msg)}
                  >
                    <div className="flex items-start gap-2">
                      {!msg.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${!msg.read ? "font-medium" : ""}`}>{msg.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{msg.subject || "Sans sujet"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(msg.created_at), "d MMM yyyy HH:mm", { locale: fr })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {!msg.read && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => markAsRead(msg.id)}>
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteMessage(msg.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop table */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8" />
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Sujet</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((msg) => (
                      <TableRow key={msg.id} className={`cursor-pointer ${!msg.read ? "bg-primary/5 font-medium" : ""}`} onClick={() => openMessage(msg)}>
                        <TableCell>{!msg.read && <div className="w-2 h-2 rounded-full bg-primary" />}</TableCell>
                        <TableCell>{msg.name}</TableCell>
                        <TableCell className="text-muted-foreground">{msg.email}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{msg.subject || "—"}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{format(new Date(msg.created_at), "d MMM yyyy HH:mm", { locale: fr })}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            {!msg.read && <Button variant="ghost" size="icon" onClick={() => markAsRead(msg.id)}><Check className="h-4 w-4" /></Button>}
                            <Button variant="ghost" size="icon" onClick={() => deleteMessage(msg.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              {selected?.subject || "Message de contact"}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">De :</span>
                  <p className="font-medium">{selected.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email :</span>
                  <p className="font-medium">
                    <a href={`mailto:${selected.email}`} className="text-primary hover:underline">{selected.email}</a>
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Reçu le :</span>
                  <p>{format(new Date(selected.created_at), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}</p>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap text-sm">
                {selected.message}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" asChild>
                  <a href={`mailto:${selected.email}?subject=Re: ${selected.subject || "Votre message"}`}>
                    Répondre par email
                  </a>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteMessage(selected.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
