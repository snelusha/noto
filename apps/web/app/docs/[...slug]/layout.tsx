import * as React from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-grow flex-row">
      <div className="md:mr-[268px]">
        <div className="fixed start-0 top-0">
          <aside className="absolute hidden h-dvh w-[268px] border-r md:flex"></aside>
        </div>
      </div>
      {children}
    </main>
  );
}
