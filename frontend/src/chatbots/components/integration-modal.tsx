import { Button } from "@/common/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/common/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { Code2, Copy, Rocket } from "lucide-react";
import React, { useState } from "react";
import { htmlScript, nextjsIntegration, reactIntegration, vueIntegration } from "../data/scripts";

interface IntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatbotId: string;
  isNewChatbot?: boolean;
}

const IntegrationModal: React.FC<IntegrationModalProps> = ({ isOpen, onClose, chatbotId, isNewChatbot = false }) => {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const copyToClipboard = (text: string, tabName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates((prev) => ({ ...prev, [tabName]: true }));

    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [tabName]: false }));
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-green-600" />
            {isNewChatbot ? "Chatbot Created Successfully!" : "Integration Code"}
          </DialogTitle>
          <DialogDescription>
            {isNewChatbot
              ? "Your chatbot is ready! Choose an integration method below to add it to your website."
              : "Choose an integration method below to add this chatbot to your website."}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="html" className="flex-1 flex flex-col min-h-0 mt-4">
          <TabsList className="w-fit flex-shrink-0">
            <TabsTrigger value="html" className="flex items-center gap-1">
              <Code2 className="h-4 w-4" />
              HTML
            </TabsTrigger>
            <TabsTrigger value="react" className="flex items-center gap-1">
              <Code2 className="h-4 w-4" />
              React
            </TabsTrigger>
            <TabsTrigger value="nextjs" className="flex items-center gap-1">
              <Code2 className="h-4 w-4" />
              Next.js
            </TabsTrigger>
            <TabsTrigger value="vue" className="flex items-center gap-1">
              <Code2 className="h-4 w-4" />
              Vue.js
            </TabsTrigger>
          </TabsList>

          <TabsContent value="html" className="flex-1 min-h-0 mt-4">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Integration Code</h4>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(htmlScript(chatbotId), "html")}>
                  <Copy className="h-4 w-4 mr-1" />
                  {copiedStates.html ? "Copied" : "Copy"}
                </Button>
              </div>
              <div className="flex-1 min-h-0">
                <div className="h-full rounded-lg overflow-hidden border">
                  <pre className="bg-muted text-foreground p-4 text-sm h-full overflow-auto">
                    <code className="whitespace-pre">{htmlScript(chatbotId)}</code>
                  </pre>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="react" className="flex-1 min-h-0 mt-4">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Integration Code</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(reactIntegration(chatbotId), "react")}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {copiedStates.react ? "Copied" : "Copy"}
                </Button>
              </div>
              <div className="flex-1 min-h-0">
                <div className="h-full rounded-lg overflow-hidden border">
                  <pre className="bg-muted text-foreground p-4 text-sm h-full overflow-auto">
                    <code className="whitespace-pre">{reactIntegration(chatbotId)}</code>
                  </pre>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="nextjs" className="flex-1 min-h-0 mt-4">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Integration Code</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(nextjsIntegration(chatbotId), "nextjs")}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {copiedStates.nextjs ? "Copied" : "Copy"}
                </Button>
              </div>
              <div className="flex-1 min-h-0">
                <div className="h-full rounded-lg overflow-hidden border">
                  <pre className="bg-muted text-foreground p-4 text-sm h-full overflow-auto">
                    <code className="whitespace-pre">{nextjsIntegration(chatbotId)}</code>
                  </pre>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vue" className="flex-1 min-h-0 mt-4">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Integration Code</h4>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(vueIntegration(chatbotId), "vue")}>
                  <Copy className="h-4 w-4 mr-1" />
                  {copiedStates.vue ? "Copied" : "Copy"}
                </Button>
              </div>
              <div className="flex-1 min-h-0">
                <div className="h-full rounded-lg overflow-hidden border">
                  <pre className="bg-muted text-foreground p-4 text-sm h-full overflow-auto">
                    <code className="whitespace-pre">{vueIntegration(chatbotId)}</code>
                  </pre>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t flex-shrink-0">
          <p className="text-sm text-muted-foreground">
            Chatbot ID: <code className="bg-muted px-2 py-1 rounded">{chatbotId}</code>
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={onClose}>Got it!</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IntegrationModal;
