//components/chart-visualization.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions,
  ScatterDataPoint,
  ChartTypeRegistry,
} from 'chart.js';
import {
  Bar,
  Line,
  Pie,
  Doughnut,
  Scatter,
} from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type ChartConfig = {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'doughnut';
  title: string;
  data: Array<Record<string, string | number>>;
  xAxis?: string;
  yAxis?: string;
  colorScheme?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gradient' | 'rainbow';
  showLegend?: boolean;
  showGrid?: boolean;
  animation?: boolean;
};

interface ChartVisualizationProps {
  content: string;
  currentVersionIndex: number;
  isCurrentVersion: boolean;
  saveContent: (content: string, debounce?: boolean) => void;
  status: 'streaming' | 'idle';
}

const colorSchemes = {
  blue: ['#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE', '#1E40AF', '#2563EB'],
  green: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#047857', '#059669'],
  purple: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#7C3AED', '#6D28D9'],
  orange: ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#D97706', '#B45309'],
  red: ['#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#DC2626', '#B91C1C'],
  gradient: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
  rainbow: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFB347', '#98D8C8'],
};

// Helper function to check if a string is likely CSV
const isLikelyCSV = (str: string): boolean => {
  return typeof str === 'string' && 
         (str.includes(',') || str.includes(';')) && 
         (str.includes('\n') || str.includes('\r')) &&
         !str.includes('{') && !str.includes('[');
};

