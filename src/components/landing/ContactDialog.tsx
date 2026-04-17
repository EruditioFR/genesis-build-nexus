import { useState, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Send, Mail, User, MessageSquare, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "required").max(100),
  email: z.string().trim().email("email").max(255),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1, "required").max(2000),
});

interface ContactDialogProps {
  trigger: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ContactDialog = ({ trigger, open, onOpenChange }: ContactDialogProps) => {
  const { t } = useTranslation("landing");
  const { t: tc } = useTranslation("common");
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = (v: boolean) => {
    if (!isControlled) setInternalOpen(v);
    onOpenChange?.(v);
  };

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setForm({ name: "", email: "", subject: "", message: "" });
    setErrors({});
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const { error: dbError } = await supabase.from("contact_messages" as any).insert({
        name: result.data.name,
        email: result.data.email,
        subject: result.data.subject || null,
        message: result.data.message,
      } as any);

      if (dbError) throw dbError;

      await supabase.functions.invoke("send-contact-email", {
        body: {
          name: result.data.name,
          email: result.data.email,
          subject: result.data.subject || "Contact via FamilyGarden",
          message: result.data.message,
        },
      });

      setSuccess(true);
      toast.success(t("contact.success"));

      // Auto-close après 2.5s
      setTimeout(() => {
        setDialogOpen(false);
        setTimeout(reset, 300);
      }, 2500);
    } catch {
      toast.error(t("contact.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(v) => {
        setDialogOpen(v);
        if (!v) setTimeout(reset, 300);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[hsl(var(--gold))]/15 mb-2">
            <Mail className="w-6 h-6 text-[hsl(var(--gold))]" />
          </div>
          <DialogTitle className="font-display text-2xl">
            {t("contact.title")}{" "}
            <span className="text-[hsl(var(--gold))]">{t("contact.titleHighlight")}</span>
          </DialogTitle>
          <DialogDescription>{t("contact.subtitle")}</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-12 flex flex-col items-center text-center gap-4">
            <CheckCircle2 className="w-16 h-16 text-[hsl(var(--gold))]" />
            <h3 className="font-display text-xl font-semibold">{t("contact.success")}</h3>
            <p className="text-sm text-muted-foreground">
              Notre équipe vous répond personnellement sous 48h.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                {t("contact.fields.name")} *
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t("contact.placeholders.name")}
                maxLength={100}
                disabled={loading}
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1">{tc(`validation.${errors.name}`)}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                {t("contact.fields.email")} *
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={t("contact.placeholders.email")}
                maxLength={255}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{tc(`validation.${errors.email}`)}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                {t("contact.fields.subject")}
              </label>
              <Input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder={t("contact.placeholders.subject")}
                maxLength={200}
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                <Send className="w-4 h-4 text-muted-foreground" />
                {t("contact.fields.message")} *
              </label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder={t("contact.placeholders.message")}
                rows={5}
                maxLength={2000}
                disabled={loading}
              />
              {errors.message && (
                <p className="text-xs text-destructive mt-1">
                  {tc(`validation.${errors.message}`)}
                </p>
              )}
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading ? t("contact.sending") : t("contact.submit")}
              <Send className="w-4 h-4 ml-2" />
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContactDialog;
