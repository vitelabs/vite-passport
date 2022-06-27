import { AddressObj, ViteAPI } from '@vite/vitejs/distSrc/utils/type';
import en from '../i18n/en';
import { setStateType } from './global-context';
import { currencyConversions, i18nDict } from '../utils/constants';
import { Transaction } from '@vite/vitejs/distSrc/accountBlock/type';

export type CurrencyConversions = typeof currencyConversions[number];

export type Storage = {
	encryptedSecrets: string;
	language: keyof typeof i18nDict;
	networkUrl: string;
	networks: { [url: string]: string };
	currencyConversion: CurrencyConversions;
	activeAccountIndex: number;
	accountList: AddressObj[];
	contacts: { [address: string]: string };
};

export type Secrets = {
	mnemonics: string;
	passphrase?: string;
};

export type State = Storage & {
	chromePort: chrome.runtime.Port;
	postPortMessage: (message: PortMessage) => void;
	setState: setStateType;
	secrets: Secrets;
	activeAccount: AddressObj; // caching cuz wallet.deriveAddress is very slow
	copyWithToast: (text: string) => void;
	toastSuccess: (text: string) => void;
	toastWarning: (text: string) => void;
	toastError: (text: string) => void;
	toastInfo: (text: string) => void;
	i18n: typeof en;
	viteApi: ViteAPI;
	toast: [string, 'success' | 'warning' | 'error' | 'info'];
	viteBalanceInfo: ViteBalanceInfo;
	transactionHistory: {
		all: Transaction[];
		unreceived: Transaction[];
		[tti: string]: Transaction[];
	};
};

export type PortMessage = {
	type: 'opening' | 'updateSecrets' | 'approveContract' | 'reopen' | 'lock';
	password?: string;
	secrets?: Secrets;
};

export type ViteBalanceInfo = {
	balance: {
		address: string;
		blockCount: string;
		balanceInfoMap?: {
			[tokenId: string]: {
				tokenInfo: TokenInfo;
				balance: string;
			};
		};
	};
	unreceived: {
		address: string; // "address": "vite_9ec6e8ff9dfa0c0ca29be649bf1430bd0ea7504fa96f142a07"
		blockCount: string; // "blockCount": "1"
		balanceInfoMap?: {
			[tokenId: string]: {
				// "tti_5649544520544f4b454e6e40"
				tokenInfo: TokenInfo;
				balance: string; // "10000000000000000000000"
				transactionCount: string; // "1"
			};
		};
	};
};

export type TokenInfo = {
	tokenName: string; // "Vite Token",
	tokenSymbol: string; // "VITE",
	totalSupply: string; // "999999996999999999999999751",
	decimals: number; // 18,
	owner: string; // "vite_962eab5a19e51fe36506308f6fcf337876139bd5fee3048c46",
	tokenId: string; // "tti_5649544520544f4b454e6e40",
	maxSupply: string; // "100000000000000000000000000000",
	ownerBurnOnly: boolean; // false,
	isReIssuable: boolean; // true,
	index: number; // 0,
	isOwnerBurnOnly: boolean; // false
};

export type NewAccountBlock = {
	hash: string;
	height: number;
	heightStr: string;
	removed: boolean;
};
