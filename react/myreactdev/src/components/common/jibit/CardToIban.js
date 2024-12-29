import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Typography,
  Modal,
  Backdrop,
  Fade,
} from "@mui/material";
import JibitService from "services/jibitService";
import { getUserID } from "utils/userUtils";
import InquiryTable from "components/tables/InquiryTable";

const CardToIban = ({
  title = "Card to IBAN",
  buttonText = "Submit",
  cardPlaceholder = "Enter your card number",
  width = "400px",
  height = "250px",
  sx = {},
}) => {
  const [cardNumber, setCardNumber] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const isValidCardNumber = (cardNumber) => /^[0-9]{16}$/.test(cardNumber);

  const handleCardToIban = async () => {
    const user_id = getUserID();

    if (!user_id) {
      setError("User ID not found. Please log in.");
      return;
    }

    if (!cardNumber) {
      setError("Card number is required.");
      return;
    }

    if (!isValidCardNumber(cardNumber)) {
      setError("Invalid card number format. It must be a 16-digit number.");
      return;
    }

    try {
      const data = await JibitService.cardToIban(cardNumber, user_id);
      setResponse(data);
      setError(null);
      setOpenModal(true);
    } catch (err) {
      setError("Error during Card to IBAN inquiry. Please try again.");
      setResponse(null);
    }
  };

  const handleCloseModal = () => setOpenModal(false);

  return (
    <Box
      sx={{
        width,
        height,
        margin: "auto",
        ...sx,
      }}
    >
      <Card
        sx={{
          boxShadow: 6,
          borderRadius: 2,
          width: "100%",
          height: "100%",
        }}
      >
        <CardHeader
          title={title}
          sx={{
            textAlign: "center",
            backgroundColor: "#1976d2",
            color: "white",
            fontSize: "1.25rem",
            padding: 2,
          }}
        />
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: "center",
            padding: 3,
          }}
        >
          <TextField
            fullWidth
            label={cardPlaceholder}
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            error={!!error}
            helperText={error}
            InputLabelProps={{
              style: {
                color: "#333",
              },
            }}
            sx={{
              backgroundColor: "#f9f9f9",
              borderRadius: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleCardToIban}
            sx={{
              fontWeight: "bold",
              backgroundColor: "#1976d2",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
            }}
          >
            {buttonText}
          </Button>
        </CardContent>
      </Card>

      {/* Modal for Showing Results */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: 600,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" textAlign="center" mb={3}>
              Inquiry Results
            </Typography>
            {response ? (
              <InquiryTable data={response} />
            ) : (
              <Typography color="error">No data available.</Typography>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default CardToIban;
