import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Send, Mail, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "required").max(100),
  email: z.string().trim().email("email").max(255),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1, "required").max(2000),
});

const ContactSection = () => {
  const { t } = useTranslation("landing");
  const { t: tc } = useTranslation("common");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      // Save to database
      const { error: dbError } = await supabase.from("contact_messages" as any).insert({
        name: result.data.name,
        email: result.data.email,
        subject: result.data.subject || null,
        message: result.data.message,
      } as any);

      if (dbError) throw dbError;

      // Send email notification
      await supabase.functions.invoke("send-contact-email", {
        body: {
          name: result.data.name,
          email: result.data.email,
          subject: result.data.subject || "Contact via FamilyGarden",
          message: result.data.message,
        },
      });

      toast.success(t("contact.success"));
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast.error(t("contact.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            {t("contact.badge")}
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            {t("contact.title")}{" "}
            <span className="text-secondary">{t("contact.titleHighlight")}</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            {t("contact.subtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="max-w-lg mx-auto"
        >
          <form onSubmit={handleSubmit} className="space-y-5 bg-card rounded-2xl p-6 md:p-8 shadow-lg border border-border">
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
              />
              {errors.name && <p className="text-xs text-destructive mt-1">{tc(`validation.${errors.name}`)}</p>}
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
              />
              {errors.email && <p className="text-xs text-destructive mt-1">{tc(`validation.${errors.email}`)}</p>}
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
              />
              {errors.message && <p className="text-xs text-destructive mt-1">{tc(`validation.${errors.message}`)}</p>}
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading ? t("contact.sending") : t("contact.submit")}
              <Send className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
