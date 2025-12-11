import type * as React from "react";

export function Logo({ ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 68 50"
      width={68}
      height={50}
      fill="none"
      aria-label="noto logo"
      role="img"
      {...props}
    >
      <path
        d="M22.316 10.17L42.656 0l24.858 50H42.373L22.316 10.17zM0 21.186L22.316 10.17V50H0V21.187z"
        fill="currentColor"
      />
    </svg>
  );
}
