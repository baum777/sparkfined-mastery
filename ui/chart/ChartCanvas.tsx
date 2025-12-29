// Fix linter error for scaleMargins and handle new drawing types logic

import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, CandlestickData, Time, HistogramData, LineData, ISeriesApi, IChartApi, MouseEventParams } from "lightweight-charts";
import { useTheme } from "next-themes";
import { Drawing, Point, DrawingType } from "./drawing-types";

interface ChartCanvasProps {
  symbol: string;
  timeframe?: string;
  className?: string;
  activeIndicators?: string[];
  drawingTool?: DrawingType | null;
}

// Define how many points each tool needs to be "complete"
// Tools not in this list might support N points (like brush)
const POINTS_REQUIRED: Record<string, number> = {
    'line': 2,
    'ray': 2,
    'rectangle': 2,
    'ruler': 2,
    'fib': 2,
    'risk_reward_long': 2, // Simplified for MVP: Entry -> Target (Stop implied or draggable later)
    'risk_reward_short': 2,
    'parallel_channel': 3,
    'disjoint_channel': 3,
    'elliot_wave': 5,
};

export function ChartCanvas({ 
  symbol, 
  timeframe = "1H", 
  className,
  activeIndicators = [],
  drawingTool = null 
}: ChartCanvasProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const { theme } = useTheme();
  
  // Drawing State
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<Drawing | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tick, setTick] = useState(0); 

  // Create Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const isDark = theme === 'dark';
    const backgroundColor = isDark ? '#09090b' : '#ffffff';
    const textColor = isDark ? '#a1a1aa' : '#52525b';
    const gridColor = isDark ? '#27272a' : '#e4e4e7';

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor: textColor,
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      timeScale: {
        borderColor: gridColor,
        timeVisible: true,
      },
      crosshair: {
        mode: 1, // CrosshairMode.Normal
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    const data = generateMockData();
    candlestickSeries.setData(data);
    seriesRef.current = candlestickSeries;

    // --- Indicators ---

    // Volume
    if (activeIndicators.includes('volume')) {
        const volumeSeries = chart.addHistogramSeries({
            color: '#26a69a',
            priceFormat: { type: 'volume' },
            priceScaleId: '', 
        });
        
        chart.priceScale('').applyOptions({
            scaleMargins: {
                top: 0.8,
                bottom: 0,
            },
        });

        volumeSeries.setData(generateVolumeData(data));
    }

    // SMA (Simple Moving Average)
    if (activeIndicators.includes('sma')) {
        const smaSeries = chart.addLineSeries({ color: '#3b82f6', lineWidth: 2, crosshairMarkerVisible: false });
        smaSeries.setData(calculateSMA(data, 20));
    }

    // EMA (Exponential Moving Average)
    if (activeIndicators.includes('ema')) {
        const emaSeries = chart.addLineSeries({ color: '#f59e0b', lineWidth: 2, crosshairMarkerVisible: false });
        emaSeries.setData(calculateEMA(data, 20));
    }

    // Bollinger Bands
    if (activeIndicators.includes('bb')) {
        const bb = calculateBollingerBands(data, 20, 2);
        
        // Upper
        const upperSeries = chart.addLineSeries({ color: '#22c55e', lineWidth: 1, crosshairMarkerVisible: false });
        upperSeries.setData(bb.upper);
        
        // Lower
        const lowerSeries = chart.addLineSeries({ color: '#22c55e', lineWidth: 1, crosshairMarkerVisible: false });
        lowerSeries.setData(bb.lower);

        // Middle (SMA20) - technically duplicate if SMA is on, but strictly part of BB
        // We can just show the bands, or show basis. Let's show basis too but subtle.
        const basisSeries = chart.addLineSeries({ color: '#22c55e', lineWidth: 1, lineStyle: 2, crosshairMarkerVisible: false });
        basisSeries.setData(bb.basis);
    }

    // RSI
    if (activeIndicators.includes('rsi')) {
        // RSI is an oscillator, typically 0-100. Best in separate pane.
        // We can overlay it at the bottom using margins, separate from volume.
        // Let's use a new priceScaleId 'rsi'
        
        const rsiSeries = chart.addLineSeries({
            color: '#8b5cf6', // Violet
            lineWidth: 2,
            priceScaleId: 'rsi',
        });
        
        chart.priceScale('rsi').applyOptions({
            scaleMargins: {
                top: 0.8, // Bottom 20%
                bottom: 0,
            },
            autoScale: false,
        });

        const rsiData = calculateRSI(data, 14);
        rsiSeries.setData(rsiData);
        
        // Add 70/30 levels lines for RSI? Not easy with simple AddLineSeries, 
        // usually we add extra series with constant data or use createChart options for grid lines?
        // Let's just draw the RSI line for now.
    }

    // MACD
    if (activeIndicators.includes('macd')) {
         const macdData = calculateMACD(data, 12, 26, 9);
         
         // MACD Line
         const macdSeries = chart.addLineSeries({
             color: '#2962FF',
             lineWidth: 1,
             priceScaleId: 'macd',
         });
         
         // Signal Line
         const signalSeries = chart.addLineSeries({
             color: '#FF6D00',
             lineWidth: 1,
             priceScaleId: 'macd',
         });
         
         // Histogram
         const histogramSeries = chart.addHistogramSeries({
             priceScaleId: 'macd',
         });

         chart.priceScale('macd').applyOptions({
             scaleMargins: {
                 top: 0.8,
                 bottom: 0,
             },
         });

         macdSeries.setData(macdData.macdLine);
         signalSeries.setData(macdData.signalLine);
         histogramSeries.setData(macdData.histogram);
    }


    chart.timeScale().fitContent();
    chartRef.current = chart;

    // Interaction Subscriptions
    chart.subscribeClick((param: MouseEventParams) => {
        if (!param.time || !param.point) return;
        if (param.point.x < 0 || param.point.y < 0) return;

        const price = candlestickSeries.coordinateToPrice(param.point.y);
        if (price === null) return;
        
        const time = param.time as number; 
        
        const event = new CustomEvent('chart-click', { 
            detail: { time, price } 
        });
        window.dispatchEvent(event);
    });

    chart.subscribeCrosshairMove((param: MouseEventParams) => {
        if (!param.time || !param.point) return;
        
        const price = candlestickSeries.coordinateToPrice(param.point.y);
        if (price === null) return;
        
        const time = param.time as number;

        const event = new CustomEvent('chart-move', { 
            detail: { time, price } 
        });
        window.dispatchEvent(event);
    });
    
    chart.timeScale().subscribeVisibleTimeRangeChange(() => {
        setTick(t => t + 1);
    });

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
            width: chartContainerRef.current.clientWidth, 
            height: chartContainerRef.current.clientHeight 
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [theme, activeIndicators, drawingTool]); 

  // --- Logic ---

  useEffect(() => {
      const handleClick = (e: Event) => {
          if (!drawingTool) return;
          const detail = (e as CustomEvent).detail;
          handleDrawingClick(detail);
      };

      const handleMove = (e: Event) => {
         if (!isDrawing || !currentDrawing) return;
         const detail = (e as CustomEvent).detail;
         
         if (drawingTool === 'brush') {
             setCurrentDrawing(prev => {
                if (!prev) return null;
                return { ...prev, points: [...prev.points, detail] };
             });
             return;
         }

         setCurrentDrawing(prev => {
            if (!prev) return null;
            const newPoints = [...prev.points];
            newPoints[newPoints.length - 1] = detail;
            return { ...prev, points: newPoints };
         });
      };

      window.addEventListener('chart-click', handleClick);
      window.addEventListener('chart-move', handleMove);

      return () => {
          window.removeEventListener('chart-click', handleClick);
          window.removeEventListener('chart-move', handleMove);
      };
  }, [drawingTool, isDrawing, currentDrawing]);


  const handleDrawingClick = (point: Point) => {
      if (!drawingTool) return;

      if (!isDrawing) {
          // Start Drawing
          const id = crypto.randomUUID();
          
          const initialPoints = drawingTool === 'brush' ? [point] : [point, point];

          const newDrawing: Drawing = {
              id,
              type: drawingTool,
              points: initialPoints, 
              color: '#3b82f6',
          };
          setCurrentDrawing(newDrawing);
          setIsDrawing(true);
      } else {
          // Continue or Finish Drawing
          if (currentDrawing) {
              const maxPoints = POINTS_REQUIRED[drawingTool] || 999;
              
              if (drawingTool === 'brush') {
                  const completedDrawing = { ...currentDrawing };
                  setDrawings(prev => [...prev, completedDrawing]);
                  setCurrentDrawing(null);
                  setIsDrawing(false);
                  return;
              }

              const currentPointsCount = currentDrawing.points.length;
              
              if (currentPointsCount >= maxPoints) {
                  // Done
                  const completedDrawing = {
                      ...currentDrawing,
                      points: [...currentDrawing.points.slice(0, -1), point] // replace preview with final
                  };
                  setDrawings(prev => [...prev, completedDrawing]);
                  setCurrentDrawing(null);
                  setIsDrawing(false);
              } else {
                  // Add next point (preview)
                  setCurrentDrawing({
                      ...currentDrawing,
                      points: [...currentDrawing.points.slice(0, -1), point, point] // fix current, add new preview
                  });
              }
          }
      }
  };

  const getScreenCoordinates = (point: Point) => {
      if (!chartRef.current || !seriesRef.current) return null;
      const x = chartRef.current.timeScale().timeToCoordinate(point.time as Time);
      const y = seriesRef.current.priceToCoordinate(point.price);
      return { x, y };
  };

  // Render Drawings
  const renderDrawing = (d: Drawing) => {
      if (d.points.length < 1) return null;
      
      const screenPoints = d.points.map(getScreenCoordinates).filter(p => p && p.x !== null && p.y !== null) as {x: number, y: number}[];
      
      if (screenPoints.length < 2 && d.type !== 'brush') return null; 

      const color = d.color || "#3b82f6";

      if (d.type === 'brush') {
          if (screenPoints.length < 2) return null;
          const pathData = `M ${screenPoints.map(p => `${p.x},${p.y}`).join(' L ')}`;
          return (
              <path
                key={d.id}
                d={pathData}
                stroke={color}
                strokeWidth={2}
                fill="none"
              />
          );
      }

      const start = screenPoints[0];
      const end = screenPoints[1];
      
      if (d.type === 'line' || d.type === 'ray' || d.type === 'ruler') {
          return (
              <g key={d.id}>
                <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={color} strokeWidth={2} />
                {d.type === 'ray' && (
                    <circle cx={end.x} cy={end.y} r={3} fill={color} />
                )}
                {d.type === 'ruler' && (
                     <text x={(start.x + end.x)/2} y={(start.y + end.y)/2 - 10} fill={color} fontSize="10" textAnchor="middle">
                        Dist
                     </text>
                )}
              </g>
          );
      }
      
      if (d.type === 'rectangle') {
          const width = end.x - start.x;
          const height = end.y - start.y;
          return (
              <rect
                key={d.id}
                x={width > 0 ? start.x : end.x}
                y={height > 0 ? start.y : end.y}
                width={Math.abs(width)}
                height={Math.abs(height)}
                stroke={color}
                fill={`${color}20`}
                strokeWidth={2}
              />
          );
      }

      if (d.type === 'risk_reward_long' || d.type === 'risk_reward_short') {
          const isLong = d.type === 'risk_reward_long';
          const targetY = end.y;
          const stopY = start.y - (targetY - start.y); 
          
          return (
             <g key={d.id}>
                 <rect 
                    x={start.x} 
                    y={Math.min(start.y, targetY)} 
                    width={Math.abs(end.x - start.x) || 50} 
                    height={Math.abs(targetY - start.y)} 
                    fill={isLong ? "#10b98120" : "#ef444420"}
                    stroke={isLong ? "#10b981" : "#ef4444"}
                 />
                 <rect 
                    x={start.x} 
                    y={Math.min(start.y, stopY)} 
                    width={Math.abs(end.x - start.x) || 50}
                    height={Math.abs(stopY - start.y)} 
                    fill={isLong ? "#ef444420" : "#10b98120"}
                    stroke={isLong ? "#ef4444" : "#10b981"}
                 />
             </g>
          )
      }

      if (d.type === 'parallel_channel' || d.type === 'disjoint_channel') {
          if (screenPoints.length < 3) {
             return <line key={d.id} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={color} strokeWidth={2} strokeDasharray="4" />;
          }
          const p3 = screenPoints[2];
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          
          return (
              <g key={d.id}>
                  <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={color} strokeWidth={2} />
                  <line x1={p3.x} y1={p3.y} x2={p3.x + dx} y2={p3.y + dy} stroke={color} strokeWidth={2} />
                  <line x1={start.x} y1={start.y} x2={p3.x} y2={p3.y} stroke={color} strokeWidth={1} strokeDasharray="2" />
                  <line x1={end.x} y1={end.y} x2={p3.x + dx} y2={p3.y + dy} stroke={color} strokeWidth={1} strokeDasharray="2" />
                  <path d={`M ${start.x},${start.y} L ${end.x},${end.y} L ${p3.x + dx},${p3.y + dy} L ${p3.x},${p3.y} Z`} fill={`${color}10`} stroke="none" />
              </g>
          );
      }

      if (d.type === 'elliot_wave') {
          const pathData = `M ${screenPoints.map(p => `${p.x},${p.y}`).join(' L ')}`;
          return (
              <g key={d.id}>
                  <path d={pathData} stroke={color} strokeWidth={2} fill="none" />
                  {screenPoints.map((p, i) => (
                      <text key={i} x={p.x} y={p.y - 10} fill={color} fontSize="12" fontWeight="bold" textAnchor="middle">
                          {i + 1}
                      </text>
                  ))}
              </g>
          );
      }

      if (d.type === 'fib') {
         const dy = end.y - start.y;
         const levels = [0, 0.382, 0.5, 0.618, 1];
         const width = Math.max(Math.abs(end.x - start.x), 100); 
         const left = Math.min(start.x, end.x);
         const right = Math.max(start.x, end.x);
         
         return (
             <g key={d.id}>
                 <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={color} strokeWidth={1} strokeDasharray="4" />
                 {levels.map(level => {
                     const y = start.y + dy * level;
                     return (
                         <g key={level}>
                             <line x1={left} y1={y} x2={right} y2={y} stroke={color} strokeWidth={1} opacity={0.7} />
                             <text x={left} y={y - 2} fill={color} fontSize="9">{level}</text>
                         </g>
                     )
                 })}
             </g>
         )
      }

      return null;
  };

  const cursorStyle = drawingTool ? 'crosshair' : 'default';

  return (
    <div className={`relative w-full h-full ${className || ''}`}>
       <div 
         ref={chartContainerRef} 
         className="w-full h-full" 
         data-testid="chart-canvas"
         style={{ cursor: cursorStyle }}
       />
       
       <svg className="absolute inset-0 pointer-events-none w-full h-full overflow-hidden">
           {drawings.map(renderDrawing)}
           {currentDrawing && renderDrawing(currentDrawing)}
       </svg>

       <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur px-3 py-1.5 rounded border text-xs font-mono shadow-sm pointer-events-none select-none">
          <span className="font-bold text-primary">{symbol}</span>
          <span className="mx-2 text-muted-foreground">•</span>
          <span className="text-muted-foreground">{timeframe}</span>
          {drawingTool && (
             <>
                <span className="mx-2 text-muted-foreground">|</span>
                <span className="text-blue-500 font-semibold">Tool: {drawingTool}</span>
                {isDrawing && <span className="ml-2 animate-pulse">● Active</span>}
             </>
          )}
       </div>
    </div>
  );
}

