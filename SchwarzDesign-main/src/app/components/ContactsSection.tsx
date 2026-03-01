import { motion } from "motion/react";
import { MessageCircle, Phone, MapPin } from "lucide-react";

const contacts = [
  {
    icon: MessageCircle,
    label: "Discord",
    value: "discord.gg/schwarzfamq",
    href: "https://discord.gg/schwarzfamq",
  },
  {
    icon: Phone,
    label: "Телефон (IC)",
    value: "555-SCHWARZ",
    href: "#",
  },
  {
    icon: MapPin,
    label: "Район",
    value: "East Los Santos, Majestic RP",
    href: "#",
  },
];

export function ContactsSection() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span
            className="font-['Oswald'] text-[#9b2335]/60 uppercase tracking-[0.3em]"
            style={{ fontSize: "0.75rem" }}
          >
            Связаться
          </span>
          <h2
            className="font-['Russo_One'] text-white mt-4"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", lineHeight: 1.2 }}
          >
            Контакты
          </h2>
          <div className="w-12 h-[2px] bg-[#9b2335] mx-auto mt-6" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contacts.map((contact, i) => (
            <motion.a
              key={contact.label}
              href={contact.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group bg-white/[0.02] border border-white/5 p-8 text-center hover:border-[#9b2335]/20 transition-all duration-500"
            >
              <contact.icon
                size={28}
                className="text-[#9b2335]/50 mx-auto mb-4 group-hover:text-[#9b2335] transition-colors"
                strokeWidth={1.5}
              />
              <p
                className="font-['Oswald'] text-white/30 uppercase tracking-wider mb-2"
                style={{ fontSize: "0.7rem" }}
              >
                {contact.label}
              </p>
              <p
                className="font-['Oswald'] text-white/70 group-hover:text-white transition-colors"
                style={{ fontSize: "0.9rem" }}
              >
                {contact.value}
              </p>
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center mt-16"
        >
          <p
            className="text-white/30 font-['Oswald']"
            style={{ fontSize: "0.85rem", lineHeight: 1.8 }}
          >
            Хочешь стать частью семьи? Свяжись с нами через Discord
            <br />
            или найди нас в игре на сервере Majestic RP.
          </p>
        </motion.div>
      </div>
    </section>
  );
}