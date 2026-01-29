import Link from "next/link";
import React from "react";

const Header = () => {
  const links = [
    {
      label: "Features",
      href: "/features",
    },
    {
      label: "About Aura",
      href: "/aura",
    },
    {
      label: "Sign In",
      href: "/sign-in",
    },
  ];
  return (
    <div>
      <div className="container flex justify-between items-center mx-auto">
        <h3>Aura3.0</h3>
        <ul className="flex items-center gap-4">
          {links.map((link, index) => (
            <li key={index}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Header;
