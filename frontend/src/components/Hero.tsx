import { Satellite } from "lucide-react";

const Hero = () => {
  return (
    <div className="text-center mb-12 animate-fade-in">
      <div className="flex items-center justify-center gap-3 mb-4">
        <Satellite className="w-10 h-10 text-primary" />
        <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          UrbanGrowth-LSTM
        </h1>
      </div>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Deep Learning for Satellite Road Extraction
      </p>
      <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
        Upload satellite imagery to extract road networks using ConvLSTM architecture
      </p>
    </div>
  );
};

export default Hero;
