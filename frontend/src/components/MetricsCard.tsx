import { useEffect, useState } from "react";

interface MetricsCardProps {
  title: string;
  value: string;
  subtitle: string;
}

const MetricsCard = ({ title, value, subtitle }: MetricsCardProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`backdrop-blur-sm bg-gradient-to-br from-card/50 to-card/30 border border-border rounded-lg p-6 transition-all duration-500 hover:scale-105 hover:border-primary/50 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <h4 className="text-sm font-medium text-muted-foreground mb-2">{title}</h4>
      <p className="text-3xl font-bold text-primary mb-1">{value}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
};

export default MetricsCard;
