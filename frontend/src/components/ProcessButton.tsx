import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProcessButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}

const ProcessButton = ({ onClick, disabled, isLoading }: ProcessButtonProps) => {
  return (
    <div className="flex flex-col items-center gap-4 my-8">
      <Button
        onClick={onClick}
        disabled={disabled || isLoading}
        size="lg"
        className="px-8 py-6 text-lg font-semibold bg-gradient-primary hover:opacity-90 transition-all duration-300 hover:scale-105"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Running ConvLSTM Model...
          </>
        ) : (
          <>
            <Play className="w-5 h-5 mr-2" />
            Process Image
          </>
        )}
      </Button>
      {isLoading && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Analyzing satellite imagery with deep learning...
        </p>
      )}
    </div>
  );
};

export default ProcessButton;
