import React from "react";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="mx-auto px-4 max-w-6xl">{children}</div>;
};

export default MainLayout;
