# Vite Passport

Available on the [Chrome Web Store](https://chrome.google.com/webstore/detail/vite-passport/eckbjklobbepbbcklkjjgkkkpdakglmf)

## How to run for development
1. `npm install`
2. go to [brave://extensions/](brave://extensions/) or [chrome://extensions/](chrome://extensions/)
3. turn on dev mode
4. `npm run dev` which generates a `dist` folder
5. drag the `dist` folder into extensions tabs or select it in "Load unpacked"

## How to build for production
- `npm run build` which generates minified `dist` folder

## How to integrate Vite Passport in a frontend
### TypeScript Definitions
If you are using TypeScript, define `vitePassport` globally. For [example](https://github.com/vitelabs/vite-express/blob/d3d28f010e1d6994928d1975d0f5f5dc2ad0b691/frontend/src/utils/types.ts#L33):
```ts
type Network = {
	name: string;
	rpcUrl: string;
	explorerUrl?: string;
};

type injectedScriptEvents = 'accountChange' | 'networkChange';
type VitePassport = {
	// These methods are relayed from contentScript.ts => injectedScript.ts
	getConnectedAddress: () => Promise<undefined | string>;
	disconnectWallet: () => Promise<undefined>;
	getNetwork: () => Promise<Network>;

	// These methods are relayed from contentScript.ts => background.ts => popup => contentScript.ts => injectedScript.ts
	connectWallet: () => Promise<{ domain: string }>;
	writeAccountBlock: (type: string, params: object) => Promise<{ block: AccountBlockBlock }>;

	// `on` subscribes to `event` and returns an unsubscribe function
	on: (
		event: injectedScriptEvents,
		callback: (payload: { activeAddress?: string; activeNetwork: Network }) => void
	) => () => void;
};
declare global {
	interface Window {
		vitePassport?: VitePassport;
	}
}
```

### Checking for a Connected Wallet
When your frontend loads, check if Vite Passport (VP) is installed. If it is, check the connected VP wallet address and network use the `getConnectedAddress` and `getNetwork` methods. For [example](https://github.com/vitelabs/vite-express/blob/d3d28f010e1d6994928d1975d0f5f5dc2ad0b691/frontend/src/components/App.tsx#L21):
```ts
...
if (window?.vitePassport) {
	vpAddress = await window.vitePassport.getConnectedAddress();
	if (vpAddress) {
		const activeNetwork = await window.vitePassport.getNetwork();
		activeNetworkIndex = networkList.findIndex((n) => n.rpcUrl === activeNetwork.rpcUrl);
	}
}
```

### Connecting
If there is no connected VP address, but VP is installed, prompt the user to connect their wallet by calling the `connectWallet` method. [For example](https://github.com/vitelabs/vite-express/blob/d3d28f010e1d6994928d1975d0f5f5dc2ad0b691/frontend/src/containers/ConnectWalletButton.tsx#L74):
```ts
...
async () => {
	if (window?.vitePassport) {
		try {
			await window.vitePassport.connectWallet();
			const activeNetwork = await window.vitePassport.getNetwork();
			setState({
				activeNetworkIndex: networkList.findIndex(
					(n) => n.rpcUrl === activeNetwork.rpcUrl
				),
			});
		} catch (error) {
			setState({ toast: error });
		}
	} else {
		setState({ toast: i18n.vitePassportNotDetected });
	}
}
```

### Subscribing to Events
Once a user's VP wallet is connected, you can listen for when they change accounts or networks using the `on` method and `'accountChange'`/`'networkChange'` event names. The `on` method returns its corresponding unsubscribe function which should be called when the subscription is no longer needed to avoid memory leaks. For [example](https://github.com/vitelabs/vite-express/blob/d3d28f010e1d6994928d1975d0f5f5dc2ad0b691/frontend/src/containers/PageContainer.tsx#L46):
```ts
...
useEffect(() => {
	let unsubscribe = () => {};
	if (window?.vitePassport && vpAddress && vpAddress === activeAddress) {
		unsubscribe = window.vitePassport.on('networkChange', (payload) => {
			let activeNetworkIndex = networkList.findIndex(
				(n) => n.rpcUrl === payload.activeNetwork.rpcUrl
			);
			if (activeNetworkIndex === -1) {
				setState({ toast: i18n.vitePassportNetworkDoesNotMatchDappNetworkUrl });
				activeNetworkIndex = 0;
			}
			setState({ activeNetworkIndex });
		});
	}
	return unsubscribe;
}, [setState, vpAddress, activeAddress, i18n]);

useEffect(() => {
	let unsubscribe = () => {};
	if (window?.vitePassport) {
		unsubscribe = window.vitePassport.on('accountChange', (payload) => {
			setState({ vpAddress: payload.activeAddress });
		});
	}
	return unsubscribe;
}, [setState]);
```
> Note: When a user connects their VP wallet, the `'accountChange'` event is triggered but not the `networkChange` event.

### Signing Blocks
Sign and send transactions to the VP wallet's active network with the `writeAccountBlock` method. It has the same parameters as vite.js' [`accountBlock.createAccountBlock`](https://docs.vite.org/vuilder-docs/SDK/vitejs/account-block/#createaccountblock) method. What it returns is a `Promise` that resolves with the [sanitized block](https://github.com/vitelabs/vite-passport/blob/main/src/components/TransactionModal.tsx#L249) that was sent (i.e. has had its private keys removed). For [example](https://github.com/vitelabs/vite-express/blob/d3d28f010e1d6994928d1975d0f5f5dc2ad0b691/frontend/src/containers/Router.tsx#L142):
```ts
...
const blockParams = {
	address: activeAddress,
	abi: methodAbi,
	toAddress,
	params,
	tokenId,
	amount,
};
if (vpAddress === activeAddress && window?.vitePassport) {
	return window.vitePassport.writeAccountBlock('callContract', blockParams);
}
```

### Disconnecting
To disconnect the VP wallet, simply call the `disconnectWallet` method. For [example](https://github.com/vitelabs/vite-express/blob/7ca5da54019acd8874a271ff3d5782e58dbd8ed7/frontend/src/containers/ConnectWalletButton.tsx#L40):
```ts
...
if (vpAddress && window?.vitePassport) {
	setState({ vpAddress: undefined });
	window.vitePassport.disconnectWallet();
}
```