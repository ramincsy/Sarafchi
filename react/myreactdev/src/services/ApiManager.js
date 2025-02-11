import UserService from "./UserService";
import BalancesService from "./BalancesService";
import WithdrawalsService from "./WithdrawalsService";
import ExchangePricesService from "./ExchangePricesService";
import RolesPermissionsService from "./RolesPermissionsService";
import PagesService from "./PagesService";
import TransactionsService from "./TransactionService";
import PriceService from "./PriceService";
import jibitService from "./jibitService";

const ApiManager = {
  UserService,
  BalancesService,
  TransactionsService,
  WithdrawalsService,
  ExchangePricesService,
  RolesPermissionsService,
  PagesService,
  PriceService,
  jibitService,
};

export default ApiManager;
