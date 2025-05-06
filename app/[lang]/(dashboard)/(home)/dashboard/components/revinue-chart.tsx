"use client";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useThemeStore } from "@/store";
import { useTheme } from "next-themes";
import { themes } from "@/config/thems";
import { getGridConfig, getYAxisConfig } from "@/lib/appex-chart-options";
import { motion } from "framer-motion";
import { Classe } from "@/lib/interface";
import { useEffect, useState } from "react";

interface Props {
  height?: number;
  classesData: Classe[];
}

const RevenueChart = ({ height = 350, classesData }: Props) => {
  const { theme: config, setTheme: setConfig, isRtl } = useThemeStore();
  const { theme: mode } = useTheme();
  const theme = themes.find((theme) => theme.name === config);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const series = [
    {
      name: "Nombre d'élèves",
      data: classesData.map((classe) => parseInt(classe.student_number, 10)),
    },
  ];

  const options = {
    chart: {
      toolbar: {
        show: false,
      },
      stacked: true,
      animations: {
        enabled: true,
        easing: "easeinout" as "easeinout",
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
      events: {
        dataPointMouseEnter: (_event: any, chartContext: any, config: any) => {
          setHoveredIndex(config.dataPointIndex);
        },
        dataPointMouseLeave: () => {
          setHoveredIndex(null);
        },
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: "20%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: false,
      width: 1,
    },
    colors: classesData.map((_, index) =>
      hoveredIndex === index
        ? `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].info})`
        : `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].primary})`
    ),
    tooltip: {
      theme: mode === "dark" ? "dark" : "light",
    },
    grid: {
      ...getGridConfig(
        `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartGird})`
      ),
      position: "back" as "back", // Explicitly cast to the allowed type
    },
    yaxis: getYAxisConfig(
      `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`
    ),
    xaxis: {
      categories: classesData.map((classe) => classe.label),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    legend: {
      position: "bottom" as "bottom",
      horizontalAlign: "center" as "center",
      fontSize: "12px",
      fontWeight: 500,
      itemMargin: {
        horizontal: 10,
        vertical: 8,
      },
      markers: {
        width: 10,
        height: 10,
        radius: 5,
        offsetX: isRtl ? 5 : -5,
      },
    },
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Chart options={options} series={series} type="bar" height={height} width={"100%"} />
    </motion.div>
  );
};

export default RevenueChart;