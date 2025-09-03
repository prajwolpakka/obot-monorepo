import { Button } from "@/common/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/common/components/ui/form";
import { Input } from "@/common/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { Separator } from "@/common/components/ui/separator";
import { Switch } from "@/common/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/common/components/ui/tooltip";
import { HelpCircle, Plus, Trash, Upload, X } from "lucide-react";
import React from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { ICreateChatbotSchema } from "../../models/schema";
import { ColorPicker } from "../color-picker";

interface OverviewTabProps {
  form: UseFormReturn<ICreateChatbotSchema>;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ form }) => {
  const {
    fields: triggerFields,
    append: appendTrigger,
    remove: removeTrigger,
  } = useFieldArray({
    control: form.control,
    name: "triggers",
  } as any);

  const {
    fields: domainFields,
    append: appendDomain,
    remove: removeDomain,
  } = useFieldArray({
    control: form.control,
    name: "allowedDomains",
  } as any);

  return (
    <Form {...form}>
      <div className="space-y-6">
        {/* Appearance Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Appearance</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter chatbot name"
                      {...field}
                      className={
                        form.formState.touchedFields.name && form.watch("name") === ""
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    {field.value ? (
                      <div className="flex items-center justify-between p-2 border rounded-md h-10">
                        <div className="flex items-center gap-2">
                          <img
                            src={URL.createObjectURL(field.value)}
                            alt="Chatbot Icon"
                            className="w-6 h-6 object-cover rounded"
                          />
                          <span className="text-sm text-muted-foreground truncate">{field.value.name}</span>
                        </div>
                        <button
                          onClick={() => field.onChange(null)}
                          className="flex items-center justify-center rounded-full border-red-500 border text-white p-1 w-5 h-5"
                          type="button"
                        >
                          <X size={12} className="text-[red]" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex h-[40px] flex-col justify-center items-start px-4 border rounded-lg">
                        <div className="flex flex-col gap-1">
                          <input
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={(e) => field.onChange(e.target.files?.[0] || null)}
                            className="hidden"
                            id="icon-upload"
                          />
                          <label
                            htmlFor="icon-upload"
                            className="cursor-pointer w-full text-muted-foreground flex gap-2 items-center"
                          >
                            <Upload size={15} />
                            <div className="text-sm">Choose a image</div>
                          </label>
                        </div>
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme</FormLabel>
                  <FormControl>
                    <ColorPicker
                      value={field.value}
                      onChange={(color) => {
                        field.onChange(color);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="welcomeMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Welcome Message</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter welcome message" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="placeholder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Placeholder</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter placeholder" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Behaviour Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Behaviour</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="tone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tone</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shouldFollowUp"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Follow Up Questions</FormLabel>
                    <div className="text-sm text-muted-foreground">Enable follow-up questions after responses</div>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="triggers"
              render={() => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Triggers</FormLabel>
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle size={16} className="text-muted-foreground cursor-help" />
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
                    {triggerFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 items-center justify-center">
                        <FormControl>
                          <Input placeholder="Enter a trigger" {...form.register(`triggers.${index}.value`)} />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeTrigger(index)}
                          className="p-3"
                        >
                          <Trash size={18} />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendTrigger({ id: new Date().toISOString(), value: "" })}
                      className="w-full"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Trigger
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Security Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Security</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="allowedDomains"
              render={() => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Allowed Domains</FormLabel>
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle size={16} className="text-muted-foreground cursor-help" />
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
                  <div className="space-y-3">
                    {domainFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 items-center justify-center">
                        <FormControl>
                          <Input
                            placeholder="https://example.com"
                            {...form.register(`allowedDomains.${index}.value`)}
                            className={
                              form.formState.touchedFields.allowedDomains?.[index]?.value &&
                              form.watch(`allowedDomains.${index}.value`) === ""
                                ? "border-red-500 focus:border-red-500"
                                : ""
                            }
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeDomain(index)}
                          className="p-3"
                          disabled={domainFields.length === 1}
                        >
                          <Trash size={18} />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => appendDomain({ id: new Date().toISOString(), value: "" })}
                      className="w-full"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Domain
                    </Button>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </Form>
  );
};

export default OverviewTab;
