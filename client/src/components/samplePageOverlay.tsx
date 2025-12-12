import React from "react";
import { Box, Typography } from "@mui/material";

type SamplePageOverlayProps = {
  /** Text to show in the watermark */
  text?: string;
};

const SamplePageOverlay: React.FC<SamplePageOverlayProps> = ({
  text = "SAMPLE PAGE",
}) => {
  return (
    <Box
      sx={{
        position: "fixed", // use "absolute" if you only want it inside a container
        inset: 0,
        pointerEvents: "none", // so you can still click stuff underneath
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: (theme) => theme.zIndex.modal + 1,
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontWeight: 700,
          letterSpacing: 8,
          textTransform: "uppercase",
          color: "grey.800",
          opacity: 0.08,
          transform: "rotate(-30deg)",
          userSelect: "none",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};

export default SamplePageOverlay;
