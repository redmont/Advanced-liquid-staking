import React from "react";
import Link from "next/link";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <ul className="flex space-x-4">
        <li>
          <Link className="text-white hover:text-gray-300" href="/">
            Home
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
