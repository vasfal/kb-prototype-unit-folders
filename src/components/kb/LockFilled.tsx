import type { SVGProps } from 'react';

/** Padlock with a filled body and an outline shackle — the "private" indicator.
 *  lucide's <Lock fill="currentColor"> fills the shackle arc too, which reads as
 *  a blob, so we draw the icon manually and fill only the lower body. Geometry
 *  matches lucide's Lock (24×24 viewBox). */
export function LockFilled({
  className,
  strokeWidth = 2,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect
        width="18"
        height="11"
        x="3"
        y="11"
        rx="2"
        ry="2"
        fill="currentColor"
      />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
