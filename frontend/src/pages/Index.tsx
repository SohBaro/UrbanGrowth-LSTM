import { useState } from "react";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import FileUpload from "@/components/FileUpload";
import ProcessButton from "@/components/ProcessButton";
import ResultsGrid from "@/components/ResultsGrid";
import { useToast } from "@/hooks/use-toast";
import { Github } from "lucide-react"; // Imported the GitHub icon

interface ProcessedResults {
  original_image: string;
  mask_image: string;
  overlay_image: string;
  road_pixels?: number;
  coverage_percent?: number;
}

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ProcessedResults | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResults(null);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setResults(null);
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to connect to the model server.");
      }

      const data = await response.json();

      const realResults: ProcessedResults = {
        original_image: `data:image/png;base64,${data.original_image}`,
        mask_image: `data:image/png;base64,${data.mask_image}`,
        overlay_image: `data:image/png;base64,${data.overlay_image}`,
        road_pixels: data.metrics?.road_pixels || 0,
        coverage_percent: data.metrics?.coverage_percentage || 0,
      };

      setResults(realResults);

      toast({
        title: "Processing Complete",
        description: "Road segmentation analysis finished successfully.",
      });
    } catch (error) {
      console.error("Processing error:", error);
      toast({
        title: "Connection Failed",
        description: "Is your Python backend running on port 8000?",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark px-4 py-12 flex flex-col justify-between relative">
      
      {/* TOP RIGHT GITHUB BUTTON */}
      <a 
        href="https://github.com/SohBaro/UrbanGrowth-LSTM" 
        target="_blank" 
        rel="noopener noreferrer"
        className="absolute top-6 right-6 p-2 bg-gray-800/50 hover:bg-gray-700 text-white rounded-full border border-gray-700 transition-all flex items-center gap-2 px-4 z-10"
      >
        <Github className="w-5 h-5" />
        <span className="text-sm font-medium hidden md:inline">View Code</span>
      </a>

      {/* MAIN CONTENT */}
      <div className="container mx-auto max-w-7xl">
        <Hero />
        <FileUpload
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
          onClear={handleClearFile}
        />
        {selectedFile && (
          <ProcessButton
            onClick={handleProcess}
            disabled={!selectedFile || isLoading}
            isLoading={isLoading}
          />
        )}
        {results && <ResultsGrid results={results} />}
        
        {/* ABOUT SECTION */}
        <AboutSection />
      </div>

      {/* FOOTER */}
      <footer className="text-center mt-20 text-gray-500 text-lg border-t border-gray-800 pt-8">
        <p>Built with ❤️ by <span className="text-white font-semibold">Soham Barot</span></p>
        <p className="mt-2 text-sm">Powered by TensorFlow, FastAPI, and React</p>
      </footer>
    </div>
  );
};

export default Index;
