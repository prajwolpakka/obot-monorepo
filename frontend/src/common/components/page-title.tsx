import React from "react";

interface Props {
  title: string;
  description: string;
}

const PageTitle: React.FC<Props> = ({ title, description }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
      <p className="text-gray-600 dark:text-gray-300 mt-1">{description}</p>
    </div>
  );
};

export default PageTitle;