export function ChartVisualization({
  content,
  currentVersionIndex,
  isCurrentVersion,
  saveContent,
  status,
}: ChartVisualizationProps) {
  const chartRef = useRef<any>(null);
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Parse chart configuration from content
  useEffect(() => {
    try {
      if (!content || content.trim() === '') {
        setError('Waiting for chart configuration...');
        return;
      }
      
      // Check if content is CSV-like
      if (isLikelyCSV(content)) {
        setError('Received CSV data instead of JSON. Please try again with a chart request.');
        console.error('Chart received CSV-like data:', content);
        return;
      }
      
      const parsedConfig = JSON.parse(content) as ChartConfig;
      
      // Validate required fields
      if (!parsedConfig.type || !parsedConfig.data || !Array.isArray(parsedConfig.data)) {
        setError('Invalid chart configuration: missing required fields');
        console.error('Invalid chart config:', parsedConfig);
        return;
      }
      
      // If we got here, we have a valid config
      setChartConfig(parsedConfig);
      setError(null);
    } catch (err) {
      setError(`Failed to parse chart configuration: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Chart config parse error:', err, 'Content:', content);
    }
  }, [content]);

  // Handle chart download
  useEffect(() => {
    const handleDownload = (event: CustomEvent) => {
      if (chartRef.current) {
        try {
          // Access the canvas element
          const canvas = chartRef.current.canvas;
          if (canvas) {
            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `chart-${Date.now()}.png`;
            link.href = url;
            link.click();
          } else {
            console.error('Canvas not found in chart reference');
          }
        } catch (err) {
          console.error('Failed to download chart:', err);
        }
      }
    };

    window.addEventListener('downloadChart', handleDownload as EventListener);
    return () => {
      window.removeEventListener('downloadChart', handleDownload as EventListener);
    };
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">Chart Error</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!chartConfig) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="animate-spin size-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-gray-600">Loading chart configuration...</div>
        </div>
      </div>
    );
  }

  // Get chart data based on chart type
  const getChartData = (): ChartData<any, any, any> => {
    const { data, xAxis, yAxis, colorScheme = 'blue', type } = chartConfig;
    
    if (!data || data.length === 0) {
      return { datasets: [] };
    }

    const colors = colorSchemes[colorScheme] || colorSchemes.blue;
    
    if (type === 'pie' || type === 'doughnut') {
      const labels = data.map((item, index) => 
        xAxis && item[xAxis] !== undefined ? String(item[xAxis]) : `Item ${index + 1}`
      );
      const values = data.map(item => 
        yAxis && item[yAxis] !== undefined ? Number(item[yAxis]) : Object.values(item).find(v => typeof v === 'number') || 0
      );

      return {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors.slice(0, values.length),
          borderColor: colors.slice(0, values.length).map(color => color + '80'),
          borderWidth: 2,
          hoverOffset: 10,
        }],
      };
    }

    if (type === 'scatter') {
      const scatterData = data.map(item => ({
        x: xAxis && item[xAxis] !== undefined ? Number(item[xAxis]) : Math.random() * 100,
        y: yAxis && item[yAxis] !== undefined ? Number(item[yAxis]) : Math.random() * 100,
      })) as ScatterDataPoint[];

      return {
        datasets: [{
          label: chartConfig.title,
          data: scatterData,
          backgroundColor: colors[0] + '80',
          borderColor: colors[0],
          pointRadius: 6,
          pointHoverRadius: 8,
        }],
      };
    }

    // For bar, line, and area charts
    const labels = data.map((item, index) => 
      xAxis && item[xAxis] !== undefined ? String(item[xAxis]) : `Item ${index + 1}`
    );
    
    const datasets = [];
    
    if (yAxis && data.length > 0 && data[0][yAxis] !== undefined) {
      datasets.push({
        label: yAxis,
        data: data.map(item => Number(item[yAxis]) || 0),
        backgroundColor: type === 'line' || type === 'area' ? colors[0] + '20' : colors[0],
        borderColor: colors[0],
        borderWidth: 2,
        fill: type === 'area',
        tension: type === 'line' || type === 'area' ? 0.4 : 0,
        pointBackgroundColor: colors[0],
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      });
    } else if (data.length > 0) {
      // Auto-detect numeric columns
      const numericKeys = Object.keys(data[0] || {}).filter(key => {
        return key !== xAxis && typeof data[0][key] === 'number';
      });
      
      numericKeys.forEach((key, index) => {
        datasets.push({
          label: key,
          data: data.map(item => Number(item[key]) || 0),
          backgroundColor: type === 'line' || type === 'area' ? colors[index % colors.length] + '20' : colors[index % colors.length],
          borderColor: colors[index % colors.length],
          borderWidth: 2,
          fill: type === 'area',
          tension: type === 'line' || type === 'area' ? 0.4 : 0,
          pointBackgroundColor: colors[index % colors.length],
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        });
      });
    }

    return { labels, datasets };
  };

  // Create chart options
  const getChartOptions = (): ChartOptions<any> => {
    const { showLegend = true, showGrid = true, animation = true, title } = chartConfig;
    
    const baseOptions: ChartOptions<any> = {
      responsive: true,
      maintainAspectRatio: false,
      animation: animation ? {
        duration: 1000,
        easing: 'easeInOutQuart',
      } : false,
      plugins: {
        title: {
          display: !!title,
          text: title,
          font: {
            size: 18,
            weight: 'bold',
          },
          color: '#1F2937',
          padding: 20,
        },
        legend: {
          display: showLegend,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
        },
      },
    };

    if (chartConfig.type === 'pie' || chartConfig.type === 'doughnut') {
      return baseOptions;
    }

    return {
      ...baseOptions,
      scales: {
        x: {
          display: true,
          grid: {
            display: showGrid,
            color: 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            color: '#6B7280',
            font: {
              size: 11,
            },
          },
        },
        y: {
          display: true,
          grid: {
            display: showGrid,
            color: 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            color: '#6B7280',
            font: {
              size: 11,
            },
          },
        },
      },
    };
  };

  const chartData = getChartData();
  const chartOptions = getChartOptions();

  if (!chartData || chartData.datasets.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="text-gray-500 text-lg font-semibold mb-2">No Data</div>
          <div className="text-gray-400">No valid data found for visualization</div>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    switch (chartConfig.type) {
      case 'bar':
        return <Bar ref={chartRef} data={chartData} options={chartOptions} />;
      case 'line':
      case 'area':
        return <Line ref={chartRef} data={chartData} options={chartOptions} />;
      case 'pie':
        return <Pie ref={chartRef} data={chartData} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut ref={chartRef} data={chartData} options={chartOptions} />;
      case 'scatter':
        return <Scatter ref={chartRef} data={chartData} options={chartOptions} />;
      default:
        return <Bar ref={chartRef} data={chartData} options={chartOptions} />;
    }
  };

  return (
    <div className="size-full bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className={`size-3 rounded-full ${
              status === 'streaming' ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'
            }`} />
            <span className="text-sm text-gray-600">
              {status === 'streaming' ? 'Updating...' : 'Ready'}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {chartConfig.type.charAt(0).toUpperCase() + chartConfig.type.slice(1)} Chart
          </div>
        </div>
        
        <div className="h-96 w-full">
          {renderChart()}
        </div>
        
        {chartConfig.data && (
          <div className="mt-4 text-xs text-gray-500 text-center">
            Showing {chartConfig.data.length} data points
          </div>
        )}
      </div>
    </div>
  );
}