import React from "react";
import { useMediaQuery } from "@mui/material";
import Box from "@mui/material/Box";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import HomeIcon from "@mui/icons-material/Home";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";

const MobileBottomNavigation = () => {
  const [value, setValue] = React.useState(0);
  const isMobile = useMediaQuery("(max-width:600px)");
  const navigate = useNavigate();

  if (!isMobile) return null; // فقط برای موبایل نمایش داده شود

  return (
    <Box
      sx={{
        width: "100%",
        position: "fixed",
        bottom: 0,
        left: 0,
        backgroundColor: "white",
        zIndex: 10,
        boxShadow: "0px -2px 5px rgba(0, 0, 0, 0.1)",
      }}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          switch (newValue) {
            case 0:
              navigate("/home");
              break;
            case 1:
              navigate("/favorites");
              break;
            case 2:
              navigate("/search");
              break;
            case 3:
              navigate("/profile");
              break;
            default:
              break;
          }
        }}
      >
        <BottomNavigationAction label="Home" icon={<HomeIcon />} />
        <BottomNavigationAction label="Favorites" icon={<FavoriteIcon />} />
        <BottomNavigationAction label="Search" icon={<SearchIcon />} />
        <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
      </BottomNavigation>
    </Box>
  );
};

export default MobileBottomNavigation;
