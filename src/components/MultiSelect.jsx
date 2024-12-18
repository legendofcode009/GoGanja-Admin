import * as React from "react";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import { Icon, Box } from "@mui/material";
import { useTranslation } from "react-i18next";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function MultiSelect(props) {
  const [t] = useTranslation();
  const { value, setValue } = props;
  const data = props?.data[0];

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setValue(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  const snakeCase = (string) => {
    return string
      .replace(/\d+/g, " ")
      .split(/ |\B(?=[A-Z])/)
      .map((word) => word.toLowerCase())
      .join("_");
  };

  return (
    <Box sx={{ borderRadius: "16px" }}>
      <FormControl
        sx={{
          width: "100%",
        }}
      >
        <InputLabel id="demo-multiple-checkbox-label">
          {t("services")}
        </InputLabel>
        <Select
          sx={{ borderRadius: "16px" }}
          labelId="demo-multiple-checkbox-label"
          id="demo-multiple-checkbox"
          multiple
          value={value}
          onChange={handleChange}
          input={<OutlinedInput label={t("services")} />}
          renderValue={(selected) => selected.join(", ")}
          MenuProps={MenuProps}
        >
          {data?.map((name) => (
            <MenuItem key={name?.service} value={name?.service}>
              <Checkbox checked={value.indexOf(name?.service) > -1} />
              <Icon sx={{ mx: 1 }}>{snakeCase(name?.web)}</Icon>
              <ListItemText primary={name?.service} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
