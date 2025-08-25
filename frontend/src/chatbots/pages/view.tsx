import { EmptyPage } from "@/common/components/empty-page";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/common/components/ui/alert-dialog";
import { Button } from "@/common/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { useToast } from "@/common/components/ui/use-toast";
import { formatFileSize } from "@/common/utils/disksize";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Bot, Code, Edit, FileText, Info, Loader2, MessageSquare, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import ChatbotComponent from "../components/chatbot";
import IntegrationModal from "../components/integration-modal";
import ConversationsTab from "../components/view-tabs/conversations-tab";
import FilesTab from "../components/view-tabs/files-tab";
import OverviewTab from "../components/view-tabs/overview-tab";
import { IUpdateChatbotSchema, updateChatbotSchema } from "../models/schema";
import { chatbotsUrl } from "../routes";
import { useChatbot, useDeleteChatbot, useUpdateChatbot } from "../services/hooks";

const ViewChatbotPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const form = useForm<IUpdateChatbotSchema>({
    resolver: zodResolver(updateChatbotSchema),
    defaultValues: {
      name: "",
      color: "#3b82f6",
      welcomeMessage: "",
      placeholder: "",
      tone: "casual",
      shouldFollowUp: false,
      isActive: true,
      triggers: [],
      allowedDomains: [],
      icon: undefined,
    },
  });

  const { data: chatbot, isLoading, error } = useChatbot(id || "");
  const { mutate: updateChatbot, isPending: isUpdating } = useUpdateChatbot();
  const { mutate: deleteChatbot, isPending: isDeleting } = useDeleteChatbot();

  // Initialize form when chatbot data loads
  useEffect(() => {
    if (chatbot) {
      form.reset({
        name: chatbot.name,
        color: chatbot.color,
        welcomeMessage: chatbot.welcomeMessage,
        placeholder: chatbot.placeholder,
        tone: chatbot.tone,
        shouldFollowUp: chatbot.shouldFollowUp,
        isActive: chatbot.isActive,
        triggers: chatbot.triggers || [],
        allowedDomains: chatbot.allowedDomains || [],
        icon: undefined,
      });
    }
  }, [chatbot, form]);

  const handleSave = async () => {
    if (!id) return;

    // Trigger form validation
    const isValid = await form.trigger();

    if (!isValid) {
      // Focus on the first error field
      const errors = form.formState.errors;

      setTimeout(() => {
        // Check basic fields first
        const basicFields = ["name", "welcomeMessage", "placeholder"];
        let firstErrorField = basicFields.find((field) => errors[field as keyof typeof errors]);

        if (firstErrorField) {
          const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
          element?.focus();
          return;
        }

        // Check allowedDomains errors
        if (errors.allowedDomains) {
          const allowedDomainsErrors = errors.allowedDomains as any[];
          const firstDomainErrorIndex = allowedDomainsErrors.findIndex((domain) => domain?.value);
          if (firstDomainErrorIndex !== -1) {
            const element = document.querySelector(
              `[name="allowedDomains.${firstDomainErrorIndex}.value"]`
            ) as HTMLElement;
            element?.focus();
            return;
          }
        }
      }, 100);
      return;
    }

    const formData = form.getValues();
    updateChatbot(
      {
        id,
        data: formData,
      },
      {
        onSuccess: () => {
          toast({
            title: "Chatbot updated successfully!",
          });
          setIsEditing(false);
        },
        onError: (error) => {
          toast({
            title: "Failed to update chatbot",
            description: error instanceof Error ? error.message : "Something went wrong",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleDelete = () => {
    if (!id) return;

    deleteChatbot(id, {
      onSuccess: () => {
        toast({
          title: "Chatbot deleted successfully!",
        });
        navigate(chatbotsUrl.viewAll);
      },
      onError: (error) => {
        toast({
          title: "Failed to delete chatbot",
          description: error instanceof Error ? error.message : "Something went wrong",
          variant: "destructive",
        });
      },
      onSettled: () => {
        setIsDeleteDialogOpen(false);
      },
    });
  };

  const handleCancel = () => {
    if (chatbot) {
      form.reset({
        name: chatbot.name,
        color: chatbot.color,
        welcomeMessage: chatbot.welcomeMessage,
        placeholder: chatbot.placeholder,
        tone: chatbot.tone,
        shouldFollowUp: chatbot.shouldFollowUp,
        isActive: chatbot.isActive,
        triggers: chatbot.triggers || [],
        allowedDomains: chatbot.allowedDomains || [],
        icon: undefined,
      });
    }
    setIsEditing(false);
  };

  const addTrigger = () => {
    const currentTriggers = form.getValues("triggers");
    form.setValue("triggers", [...currentTriggers, { id: new Date().toISOString(), value: "" }]);
  };

  const removeTrigger = (index: number) => {
    const currentTriggers = form.getValues("triggers");
    form.setValue(
      "triggers",
      currentTriggers.filter((_, i) => i !== index)
    );
  };

  const addDomain = () => {
    const currentDomains = form.getValues("allowedDomains");
    form.setValue("allowedDomains", [...currentDomains, { id: new Date().toISOString(), value: "" }]);
  };

  const removeDomain = (index: number) => {
    const currentDomains = form.getValues("allowedDomains");
    form.setValue(
      "allowedDomains",
      currentDomains.filter((_, i) => i !== index)
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-54px)] flex flex-col overflow-hidden">
        {/* Fixed Header Skeleton */}
        <div className="bg-white dark:bg-gray-800 p-4 border-b flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Tabs and Content Skeleton */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs List Skeleton */}
          <div className="p-4">
            <div className="w-full max-w-[400px] bg-white dark:bg-gray-800 rounded-lg border p-1 flex gap-1">
              <div className="w-full h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-full h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-full h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>

          {/* Tab Content Skeleton */}
          <div className="flex-1 overflow-hidden px-4 pb-4">
            <div className="h-full grid grid-cols-3 gap-6">
              {/* Left sidebar skeleton */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden h-full">
                <div className="h-full overflow-y-auto p-6">
                  <div className="space-y-6">
                    {/* Basic Info Section */}
                    <div className="space-y-4">
                      <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                    </div>

                    {/* Welcome Message Section */}
                    <div className="space-y-4">
                      <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-24 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>

                    {/* Placeholder Section */}
                    <div className="space-y-4">
                      <div className="h-6 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>

                    {/* Triggers Section */}
                    <div className="space-y-4">
                      <div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                    </div>

                    {/* Settings Section */}
                    <div className="space-y-4">
                      <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !chatbot) {
    return (
      <EmptyPage
        title="Chatbot not found"
        description="The chatbot you're looking for doesn't exist or you don't have access to it."
        icon={<Bot className="h-16 w-16 text-gray-400 mb-6" />}
        cta={{
          text: "Go Back",
          icon: <ArrowLeft size={20} />,
          onClick: () => navigate(-1),
        }}
      />
    );
  }

  return (
    <div className="h-[calc(100vh-54px)] flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{chatbot.name}</h1>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Edit/Save buttons - only visible on overview tab */}
            {activeTab === "overview" && (
              <>
                {isEditing ? (
                  <>
                    <Button variant="outline" size="sm" className="w-24" onClick={handleCancel}>
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                    <Button size="sm" className="w-24" onClick={handleSave} disabled={isUpdating}>
                      <Save className="h-4 w-4" />
                      {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setShowIntegrationModal(true)}>
                      <Code className="h-4 w-4" />
                      Integrate
                    </Button>
                    <Button variant="outline" size="sm" className="w-24" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4" /> Edit
                    </Button>

                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                      <AlertDialogTrigger asChild data-alert-dialog-trigger>
                        <Button variant="outline" size="sm" disabled={isDeleting} className="w-24">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the chatbot "{chatbot.name}" and
                            all of its data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleting}
                          >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs and Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tabs List */}
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full max-w-[400px] bg-white dark:bg-gray-800">
              <TabsTrigger
                value="overview"
                className="flex items-center gap-2 w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Info className="h-4 w-4" />
                Overview
              </TabsTrigger>{" "}
              <TabsTrigger
                value="files"
                className="flex items-center gap-2 w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <FileText className="h-4 w-4" />
                Files
              </TabsTrigger>
              <TabsTrigger
                value="conversations"
                className="flex items-center gap-2 w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <MessageSquare className="h-4 w-4" />
                Conversations
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden px-4 pb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsContent value="overview" className="h-full m-0 overflow-hidden">
              <div className="h-full grid grid-cols-3 gap-6">
                {/* Left sidebar with scrollable content */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden h-full">
                  <div className="h-full overflow-y-auto p-6">
                    <OverviewTab
                      chatbot={chatbot}
                      isEditing={isEditing}
                      form={form}
                      addTrigger={addTrigger}
                      removeTrigger={removeTrigger}
                      addDomain={addDomain}
                      removeDomain={removeDomain}
                    />
                  </div>
                </div>

                {/* Chatbot preview */}
                <div className="flex items-center justify-center">
                  <ChatbotComponent
                    apiKey="preview-api-key"
                    color={isEditing ? form.watch("color") : chatbot.color}
                    defaultOpen={true}
                    chatbotName={isEditing ? form.watch("name") || "Chatbot" : chatbot.name}
                    initialMessage={isEditing ? form.watch("welcomeMessage") : chatbot.welcomeMessage}
                    placeholder={isEditing ? form.watch("placeholder") : chatbot.placeholder}
                    height="500px"
                    width="400px"
                    imageUrl={chatbot.iconUrl ? `${import.meta.env.VITE_API_URL || "http://localhost:4001"}${chatbot.iconUrl}` : undefined}
                    triggers={
                      isEditing
                        ? form.watch("triggers")?.map((t) => t.value) || []
                        : chatbot.triggers?.map((t) => t.value) || []
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="files" className="h-full m-0 overflow-y-auto">
              <FilesTab chatbot={chatbot} formatDate={formatDate} formatFileSize={formatFileSize} />
            </TabsContent>

            <TabsContent value="conversations" className="h-full m-0 overflow-hidden">
              <ConversationsTab chatbotId={id || ""} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Integration Modal */}
      <IntegrationModal
        isOpen={showIntegrationModal}
        onClose={() => setShowIntegrationModal(false)}
        chatbotId={chatbot.id}
        isNewChatbot={false}
      />
    </div>
  );
};

export default ViewChatbotPage;
