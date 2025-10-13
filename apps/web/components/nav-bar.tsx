export function Navbar() {
  return (
    <div className="bg-background_ sticky top-0 z-30 flex flex-col backdrop-blur-md">
      <nav className="top-0 flex h-16 grid-cols-12 items-center justify-between md:grid md:border-b">
        <div className="relative flex items-center justify-end md:col-span-10">
          <ul className="hidden w-max shrink-0 items-center divide-x md:flex"></ul>
        </div>
      </nav>
    </div>
  );
}
