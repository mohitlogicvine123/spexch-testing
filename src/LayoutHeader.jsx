import MenuHeader from "./components/Header/MenuHeader";
import TopHeader from "./components/Header/TopHeader";

import React from "react";

const LayoutHeader = ({ children }) => {
  return (
    <div>
      <TopHeader />
      <MenuHeader />
      <div className="md:px-8 px-1 md:py-4 py-4">
        <div>{children}</div>
      </div>
    </div>
  );
};

export default LayoutHeader;
