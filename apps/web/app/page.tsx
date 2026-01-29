"use client";
import MoodSelector from "@/components/MoodSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
export default function Home() {
  const cards = [
    {
      title: "24/7 Support",
      text: "Always here to listen and support you, any time of day",
    },
    {
      title: "24/7 Support",
      text: "Always here to listen and support you, any time of day",
    },
    {
      title: "24/7 Support",
      text: "Always here to listen and support you, any time of day",
    },
    {
      title: "24/7 Support",
      text: "Always here to listen and support you, any time of day",
    },
  ];
  return (
    <div className="contaier mx-auto text-center">
      <h2>Find Peace of Mind</h2>
      <p>
        Experience a new way of emotional support. Our AI companion is here to
        listen, understand, and guide you through life &apos s journey.
      </p>
      <MoodSelector />
      <h2>How Aura Helps You</h2>
      <p>
        Experience a new kind of emotional support, powered by empathetic AI
      </p>
      <div className="flex items-center gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: i * 0.15,
              ease: "easeOut",
            }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{card.text}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
