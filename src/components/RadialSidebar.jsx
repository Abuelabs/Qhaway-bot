import React, { useState, useEffect, useRef } from 'react';
import { Home, CalendarRange, Users, MessageSquare, Stethoscope, Bot, History, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function RadialSidebar({ currentView, onViewChange }) {
  const { t } = useLanguage();
  const [mouseNear, setMouseNear] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const leaveTimerRef = useRef(null);

  // Update window height on resize to keep the middle vertical position accurate
  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Proximity hover detector
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isOpen) return;
      
      // If mouse is within 120px of the left edge of the screen, show the bubble
      if (e.clientX < 120) {
        setMouseNear(true);
      } else {
        setMouseNear(false);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isOpen]);

  // Collapse menu after some time when the mouse leaves the menu area
  const handleMouseLeave = () => {
    if (!isOpen) return;
    leaveTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 1500); // 1.5s delay
  };

  const handleMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
    }
  };

  // Close menu if user clicks anywhere outside the radial menu container
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
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
  };

  // Shortcut items setup
  const menuItems = [
    { id: 'home', icon: Home, label: 'Inicio', bgHover: 'hover:bg-blue-500/10 dark:hover:bg-blue-500/20 hover:text-blue-600 dark:hover:text-blue-400' },
    { id: 'rutinas', icon: CalendarRange, label: 'Rutinas', bgHover: 'hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-400' },
    { id: 'contactos', icon: Users, label: 'Contactos', bgHover: 'hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400' },
    { id: 'mensajes', icon: MessageSquare, label: 'Mensajes', bgHover: 'hover:bg-purple-500/10 dark:hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-400' },
    { id: 'salud', icon: Stethoscope, label: 'Salud', bgHover: 'hover:bg-rose-500/10 dark:hover:bg-rose-500/20 hover:text-rose-600 dark:hover:text-rose-400' },
    { id: 'robot', icon: Bot, label: 'Robot', bgHover: 'hover:bg-cyan-500/10 dark:hover:bg-cyan-500/20 hover:text-cyan-600 dark:hover:text-cyan-400' },
    { id: 'actividad', icon: History, label: 'Actividad', bgHover: 'hover:bg-amber-500/10 dark:hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-400' },
  ];

  // Dimensional config for positioning
  const bubbleSize = 48; // Size of the main bubble (w-12 h-12)
  const anchorLeft = isOpen ? 16 : 20; // px from left edge
  
  // Vertical position: top-left (80px, below the 64px navbar) when open, centered vertically when closed
  const anchorTop = isOpen ? 80 : (windowHeight / 2 - bubbleSize / 2);

  // Center coordinate of the main bubble
  const centerX = anchorLeft + bubbleSize / 2;
  const centerY = anchorTop + bubbleSize / 2;

  return (
    <div
      id="radial-sidebar-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="fixed inset-0 pointer-events-none z-50"
    >
      {/* Radial Items */}
      {menuItems.map((item, idx) => {
        const IconComponent = item.icon;
        const count = menuItems.length;
        
        // Distribute the items across an arc of 90 degrees (from 0 to 90 deg)
        // 0 deg points directly to the right, 90 deg points straight down.
        const angleDeg = (idx * 90) / (count - 1);
        const angleRad = (angleDeg * Math.PI) / 180;

        const itemSize = 40; // Size of shortcut items (w-10 h-10)
        
        // Stagger items into 2 rows (inner arc at 90px radius, outer arc at 150px radius)
        const isOuterRow = idx % 2 !== 0;
        const currentRadius = isOuterRow ? 150 : 90; // px
        
        // Coordinates when deployed
        const targetLeft = centerX + currentRadius * Math.cos(angleRad) - itemSize / 2;
        const targetTop = centerY + currentRadius * Math.sin(angleRad) - itemSize / 2;

        // Coordinates when retracted (centered inside the main bubble)
        const closedLeft = anchorLeft + bubbleSize / 2 - itemSize / 2;
        const closedTop = anchorTop + bubbleSize / 2 - itemSize / 2;

        const isCurrent = currentView === item.id;

        return (
          <button
            key={item.id}
            onClick={(e) => {
              e.stopPropagation();
              onViewChange(item.id);
              setIsOpen(false);
            }}
            style={{
              left: isOpen ? `${targetLeft}px` : `${closedLeft}px`,
              top: isOpen ? `${targetTop}px` : `${closedTop}px`,
              transform: isOpen ? 'scale(1)' : 'scale(0)',
              opacity: isOpen ? 1 : 0,
              transitionDelay: isOpen ? `${idx * 40}ms` : '0ms',
              width: `${itemSize}px`,
              height: `${itemSize}px`,
            }}
            className={`absolute flex items-center justify-center rounded-full shadow-lg border cursor-pointer group transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              isCurrent
                ? 'bg-blue-600 dark:bg-baltic-blue-500 text-white border-blue-600 dark:border-baltic-blue-500 scale-110 shadow-blue-500/20 dark:shadow-baltic-blue-500/20'
                : `bg-white/95 dark:bg-prussian-blue-900/95 border-slate-200 dark:border-prussian-blue-800 text-slate-700 dark:text-prussian-blue-200 ${item.bgHover}`
            } pointer-events-auto`}
            title={item.label}
          >
            <IconComponent className="w-5 h-5" />
            
            {/* Tooltip */}
            <span className="absolute whitespace-nowrap bg-slate-900/90 dark:bg-prussian-blue-950/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 left-12 top-1/2 -translate-y-1/2 z-50">
              {item.label}
            </span>
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
          transform: (isOpen || mouseNear) ? 'scale(1)' : 'scale(0) translateX(-40px)',
          opacity: (isOpen || mouseNear) ? 1 : 0,
        }}
        className={`absolute flex items-center justify-center rounded-full border shadow-xl cursor-pointer pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isOpen
            ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-500 scale-105 rotate-90'
            : 'bg-blue-600 text-white border-blue-600 dark:bg-baltic-blue-500 dark:border-baltic-blue-500 hover:bg-blue-700 dark:hover:bg-baltic-blue-600 hover:scale-110 active:scale-95'
        }`}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Home className="w-5 h-5" />}
      </button>
    </div>
  );
}
