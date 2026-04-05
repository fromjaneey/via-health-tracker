import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Ruler, Weight } from "lucide-react";

const feetOptions = Array.from({ length: 5 }, (_, i) => i + 4); // 4–8
const inchOptions = Array.from({ length: 12 }, (_, i) => i); // 0–11
const lbsOptions = Array.from({ length: 251 }, (_, i) => i + 80); // 80–330

function cmToFeetInches(cm: number) {
  const totalInches = Math.round(cm / 2.54);
  return { feet: Math.floor(totalInches / 12), inches: totalInches % 12 };
}
function feetInchesToCm(feet: number, inches: number) {
  return ((feet * 12 + inches) * 2.54).toFixed(1);
}
function kgToLbs(kg: number) {
  return Math.round(kg * 2.205);
}
function lbsToKg(lbs: number) {
  return (lbs / 2.205).toFixed(1);
}

interface MeasurementsStepProps {
  heightCm: string;
  weightKg: string;
  onHeightChange: (cm: string) => void;
  onWeightChange: (kg: string) => void;
  onNext: () => void;
  slideIn: any;
}

const ScrollPicker = ({
  options,
  value,
  onChange,
  label,
  suffix,
}: {
  options: number[];
  value: number;
  onChange: (v: number) => void;
  label: string;
  suffix: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemHeight = 48;
  const isScrolling = useRef(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const idx = options.indexOf(value);
    if (idx >= 0 && containerRef.current && !isScrolling.current) {
      containerRef.current.scrollTop = idx * itemHeight;
    }
  }, [value, options]);

  const handleScroll = () => {
    isScrolling.current = true;
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      if (!containerRef.current) return;
      const scrollTop = containerRef.current.scrollTop;
      const idx = Math.round(scrollTop / itemHeight);
      const clamped = Math.max(0, Math.min(idx, options.length - 1));
      containerRef.current.scrollTo({ top: clamped * itemHeight, behavior: "smooth" });
      onChange(options[clamped]);
      isScrolling.current = false;
    }, 80);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <div className="relative h-[144px] w-20 overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-background to-transparent z-10" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent z-10" />
        <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-12 rounded-lg bg-primary/10 border border-primary/20 z-[5]" />
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-none"
          style={{ scrollSnapType: "y mandatory", paddingTop: itemHeight, paddingBottom: itemHeight }}
        >
          {options.map((opt) => (
            <div
              key={opt}
              className={`h-12 flex items-center justify-center snap-center transition-all ${
                opt === value
                  ? "text-foreground font-bold text-lg"
                  : "text-muted-foreground/50 text-sm"
              }`}
              style={{ scrollSnapAlign: "center" }}
            >
              {opt}{suffix}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MeasurementsStep = ({ heightCm, weightKg, onHeightChange, onWeightChange, onNext, slideIn }: MeasurementsStepProps) => {
  const currentCm = heightCm ? parseFloat(heightCm) : 165;
  const currentKg = weightKg ? parseFloat(weightKg) : 60;

  const { feet, inches } = cmToFeetInches(currentCm);
  const currentLbs = kgToLbs(currentKg);

  const handleFeetChange = (f: number) => {
    onHeightChange(feetInchesToCm(f, inches));
  };
  const handleInchesChange = (i: number) => {
    onHeightChange(feetInchesToCm(feet, i));
  };
  const handleLbsChange = (lbs: number) => {
    onWeightChange(lbsToKg(lbs));
  };

  return (
    <motion.div key="measurements" {...slideIn} className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Your measurements 📏</h2>
        <p className="text-sm text-muted-foreground mt-1">Helps us calculate calorie needs and track progress</p>
      </div>

      {/* Height */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Ruler className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-display font-semibold text-foreground">Height</span>
        </div>
        <div className="flex items-center justify-center gap-4 bg-card border border-border rounded-xl p-4">
          <ScrollPicker options={feetOptions} value={feet} onChange={handleFeetChange} label="feet" suffix="'" />
          <ScrollPicker options={inchOptions} value={inches} onChange={handleInchesChange} label="inches" suffix='"' />
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          {feet}'{inches}"
        </p>
      </div>

      {/* Weight */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Weight className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-display font-semibold text-foreground">Weight</span>
        </div>
        <div className="flex items-center justify-center bg-card border border-border rounded-xl p-4">
          <ScrollPicker options={lbsOptions} value={currentLbs} onChange={handleLbsChange} label="pounds" suffix=" lbs" />
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          {currentLbs} lbs
        </p>
      </div>

      <Button variant="hero" className="w-full h-12 font-display" onClick={onNext}>
        Continue <ArrowRight className="w-4 h-4" />
      </Button>
    </motion.div>
  );
};

export default MeasurementsStep;
