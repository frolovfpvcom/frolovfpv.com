"use client";

import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { Mail, Send } from "lucide-react";

const EMAIL = "peterfrolov09@gmail.com";

const projectTypes = ["Reklame", "Event", "Natur og landskab", "Musikvideo", "Andet"];

const field =
  "w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-white placeholder:text-neutral-600 focus:border-white/40 focus:outline-none transition-colors";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  // There's no mail server behind the site, so the form opens the visitor's
  // mail app with everything filled in, addressed to Peter.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name"));
    const type = String(data.get("type"));
    const subject = `${type}: henvendelse fra ${name}`;
    const body = [
      String(data.get("message")),
      "",
      `Navn: ${name}`,
      `Email: ${data.get("email")}`,
      data.get("phone") ? `Telefon: ${data.get("phone")}` : "",
      data.get("date") ? `Dato: ${data.get("date")}` : "",
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
          <p className="text-xs text-neutral-500 uppercase tracking-[0.3em] mb-6">Kontakt</p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            Nysgerrig?
            <br />
            <span className="text-neutral-400">Tøv ikke med at kontakte mig.</span>
          </h1>
          <p className="mt-6 text-neutral-400 text-lg leading-relaxed">
            Har du en idé, et event eller et produkt, der skal ses fra en vinkel, ingen har filmet
            før? Fortæl mig lidt om det, så vender jeg tilbage hurtigst muligt.
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
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <label className="block">
              <span className="mb-2 block text-sm text-neutral-400">Navn *</span>
              <input name="name" required autoComplete="name" className={field} placeholder="Dit navn" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-neutral-400">Email *</span>
              <input name="email" type="email" required autoComplete="email" className={field} placeholder="din@email.dk" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-neutral-400">Telefon</span>
              <input name="phone" type="tel" autoComplete="tel" className={field} placeholder="Valgfrit" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-neutral-400">Hvornår?</span>
              <input name="date" className={field} placeholder="Dato eller periode" />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm text-neutral-400">Hvad drejer det sig om?</span>
            <select name="type" className={`${field} appearance-none`} defaultValue={projectTypes[0]}>
              {projectTypes.map((t) => (
                <option key={t} value={t} className="bg-neutral-900">
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-neutral-400">Besked *</span>
            <textarea
              name="message"
              required
              rows={6}
              className={`${field} resize-y`}
              placeholder="Fortæl lidt om dit projekt, sted og idé…"
            />
          </label>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-black hover:bg-neutral-200 transition-colors sm:w-auto"
          >
            <Send size={16} />
            Send besked
          </button>

          {sent && (
            <p className="text-sm text-neutral-400">
              Din mail-app burde åbne nu med beskeden klar. Hvis ikke, så skriv direkte til {EMAIL}.
            </p>
          )}
        </motion.form>
      </div>
    </section>
  );
}
