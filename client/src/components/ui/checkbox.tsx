// src/components/ui/checkbox.tsx
import * as React from "react";
import Checkbox from "@mui/material/Checkbox";
import type { SxProps } from "@mui/material/styles";
import CheckIcon from "@mui/icons-material/Check";

export interface AppCheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  sx?: SxProps;
}

const AppCheckbox: React.FC<AppCheckboxProps> = ({
  className,
  sx,
  ...props
}) => {
  return (
    <Checkbox
      icon={<CheckIcon sx={{ opacity: 0 }} />} // placeholder for consistent size
      checkedIcon={<CheckIcon />}
      sx={{
        width: 20,
        height: 20,
        padding: 0.5,
        borderRadius: "4px",
        color: "grey.600",
        "&.Mui-checked": {
          color: "primary.main",
        },
        "&.Mui-disabled": {
          color: "grey.400",
        },
        ...sx,
      }}
      className={className}
      {...props}
    />
  );
};

export default AppCheckbox;
export { AppCheckbox };
