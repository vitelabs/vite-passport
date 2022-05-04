import { AddressObj, ViteAPI } from '@vite/vitejs/distSrc/utils/type';
import en from '../i18n/en';
import { setStateType } from './global-context';

export type NetworkTypes = 'testnet' | 'mainnet' | 'localnet';
export type ToastTypes = 'success' | 'warning' | 'error' | 'info';
export type CurrencyConversions =
	| 'AUD'
	| 'BTC'
	| 'CAD'
	| 'EUR'
	| 'HKD'
	| 'INR'
	| 'IDR'
	| 'LTC'
	| 'XMR'
	| 'NZD'
	| 'PHP'
	| 'RUB'
	| 'SGD'
	| 'USD';

export type Languages = 'en';

export type Storage = {
	encryptedSecrets: string;
	language: Languages;
	networkType: NetworkTypes; // suffixed with "Type" cuz "network" by itself could mean the name of the network (e.g. Rinkeby) which is not what's intended
	currencyConversion: CurrencyConversions;
	activeAccountIndex: number;
};

export type Secrets = {
	mnemonics: string;
	bip39Passphrase?: string;
};

export type State = Storage & {
	chromePort: chrome.runtime.Port;
	postPortMessage: (message: PortMessage) => void;
	setState: setStateType;
	secrets: Secrets;
	addressList: AddressObj[];
	copyWithToast: (text: string) => void;
	toastSuccess: (text: string) => void;
	toastWarning: (text: string) => void;
	toastError: (text: string) => void;
	toastInfo: (text: string) => void;
	i18n: typeof en;
	viteApi: ViteAPI;
	toast: [string, ToastTypes];
	viteBalanceInfo: ViteBalanceInfo;
	transactionHistory: {
		[address: string]: Transaction[];
	};
};

export type PortMessage = {
	type: 'opening' | 'updateSecrets' | 'approveContract' | 'reopen' | 'lock';
	password?: string;
	secrets?: Secrets;
};

// TODO: replace null types
export type Transaction = {
	blockType: number;
	height: string;
	hash: string;
	prevHash: string;
	previousHash: string;
	accountAddress: string;
	address: string;
	publicKey: string;
	producer: string;
	fromAddress: string;
	toAddress: string;
	fromBlockHash: string;
	sendBlockHash: string;
	tokenId: string;
	amount: string;
	fee: string;
	data: null;
	difficulty: null;
	nonce: null;
	signature: string;
	quota: string;
	quotaByStake: string;
	quotaUsed: string;
	totalQuota: string;
	utUsed: string;
	logHash: null;
	vmLogHash: null;
	sendBlockList: null;
	triggeredSendBlockList: null;
	tokenInfo: {
		tokenName: string;
		tokenSymbol: string;
		totalSupply: string;
		decimals: 18;
		owner: string;
		tokenId: string;
		maxSupply: string;
		ownerBurnOnly: boolean;
		isReIssuable: boolean;
		index: 1;
		isOwnerBurnOnly: boolean;
	};
	confirmedTimes: string;
	confirmations: string;
	confirmedHash: string;
	firstSnapshotHash: string;
	firstSnapshotHeight: string;
	receiveBlockHeight: null;
	receiveBlockHash: null;
	timestamp: number;
	transactionType: string;
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
		address: string;
		blockCount: string;
	};
};

export type TokenInfo = {
	tokenName: string;
	tokenSymbol: string;
	totalSupply: string;
	decimals: number;
	owner: string;
	tokenId: string;
	maxSupply: string;
	ownerBurnOnly: false;
	isReIssuable: false;
	index: number;
	isOwnerBurnOnly: false;
};

export type NewAccountBlock = {
	hash: string;
	height: number;
	heightStr: string;
	removed: boolean;
};
