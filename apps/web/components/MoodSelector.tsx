"use client";
import { useState } from "react";
import { Slider } from "./ui/slider";
import { motion } from "framer-motion";
const MoodSelector = () => {
  const [modeSelected, setModeSelected] = useState<number>(50);
  const moods = [
    { label: "Excited", value: 100, emoji: "😄", color: "bg-yellow-500" },
    { label: "Happy", value: 75, emoji: "😊", color: "bg-green-500" },
    { label: "Peaceful", value: 50, emoji: "😌", color: "bg-blue-500" },
    { label: "Content", value: 25, emoji: "🙂", color: "bg-purple-500" },
    { label: "Down", value: 0, emoji: "😔", color: "bg-red-500" },
  ];
  return (
    <div>
      <Slider
        defaultValue={[50]}
        max={100}
        step={1}
        onValueChange={(value) => {
          setModeSelected(value[0]);
        }}
      />
      <div className="flex items-center gap-4">
        {moods.map((mood) => (
          <motion.div
            key={mood.value}
            className={`m-2 p-2 ${mood.color} rounded-full w-fit`}
            animate={{
              scale:
                modeSelected >= mood.value - 15 && modeSelected <= mood.value
                  ? 1.2
                  : 1,
              boxShadow:
                modeSelected >= mood.value - 15 && modeSelected <= mood.value
                  ? "0px 0px 8px rgba(0, 0, 0, 0.6)"
                  : "0px 0px 4px rgba(0, 0, 0, 0.3)",
              opacity:
                modeSelected >= mood.value - 15 && modeSelected <= mood.value
                  ? 1
                  : 0.6,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {mood.emoji} {mood.label}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;
