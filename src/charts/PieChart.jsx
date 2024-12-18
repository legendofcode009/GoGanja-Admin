import React from "react";
import { Chart } from "react-google-charts";
import { colors } from "../utilities/colors";

export const data = [
  ["Task", "Hours per Day"],
  ["Work", 11],
  ["Eat", 2],
  ["Commute", 2],
  ["Watch TV", 2],
  ["Sleep", 7],
];

export const options = {
  title: "My Daily Activities",
  pieHole: 0.4,
  is3D: false,
  colors: [
    colors?.lightBlack,
    colors?.golden,
    colors?.lightGreen,
    colors?.lighterGreen,
    colors?.yellow,
  ],
  legend: { position: "right" },
};

export default function PieChart() {
  return (
    <Chart
      chartType="PieChart"
      width="100%"
      height="400px"
      data={data}
      options={options}
    />
  );
}