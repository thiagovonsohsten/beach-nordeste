import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  bgColor?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  trend,
  bgColor = "bg-white",
}) => {
  return (
    <div className={cn("rounded-2xl shadow-md p-6", bgColor)}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-2 text-gray-800">{value}</h3>
          {trend && (
            <div className="mt-2 flex items-center">
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.isPositive ? "+" : "-"}{trend.value}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs período anterior</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", bgColor === "bg-white" ? "bg-soft-purple" : "bg-white bg-opacity-30")}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
