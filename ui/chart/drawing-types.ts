export type Point = { time: number; price: number };

export type DrawingType = 
  | 'line' 
  | 'ray' 
  | 'parallel_channel' 
  | 'disjoint_channel' 
  | 'rectangle' 
  | 'brush' 
  | 'fib' 
  | 'elliot_wave' 
  | 'ruler' 
  | 'risk_reward_long'
  | 'risk_reward_short';

export interface Drawing {
  id: string;
  type: DrawingType;
  points: Point[]; // Logical coordinates (Time, Price)
  color?: string;
  text?: string; // For text tool
  // Additional styling properties could go here
}
