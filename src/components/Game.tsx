
import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

const Game = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isWalking, setIsWalking] = useState(true);
  const controls = useAnimation();
  const walkingControls = useAnimation();
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
    walkingControls.stop();
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
    const currentX = direction === 'right' ? character.x - container.x : character.x - container.x;
    
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
    
    await walkingControls.start({
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
        animate={[controls, walkingControls]}
        onDrag={(event, info) => {
          setPosition({ x: info.point.x, y: info.point.y });
        }}
        className="absolute cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      >
        <div className={`character ${direction === 'left' ? 'scale-x-[-1]' : ''}`}>
          <div className="w-12 h-12 bg-blue-400 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105">
            <div className="w-2 h-2 bg-white rounded-full transform translate-x-1 -translate-y-1" />
          </div>
        </div>
      </motion.div>

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-200" />
    </div>
  );
};

export default Game;
