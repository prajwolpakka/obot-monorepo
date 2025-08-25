import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/common/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { DateRange } from "react-day-picker";
import { DatePicker } from "./datepicker";

interface Props {
  dateRange: DateRange | undefined;
  setDateRange: (date: DateRange | undefined) => void;
  label?: string;
}

/**
 * A component for selecting a date range with a collapsible section.
 *
 * This component provides a collapsible section that allows users to select a date range
 * using a custom date picker. The selected date range is passed to the parent component
 * through the `setDateRange` callback.
 *
 * @param dateRange - The currently selected date range.
 * @param setDateRange - A callback function to update the selected date range.
 *
 * @returns A collapsible section with a date picker to select and update a date range.
 */

const DateFilter = ({ dateRange, setDateRange, label = "Date Range" }: Props) => {
  return (
    <Collapsible className="group/collapsible" defaultOpen={dateRange != undefined}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center space-x-2 py-2 cursor-pointer">
          <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          <span className="select-none font-medium"> {label} </span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-8">
        <DatePicker dateRange={dateRange} setDateRange={setDateRange} />
      </CollapsibleContent>
    </Collapsible>
  );
};

export default DateFilter;
