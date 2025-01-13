// src/utils/userUtils.js
export const getUserID = (contextUserInfo = null) => {
  try {
    const userInfo =
      contextUserInfo || JSON.parse(localStorage.getItem("user_info"));
    if (userInfo && userInfo.user_id) {
      return userInfo.user_id;
    }
  } catch (error) {
    console.error("Error reading user_id from localStorage:", error);
  }
  return null;
};
