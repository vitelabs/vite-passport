// import { BalanceInfo } from './types';
import en from '../i18n/en';
import { Storage, TokenApiInfo } from './types';

export const i18nDict = { en };

// export const PROD = process.env.NODE_ENV === 'production';

export const defaultStorage: Storage = {
	encryptedSecrets: undefined,
	derivedAddresses: undefined,
	language: 'en',
	activeNetworkIndex: 0,
	networkList: [
		{
			name: 'Mainnet',
			rpcUrl: 'wss://node.vite.net/gvite/ws',
			// http: 'https://node.vite.net/gvite',
			explorerUrl: 'https://vitescan.io',
		},
		{
			name: 'Testnet',
			rpcUrl: 'wss://buidl.vite.net/gvite/ws',
			// http: 'https://buidl.vite.net/gvite',
			explorerUrl: 'https://test.vitescan.io',
		},
		{
			name: 'Localnet',
			rpcUrl: 'ws://localhost:23457',
			// http: 'http://127.0.0.1:23456',
		},
	],
	currencyConversion: 'USD',
	activeAccountIndex: 0,
	contacts: {},
	homePageTokenIdsAndNames: [['tti_5649544520544f4b454e6e40', 'vite']],
	connectedDomains: {},
};

export const getCoinGeckoPriceApiUrl = (tokenNames: string[]) => {
	// IMPORTANT: token names should be returned by `normalizeTokenName`
	return (
		`https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=` + tokenNames.join(',')
	);
};

export const getTokenFuzzySearchApiUrl = (networkRpcUrl: string, query = '') => {
	let url;
	if (
		networkRpcUrl.startsWith(defaultStorage.networkList[0].rpcUrl) ||
		networkRpcUrl.startsWith('https://node.vite.net/gvite')
	) {
		url = 'https://vitex.vite.net/api/v1/cryptocurrency/info/search?fuzzy=';
	}
	if (
		networkRpcUrl.startsWith(defaultStorage.networkList[0].rpcUrl) ||
		networkRpcUrl.startsWith('https://node.vite.net/gvite')
	) {
		url = 'https://vitex.vite.net/api/v1/cryptocurrency/info/search?fuzzy=';
	}
	return !url ? null : url + encodeURIComponent(query);
};

export const getTokenIdSearchApiUrl = (networkRpcUrl: string) => {
	if (
		networkRpcUrl.startsWith(defaultStorage.networkList[0].rpcUrl) ||
		networkRpcUrl.startsWith('https://node.vite.net/gvite')
	) {
		return 'https://vitex.vite.net/api/v1/cryptocurrency/info/platform/query';
	}
	if (
		networkRpcUrl.startsWith(defaultStorage.networkList[1].rpcUrl) ||
		networkRpcUrl.startsWith('https://buidl.vite.net/gvite')
	) {
		return 'https://buidl.vite.net/vitex/api/v1/cryptocurrency/info/platform/query';
	}
	return null;
};

export const ExplorerURLs = {
	vitescan: {
		mainnet: {
			home: 'https://vitescan.io/',
			address: 'https://vitescan.io/address/',
			hash: 'https://vitescan.io/tx/',
			token: 'https://vitescan.io/token/',
		},
		testnet: {
			home: 'https://test.vitescan.io/',
			address: 'https://test.vitescan.io/address/',
			hash: 'https://test.vitescan.io/tx/',
			token: 'https://test.vitescan.io/token/',
		},
	},
	viteview: {
		mainnet: {
			home: 'https://mainnet.viteview.xyz/#/',
			address: 'https://mainnet.viteview.xyz/#/account/',
			hash: 'https://mainnet.viteview.xyz/#/snapshot/',
			token: 'https://mainnet.viteview.xyz/#/token/',
		},
		testnet: {
			home: 'https://buidl.viteview.xyz/#/',
			address: 'https://buidl.viteview.xyz/#/account/',
			hash: 'https://buidl.viteview.xyz/#/snapshot/',
			token: 'https://buidl.viteview.xyz/#/token/',
		},
	},
	// vitetxs: {
	// 	home: 'https://vitetxs.de/#/',
	// 	address: '',
	// 	hash: '',
	// 	token: '',
	// },
	// VITCScan: {
	// 	mainnet: {
	// 		home: 'https://vitcscan.com/',
	// 		address: 'https://vitcscan.com/address/',
	// 		hash: 'https://vitcscan.com/tx/',
	// 		token: 'https://vitcscan.com/token/',
	// 	},
	// },
	// vitexplorer: {
	// 	mainnet: {
	// 		home: 'https://vitexplorer.fr/dashboard',
	// 		address: 'https://vitexplorer.fr/address/',
	// 		hash: 'https://vitexplorer.fr/transaction/',
	// 		token: 'https://vitexplorer.fr/token/',
	// 	},
	// },
};

