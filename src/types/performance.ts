export interface PerformanceMetric {
  timestamp: number;
  latency: number;
  success: boolean;
  model: string;
}
