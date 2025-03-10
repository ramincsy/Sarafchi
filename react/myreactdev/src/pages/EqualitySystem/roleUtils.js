// roleUtils.js
import { EQUALITY_ROLES } from "./equalityRoleConfig";

export function determineSide(user) {
  const userRoles = (user.roles || []).map((r) => r.toLowerCase());

  // اگر هر نقش در exclude داشت => کنار گذاشته شود
  if (
    userRoles.some((r) =>
      EQUALITY_ROLES.exclude.map((x) => x.toLowerCase()).includes(r)
    )
  ) {
    return "excluded";
  }

  // اگر یکی از نقش‌های شرکت داشته باشد => "company"
  const hasCompany = userRoles.some((r) =>
    EQUALITY_ROLES.companySide.map((x) => x.toLowerCase()).includes(r)
  );
  if (hasCompany) return "company";

  // در غیر این صورت اگر یکی از نقش‌های userSide داشت => "user"
  const hasUser = userRoles.some((r) =>
    EQUALITY_ROLES.userSide.map((x) => x.toLowerCase()).includes(r)
  );
  if (hasUser) return "user";

  // وگرنه
  return "excluded";
}

export function splitUsersBySide(allUsers) {
  const companyArray = [];
  const userArray = [];
  const excludedArray = [];

  allUsers.forEach((user) => {
    const side = determineSide(user);
    switch (side) {
      case "company":
        companyArray.push(user);
        break;
      case "user":
        userArray.push(user);
        break;
      default:
        excludedArray.push(user);
        break;
    }
  });

  return { companyArray, userArray, excludedArray };
}
