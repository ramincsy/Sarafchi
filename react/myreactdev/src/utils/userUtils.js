// src/utils/userUtils.js
export const getUserID = () => {
  try {
    const storedUserInfo = localStorage.getItem("user_info");
    if (storedUserInfo) {
      const { user_id } = JSON.parse(storedUserInfo);
      return user_id;
    }
  } catch (error) {
    console.error("Error reading user_id from localStorage:", error);
  }
  return null;
};
