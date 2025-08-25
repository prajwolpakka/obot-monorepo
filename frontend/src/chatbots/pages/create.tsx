import { Button } from "@/common/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { useToast } from "@/common/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Bot, FileText } from "lucide-react";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import ChatbotComponent from "../components/chatbot";
import FilesTab from "../components/create-tabs/files-tab";
import OverviewTab from "../components/create-tabs/overview-tab";
import IntegrationModal from "../components/integration-modal";
import { ICreateChatbotSchema, createChatbotSchema } from "../models/schema";
import { chatbotsUrl } from "../routes";
import { useCreateChatbot } from "../services/hooks";

const CreateChatbotPage: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [documentFiles, setDocumentFiles] = React.useState<string[]>([]);
  const [activeTab, setActiveTab] = React.useState<string>("overview");
  const [showIntegrationModal, setShowIntegrationModal] = React.useState(false);
  const [createdChatbotId, setCreatedChatbotId] = React.useState<string>("");

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDocumentsChange = (documents: string[]) => {
    setDocumentFiles(documents);
  };

  const form = useForm<ICreateChatbotSchema>({
    resolver: zodResolver(createChatbotSchema),
    defaultValues: {
      name: "",
      color: "#3b82f6",
      welcomeMessage: "Hello! How can I help you?",
      placeholder: "Type a message...",
      tone: "casual",
      shouldFollowUp: false,
      triggers: [] as { id: string; value: string }[],
      allowedDomains: [{ id: new Date().toISOString(), value: "http://localhost:6000/" }],
      icon: undefined,
      selectedDocuments: [],
      uploadedFiles: [],
    },
  });

  const { mutate: create, isPending } = useCreateChatbot();

  const onSubmit = async (data: ICreateChatbotSchema) => {
    create(data, {
      onSuccess: (response) => {
        toast({
          title: "Chatbot created successfully!",
        });

        // Extract chatbot ID from response and show integration modal
        const chatbotId = response?.id || "your-chatbot-id";
        setCreatedChatbotId(chatbotId);
        setShowIntegrationModal(true);
      },
      onError: (error) => {
        console.error("Error creating chatbot:", error);
        toast({
          title: "Something went wrong!",
          description: `Failed to create chatbot: ${error}`,
          variant: "destructive",
        });
      },
    });
  };

  const handleCreateClick = async () => {
    // Update form with current file states
    form.setValue("selectedDocuments", documentFiles);
    form.setValue("uploadedFiles", selectedFiles);

    // Trigger form validation
    const isValid = await form.trigger();

    if (!isValid) {
      // Check for overview tab errors
      const overviewFields = ["name", "color", "welcomeMessage", "placeholder", "tone", "icon", "allowedDomains"];
      const filesFields = ["selectedDocuments", "uploadedFiles"];
      const errors = form.formState.errors;

      const hasOverviewErrors = overviewFields.some((field) => errors[field as keyof typeof errors]);
      const hasFilesErrors = filesFields.some((field) => errors[field as keyof typeof errors]);

      if (hasOverviewErrors && activeTab !== "overview") {
        setActiveTab("overview");
        setTimeout(() => {
          const firstErrorField = overviewFields.find((field) => errors[field as keyof typeof errors]);
          if (firstErrorField) {
            const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
            element?.focus();
          }
        }, 100);
        return;
      }

      if (hasFilesErrors && activeTab !== "files") {
        setActiveTab("files");
        return;
      }
    }

    // If valid or errors are in current tab, proceed with submission
    form.handleSubmit(onSubmit)();
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRevert = () => {
    form.reset({
      name: "",
      color: "#3b82f6",
      welcomeMessage: "Hello! How can I help you?",
      placeholder: "Type a message...",
      tone: "casual",
      shouldFollowUp: false,
      triggers: [],
      allowedDomains: [{ id: new Date().toISOString(), value: "" }],
      icon: undefined,
      selectedDocuments: [],
      uploadedFiles: [],
    });
  };

  const handleIntegrationModalClose = () => {
    setShowIntegrationModal(false);
    navigate(chatbotsUrl.viewAll);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
    });
  };

  const watchedValues = form.watch();

  // Memoize the image URL to prevent unnecessary re-renders
  const imageUrl = useMemo(() => {
    return watchedValues.icon ? URL.createObjectURL(watchedValues.icon) : undefined;
  }, [watchedValues.icon]);

  return (
    <>
      <div className="h-[100%] w-[100%] flex gap-4 overflow-clip">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="min-w-[400px] max-w-[400px] bg-white flex flex-col"
        >
          {/* Back button inline with tabs */}
          <div className="flex items-center gap-2 p-2">
            <Button variant="outline" size="sm" onClick={() => navigate(chatbotsUrl.viewAll)} className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <TabsList className="flex-1 grid grid-cols-2">
              <TabsTrigger value="overview">
                <div className="flex gap-2 items-center">
                  <Bot size={16} />
                  Overview
                </div>
              </TabsTrigger>
              <TabsTrigger value="files">
                <div className="flex gap-2 items-center">
                  <FileText size={16} />
                  Files
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden border-t">
            <TabsContent value="overview" className="overflow-auto px-4 h-full m-0 p-4">
              <OverviewTab form={form} />
            </TabsContent>

            <TabsContent value="files" className="overflow-auto p-4 overflow-y-auto max-w-full h-full m-0 ">
              <FilesTab
                selectedFiles={selectedFiles}
                documentFiles={documentFiles}
                onFileUpload={handleFileUpload}
                onRemoveFile={removeFile}
                onDocumentsChange={handleDocumentsChange}
              />
            </TabsContent>
          </div>

          <div className="border-t bg-white px-4 py-3 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleRevert} type="button">
              Reset
            </Button>
            <Button onClick={handleCreateClick} className="flex-1" disabled={isPending}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </Tabs>

        <ChatbotComponent
          apiKey="random-api-key"
          color={watchedValues.color}
          defaultOpen={true}
          chatbotName={watchedValues.name || "Chatbot"}
          initialMessage={watchedValues.welcomeMessage}
          placeholder={watchedValues.placeholder}
          height={"500px"}
          width={"400px"}
          imageUrl={imageUrl}
          triggers={watchedValues.triggers?.map((t) => t.value) || []}
        />
      </div>

      <IntegrationModal
        isOpen={showIntegrationModal}
        onClose={handleIntegrationModalClose}
        chatbotId={createdChatbotId}
        isNewChatbot={true}
      />
    </>
  );
};

export default CreateChatbotPage;