// --- Helpers ---

function generateMockData(): CandlestickData<Time>[] {
    const data: CandlestickData<Time>[] = [];
    let time = Math.floor(Date.now() / 1000) - 200 * 3600; 
    let open = 150.0;
    
    for (let i = 0; i < 200; i++) {
        const volatility = 2.0;
        const change = (Math.random() - 0.5) * volatility;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * volatility * 0.5;
        const low = Math.min(open, close) - Math.random() * volatility * 0.5;
        
        data.push({
            time: time as Time,
            open,
            high,
            low,
            close
        });
        
        open = close;
        time += 3600;
    }
    return data;
}

function generateVolumeData(priceData: CandlestickData<Time>[]): HistogramData<Time>[] {
    return priceData.map((d) => ({
        time: d.time,
        value: Math.random() * 10000 + 5000,
        color: (d.close > d.open) ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)',
    }));
}

function calculateSMA(data: CandlestickData<Time>[], period: number): LineData<Time>[] {
    const smaData: LineData<Time>[] = [];
    for (let i = period - 1; i < data.length; i++) {
        const slice = data.slice(i - period + 1, i + 1);
        const sum = slice.reduce((acc, val) => acc + val.close, 0);
        smaData.push({
            time: data[i].time,
            value: sum / period,
        });
    }
    return smaData;
}

