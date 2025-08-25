import React from 'react';
import { CheckCircle, Circle, XCircle, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/common/components/ui/tooltip';

export type EmbeddingStatus = 'pending' | 'embedding' | 'processed' | 'failed';

interface EmbeddingStatusIndicatorProps {
  status: EmbeddingStatus;
  className?: string;
}

export const EmbeddingStatusIndicator: React.FC<EmbeddingStatusIndicatorProps> = ({ 
  status, 
  className = '' 
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Circle className="h-4 w-4 text-gray-400" />;
      case 'embedding':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'processed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Embedding pending';
      case 'embedding':
        return 'Processing embeddings...';
      case 'processed':
        return 'Embedding completed';
      case 'failed':
        return 'Embedding failed';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1 ${className}`}>
            {getStatusIcon()}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getStatusText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};