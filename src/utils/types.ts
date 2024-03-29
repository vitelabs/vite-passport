import { AccountBlockBlock, AddressObj, ViteAPI } from '@vite/vitejs/distSrc/utils/type';
import en from '../i18n/en';
import { setStateType } from './global-context';
import { currencyConversions, i18nDict } from '../utils/constants';
import { Transaction } from '@vite/vitejs/distSrc/accountBlock/type';

export type CurrencyConversions = typeof currencyConversions[number];
export type Network = {
	name: string;
	rpcUrl: string;
	explorerUrl?: string;
};

export type Storage = {
	encryptedSecrets?: string;
	derivedAddresses?: string[]; // caching cuz wallet.deriveAddress is very slow
	language: keyof typeof i18nDict;
	currencyConversion: null | CurrencyConversions;
	networkList: Network[];
	activeNetworkIndex: number;
	activeAccountIndex: number;
	contacts: { [address: string]: string };
	homePageTokenIdsAndNames: [tti: string, name: string][]; // IMPORTANT: token names should be returned by `normalizeTokenName`
	connectedDomains: {
		// connectedDomains.address.domain => easy to get an account's connect domains
		// connectedDomains.domain.address => easy to get a connected domains across all accounts and remove domain access by account granularity
		[address: string]: {
			[domain: string]: {
				[contractAddress: string]: boolean;
			};
		};
	};
};

export type Secrets = {
	mnemonics: string;
	// passphrase?: string;
};

export type State = Storage & {
	chromePort: chrome.runtime.Port;
	sendBgScriptPortMessage: (message: BgScriptPortMessage) => void;
	triggerInjectedScriptEvent: (event: injectedScriptEventData) => void;
	setState: setStateType;
	secrets?: Secrets;
	activeAccount: AddressObj;
	activeNetwork: Network;
	copyWithToast: (text: string) => void;
	toastSuccess: (text: string) => void;
	toastWarning: (text: string) => void;
	toastError: (error: any) => void;
	toastInfo: (text: string) => void;
	i18n: typeof en;
	viteApi: ViteAPI;
	toast?: [string, 'success' | 'warning' | 'error' | 'info'];
	viteBalanceInfo?: ViteBalanceInfo;
	portfolioValue?: number;
	homePageTokens?: TokenApiInfo[];
	transactionHistory?: {
		received?: Transaction[];
		unreceived?: Transaction[];
		[tti: string]: undefined | Transaction[]; // assume these only show received txs
	};
	prices?: {
		[name: string]: {
			// IMPORTANT: token names should be returned by `normalizeTokenName`
			[currency: string]: number;
		};
	};
};

export type BgScriptPortMessage =
	| { type: 'reopen' | 'lock' }
	| {
			type: 'opening' | 'updateSecrets';
			secrets: Secrets;
	  }
	| {
			type: 'connectWallet';
			domain: string;
	  }
	| {
			type: 'writeAccountBlock';
			block: object;
	  };

export type injectedScriptEventData =
	| {
			type: 'accountChange';
			payload: { activeAddress?: string };
	  }
	| {
			type: 'networkChange';
			payload: { activeNetwork: Network };
	  }
		// above are events that `vitePassport.on` takes
		// below are events that trigger when a the resolving of a Promise
	| {
			type: 'writeAccountBlock';
			payload: { block: AccountBlockBlock };
	  }
	| {
			type: 'connectWallet';
			payload: { domain: string };
	  }

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

type TokenInfo = {
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
	hash: string; // "cc1d1722d572bd181bb7f98ab051cd78bf3a0a9d0169e81c7da9c737271a48d7",
	height: string; // "20",
	// heightStr: string;
	removed: boolean; // false
};

export type UnreceivedBlockMessage = {
	hash: string; // 'c425b542d56f37d3255ded1ac80110c00fc15cd75f9f9008bc5ddf3ab0abe94b';
	received: boolean; // false => true;
	removed: boolean; // false;
};