function calculateEMA(data: CandlestickData<Time>[], period: number): LineData<Time>[] {
    const k = 2 / (period + 1);
    const emaData: LineData<Time>[] = [];
    let initialSum = 0;
    for (let i = 0; i < period; i++) initialSum += data[i].close;
    let prevEma = initialSum / period;
    emaData.push({ time: data[period - 1].time, value: prevEma });
    for (let i = period; i < data.length; i++) {
        const close = data[i].close;
        const ema = (close * k) + (prevEma * (1 - k));
        emaData.push({ time: data[i].time, value: ema });
        prevEma = ema;
    }
    return emaData;
}

function calculateBollingerBands(data: CandlestickData<Time>[], period: number, stdDevMultiplier: number) {
    const upper: LineData<Time>[] = [];
    const lower: LineData<Time>[] = [];
    const basis: LineData<Time>[] = [];

    for (let i = period - 1; i < data.length; i++) {
        const slice = data.slice(i - period + 1, i + 1);
        const sum = slice.reduce((acc, val) => acc + val.close, 0);
        const mean = sum / period;
        
        const variance = slice.reduce((acc, val) => acc + Math.pow(val.close - mean, 2), 0) / period;
        const stdDev = Math.sqrt(variance);
        
        basis.push({ time: data[i].time, value: mean });
        upper.push({ time: data[i].time, value: mean + stdDev * stdDevMultiplier });
        lower.push({ time: data[i].time, value: mean - stdDev * stdDevMultiplier });
    }
    return { upper, lower, basis };
}

