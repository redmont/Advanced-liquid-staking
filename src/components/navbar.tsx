import React from "react";
import Link from "next/link";
import Logo from "@/assets/images/logo.svg";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-light p-6">
      <ul className="flex space-x-4">
        <li>
          <Link className="text-white hover:text-gray-300" href="/">
            <Logo alt="Site Title" />
          </Link>
        </li>
        <li>
          <DynamicWidget />
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
