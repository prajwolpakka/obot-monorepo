import { EmptyPage } from "@/common/components/empty-page";
import PageTitle from "@/common/components/page-title";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { Skeleton } from "@/common/components/ui/skeleton";
import TableSearch from "@/common/components/ui/table-search";
import { formatDateString } from "@/common/utils/date-time";
import { truncateText } from "@/common/utils/strings";
import { useMetrics } from "@/dashboard/services/hooks";
import { Bot, Calendar, Edit, MessageCircle, MoreVertical, Plus, Trash, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "../../common/components/ui/badge";
import { Button } from "../../common/components/ui/button";
import { useToast } from "../../common/components/ui/use-toast";
import { chatbotsUrl } from "../routes";
import { useChatbots, useDeleteChatbot } from "../services/hooks";

const ChatbotsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { data: chatbots, isLoading } = useChatbots();
  const { data: metrics, isLoading: isMetricsLoading } = useMetrics();
  const { mutate: deleteChatbot, isPending: isDeleting } = useDeleteChatbot();

  const handleStatusChange = (value: string) => {
    setStatusFilter(value === "all" ? null : value);
  };

  const clearStatusFilter = () => {
    setStatusFilter(null);
  };

  const handleCardClick = (chatbotId: string) => {
    navigate(`/chatbots/${chatbotId}`);
  };

  const handleEdit = (chatbotId: string) => {
    navigate(`/chatbots/${chatbotId}`);
  };

  const handleDelete = (chatbotId: string) => {
    deleteChatbot(chatbotId, {
      onSuccess: () => {
        toast({
          title: "Chatbot deleted successfully!",
        });
      },
      onError: (error) => {
        toast({
          title: "Failed to delete chatbot",
          description: `Error: ${error}`,
          variant: "destructive",
        });
      },
    });
  };

  if (isMetricsLoading) return <></>;

  if (metrics.totalChatbots === 0) {
    return (
      <EmptyPage
        title="No chatbots found"
        description="Get started by creating your first chatbot."
        icon={<Bot className="h-16 w-16 text-gray-400 mb-6" />}
        cta={{
          text: "Create Chatbot",
          icon: <Plus size={20} />,
          onClick: () => navigate(chatbotsUrl.create),
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 h-full w-full overflow-hidden">
        <Card className="h-full flex flex-col">
          <CardContent className="p-6 flex flex-col h-full min-h-0">
            <div className="space-y-6 flex-1 flex flex-col min-h-0">
              {/* Page Title Skeleton */}
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>

              {/* Filters and Create Button Skeleton */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-64" /> {/* Search */}
                <Skeleton className="h-10 w-24" /> {/* Filter */}
                <div className="flex-grow" />
                <Skeleton className="h-10 w-32" /> {/* Create Button */}
              </div>

              {/* Cards Grid Skeleton */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <Card
                      key={i}
                      className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden relative"
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <div className="flex items-center gap-3 pr-16">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="flex-1 min-w-0">
                            <Skeleton className="h-5 w-full mb-2" />
                            <Skeleton className="h-5 w-16" />
                          </div>
                        </div>
                        <Skeleton className="h-8 w-8 absolute top-4 right-4" />
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {/* Welcome Message Preview Skeleton */}
                          <div className="flex items-start gap-2">
                            <Skeleton className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <Skeleton className="h-4 w-full mb-1" />
                              <Skeleton className="h-4 w-3/4" />
                            </div>
                          </div>

                          {/* Color Divider Skeleton */}
                          <Skeleton className="w-full h-px" />

                          {/* Stats Skeleton */}
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-3 w-20" />
                            <div className="flex items-center gap-1">
                              <Skeleton className="h-3 w-3" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 h-full w-full overflow-hidden">
      <Card className="h-full flex flex-col">
        <CardContent className="p-6 flex flex-col h-full min-h-0">
          <div className="space-y-6 flex-1 flex flex-col min-h-0">
            <PageTitle title="Chatbots" description="Manage and monitor your chatbots" />

            <div className="flex items-center gap-4">
              <TableSearch onSearch={setSearchTerm} />
              <Select value={statusFilter || "all"} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex-grow" />
              <Link to={chatbotsUrl.create}>
                <Button className="flex items-center gap-2">
                  <Plus size={20} />
                  Create Chatbot
                </Button>
              </Link>
            </div>

            {statusFilter && (
              <div className="flex gap-2">
                <Badge
                  className="flex items-center gap-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 cursor-pointer"
                  onClick={clearStatusFilter}
                >
                  {statusFilter === "active" ? "Active" : "Inactive"}
                  <X className="w-3 h-3 hover:text-red-500 transition-colors" />
                </Badge>
              </div>
            )}

            <div className="flex-1 min-h-0 overflow-y-auto">
              {chatbots && chatbots.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {chatbots
                    .filter((chatbot) => {
                      const matchesSearch =
                        searchTerm === "" ||
                        chatbot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        chatbot.welcomeMessage.toLowerCase().includes(searchTerm.toLowerCase());

                      const matchesStatus =
                        !statusFilter ||
                        (statusFilter === "active" && chatbot.isActive) ||
                        (statusFilter === "inactive" && !chatbot.isActive);

                      return matchesSearch && matchesStatus;
                    })
                    .map((chatbot) => (
                      <Card
                        key={chatbot.id}
                        className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden relative"
                        onClick={() => {
                          console.log("CARD CLICKED!!");
                          handleCardClick(chatbot.id);
                        }}
                      >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                          <div className="flex items-center gap-3 pr-16">
                            <div
                              className="w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-lg"
                              style={{ borderColor: chatbot.color, backgroundColor: chatbot.color + "20" }}
                            >
                              {chatbot.iconUrl ? (
                                <img
                                  src={`${import.meta.env.VITE_API_URL || "http://localhost:4001"}${chatbot.iconUrl}`}
                                  alt={chatbot.name + " logo"}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <Bot size={24} style={{ color: chatbot.color }} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg font-semibold truncate">{chatbot.name}</CardTitle>
                              <Badge
                                className={`mt-1 ${
                                  chatbot.isActive
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                }`}
                              >
                                {chatbot.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                          <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild data-dropdown-trigger>
                                <Button variant="ghost" className="h-8 w-8 p-0 absolute top-4 right-4">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" side="bottom">
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  onClick={() => handleEdit(chatbot.id)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild data-alert-dialog-trigger>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                      <Trash className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the chatbot "
                                        {chatbot.name}" and all of its data.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(chatbot.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                        disabled={isDeleting}
                                      >
                                        {isDeleting ? "Deleting..." : "Delete"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            {/* Welcome Message Preview */}
                            <div className="flex items-start gap-2">
                              <MessageCircle size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {truncateText(chatbot.welcomeMessage, 80)}
                              </p>
                            </div>

                            {/* Color Divider */}
                            <div className="w-full h-px" style={{ backgroundColor: chatbot.color + "40" }} />

                            {/* Stats */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <span>
                                  {chatbot.documents?.length || 0} docs / {chatbot.triggers?.length || 0} triggers
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                <span>{formatDateString(chatbot.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Bot className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No chatbots found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {searchTerm || statusFilter
                      ? "Try adjusting your search or filter criteria to find what you're looking for."
                      : "Get started by creating your first chatbot to engage with your users."}
                  </p>
                  {!searchTerm && !statusFilter && (
                    <div className="mt-6">
                      <Link to={chatbotsUrl.create}>
                        <Button>
                          <Plus size={20} className="mr-2" />
                          Create Chatbot
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatbotsPage;
