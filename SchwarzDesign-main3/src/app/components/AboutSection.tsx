import { motion } from "motion/react";
import { Shield, Crown, Crosshair, Users } from "lucide-react";

const features = [
  {
    icon: Crown,
    title: "Опыт",
    desc: "Играем с 2022 года — прошли несколько серверов и десятки лидерок",
  },
  {
    icon: Shield,
    title: "Обучение",
    desc: "Помогаем новичкам освоиться в RP и вырасти как игроку",
  },
  {
    icon: Users,
    title: "Сообщество",
    desc: "Активный Discord, совместные сессии и дружеская атмосфера",
  },
  {
    icon: Crosshair,
    title: "Контент",
    desc: "Стримы, видео, ивенты — мы делаем то, что интересно смотреть и играть",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
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
            О семье
          </span>
          <h2
            className="font-['Russo_One'] text-white mt-4"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", lineHeight: 1.2 }}
          >
            Кто мы такие
          </h2>
          <div className="w-12 h-[2px] bg-[#9b2335] mx-auto mt-6" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-white/50 text-center max-w-3xl mx-auto mb-20 font-['Oswald']"
          style={{ fontSize: "1.05rem", lineHeight: 1.8 }}
        >
          Schwarz Family — RP-семья с 2022 года. Начинали на Majestic RP, играли
          на GTA5RP, вернулись обратно. За это время прошли 15+ сроков лидерства
          в разных фракциях. Сейчас мы на Majestic RP — играем, стримим,
          обучаем новичков и делаем контент.
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative bg-white/[0.02] border border-white/5 p-8 hover:border-[#9b2335]/20 transition-all duration-500"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#9b2335]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <feature.icon
                size={28}
                className="text-[#9b2335]/70 mb-5"
                strokeWidth={1.5}
              />
              <h3
                className="font-['Oswald'] text-white uppercase tracking-wider mb-3"
                style={{ fontSize: "0.9rem" }}
              >
                {feature.title}
              </h3>
              <p
                className="text-white/40 font-['Oswald']"
                style={{ fontSize: "0.85rem", lineHeight: 1.7 }}
              >
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}