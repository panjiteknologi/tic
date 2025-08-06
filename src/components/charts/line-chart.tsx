/* eslint-disable @typescript-eslint/no-explicit-any */
import { TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/charts/chart";

type Props = {
  data: any[];
  config: ChartConfig;
  label?: string;
  description?: string;
};

export function LineCharts({ data, config, label, description }: Props) {
  const dataKeys = Object.keys(config);

  return (
    <Card>
      <CardContent className="p-6">
        <ChartContainer config={config}>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 20, right: 20, bottom: 0, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value?.slice(0, 5)}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />

                {/* ✅ ChartTooltip harus ada DI DALAM ChartContainer */}
                <ChartTooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={<ChartTooltipContent indicator="line" />}
                />

                {dataKeys.map((key) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={config[key].color}
                    strokeWidth={2}
                    dot={{ r: 3, fill: config[key].color }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </CardContent>

      {(label || description) && (
        <CardFooter className="flex-col items-start gap-2 text-sm px-6 pb-6">
          {label && (
            <div className="flex items-center gap-2 font-medium">
              <TrendingUp className="h-4 w-4 text-green-600" />
              {label}
            </div>
          )}
          {description && (
            <div className="text-muted-foreground">{description}</div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
