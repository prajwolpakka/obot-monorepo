import { Controller, Get, Headers, Res } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { readFileSync } from "fs";
import { join } from "path";
import { ChatbotsService } from "./chatbots.service";

@ApiTags("chatbot")
@Controller("chatbot")
export class ChatbotsPublicController {
  constructor(private readonly chatbotsService: ChatbotsService) {}

  @Get("integrate")
  @ApiOperation({ summary: "Initialize chatbot integration (public endpoint)" })
  @ApiResponse({ status: 200, description: "Chatbot interface served successfully" })
  @ApiResponse({ status: 403, description: "Domain not allowed or no chatbot found for this domain" })
  async integrateChatbot(@Headers("referer") referer: string, @Res() res: Response): Promise<void> {
    try {
      if (!referer) {
        res.status(403).json({ message: "Referer header required" });
        return;
      }

      const refererUrl = new URL(referer);
      const domain = refererUrl.host; // Use host instead of hostname to include port

      // Find chatbot by allowed domain
      const result = await this.chatbotsService.findByDomain(domain);
      if (!result) {
        res.status(403).json({ message: "No chatbot configured for this domain" });
        return;
      }

      // Set proper headers
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'no-cache');
      
      // Read both JS and CSS files
      const jsFilePath = join(process.cwd(), "src", "chatbots", "chatbot.js");
      const cssFilePath = join(process.cwd(), "src", "chatbots", "chatbot.css");
      
      const jsContent = readFileSync(jsFilePath, 'utf8');
      const cssContent = readFileSync(cssFilePath, 'utf8');
      
      // Inject CSS into JS by creating a style element
      const combinedContent = `
// Auto-inject CSS styles
(function() {
  const style = document.createElement('style');
  style.textContent = \`${cssContent.replace(/`/g, '\\`')}\`;
  document.head.appendChild(style);
})();

${jsContent}
`;
      
      res.send(combinedContent);
      
    } catch (error) {
      console.error('Error in integrateChatbot:', error);
      if (!res.headersSent) {
        res.status(403).json({ message: "Invalid referer URL" });
      }
    }
  }
}
