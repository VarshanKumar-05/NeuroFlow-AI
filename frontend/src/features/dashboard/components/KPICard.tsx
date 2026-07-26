import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  description?: string;
}

export function KPICard({ title, value, icon: Icon, trend, trendDirection, description }: KPICardProps) {
  const trendColor = 
    trendDirection === "up" ? "text-red-500" : 
    trendDirection === "down" ? "text-green-500" : 
    "text-slate-500"; // Assuming up is bad for traffic/incidents, down is good (except for speed maybe, adjust later)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(trend || description) && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {trend && <span className={`${trendColor} font-medium mr-1`}>{trend}</span>}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
