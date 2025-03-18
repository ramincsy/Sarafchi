import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Stack,
  Divider,
  useTheme,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Autorenew,
  Equalizer,
  AccountBalance,
  Business,
  Warning,
  CheckCircle,
  MonetizationOn,
  AutoFixHigh,
} from "@mui/icons-material";
import EquilibriumService from "services/EquilibriumService";
import GaugeCharts from "./GaugeCharts";

const EquilibriumPage = () => {
  const theme = useTheme();
  const [userTotals, setUserTotals] = useState({});
  const [companyTotals, setCompanyTotals] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ut, ct, sug] = await Promise.all([
        EquilibriumService.fetchUserBalances(),
        EquilibriumService.fetchCompanyBalances(),
        EquilibriumService.fetchSuggestions(),
      ]);
      setUserTotals(ut);
      setCompanyTotals(ct);
      setSuggestions(sug);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const computeDiscrepancies = () => {
    const currencies = Object.keys({ ...userTotals, ...companyTotals });
    return currencies.map((currency) => {
      const userBalance = userTotals[currency]?.balance || 0;
      const companyBalance = companyTotals[currency]?.balance || 0;
      const difference = Math.abs(companyBalance - userBalance);
      return {
        currency,
        user_balance: userBalance,
        company_balance: companyBalance,
        difference,
      };
    });
  };

  const renderBalanceCard = (title, totals, icon) => (
    <Card
      sx={{
        height: "100%",
        boxShadow: theme.shadows[4],
        background: theme.palette.background.paper,
      }}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>{icon}</Avatar>
          <Typography variant="h5" fontWeight="medium">
            {title}
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          {Object.entries(totals).map(([currency, data]) => (
            <Grid item xs={12} md={6} key={currency}>
              <Card variant="outlined">
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <MonetizationOn color="primary" />
                    <Typography variant="subtitle1" fontWeight="bold">
                      {currency}
                    </Typography>
                  </Stack>
                  <Divider sx={{ my: 1 }} />
                  <Grid container spacing={1}>
                    {Object.entries(data).map(([key, value]) => (
                      <Grid item xs={6} key={key}>
                        <Typography variant="body2" color="text.secondary">
                          {key.replace(/_/g, " ")}:
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {value}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  const renderSuggestionItem = (sug, index) => (
    <ListItem
      key={index}
      sx={{
        transition: "all 0.3s",
        "&:hover": { transform: "translateX(5px)" },
      }}
    >
      <ListItemIcon>
        {sug.severity === "high" ? (
          <Warning color="error" />
        ) : (
          <CheckCircle color="success" />
        )}
      </ListItemIcon>
      <ListItemText
        primary={sug.message}
        secondary={`Action: ${sug.action} - Amount: ${sug.amount}`}
      />
      <Chip
        label={sug.action}
        color={sug.action.includes("Buy") ? "success" : "error"}
        variant="outlined"
      />
    </ListItem>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.palette.grey[50] }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        spacing={2}
      >
        <Typography variant="h4" fontWeight="bold" color="primary">
          Equilibrium System
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<Autorenew />}
            onClick={fetchData}
            sx={{ borderRadius: 50 }}
          >
            Refresh Data
          </Button>
          <Button
            variant="outlined"
            startIcon={<AutoFixHigh />}
            onClick={async () => {
              try {
                await EquilibriumService.autoCreateProposals();
                fetchData();
              } catch (error) {
                console.error("Error auto creating proposals:", error);
              }
            }}
            sx={{ borderRadius: 50 }}
          >
            Auto Proposals
          </Button>
        </Stack>
      </Stack>

      {loading ? (
        <Box
          sx={{
            height: "50vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" mt={2} color="text.secondary">
            Loading Equilibrium Data...
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            {renderBalanceCard("User Balances", userTotals, <AccountBalance />)}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderBalanceCard("Company Balances", companyTotals, <Business />)}
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ boxShadow: theme.shadows[4] }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                  <Equalizer fontSize="large" color="primary" />
                  <Typography variant="h5" fontWeight="medium">
                    Balance Discrepancy Analysis
                  </Typography>
                </Stack>
                <GaugeCharts discrepancies={computeDiscrepancies()} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ boxShadow: theme.shadows[4] }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                  <Warning fontSize="large" color="warning" />
                  <Typography variant="h5" fontWeight="medium">
                    Trading Proposals
                  </Typography>
                </Stack>
                <List disablePadding>
                  {suggestions.length > 0 ? (
                    suggestions.map(renderSuggestionItem)
                  ) : (
                    <Box
                      sx={{
                        p: 4,
                        textAlign: "center",
                        color: "text.secondary",
                      }}
                    >
                      <Typography variant="h6">
                        No current proposals available
                      </Typography>
                      <Typography variant="body2">
                        Click "Auto Proposals" to generate suggestions
                      </Typography>
                    </Box>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default EquilibriumPage;
