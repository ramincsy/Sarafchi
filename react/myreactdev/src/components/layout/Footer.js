import React from "react";
import { Box, Typography, useTheme, Link } from "@mui/material";

const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "rgba(241, 172, 172, 0.18)",
        padding: theme.spacing(1),
        textAlign: "center",
        borderTop: `1px solid ${theme.palette.divider}`,
        position: "fixed",
        width: "100%",
        bottom: 0,
        zIndex: 1300,
        boxShadow: "0 -2px 4px rgba(0, 0, 0, 0)",
      }}
    >
      <Link href="https://Rebital.com" color="inherit" sx={{ mx: 1 }}>
        www.Rebital.com
      </Link>
    </Box>
  );
};

export default Footer;
