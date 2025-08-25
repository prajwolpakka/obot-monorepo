import { Button } from "@/common/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/common/components/ui/popover";
import { Filter } from "lucide-react";
import { ReactNode, useState } from "react";

interface Props {
  onSave: () => void;
  onClear: () => void;
  onOpen: () => void;
  children: ReactNode;
}

/**
 * A component for displaying and managing table filters with a popover.
 *
 * This component provides a button that opens a popover with filter options. It includes
 * buttons to save the selected filters or clear them. The component also triggers
 * functions when filters are saved, cleared, or when the popover is opened.
 *
 * @param onSave - A callback function to be called when the "Save" button is clicked.
 * @param onClear - A callback function to be called when the "Clear All" button is clicked.
 * @param onOpen - A callback function to be called when the popover is opened.
 * @param children - The filter content (e.g., filter form elements) to be displayed inside the popover.
 *
 * @returns A button that opens a popover, containing filter options and action buttons.
 */

const TableFilter = ({ onSave, onOpen, onClear, children }: Props) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleClearFilters = () => {
    onClear();
  };

  const handleSave = () => {
    onSave();
    setIsPopoverOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) onOpen();
    setIsPopoverOpen(open);
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex flex-row items-center justify-between">
            <h4 className="font-semibold">Filter</h4>
            <div className="flex items-center">
              <Button onClick={handleClearFilters} variant="ghost" className="text-red-500 hover:text-red-500">
                Clear All
              </Button>
              <Button onClick={handleSave} variant="ghost" className="text-primary hover:text-primary">
                Save
              </Button>
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto w-[100%] max-w-[500px] pr-2">{children}</div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TableFilter;
