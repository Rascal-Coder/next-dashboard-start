import * as React from "react"

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  /**
   * 为 true 时作为纯装饰（旁侧已有「Xpress」等文案），对读屏隐藏图形。
   */
  decorative?: boolean
}
export function Logo({
  size = 24,
  className,
  decorative = false,
  ...props
}: LogoProps) {
  const a11y = decorative
    ? { "aria-hidden": true as const }
    : { role: "img" as const, "aria-label": "Xpress" }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      focusable={false}
      {...a11y}
      {...props}
    >
      <rect
        x={2.25}
        y={2.25}
        width={27.5}
        height={27.5}
        rx={7}
        stroke="currentColor"
        strokeWidth={1.15}
        opacity={0.26}
      />
      <g transform="translate(9.25 16) rotate(45) scale(0.86)">
        <rect
          x={-2}
          y={-6.75}
          width={4}
          height={13.5}
          rx={2}
          fill="currentColor"
        />
        <rect
          x={-6.75}
          y={-2}
          width={13.5}
          height={4}
          rx={2}
          ry={2}
          fill="currentColor"
        />
      </g>
      <path
        d="M18.5 16H23.5M23.5 14.5L26 16 23.5 17.5"
        stroke="currentColor"
        strokeWidth={1.85}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.9}
      />
      <path
        d="M19.5 11.4l4.2-3.8M19.9 20.1l4.1 3.9"
        stroke="currentColor"
        strokeWidth={1.35}
        strokeLinecap="round"
        opacity={0.45}
      />
    </svg>
  )
}
