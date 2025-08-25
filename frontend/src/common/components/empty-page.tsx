import React from "react";
import { Button } from "./ui/button";

interface Props {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta?: {
    text: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  dialog?: React.ReactNode;
}

export const EmptyPage: React.FC<Props> = ({ icon, title, description, cta, dialog }) => {
  const shouldAddSpacing = !cta && !dialog;

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {icon}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{description}</p>

      {cta && (
        <Button onClick={cta.onClick} className="flex items-center gap-2">
          {cta.icon}
          {cta.text}
        </Button>
      )}

      {dialog}

      {shouldAddSpacing && <div className="h-10" />}

      <div className="h-1/3" />
    </div>
  );
};
