import { useEffect, useState } from "react";
import MetricsCard from "./MetricsCard";
import { Download } from "lucide-react";
import { Button } from "./ui/button";

interface ResultsGridProps {
  results: {
    original_image: string;
    mask_image: string;
    overlay_image: string;
    road_pixels?: number;
    coverage_percent?: number;
  };
}

const ResultsGrid = ({ results }: ResultsGridProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const roadPixels = results.road_pixels || 0;
  const coveragePercent = results.coverage_percent || 0;

  // Helper function to download base64 images
  const handleDownload = (dataUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`w-full max-w-6xl mx-auto mt-12 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-primary bg-clip-text text-transparent">
        Analysis Results
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* ORIGINAL IMAGE */}
        <div className="backdrop-blur-sm bg-card/50 border border-border rounded-lg overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-center">Original Image</h3>
          </div>
          <div className="p-4 flex-grow">
            <img src={results.original_image} alt="Original" className="w-full h-auto rounded-lg" />
          </div>
        </div>

        {/* MASK IMAGE + DOWNLOAD */}
        <div className="backdrop-blur-sm bg-card/50 border border-border rounded-lg overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-center">AI Skeleton Mask</h3>
          </div>
          <div className="p-4 flex-grow">
            <img src={results.mask_image} alt="Mask" className="w-full h-auto rounded-lg bg-muted" />
          </div>
          <div className="p-4 border-t border-border">
            <Button 
              className="w-full bg-gray-800 hover:bg-gray-700"
              onClick={() => handleDownload(results.mask_image, "road_mask.png")}
            >
              <Download className="w-4 h-4 mr-2" /> Download Mask
            </Button>
          </div>
        </div>

        {/* OVERLAY IMAGE + DOWNLOAD */}
        <div className="backdrop-blur-sm bg-card/50 border border-border rounded-lg overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-center">Overlay Result</h3>
          </div>
          <div className="p-4 flex-grow">
            <img src={results.overlay_image} alt="Overlay" className="w-full h-auto rounded-lg" />
          </div>
          <div className="p-4 border-t border-border">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-500"
              onClick={() => handleDownload(results.overlay_image, "road_overlay.png")}
            >
              <Download className="w-4 h-4 mr-2" /> Download Overlay
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <MetricsCard title="Road Pixels" value={roadPixels.toLocaleString()} subtitle="Detected road segments" />
        <MetricsCard title="Coverage" value={`${coveragePercent.toFixed(2)}%`} subtitle="Of total image area" />
      </div>
    </div>
  );
};

export default ResultsGrid;