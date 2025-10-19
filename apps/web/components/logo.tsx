export function Logo({ ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 68 50"
      width={68}
      height={50}
      fill="none"
      {...props}
    >
      <path
        d="M0 21.084L22.49 9.94V50H0V21.084zM22.49 9.84L42.57 0l24.9 49.9h-24.9L22.49 9.84z"
        fill="currentColor"
      />
    </svg>
  );
}
