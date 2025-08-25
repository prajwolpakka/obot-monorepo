import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/common/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import TableSearch from "./table-search";

export interface IChoiceOption {
  label: string;
  value: string;
}

interface Props {
  label: string;
  options: IChoiceOption[];
  selected: IChoiceOption[];
  setSelected: (selected: IChoiceOption[]) => void;
  onSearch?: (query: string) => void;
}

/**
 * A component for filtering by multiple choices with a collapsible section.
 *
 * This component displays a collapsible section that allows users to select one or more
 * options using checkboxes. The selected options are tracked and updated via the
 * `setSelected` callback. The user can toggle between selected and unselected options.
 *
 * @param label - A string to display the label of the choices.
 * @param options - An array of available options, each containing a label and value.
 * @param selected - The currently selected options.
 * @param setSelected - A callback function to update the selected options.
 *
 * @returns A collapsible section with checkboxes for each available option.
 */

const MultiChoiceFilter = ({ label, options, selected, setSelected, onSearch }: Props) => {
  const toggleOption = (optionValue: string) => {
    const isSelected = selected.some((s) => s.value === optionValue);
    const newSelectedOptions = isSelected
      ? selected.filter((s) => s.value !== optionValue)
      : [...selected, options.find((option) => option.value === optionValue)!];
    setSelected(newSelectedOptions);
  };

  const toggleSelectAll = () => {
    if (selected.length === options.length) {
      setSelected([]); // Deselect all if all are selected
    } else {
      setSelected(options); // Select all if not all are selected
    }
  };

  // Check if all options are selected
  const isAllSelected = selected.length === options.length;

  return (
    <Collapsible className="group/collapsible" defaultOpen={selected.length > 0}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center space-x-2 py-2 cursor-pointer">
          <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          <span className="select-none font-medium">{label}</span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-8 pb-2">
        <div className="space-y-2">
          {options.length > 2 && (
            <>
              {onSearch && <TableSearch onSearch={onSearch} />}
              <div className="flex items-center space-x-2">
                <input
                  id={`Select All ${label}`}
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 text-blue-500"
                />
                <label htmlFor={`Select All ${label}`} className="text-sm font-semibold select-none">
                  Select All
                </label>
              </div>
            </>
          )}

          {/* Option checkboxes */}
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={option.value}
                checked={selected.some((s) => s.value === option.value)}
                onChange={() => toggleOption(option.value)}
                className="h-4 w-4 text-blue-500"
              />
              <label htmlFor={option.value} className="text-sm select-none">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default MultiChoiceFilter;
