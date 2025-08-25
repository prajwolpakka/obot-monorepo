import { motion } from "framer-motion";

const orbs = [
  {
    id: 1,
    size: "w-32 h-32",
    gradient: "from-blue-300 to-indigo-300",
    position: { left: "10%", top: "15%" },
    opacity: 0.15,
  },
  {
    id: 2,
    size: "w-24 h-24",
    gradient: "from-purple-300 to-violet-300",
    position: { right: "15%", top: "25%" },
    opacity: 0.2,
  },
  {
    id: 3,
    size: "w-20 h-20",
    gradient: "from-blue-200 to-purple-200",
    position: { left: "20%", bottom: "20%" },
    opacity: 0.18,
  },
  {
    id: 4,
    size: "w-28 h-28",
    gradient: "from-indigo-200 to-blue-200",
    position: { right: "12%", bottom: "15%" },
    opacity: 0.12,
  },
  {
    id: 5,
    size: "w-16 h-16",
    gradient: "from-blue-100 to-indigo-100",
    position: { left: "75%", top: "45%" },
    opacity: 0.1,
  },
];

const AnimatedOrbs = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
      {orbs.map((orb, index) => (
        <motion.div
          key={orb.id}
          className={`absolute ${orb.size} rounded-full bg-gradient-to-br ${orb.gradient}`}
          style={{
            ...orb.position,
            opacity: orb.opacity,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-15, 25, -15],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8 + index * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 1.5,
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedOrbs;
