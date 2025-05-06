"use client";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useThemeStore } from "@/store";
import { useTheme } from "next-themes";
import { themes } from "@/config/thems";
import { getGridConfig, getYAxisConfig } from "@/lib/appex-chart-options";

interface Props {
  height?: number;
  seriesData: { name: string; data: number[] }[];
  categories: string[];
  // Ajout des données complètes pour les tooltips
  rawData: Array<{
    classeId: number;
    classeLabel: string;
    tauxRecouvrementParFrais: Array<{
      typeFrais: string;
      montantTotalDu: number;
      montantTotalPaye: number;
      tauxRecouvrement: number;
    }>;
  }>;
}

const GroupedStackBar = ({ height = 350, seriesData, categories, rawData }: Props) => {
  const { theme: config, isRtl } = useThemeStore();
  const { theme: mode } = useTheme();

  const theme = themes.find((theme) => theme.name === config);

  // Fonction pour formater les montants en FCFA
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const options = {
    chart: {
      toolbar: { show: false },
      stacked: true,
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: string | number | number[] | undefined) => {
        if (typeof val === "number" && !isNaN(val)) {
          return `${val.toFixed(2)}%`;
        }
        return "0%";
      },
    },
    colors: [
      `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].primary})`,
      `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].info})`,
      `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].success})`,
      `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].warning})`,
    ],
    tooltip: {
      theme: mode === "dark" ? "dark" : "light",
      custom: ({ seriesIndex, dataPointIndex, w }: any) => {
        // Récupérer les données correspondantes
        const fraisType = seriesData[seriesIndex]?.name;
        const classeLabel = categories[dataPointIndex];
        
        // Trouver les données complètes dans rawData
        const classeData = rawData.find(item => item.classeLabel === classeLabel);
        if (!classeData) return '';
        
        const fraisData = classeData.tauxRecouvrementParFrais.find(
          f => f.typeFrais === fraisType
        );
        if (!fraisData) return '';
        
        // Construire le HTML du tooltip
        return `
          <div class="p-2">
            <div class="font-bold">${classeLabel} - ${fraisType}</div>
            <div>Taux: ${fraisData.tauxRecouvrement.toFixed(2)}%</div>
            <div>Montant dû: ${formatCurrency(fraisData.montantTotalDu)}</div>
            <div>Montant payé: ${formatCurrency(fraisData.montantTotalPaye)}</div>
            <div>Reste à payer: ${formatCurrency(fraisData.montantTotalDu - fraisData.montantTotalPaye)}</div>
          </div>
        `;
      },
    },
    grid: {
      ...getGridConfig(
        `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartGird})`
      ),
      position: "back" as "back",
    },
    yaxis: getYAxisConfig(
      `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`
    ),
    xaxis: {
      categories,
      labels: {
        style: {
          colors: `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`,
        },
      },
    },
    legend: {
      position: "top" as "top",
      horizontalAlign: "left" as "left",
      labels: {
        colors: `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`,
      },
      markers: {
        width: 12,
        height: 12,
        radius: 1,
        offsetX: isRtl ? 5 : -5,
      },
    },
  };

  if (!seriesData || !categories) {
    return <div>Chargement des données...</div>;
  }

  if (!Array.isArray(seriesData) || !Array.isArray(categories)) return null;

  return (
    <Chart 
      options={options} 
      series={seriesData} 
      type="bar" 
      height={height} 
      width={"100%"} 
    />
  );
};

export default GroupedStackBar;