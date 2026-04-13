declare module 'react-gauge-chart' {
  import { FC } from 'react';

  interface GaugeChartProps {
    id: string;
    nrOfLevels?: number;
    arcsLength?: number[];
    colors?: string[];
    percent?: number;
    arcPadding?: number;
    arcWidth?: number;
    cornerRadius?: number;
    textColor?: string;
    needleColor?: string;
    needleBaseColor?: string;
    hideText?: boolean;
    animate?: boolean;
    animDelay?: number;
    animateDuration?: number;
    marginInPercent?: number;
  }

  const GaugeChart: FC<GaugeChartProps>;
  export default GaugeChart;
}
