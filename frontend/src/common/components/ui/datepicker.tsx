import { Button } from "@/common/components/ui/button";
import { Calendar } from "@/common/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/common/components/ui/popover";
import { DateRange } from "react-day-picker";
import { formatDateRange } from "../../utils/date-time";

interface Props {
  dateRange?: DateRange;
  setDateRange?: (range?: DateRange) => void;
}

/**
 * A component for selecting a date range using a popover with a calendar.
 *
 * This component displays a button that shows the selected date range, and when clicked,
 * opens a calendar popover that allows users to select a range of dates. The selected date
 * range is passed back to the parent component via the `setDateRange` callback.
 *
 * @param dateRange - The currently selected date range.
 * @param setDateRange - A callback function to update the selected date range.
 *
 * @returns A button that triggers a popover with a calendar for selecting a date range.
 */

export const DatePicker = ({ dateRange, setDateRange }: Props) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full font-normal justify-start">
          {formatDateRange(dateRange) || "Select Date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="range" selected={dateRange} onSelect={setDateRange} />
      </PopoverContent>
    </Popover>
  );
};
