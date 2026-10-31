"use client";

import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { Mail, Send } from "lucide-react";
import { useT } from "@/lib/lang";

const EMAIL = "peterfrolov09@gmail.com";

const texts = {
  da: {
    label: "Kontakt",
    title: "Nysgerrig?",
    accent: "Tøv ikke med at kontakte mig.",
    lead: "Har du en idé, et event eller et produkt, der skal ses fra en vinkel, ingen har filmet før? Fortæl mig lidt om det, så vender jeg tilbage hurtigst muligt.",
    name: "Navn *",
    namePh: "Dit navn",
    email: "Email *",
    emailPh: "din@email.dk",
    phone: "Telefon",
    optional: "Valgfrit",
    when: "Hvornår?",
    whenPh: "Dato eller periode",
    type: "Hvad drejer det sig om?",
    types: ["Reklame", "Event", "Natur og landskab", "Musikvideo", "Andet"],
    message: "Besked *",
    messagePh: "Fortæl lidt om dit projekt, sted og idé…",
    send: "Send besked",
    sent: "Din mail-app burde åbne nu med beskeden klar. Hvis ikke, så skriv direkte til",
    inquiry: "henvendelse fra",
    mail: { name: "Navn", phone: "Telefon", date: "Dato" },
  },
  en: {
    label: "Contact",
    title: "Curious?",
    accent: "Don't hesitate to reach out.",
    lead: "Got an idea, an event or a product that should be seen from an angle nobody has filmed before? Tell me a bit about it and I'll get back to you as soon as I can.",
    name: "Name *",
    namePh: "Your name",
    email: "Email *",
    emailPh: "you@email.com",
    phone: "Phone",
    optional: "Optional",
    when: "When?",
    whenPh: "Date or period",
    type: "What is it about?",
    types: ["Commercial", "Event", "Nature and landscape", "Music video", "Other"],
    message: "Message *",
    messagePh: "Tell me a bit about your project, location and idea…",
    send: "Send message",
    sent: "Your mail app should open now with the message ready. If not, write directly to",
    inquiry: "inquiry from",
    mail: { name: "Name", phone: "Phone", date: "Date" },
  },
};

const field =
  "w-full rounded-xl border border-blaa-300/15 bg-blaa-900/30 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-blaa-400 focus:outline-none transition-colors";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const t = useT(texts);

  // There's no mail server behind the site, so the form opens the visitor's
  // mail app with everything filled in, addressed to Peter.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name"));
    const type = String(data.get("type"));
    const subject = `${type}: ${t.inquiry} ${name}`;
    const body = [
      String(data.get("message")),
      "",
      `${t.mail.name}: ${name}`,
      `Email: ${data.get("email")}`,
      data.get("phone") ? `${t.mail.phone}: ${data.get("phone")}` : "",
      data.get("date") ? `${t.mail.date}: ${data.get("date")}` : "",
    ]
      .filter((line, i) => i < 2 || line)
      .join("\n");
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <section className="px-6 pt-36 pb-24 md:pt-44">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-14">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-xs text-blaa-300 uppercase tracking-[0.3em] mb-6">{t.label}</p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            {t.title}
            <br />
            <span className="text-blaa-300">{t.accent}</span>
          </h1>
          <p className="mt-6 text-neutral-400 text-lg leading-relaxed">
            {t.lead}
          </p>
          <a
            href={`mailto:${EMAIL}`}
            className="mt-8 inline-flex items-center gap-3 text-neutral-300 hover:text-white transition-colors"
          >
            <Mail size={18} />
            {EMAIL}
          </a>
        </motion.div>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-blaa-300/10 bg-blaa-900/20 p-6 md:p-8 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <label className="block">
              <span className="mb-2 block text-sm text-neutral-400">{t.name}</span>
              <input name="name" required autoComplete="name" className={field} placeholder={t.namePh} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-neutral-400">{t.email}</span>
              <input name="email" type="email" required autoComplete="email" className={field} placeholder={t.emailPh} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-neutral-400">{t.phone}</span>
              <input name="phone" type="tel" autoComplete="tel" className={field} placeholder={t.optional} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-neutral-400">{t.when}</span>
              <input name="date" className={field} placeholder={t.whenPh} />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm text-neutral-400">{t.type}</span>
            <select name="type" className={`${field} appearance-none`} key={t.types[0]} defaultValue={t.types[0]}>
              {t.types.map((type) => (
                <option key={type} value={type} className="bg-neutral-900">
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-neutral-400">{t.message}</span>
            <textarea
              name="message"
              required
              rows={6}
              className={`${field} resize-y`}
              placeholder={t.messagePh}
            />
          </label>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blaa-500 px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-blaa-500/25 hover:bg-blaa-400 transition-colors sm:w-auto"
          >
            <Send size={16} />
            {t.send}
          </button>

          {sent && (
            <p className="text-sm text-neutral-400">
              {t.sent} {EMAIL}.
            </p>
          )}
        </motion.form>
      </div>
    </section>
  );
}