function calculateRSI(data: CandlestickData<Time>[], period: number): LineData<Time>[] {
    const rsiData: LineData<Time>[] = [];
    let gains = 0;
    let losses = 0;

    // Initial average gain/loss
    for (let i = 1; i <= period; i++) {
        const diff = data[i].close - data[i - 1].close;
        if (diff > 0) gains += diff;
        else losses += Math.abs(diff);
    }
    
    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = period + 1; i < data.length; i++) {
        const diff = data[i].close - data[i - 1].close;
        const gain = diff > 0 ? diff : 0;
        const loss = diff < 0 ? Math.abs(diff) : 0;
        
        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;
        
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        
        rsiData.push({ time: data[i].time, value: rsi });
    }
    return rsiData;
}

function calculateMACD(data: CandlestickData<Time>[], fast: number, slow: number, signal: number) {
    const fastEMA = calculateEMA(data, fast);
    const slowEMA = calculateEMA(data, slow);
    
    // We need to align them by time
    // slowEMA is shorter (starts later).
    // Map time -> value
    const fastMap = new Map(fastEMA.map(d => [d.time as number, d.value]));
    
    const macdLine: LineData<Time>[] = [];
    
    slowEMA.forEach(s => {
        const fVal = fastMap.get(s.time as number);
        if (fVal !== undefined) {
            macdLine.push({
                time: s.time,
                value: fVal - s.value
            });
        }
    });

    // Calculate Signal Line (EMA of MACD Line)
    // We need to adapt calculateEMA to accept LineData not CandlestickData
    // Let's make a generic helper or just inline simple calculation here
    
    const signalLine: LineData<Time>[] = [];
    const histogram: HistogramData<Time>[] = [];

    // EMA of MACD Line
    const k = 2 / (signal + 1);
    let initialSum = 0;
    for(let i=0; i<signal; i++) {
        if (i < macdLine.length) initialSum += macdLine[i].value;
    }
    let prevEma = initialSum / signal;
    
    // Avoid index out of bounds if data is too short
    if (macdLine.length > signal) {
         signalLine.push({ time: macdLine[signal-1].time, value: prevEma });
         
         for(let i=signal; i<macdLine.length; i++) {
             const val = macdLine[i].value;
             const ema = (val * k) + (prevEma * (1 - k));
             signalLine.push({ time: macdLine[i].time, value: ema });
             prevEma = ema;
         }
    }

    // Histogram = MACD - Signal
    const signalMap = new Map(signalLine.map(s => [s.time as number, s.value]));
    macdLine.forEach(m => {
        const sVal = signalMap.get(m.time as number);
        if (sVal !== undefined) {
            const histVal = m.value - sVal;
            histogram.push({
                time: m.time,
                value: histVal,
                color: histVal >= 0 ? '#26a69a' : '#ef5350'
            });
        }
    });

    return { macdLine, signalLine, histogram };
}
