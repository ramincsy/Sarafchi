import React, { useCallback, useState } from "react";
import { Box, Typography, Stack, Button } from "@mui/material";
import { useDropzone } from "react-dropzone";
import axiosInstance from "utils/axiosInstance";

const ReceiptUploadForm = ({ wizardData, setWizardData }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    setUploading(true);
    try {
      // آپلود فیش تومان
      if (wizardData.receiptsInfo?.TomanReceipt) {
        const formDataToman = new FormData();
        formDataToman.append("file", wizardData.receiptsInfo.TomanReceipt);
        // استفاده از TransactionID به جای ProposalID
        formDataToman.append(
          "TransactionID",
          wizardData.transactionInfo.TransactionID
        );
        formDataToman.append("FileType", "image");
        formDataToman.append("Description", "Toman receipt");

        // چاپ محتویات FormData برای اشکال‌زدایی
        for (let [key, value] of formDataToman.entries()) {
          console.log(key, value);
        }

        const responseToman = await axiosInstance.post(
          "/equilibrium/receipts",
          formDataToman,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        console.log("Toman receipt upload response:", responseToman.data);
      }

      // آپلود فیش USDT
      if (wizardData.receiptsInfo?.USDTReceipt) {
        const formDataUSDT = new FormData();
        formDataUSDT.append("file", wizardData.receiptsInfo.USDTReceipt);
        formDataUSDT.append(
          "TransactionID",
          wizardData.transactionInfo.TransactionID
        );
        formDataUSDT.append("FileType", "image");
        formDataUSDT.append("Description", "USDT receipt");

        // چاپ محتویات FormData برای اشکال‌زدایی
        for (let [key, value] of formDataUSDT.entries()) {
          console.log(key, value);
        }

        const responseUSDT = await axiosInstance.post(
          "/equilibrium/receipts",
          formDataUSDT,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        console.log("USDT receipt upload response:", responseUSDT.data);
      }

      alert("فایل‌ها با موفقیت آپلود شدند.");
    } catch (error) {
      console.error("Error uploading receipts:", error);
      alert("آپلود فایل‌ها با خطا مواجه شد: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const onDropToman = useCallback(
    (acceptedFiles) => {
      setWizardData((prevData) => ({
        ...prevData,
        receiptsInfo: {
          ...prevData.receiptsInfo,
          TomanReceipt: acceptedFiles[0],
        },
      }));
    },
    [setWizardData]
  );

  const onDropUSDT = useCallback(
    (acceptedFiles) => {
      setWizardData((prevData) => ({
        ...prevData,
        receiptsInfo: {
          ...prevData.receiptsInfo,
          USDTReceipt: acceptedFiles[0],
        },
      }));
    },
    [setWizardData]
  );

  const { getRootProps: getRootPropsToman, getInputProps: getInputPropsToman } =
    useDropzone({
      onDrop: onDropToman,
      accept: {
        "image/jpeg": [".jpg", ".jpeg"],
        "application/pdf": [".pdf"],
      },
    });

  const { getRootProps: getRootPropsUSDT, getInputProps: getInputPropsUSDT } =
    useDropzone({
      onDrop: onDropUSDT,
      accept: {
        "image/jpeg": [".jpg", ".jpeg"],
        "application/pdf": [".pdf"],
      },
    });

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        آپلود فیش‌ها
      </Typography>
      <Stack spacing={2}>
        <Box
          {...getRootPropsToman()}
          sx={{
            border: "2px dashed grey",
            p: 2,
            textAlign: "center",
            cursor: "pointer",
          }}
        >
          <input {...getInputPropsToman()} />
          <Typography>
            فایل رسید تومان را اینجا رها کنید یا کلیک کنید (jpg, pdf)
          </Typography>
          <Typography variant="caption">
            {wizardData.receiptsInfo?.TomanReceipt?.name ||
              "هنوز فایلی انتخاب نشده است"}
          </Typography>
        </Box>
        <Box
          {...getRootPropsUSDT()}
          sx={{
            border: "2px dashed grey",
            p: 2,
            textAlign: "center",
            cursor: "pointer",
          }}
        >
          <input {...getInputPropsUSDT()} />
          <Typography>
            فایل رسید USDT را اینجا رها کنید یا کلیک کنید (jpg, pdf)
          </Typography>
          <Typography variant="caption">
            {wizardData.receiptsInfo?.USDTReceipt?.name ||
              "هنوز فایلی انتخاب نشده است"}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? "در حال آپلود..." : "آپلود فایل‌ها"}
        </Button>
      </Stack>
    </Box>
  );
};

export default ReceiptUploadForm;
