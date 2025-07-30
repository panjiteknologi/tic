/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
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
      <CardContent>
        <ChartContainer config={config}>
          <LineChart data={data} margin={{ top: 20, left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value?.slice(0, 5)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            {dataKeys.map((key) => (
              <Line
                key={key}
                dataKey={key}
                type="natural"
                stroke={`var(--color-${key})`}
                strokeWidth={2}
                dot={{ fill: `var(--color-${key})` }}
                activeDot={{ r: 6 }}
              >
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Line>
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
      {(label || description) && (
        <CardFooter className="flex-col items-start gap-2 text-sm">
          {label && (
            <div className="flex gap-2 font-medium leading-none">
              {label} <TrendingUp className="h-4 w-4" />
            </div>
          )}
          {description && (
            <div className="leading-none text-muted-foreground">
              {description}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
