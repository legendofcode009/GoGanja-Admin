import React from "react";
import { Chart } from "react-google-charts";
import { colors } from "../utilities/colors";

export const data = [
  ["Year", "Sales", "Expenses", "Profit"],
  ["2014", 0, 0, 0],
  ["2015", 0, 0, 0],
  ["2016", 0, 0, 0],
  ["2017", 0, 0, 0],
  ["2018", 0, 0, 0],
  ["2018", 0, 0, 0],
  ["2020", 0, 0, 0],
  ["2021", 0, 0, 0],
];

export const options = {
  chart: {
    title: "Company Performance",
    subtitle: "Sales, Expenses, and Profit: 2014-2017",
  },
  colors: [colors?.lightBlack, colors?.golden, colors?.lightGreen],
  legend: { position: "bottom", alignment: "start" },
};

export default function VBarChart() {
  return (
    <Chart
      chartType="Bar"
      width="100%"
      height="350px"
      data={data}
      options={options}
    />
  );
}
