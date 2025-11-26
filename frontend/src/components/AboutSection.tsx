import { Brain, Layers, Activity } from "lucide-react";

const AboutSection = () => {
  return (
    <div className="mt-20 border-t border-gray-800 pt-16">
      <h2 className="text-3xl font-bold text-center mb-12 text-white">
        Methodology & Architecture
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        {/* Card 1 */}
        <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800">
          <Layers className="w-8 h-8 text-blue-500 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">ConvLSTM-UNet</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Unlike standard UNets, this model uses <strong>Convolutional LSTMs</strong> in the bottleneck 
            to capture spatial dependencies, significantly improving road connectivity in complex urban environments.
          </p>
        </div>

        {/* Card 2 */}
        <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800">
          <Activity className="w-8 h-8 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Coordinate Attention</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            We inject <strong>Coordinate Channels</strong> (x, y) directly into the input tensors. 
            This allows the Conv layers to understand global spatial context, reducing fragmented road segments.
          </p>
        </div>

        {/* Card 3 */}
        <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800">
          <Brain className="w-8 h-8 text-purple-500 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Skeletonization</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            The raw probability masks undergo a custom post-processing pipeline using 
            <strong>Morphological Closing</strong> and <strong>Skeletonization</strong> to produce 
            clean, single-pixel wide road networks ready for GIS usage.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;