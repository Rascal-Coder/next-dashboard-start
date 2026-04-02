'use client';

import { cn } from '@/lib/utils';
import React, { useEffect, useRef, useState } from 'react';

function mod(n: number, m: number) {
  if (m === 0) return 0;
  return ((n % m) + m) % m;
}

/**
 * InteractiveGridPattern is a component that renders a grid pattern with interactive squares.
 *
 * @param width - The width of each square.
 * @param height - The height of each square.
 * @param squares - The number of squares in the grid. The first element is the number of horizontal squares, and the second element is the number of vertical squares.
 * @param className - The class name of the grid.
 * @param squaresClassName - The class name of the squares.
 * @param scroll - When true, continuously pans the grid with organically changing x/y (seamless modulo cell size).
 * @param scrollSpeed - Multiplier for drift speed (1 = default).
 */
interface InteractiveGridPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  squares?: [number, number]; // [horizontal, vertical]
  className?: string;
  squaresClassName?: string;
  scroll?: boolean;
  scrollSpeed?: number;
}

/**
 * The InteractiveGridPattern component.
 *
 * @see InteractiveGridPatternProps for the props interface.
 * @returns A React component.
 */
export function InteractiveGridPattern({
  width = 40,
  height = 40,
  squares = [24, 24],
  className,
  squaresClassName,
  scroll = true,
  scrollSpeed = 1,
  ...props
}: InteractiveGridPatternProps) {
  const [horizontal, vertical] = squares;
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const layerRef = useRef<SVGGElement>(null);
  const startRef = useRef<number | null>(null);

  const cols = horizontal + 2;
  const rows = vertical + 2;
  const cells: { col: number; row: number; key: string }[] = [];
  for (let row = -1; row <= vertical; row++) {
    for (let col = -1; col <= horizontal; col++) {
      cells.push({ col, row, key: `${col},${row}` });
    }
  }

  useEffect(() => {
    const g = layerRef.current;
    if (!g) return;

    if (!scroll) {
      g.setAttribute('transform', 'translate(0,0)');
      return;
    }

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;

    const tick = (now: number) => {
      if (mq.matches) {
        g.setAttribute('transform', 'translate(0,0)');
      } else {
        if (startRef.current === null) startRef.current = now;
        const t = (now - startRef.current) * scrollSpeed;

        // Linear drift + several incommensurate waves so x/y keep evolving (similar vibe to animated login meshes).
        const ox =
          t * 0.014 +
          width * 0.82 * Math.sin(t * 0.00035) +
          width * 0.28 * Math.sin(t * 0.00019 + 1.4) +
          width * 0.12 * Math.cos(t * 0.00051 + 0.3);
        const oy =
          t * 0.011 +
          height * 0.78 * Math.cos(t * 0.00031) +
          height * 0.26 * Math.cos(t * 0.00022 + 2.1) +
          height * 0.11 * Math.sin(t * 0.00047 + 1.1);

        const tx = -mod(ox, width);
        const ty = -mod(oy, height);
        g.setAttribute('transform', `translate(${tx},${ty})`);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      startRef.current = null;
    };
  }, [scroll, scrollSpeed, width, height]);

  return (
    <svg
      width={width * cols}
      height={height * rows}
      className={cn(
        'absolute inset-0 h-full w-full border border-primary-foreground/20',
        className
      )}
      {...props}
    >
      <g ref={layerRef}>
        {cells.map(({ col, row, key }) => {
          const x = col * width;
          const y = row * height;
          return (
            <rect
              key={key}
              x={x}
              y={y}
              width={width}
              height={height}
              className={cn(
                'stroke-primary-foreground/25 transition-all duration-100 ease-in-out not-[&:hover]:duration-1000',
                hoveredKey === key ? 'fill-primary-foreground/15' : 'fill-transparent',
                squaresClassName
              )}
              onMouseEnter={() => setHoveredKey(key)}
              onMouseLeave={() => setHoveredKey(null)}
            />
          );
        })}
      </g>
    </svg>
  );
}