export type TokenApiInfo = {
	symbol: string;
	name: string;
	tokenCode: string;
	platform: string;
	tokenAddress: string;
	standard: string | null;
	url: string | null;
	tokenIndex: number | null;
	icon: null | string;
	decimal: number;
	gatewayInfo: null | {
		name: string;
		icon: string | null;
		policy: {
			en: string;
		};
		overview: {
			[language: string]: string;
		};
		links: {
			website?: string[];
			github?: string[];
			twitter?: string[];
			discord?: string[];
			whitepaper?: string[];
			explorer?: string[];
			reddit?: string[];
			email?: string[];
		};
		support: string;
		serviceSupport: string;
		isOfficial: boolean;
		level: number;
		website: string;
		mappedToken: {
			symbol: string;
			name: string | null;
			tokenCode: string;
			platform: string;
			tokenAddress: string | null;
			standard: string;
			url: string;
			tokenIndex: number | null;
			icon: string;
			decimal: number;
			mappedTokenExtras:
				| null
				| {
						symbol: string;
						name: string | null;
						tokenCode: string;
						platform: string;
						tokenAddress: string;
						standard: string;
						url: string;
						tokenIndex: number | null;
						icon: string;
						decimal: number;
						mappedTokenExtras: null;
				  }[];
		};
		url: string;
	};
};

// Not sure which ones could be null. Nbd, just need to display the values in `TransactionInfo`
export type RpcTx = {
	blockType: number; //2;
	height: string; // '13';
	hash: string; // '0608cfb70c8fa35ca361f285742fd38306bafdfbba0fae6e17389828b069cf2a';
	prevHash: string; // 'db9ee8e72a4b4a1112bf8756837d4ed14325baafd41240a5a57838f1dc06f744';
	previousHash: string; // 'db9ee8e72a4b4a1112bf8756837d4ed14325baafd41240a5a57838f1dc06f744';
	accountAddress: string; // 'vite_4f06034504efae85deb8a1ce77f38447005a430c3a893e8515';
	address: string; // 'vite_4f06034504efae85deb8a1ce77f38447005a430c3a893e8515';
	publicKey: string; // 'g7prYYXjyUiIpooRI5Mk+qczP6DNZ7KCkg3Ck39GCHg=';
	producer: string; // 'vite_4f06034504efae85deb8a1ce77f38447005a430c3a893e8515';
	fromAddress: string; // 'vite_4f06034504efae85deb8a1ce77f38447005a430c3a893e8515';
	toAddress: string; // 'vite_f30697191707a723c70d0652ab80304195e5928dcf71fcab99';
	fromBlockHash: string; // '0000000000000000000000000000000000000000000000000000000000000000';
	sendBlockHash: string; // '0000000000000000000000000000000000000000000000000000000000000000';
	tokenId: string; // 'tti_5649544520544f4b454e6e40';
	amount: string; // '100000000000000';
	fee: string; // '0';
	data: null;
	difficulty: string; // '67108863';
	nonce: string; // 'rWcxPuHE/J8=';
	signature: string; // '/tZ8f9ecZTZ5NyIYk+kH21DUxG93HBNmFWRoKVG4GnQim6ec/fwfNaGLncYbDwUGwRvYj4Kxaq1umRTOdt1CCg==';
	quota: string; // '0';
	quotaByStake: string; // '0';
	quotaUsed: string; // '21000';
	totalQuota: string; // '21000';
	utUsed: string; // '1';
	logHash: null;
	vmLogHash: null;
	sendBlockList: null;
	triggeredSendBlockList: null;
	tokenInfo: {
		tokenName: string; // 'VITE';
		tokenSymbol: string; // 'VITE';
		totalSupply: string; // '1043304425488202606515701342';
		decimals: number; // 18;
		owner: string; // 'vite_0000000000000000000000000000000000000004d28108e76b';
		tokenId: string; // 'tti_5649544520544f4b454e6e40';
		maxSupply: string; // '115792089237316195423570985008687907853269984665640564039457584007913129639935';
		ownerBurnOnly: boolean;
		isReIssuable: boolean;
		index: number; // 0;
		isOwnerBurnOnly: boolean;
	};
	confirmedTimes: string; // '39846';
	confirmations: string; // '39846';
	confirmedHash: string; // 'c7b3b58834054362657891d408116a445ae737d3b348a61d35c3abeb46b9298d';
	firstSnapshotHash: string; // 'c7b3b58834054362657891d408116a445ae737d3b348a61d35c3abeb46b9298d';
	firstSnapshotHeight: string; // '97178152';
	receiveBlockHeight: null;
	receiveBlockHash: null;
	timestamp: number; // 1657815577;
};
