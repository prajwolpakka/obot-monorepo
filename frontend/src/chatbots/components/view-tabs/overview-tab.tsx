import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { Separator } from "@/common/components/ui/separator";
import { Switch } from "@/common/components/ui/switch";
import { Textarea } from "@/common/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/common/components/ui/tooltip";
import { HelpCircle, Plus, Trash, Upload } from "lucide-react";
import React, { useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { IUpdateChatbotSchema } from "../../models/schema";
import { ColorPicker } from "../color-picker";

interface OverviewTabProps {
  chatbot: any;
  isEditing: boolean;
  form: UseFormReturn<IUpdateChatbotSchema>;
  addTrigger: () => void;
  removeTrigger: (index: number) => void;
  addDomain: () => void;
  removeDomain: (index: number) => void;
}
const OverviewTab: React.FC<OverviewTabProps> = ({
  chatbot,
  isEditing,
  form,
  addTrigger,
  removeTrigger,
  addDomain,
  removeDomain,
}) => {
  const iconInputRef = useRef<HTMLInputElement>(null);
  const watchedValues = form.watch();

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("icon", file);
    }
  };
  return (
    <div className="space-y-6">
      {/* Status Section - at the top */}
      <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="space-y-0.5">
          <Label htmlFor="status" className="text-sm font-medium">
            Status
          </Label>
          <p className="text-xs text-gray-500 dark:text-gray-400">Enable or disable the chatbot</p>
        </div>
        {isEditing ? (
          <Switch
            id="status"
            checked={watchedValues.isActive}
            onCheckedChange={(checked) => form.setValue("isActive", checked)}
          />
        ) : (
          <Badge
            variant={chatbot.isActive ? "default" : "secondary"}
            className={`text-xs ${
              chatbot.isActive
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            {chatbot.isActive ? "Active" : "Inactive"}
          </Badge>
        )}
      </div>

      <Separator />

      {/* Appearance Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Appearance</h3>
        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name
            </Label>
            {isEditing ? (
              <>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Enter chatbot name"
                  className={`h-10 ${
                    form.formState.touchedFields.name && form.watch("name") === ""
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
              </>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 min-h-[40px] flex items-center">
                <p className="text-sm text-gray-700 dark:text-gray-300">{chatbot.name}</p>
              </div>
            )}
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Icon</Label>
            {isEditing ? (
              <div className="space-y-3">
                <input ref={iconInputRef} type="file" accept="image/*" onChange={handleIconChange} className="hidden" />
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 min-h-[60px] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {watchedValues.icon ? (
                      <img
                        src={URL.createObjectURL(watchedValues.icon)}
                        alt="New icon preview"
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : chatbot.iconUrl ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL || "http://localhost:4001"}${chatbot.iconUrl}`}
                        alt="Current icon"
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center">
                        <Upload className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {watchedValues.icon
                          ? watchedValues.icon.name
                          : chatbot.iconUrl
                          ? "Current icon"
                          : "No icon uploaded"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Recommended: 64x64px, PNG or JPG</p>
                    </div>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => iconInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    {watchedValues.icon || chatbot.iconUrl ? "Change" : "Upload"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 min-h-[40px] flex items-center">
                {chatbot.iconUrl ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={`${import.meta.env.VITE_API_URL || "http://localhost:4001"}${chatbot.iconUrl}`}
                      alt="Chatbot icon"
                      className="w-8 h-8 rounded object-cover"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Custom icon</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Using default icon</p>
                )}
              </div>
            )}
          </div>

          {/* Theme Color */}
          <div className="space-y-2">
            <Label htmlFor="color" className="text-sm font-medium">
              Theme
            </Label>
            {isEditing ? (
              <ColorPicker value={watchedValues.color} onChange={(color) => form.setValue("color", color)} />
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 min-h-[40px] flex items-center">
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: chatbot.color }}
                  />
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{chatbot.color}</span>
                </div>
              </div>
            )}
          </div>

          {/* Welcome Message */}
          <div className="space-y-2">
            <Label htmlFor="welcomeMessage" className="text-sm font-medium">
              Welcome Message
            </Label>
            {isEditing ? (
              <>
                <Textarea
                  id="welcomeMessage"
                  {...form.register("welcomeMessage")}
                  placeholder="Enter welcome message"
                  rows={3}
                  className={`resize-none ${
                    form.formState.touchedFields.welcomeMessage && form.watch("welcomeMessage") === ""
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
              </>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 min-h-[80px]">
                <p className="text-sm text-gray-700 dark:text-gray-300">{chatbot.welcomeMessage}</p>
              </div>
            )}
          </div>

          {/* Placeholder */}
          <div className="space-y-2">
            <Label htmlFor="placeholder" className="text-sm font-medium">
              Placeholder
            </Label>
            {isEditing ? (
              <Input
                id="placeholder"
                {...form.register("placeholder")}
                placeholder="Enter input placeholder"
                className="h-10"
              />
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 min-h-[40px] flex items-center">
                <p className="text-sm text-gray-700 dark:text-gray-300">{chatbot.placeholder}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Behaviour Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Behaviour</h3>
        <div className="space-y-4">
          {/* Tone */}
          <div className="space-y-2">
            <Label htmlFor="tone" className="text-sm font-medium">
              Tone
            </Label>
            {isEditing ? (
              <Select value={watchedValues.tone} onValueChange={(value) => form.setValue("tone", value)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 min-h-[40px] flex items-center">
                <p className="text-sm text-gray-700 dark:text-gray-300 capitalize">{chatbot.tone}</p>
              </div>
            )}
          </div>

          {/* Follow-up Questions */}
          <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="followUp" className="text-sm font-medium">
                Follow Up Questions
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Enable follow-up questions after responses</p>
            </div>
            {isEditing ? (
              <Switch
                id="followUp"
                checked={watchedValues.shouldFollowUp}
                onCheckedChange={(checked) => form.setValue("shouldFollowUp", checked)}
              />
            ) : (
              <Badge variant={chatbot.shouldFollowUp ? "default" : "secondary"} className="text-xs">
                {chatbot.shouldFollowUp ? "Enabled" : "Disabled"}
              </Badge>
            )}
          </div>

          {/* Triggers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Triggers</Label>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle size={16} className="text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Specific phrases that will appear as suggestions at the start of the chat
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-2">
              {isEditing ? (
                <>
                  {watchedValues.triggers?.map((trigger, index) => (
                    <div key={trigger.id} className="flex items-center gap-2">
                      <Input
                        {...form.register(`triggers.${index}.value`)}
                        placeholder="Enter a trigger"
                        className="h-10"
                      />
                      <Button variant="outline" size="icon" onClick={() => removeTrigger(index)} className="p-3">
                        <Trash size={18} />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addTrigger} className="w-full">
                    <Plus size={16} className="mr-2" />
                    Add Trigger
                  </Button>
                </>
              ) : (
                <>
                  {chatbot.triggers && chatbot.triggers.length > 0 ? (
                    chatbot.triggers.map((trigger) => (
                      <div
                        key={trigger.id}
                        className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg text-sm"
                      >
                        {trigger.value}
                      </div>
                    ))
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 min-h-[40px] flex items-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">No triggers set</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Security Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Security</h3>
        <div className="space-y-4">
          {/* Allowed Domains */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Allowed Domains</Label>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle size={16} className="text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="max-w-xs space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                        <p>This chatbot works only on the domain added in the list.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                        <p>Format: http(s)://example.com</p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-2">
              {isEditing ? (
                <>
                  {watchedValues.allowedDomains?.map((domain, index) => (
                    <div key={domain.id} className="flex items-center gap-2">
                      <Input
                        {...form.register(`allowedDomains.${index}.value`)}
                        placeholder="https://example.com"
                        className={`h-10 ${
                          form.formState.touchedFields.allowedDomains?.[index]?.value &&
                          form.watch(`allowedDomains.${index}.value`) === ""
                            ? "border-red-500 focus:border-red-500"
                            : ""
                        }`}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeDomain(index)}
                        className="p-3"
                        disabled={watchedValues.allowedDomains?.length === 1}
                      >
                        <Trash size={18} />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addDomain} className="w-full">
                    <Plus size={16} className="mr-2" />
                    Add Domain
                  </Button>
                </>
              ) : (
                <>
                  {chatbot.allowedDomains && chatbot.allowedDomains.length > 0 ? (
                    chatbot.allowedDomains.map((domain) => (
                      <div
                        key={domain.id}
                        className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg text-sm"
                      >
                        {domain.value}
                      </div>
                    ))
                  ) : (
                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg text-sm">
                      <p className="text-sm text-gray-500 dark:text-gray-400">No domains set</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
