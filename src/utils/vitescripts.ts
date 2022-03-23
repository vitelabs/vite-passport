// fork of https://github.com/weserickson/solpp-dapp-workshop/blob/master/src/vitescripts.js

// @ts-ignore
import WS_RPC from '@vite/vitejs-ws';
import { ViteAPI } from '@vite/vitejs';

const providerWsURLs = {
	localnet: 'ws://localhost:23457',
	testnet: 'wss://buidl.vite.net/gvite/ws',
	mainnet: 'wss://node.vite.net/gvite/ws',
};
const providerTimeout = 60000;
const providerOptions = { retryTimes: 10, retryInterval: 5000 };
const provider = new WS_RPC(providerWsURLs.mainnet, providerTimeout, providerOptions);
// const provider = new HTTP_RPC(providerHttpURLs.mainnet);
// const provider = new IPC_RPC(providerWsURLs.mainnet);
const viteApi = new ViteAPI(provider, () => {
	console.log('connected');
});

export function getBalanceInfo(address: string) {
	return viteApi.getBalanceInfo(address);
}

export function subscribe(event: string, ...args: any) {
	return viteApi.subscribe(event, ...args);
}

// contract_getTokenInfoById
// https://docs.vite.org/vite-docs/api/rpc/contract_v2.html#contract-gettokeninfobyid
