"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FlowerIcon } from "lucide-react";
import { useState } from "react";

const ZenGarden = () => {
  const [selectedPlant, setSelectedPlant] = useState<
    "rock" | "tree" | "flower"
  >("rock");
  const [coords, setCoords] = useState<
    { x: number; y: number; type: "rock" | "tree" | "flower" }[]
  >([]);

  const plants = [
    { type: "rock", label: "Rock", icon: "🪨" },
    { type: "tree", label: "Tree", icon: "🌳" },
    { type: "flower", label: "Flower", icon: "🌸" },
  ];

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // These properties provide the coordinates relative to the div's top-left corner
    const x = event.nativeEvent.offsetX;
    const y = event.nativeEvent.offsetY;

    setCoords((prevState) => [...prevState, { x, y, type: selectedPlant }]);
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-start border-2 border-green-500 cursor-pointer p-4 rounded-xl gap-4">
          <div className="p-2 rounded-lg bg-red-200">
            <FlowerIcon />
          </div>
          <div>
            <h4 className="text-lg font-medium">Zen Garden</h4>
            <p>Create and maintain your digital peaceful space</p>
            <p>10 mins</p>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25 bg-white">
        <DialogHeader>
          <DialogTitle>Zen Garden</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-4">
          {plants.map((plant) => (
            <div
              key={plant.type}
              className={`flex items-center p-2 rounded-lg cursor-pointer ${
                selectedPlant === plant.type
                  ? "bg-blue-100"
                  : "hover:bg-gray-100"
              }`}
              onClick={() =>
                setSelectedPlant(plant.type as "rock" | "tree" | "flower")
              }
            >
              <span className="mr-2">{plant.icon}</span>
              <span>{plant.label}</span>
            </div>
          ))}
        </div>
        <div
          onClick={handleClick}
          className="relative min-h-56 bg-blue-100 rounded-md cursor-pointer"
        >
          {coords.map((coord, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                left: coord.x,
                top: coord.y,
                zIndex: 10,
              }}
            >
              {coord.type === "rock" && (
                <div className="rounded-full bg-white p-1">🪨</div>
              )}
              {coord.type === "tree" && "🌳"}
              {coord.type === "flower" && "🌸"}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ZenGarden;
