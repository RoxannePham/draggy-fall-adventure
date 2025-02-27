
import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

const Game = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isWalking, setIsWalking] = useState(true);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);

  const calculateBoundaries = () => {
    if (!containerRef.current || !characterRef.current) return { x: 0, y: 0 };
    
    const container = containerRef.current.getBoundingClientRect();
    const character = characterRef.current.getBoundingClientRect();
    
    return {
      x: Math.min(Math.max(position.x, 0), container.width - character.width),
      y: Math.min(position.y, container.height - character.height - 20)
    };
  };

  const handleDragStart = () => {
    setIsDragging(true);
    setIsWalking(false);
    controls.stop();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    fall();
    
    // Resume walking after falling
    setTimeout(() => {
      setIsWalking(true);
    }, 500);
  };

  const fall = async () => {
    const finalPosition = calculateBoundaries();
    
    await controls.start({
      y: finalPosition.y,
      transition: {
        type: "spring",
        velocity: 0,
        stiffness: 200,
        damping: 20
      }
    });
  };

  const walk = async () => {
    if (!containerRef.current || !characterRef.current || isDragging) return;
    
    const container = containerRef.current.getBoundingClientRect();
    const character = characterRef.current.getBoundingClientRect();
    const characterElement = characterRef.current;
    const rect = characterElement.getBoundingClientRect();
    const currentX = rect.left - container.left;
    
    if (direction === 'right') {
      if (currentX + character.width >= container.width - 10) {
        setDirection('left');
      }
    } else {
      if (currentX <= 10) {
        setDirection('right');
      }
    }
    
    const targetX = direction === 'right' 
      ? Math.min(currentX + 100, container.width - character.width) 
      : Math.max(currentX - 100, 0);
    
    await controls.start({
      x: targetX,
      transition: {
        type: "tween",
        duration: 2,
        ease: "linear"
      }
    });
    
    if (isWalking) {
      walk();
    }
  };

  // Start walking effect
  useEffect(() => {
    if (isWalking) {
      walk();
    }
  }, [isWalking, direction]);

  useEffect(() => {
    const handleResize = () => {
      if (!isDragging) {
        fall();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-2xl aspect-video bg-white rounded-lg shadow-lg overflow-hidden"
      style={{ minHeight: '300px' }}
    >
      <motion.div
        ref={characterRef}
        drag
        dragElastic={1}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        animate={controls}
        onDrag={(event, info) => {
          setPosition({ x: info.point.x, y: info.point.y });
        }}
        className="absolute cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      >
        <div className={`character ${direction === 'left' ? 'scale-x-[-1]' : ''}`}>
          <div className="w-14 h-14 flex items-center justify-center">
            {/* Star shape using SVG */}
            <svg 
              width="100%" 
              height="100%" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-lg"
            >
              <path 
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                fill="#FFD700" 
                stroke="#FFC800" 
                strokeWidth="0.5"
              />
              {/* Eye */}
              <circle cx="9" cy="10" r="1" fill="black" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-200" />
    </div>
  );
};

export default Game;
