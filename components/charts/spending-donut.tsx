"use client";

import { getCategoryColor } from "@/lib/category-colors";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// ── Types ───────────────────────────────────────────────────────

interface SpendingDonutProps {
  byCategory?: { category: string; amount: number }[];
  totalSpent: number;
  isLoading: boolean;
  formatCurrency: (n: number) => string;
  className?: string;
}

interface ActiveShapeProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: { category: string; amount: number };
}

// ── Geometry helpers ─────────────────────────────────────────────

const RADIAN = Math.PI / 180;

function buildSectorPath(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
): string {
  const sx = cx + outerRadius * Math.cos(-RADIAN * startAngle);
  const sy = cy + outerRadius * Math.sin(-RADIAN * startAngle);
  const ex = cx + outerRadius * Math.cos(-RADIAN * endAngle);
  const ey = cy + outerRadius * Math.sin(-RADIAN * endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  const ix1 = cx + innerRadius * Math.cos(-RADIAN * endAngle);
  const iy1 = cy + innerRadius * Math.sin(-RADIAN * endAngle);
  const ix2 = cx + innerRadius * Math.cos(-RADIAN * startAngle);
  const iy2 = cy + innerRadius * Math.sin(-RADIAN * startAngle);

  return [
    `M ${sx} ${sy}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 0 ${ex} ${ey}`,
    `L ${ix1} ${iy1}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${ix2} ${iy2}`,
    "Z",
  ].join(" ");
}

// ── Active shape (hover state) ──────────────────────────────────

function renderActiveShape(
  props: ActiveShapeProps,
  formatCurrency: (n: number) => string
) {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);

  // Callout geometry — longer lines for better readability
  const gap = 18;
  const ex = cx + (outerRadius + gap) * cos;
  const ey = cy + (outerRadius + gap) * sin;
  const lineLen = cos >= 0 ? 36 : -36;
  const tx = ex + lineLen;
  const anchor = cos >= 0 ? "start" : "end";
  const textOffset = cos >= 0 ? 10 : -10;

  // Enlarged sector path (grows 8px outward on hover)
  const sectorPath = buildSectorPath(cx, cy, innerRadius, outerRadius + 8, startAngle, endAngle);

  return (
    <g>
      <path d={sectorPath} fill={fill} opacity={0.95} />
      <line
        x1={cx + outerRadius * cos}
        y1={cy + outerRadius * sin}
        x2={ex}
        y2={ey}
        stroke={fill}
        strokeWidth={2}
      />
      <line x1={ex} y1={ey} x2={tx} y2={ey} stroke={fill} strokeWidth={2} />
      <circle cx={tx} cy={ey} r={3.5} fill={fill} />
      <text
        x={tx + textOffset}
        y={ey - 7}
        textAnchor={anchor}
        className="fill-foreground text-[13px] font-semibold"
      >
        {formatCurrency(payload.amount)}
      </text>
      <text
        x={tx + textOffset}
        y={ey + 10}
        textAnchor={anchor}
        className="fill-muted-foreground text-[11px]"
      >
        {payload.category}
      </text>
    </g>
  );
}

// ── Component ───────────────────────────────────────────────────

export function SpendingDonut({
  byCategory,
  totalSpent,
  isLoading,
  formatCurrency,
  className,
}: SpendingDonutProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold tracking-tight">
          Spending by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-80 w-full" />
        ) : byCategory && byCategory.length > 0 ? (
          <ResponsiveContainer width="100%" height={380}>
            <PieChart>
              <Pie
                data={byCategory}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={150}
                innerRadius={90}
                paddingAngle={2}
                activeShape={((props: ActiveShapeProps) =>
                  renderActiveShape(props, formatCurrency)
                ) as unknown as boolean}
              >
                {byCategory.map((entry) => (
                  <Cell
                    key={entry.category}
                    fill={getCategoryColor(entry.category).hex}
                    stroke="none"
                    cursor="pointer"
                  />
                ))}
              </Pie>
              <text
                x="50%"
                y="47%"
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-foreground text-xl font-bold"
              >
                {formatCurrency(totalSpent)}
              </text>
              <text
                x="50%"
                y="55%"
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-muted-foreground text-[12px]"
              >
                Total Spent
              </text>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-12">
            No expense data this month
          </p>
        )}
      </CardContent>
    </Card>
  );
}
