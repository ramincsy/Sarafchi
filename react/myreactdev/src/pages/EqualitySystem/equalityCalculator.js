// equalityCalculator.js
import { splitUsersBySide } from "./roleUtils";

/**
 *
 * @param {Array} allUsers آرایه کاربرانی که از EqualityDataService گرفتیم (همراه با roles و balances)
 * @param {String} currency مثلاً "TOMAN" یا "USDT"
 * @param {Object} options شامل {includeDebt, includeCredit, includeLoan}
 *
 * خروجی: {
 *   currency,
 *   userSide: number,
 *   companySide: number,
 *   difference: number
 * }
 */
export function calculateEquality(
  allUsers,
  currency,
  { includeDebt, includeCredit, includeLoan }
) {
  // 1) تقسیم به userSideArray و companySideArray
  const { userArray: userSideArray, companyArray: companySideArray } =
    splitUsersBySide(allUsers);

  // 2) جمع موجودی userSide
  const userTotal = sumBalancesForSide(userSideArray, currency, {
    includeDebt,
    includeCredit,
    includeLoan,
  });

  // 3) جمع موجودی companySide
  const companyTotal = sumBalancesForSide(companySideArray, currency, {
    includeDebt,
    includeCredit,
    includeLoan,
  });

  // 4) اختلاف
  const difference = userTotal - companyTotal;

  return {
    currency,
    userSide: userTotal,
    companySide: companyTotal,
    difference,
  };
}

function sumBalancesForSide(
  userArray,
  currency,
  { includeDebt, includeCredit, includeLoan }
) {
  return userArray.reduce((total, user) => {
    const balanceObj = user.balances.find(
      (b) => b.CurrencyType?.toUpperCase() === currency.toUpperCase()
    );
    if (!balanceObj) return total;

    let netBalance = balanceObj.Balance || 0;

    if (includeCredit) netBalance += balanceObj.Credit || 0;
    if (includeDebt) netBalance -= balanceObj.Debt || 0;
    if (includeLoan) netBalance -= balanceObj.LoanAmount || 0;

    return total + netBalance;
  }, 0);

  return total;
}
