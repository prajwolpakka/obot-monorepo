import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/common/components/ui/popover";
import { useState } from "react";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const presetColors = ["#3B82F6", "#000000", "#10B981", "#F97316", "#8b5cf6"];

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  const [customColor, setCustomColor] = useState(value);

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    onChange(color);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal">
          <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: value }} />
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Choose a color</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded border-2 ${
                    value === color ? "border-gray-900 dark:border-white" : "border-gray-200 dark:border-gray-700"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => onChange(color)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-color" className="text-sm font-medium">
              Custom Color
            </Label>
            <div className="flex gap-2">
              <Input
                id="custom-color"
                type="color"
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="w-12 h-10 p-1 border rounded"
              />
              <Input
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
