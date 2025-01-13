export const getOrCreateUUID = () => {
  try {
    // تلاش برای بازیابی UUID از کوکی
    let uuid = document.cookie
      .split("; ")
      .find((row) => row.startsWith("device_uuid="))
      ?.split("=")[1];

    if (uuid) {
      console.log("Existing UUID retrieved from cookie:", uuid);
      return uuid;
    }

    // اگر در کوکی نبود، تلاش برای بازیابی از localStorage
    uuid = localStorage.getItem("device_uuid");

    if (uuid) {
      console.log("Existing UUID retrieved from localStorage:", uuid);
    } else {
      // اگر در localStorage هم نبود، ایجاد UUID جدید
      uuid = generateUUID();
      console.log("New UUID generated:", uuid);

      // ذخیره در localStorage
      localStorage.setItem("device_uuid", uuid);
      console.log("UUID stored in localStorage:", uuid);
    }

    // ذخیره در کوکی
    storeUUIDInCookie(uuid);

    return uuid;
  } catch (error) {
    console.error("Error in getOrCreateUUID:", error);
    throw new Error("Failed to retrieve or create UUID.");
  }
};

const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
};

const storeUUIDInCookie = (uuid) => {
  try {
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    document.cookie = `device_uuid=${uuid}; path=/; domain=${
      window.location.hostname
    }; expires=${expiryDate.toUTCString()}; Secure; SameSite=Strict`;
    console.log("UUID stored in cookie:", uuid);
  } catch (error) {
    console.error("Error storing UUID in cookie:", error);
  }
};
