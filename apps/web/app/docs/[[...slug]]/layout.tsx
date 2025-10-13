import "~/styles/prose.css";

import { Navbar } from "~/components/nav-bar";
import { Sidebar } from "~/components/side-bar";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="font-calling-code">
      <Navbar />
      <main className="relative flex flex-grow flex-row">
        <div className="md:mr-[268px] lg:mr-[286px]">
          <Sidebar />
        </div>
        {children}
      </main>
    </div>
  );
}
