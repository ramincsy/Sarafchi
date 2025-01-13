// utils/ipHelper.js
export const getIPAddress = async () => {
  try {
    const response = await fetch("https://api64.ipify.org?format=json");
    const data = await response.json();
    return data.ip || "127.0.0.1";
  } catch (error) {
    console.error("Failed to get IP address:", error);
    return "127.0.0.1";
  }
};
