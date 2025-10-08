import * as React from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <div className="bg-background sticky top-0 z-30 flex flex-col backdrop-blur-md">
        <nav className="flex h-16 items-center justify-between md:border-b">
          <div className="h-full w-[268px] md:border-r"></div>
          <div className="h-10 flex-grow"></div>
        </nav>
      </div>
      {children}
    </main>
  );
}
