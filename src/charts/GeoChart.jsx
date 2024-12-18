import React from "react";
import { Chart } from "react-google-charts";

export const data = [
  ["Country", "Popularity"],
  ["Germany", 0],
  ["United States", 0],
  ["Brazil", 0],
  ["Canada", 0],
  ["France", 0],
  ["RU", 0],
  ["India", 0],
  ["Bangladesh", 0],
];

export default function GeoChart() {
  return (
    <Chart
      chartEvents={[
        {
          eventName: "select",
          callback: ({ chartWrapper }) => {
            const chart = chartWrapper.getChart();
            const selection = chart.getSelection();
            if (selection.length === 0) return;
            const region = data[selection[0].row + 1];
            console.log("Selected : " + region);
          },
        },
      ]}
      chartType="GeoChart"
      width="100%"
      height="270px"
      data={data}
    />
  );
}
