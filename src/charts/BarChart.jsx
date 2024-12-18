import React from "react";
import { Chart } from "react-google-charts";

export const data = [
  ["City", "2010 Population", "2000 Population"],
  ["New York City, NY", 0, 0],
  ["Los Angeles, CA", 0, 0],
  ["Chicago, IL", 0, 0],
  ["Houston, TX", 0, 0],
  ["Philadelphia, PA", 0, 0],
];

export const options = {
  title: "Population of Largest U.S. Cities",
  chartArea: { width: "50%" },
  hAxis: {
    title: "Total Population",
    minValue: 0,
  },
  colors: ["rgb(53, 138, 148)", "rgb(40, 34, 70)"],
  vAxis: {
    title: "City",
  },
};

export default function BarChart() {
  return (
    <Chart
      chartType="BarChart"
      width="100%"
      height="270px"
      data={data}
      options={options}
    />
  );
}