export const currencyConversions = [
	'USD',
	// 'AUD',
	// 'BTC',
	// 'CAD',
	// 'EUR',
	// 'HKD',
	// 'INR',
	// 'IDR',
	// 'XMR',
	// 'NZD',
	// 'PHP',
	// 'RUB',
	// 'SGD',
] as const;

export const languages: { [key in keyof typeof i18nDict]: string } = {
	// stored as an object for easier lookups. The language is stored in the shorthand version cuz they're filename friendly, but displayed in longhand for readability
	en: 'English',
};

export const defaultTokenList: TokenApiInfo[] = [
	{
		symbol: 'VITE',
		name: 'VITE',
		tokenCode: '1171',
		platform: 'VITE',
		tokenAddress: 'tti_5649544520544f4b454e6e40',
		standard: null,
		url: null,
		tokenIndex: 0,
		icon: 'https://static.vite.net/token-profile-1257137467/icon/e6dec7dfe46cb7f1c65342f511f0197c.png',
		decimal: 18,
		gatewayInfo: {
			name: 'Vite Gateway',
			icon: null,
			policy: {
				en: 'https://x.vite.net/viteLabsGatePrivacy.html',
			},
			overview: {
				en: 'Vite Gateway runs cross-chain services for four coins: BTC, ETH, USDT(ERC20)',
				zh: 'Vite Gateway runs cross-chain services for four coins: BTC, ETH, USDT(ERC20)',
			},
			links: {
				website: ['https://vite.org'],
				whitepaper: ['https://github.com/vitelabs/whitepaper/'],
				explorer: ['https://explorer.vite.net'],
				email: ['gateway@vite.org'],
			},
			support: 'gateway@vite.org',
			serviceSupport: 'https://vitex.zendesk.com/hc/en-001/requests/new',
			isOfficial: false,
			level: 0,
			website: 'https://vite.org',
			mappedToken: {
				symbol: 'VITE',
				name: 'ViteToken',
				tokenCode: '1564',
				platform: 'ETH',
				tokenAddress: '0xadd5E881984783dD432F80381Fb52F45B53f3e70',
				standard: 'ERC20',
				url: 'https://crosschain.vite.net/gateway/eth',
				tokenIndex: null,
				icon: 'https://static.vite.net/token-profile-1257137467/icon/e6dec7dfe46cb7f1c65342f511f0197c.png',
				decimal: 18,
				mappedTokenExtras: [
					{
						symbol: 'VITE',
						name: null,
						tokenCode: '1588',
						platform: 'BSC',
						tokenAddress: '0x2794dad4077602ed25a88d03781528d1637898b4',
						standard: 'BEP20',
						url: 'https://crosschain.vite.net/gateway/bsc',
						tokenIndex: null,
						icon: 'https://static.vite.net/token-profile-1257137467/icon/e6dec7dfe46cb7f1c65342f511f0197c.png',
						decimal: 18,
						mappedTokenExtras: null,
					},
				],
			},
			url: 'https://crosschain.vite.net/gateway/eth',
		},
	},
];
