import React, { useState, useEffect } from 'react';
import { Home, CalendarRange, Users, MessageSquare, BookOpen, Stethoscope, Bot, History, X } from 'lucide-react';

export default function RadialSidebar({ currentView, onViewChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [buttonY, setButtonY] = useState(window.innerHeight / 2 - 24);

  // Update window height on resize to keep the middle vertical position accurate
  useEffect(() => {
    const handleResize = () => {
      const newHeight = window.innerHeight;
      setWindowHeight(newHeight);
      setButtonY(newHeight / 2 - 24);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Proximity tracking to slide the button vertically
  useEffect(() => {
    if (isOpen) return;

    const handleMouseMove = (e) => {
      const bubbleSize = 48;
      const bubbleRadius = bubbleSize / 2;

      // If mouse is within 300px of the left edge of the screen, follow its Y position
      if (e.clientX < 300) {
        const minY = 80;
        const maxY = windowHeight - bubbleSize - 20;
        const targetY = Math.max(minY, Math.min(maxY, e.clientY - bubbleRadius));
        setButtonY(targetY);
      } else {
        // Return to vertical center
        setButtonY(windowHeight / 2 - bubbleRadius);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isOpen, windowHeight]);

  // Close menu if user clicks anywhere outside the sidebar container
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      const container = document.getElementById('radial-sidebar-container');
      if (container && !container.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const timer = setTimeout(() => {
      window.addEventListener('click', handleClickOutside);
    }, 50);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  const toggleOpen = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // Menu items, displayed top-to-bottom as a dropdown list
  const menuItems = [
    { id: 'home', icon: Home, label: 'Inicio', activeColor: 'text-blue-600 dark:text-baltic-blue-400', activeBg: 'bg-blue-50 dark:bg-baltic-blue-950/40' },
    { id: 'rutinas', icon: CalendarRange, label: 'Rutinas', activeColor: 'text-emerald-600 dark:text-emerald-400', activeBg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { id: 'contactos', icon: Users, label: 'Contactos', activeColor: 'text-indigo-600 dark:text-indigo-400', activeBg: 'bg-indigo-50 dark:bg-indigo-950/30' },
    { id: 'mensajes', icon: MessageSquare, label: 'Mensajes', activeColor: 'text-purple-600 dark:text-purple-400', activeBg: 'bg-purple-50 dark:bg-purple-950/30' },
    { id: 'salud', icon: Stethoscope, label: 'Salud', activeColor: 'text-rose-600 dark:text-rose-400', activeBg: 'bg-rose-50 dark:bg-rose-950/30' },
    { id: 'biblioteca', icon: BookOpen, label: 'Biblioteca', activeColor: 'text-orange-600 dark:text-orange-400', activeBg: 'bg-orange-50 dark:bg-orange-950/30' },
    { id: 'robot', icon: Bot, label: 'Robot', activeColor: 'text-cyan-600 dark:text-cyan-400', activeBg: 'bg-cyan-50 dark:bg-cyan-950/30' },
    { id: 'actividad', icon: History, label: 'Actividad', activeColor: 'text-amber-600 dark:text-amber-400', activeBg: 'bg-amber-50 dark:bg-amber-950/30' },
  ];

  // Dimensional config for positioning
  const bubbleSize = 48; // Size of the main bubble (w-12 h-12)
  const anchorLeft = isOpen ? 16 : 20; // px from left edge

  // Vertical position: top-left (80px, below the 64px navbar) when open, centered vertically when closed
  const anchorTop = isOpen ? 80 : buttonY;

  // List item dimensions
  const itemWidth = 196;
  const itemHeight = 44;
  const itemGap = 8;

  return (
    <div
      id="radial-sidebar-container"
      className="fixed inset-0 pointer-events-none z-50"
    >
      {/* Dropdown list items, stacked top to bottom below the home button */}
      {menuItems.map((item, idx) => {
        const IconComponent = item.icon;
        const isCurrent = currentView === item.id;

        const openTop = anchorTop + bubbleSize + 10 + idx * (itemHeight + itemGap);
        const closedTop = anchorTop + bubbleSize / 2 - itemHeight / 2;

        return (
          <button
            key={item.id}
            onClick={(e) => {
              e.stopPropagation();
              onViewChange(item.id);
              setIsOpen(false);
            }}
            style={{
              left: `${anchorLeft}px`,
              top: isOpen ? `${openTop}px` : `${closedTop}px`,
              width: `${itemWidth}px`,
              height: `${itemHeight}px`,
              transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(-12px) scale(0.92)',
              opacity: isOpen ? 1 : 0,
              transitionDelay: isOpen ? `${idx * 35}ms` : '0ms',
            }}
            className={`absolute flex items-center gap-3 px-4 rounded-2xl shadow-lg border cursor-pointer group transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isCurrent
                ? `${item.activeBg} ${item.activeColor} border-current/20 font-bold`
                : 'bg-white/95 dark:bg-prussian-blue-900/95 border-slate-200 dark:border-prussian-blue-800 text-slate-700 dark:text-prussian-blue-200 hover:bg-slate-50 dark:hover:bg-prussian-blue-800'
              } ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
          >
            <IconComponent className="w-5 h-5 shrink-0" />
            <span className="text-sm font-bold whitespace-nowrap">{item.label}</span>
          </button>
        );
      })}

      {/* Main Anchor Bubble */}
      <button
        onClick={toggleOpen}
        style={{
          left: `${anchorLeft}px`,
          top: `${anchorTop}px`,
          width: `${bubbleSize}px`,
          height: `${bubbleSize}px`,
          transform: isOpen ? 'scale(1.05) rotate(90deg)' : 'scale(1)',
          opacity: 1,
        }}
        className={`absolute flex items-center justify-center rounded-full border shadow-xl cursor-pointer pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isOpen
            ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-500 scale-105 rotate-90'
            : 'bg-blue-600 text-white border-blue-600 dark:bg-baltic-blue-500 dark:border-baltic-blue-500 hover:bg-blue-700 dark:hover:bg-baltic-blue-600 hover:scale-110 active:scale-95'
          }`}
        title="Menú"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Home className="w-5 h-5" />}
      </button>
    </div>
  );
}
