import { setStateType } from './global-context';

export type Networks = 'vite' | 'bsc';
export type NetworkTypes = 'testnet' | 'mainnet';
export type ToastTypes = 'success' | 'warning' | 'error' | 'info';

export type State = {
	setState: setStateType;
	networkType: NetworkTypes;
	network: string;
	copyWithToast: (text: string) => void;
	toastSuccess: (text: string) => void;
	toastWarning: (text: string) => void;
	toastError: (text: string) => void;
	toastInfo: (text: string) => void;
	currentAddress: string;
	language: string;
	i18n: { [key: string]: string };
	toast: [string, ToastTypes];
	balances: {
		[tokenId: string]: TokenInfo;
	};
	transactionHistory: {
		[address: string]: Transaction[];
	};
};

export type Transaction = {
	hash: string;
};

export type TokenInfo = {
	balance: string;
	decimals: number;
	index: number;
	isOwnerBurnOnly: boolean;
	isReIssuable: boolean;
	maxSupply: string;
	owner: string;
	ownerBurnOnly: boolean;
	tokenId: string;
	tokenName: string;
	tokenSymbol: string;
	totalSupply: string;
};

export type NewAccountBlock = {
	hash: string;
	height: number;
	heightStr: string;
	removed: boolean;
};

export type BridgeTransaction = {
	id: string;
	idx: string;
	amount: string;
	fromAddress: string;
	toAddress: string;
	token: string;
	fromNet: string;
	fromHash: string;
	fromHashConfirmedHeight: number;
	fromHashConfirmationNums: number;
	fee: string;
	time: number;
	toNet: string;
	toHash: string;
	toHashConfirmedHeight: number;
	toHashConfirmationNums: number;
};
