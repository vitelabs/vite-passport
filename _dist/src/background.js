"use strict";

// src/utils/storage.ts
var setValue = (value) => {
  return new Promise((resolve) => {
    chrome.storage.local.set(value, () => resolve(void 0));
  });
};
var getValue = (keys) => {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (items) => resolve(items));
  });
};
var removeKeys = (keys) => {
  return new Promise((resolve) => {
    chrome.storage.local.remove(keys, () => resolve(void 0));
  });
};

// src/utils/strings.ts
var shortenString = (str, startCount = 8, endCount = 5) => str.slice(0, startCount) + "..." + str.slice(-endCount);
var shortenAddress = (address) => shortenString(address, 8, 5);
var shortenHash = (hash) => shortenString(hash, 5, 5);
var shortenTti = (hash) => shortenString(hash, 7, 5);
var copyToClipboardAsync = (str = "") => {
  if (navigator && navigator.clipboard && navigator.clipboard.writeText)
    return navigator.clipboard.writeText(str);
  return window.alert("The Clipboard API is not available.");
};
var toBiggestUnit = (num, decimals = 0) => {
  num = `${num.substring(0, num.length - decimals) || 0}.${"0".repeat(Math.max(0, decimals - num.length))}${num.substring(Math.max(0, num.length - decimals))}`;
  return num.replace(/(0+|\.0+|\.)$/, "");
};
var toSmallestUnit = (num, decimals = 0) => {
  const indexOfDot = num.indexOf(".");
  if (indexOfDot === -1) {
    return num + "0".repeat(decimals);
  }
  const decimalPlaces = num.length - indexOfDot - 1;
  return (num.substring(indexOfDot + 1) + "0".repeat(decimals - decimalPlaces)).replace(/^0+/g, "");
};
var roundDownTo6Decimals = (balance) => Math.floor(+balance * 1e6) / 1e6 + "";
var validateWsUrl = (v = "") => /^(ws:\/\/|wss:\/\/)/.test(v);
var validateHttpUrl = (v = "") => /^(http:\/\/|https:\/\/)/.test(v);
var toQueryString = (params) => "?" + Object.keys(params).filter((key) => !!params[key]).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(params[key])).join("&");
var getHostname = (url = "") => {
  if (!url.startsWith("http")) {
    return "";
  }
  return new URL(url).hostname;
};
var parseQueryString = (urlSearchParams) => {
  if (urlSearchParams[0] !== "?") {
    throw new Error('urlSearchParams must start with "?"');
  }
  const split = urlSearchParams.slice(1).split("&");
  return split.map((p) => p.split("=")).reduce((obj, pair) => {
    const [key, value] = pair.map(decodeURIComponent);
    if (key) {
      return { ...obj, [key]: value };
    }
    return obj;
  }, {});
};
var addIndexToTokenSymbol = (symbol, index) => {
  if (symbol === "VITE" || symbol === "VX" || symbol === "VCP" || index == null) {
    return symbol;
  }
  return `${symbol}-${("" + index).padStart(3, "0")}`;
};
var makeReadable = (err) => err.toString() === "[object Object]" ? JSON.stringify(err) : err.toString();
var joinWords = (arr, conjunction = "or") => {
  const listStart = arr.slice(0, -1).join(", ");
  const listEnd = arr.slice(-1);
  return [listStart, listEnd].join(arr.length <= 1 ? "" : arr.length > 2 ? `, ${conjunction} ` : ` ${conjunction} `);
};
var prefixName = (str) => "vitePassport" + str[0].toUpperCase() + str.substring(1);

// src/utils/time.ts
var SECOND = 1e3;
var MINUTE = 60 * SECOND;
var HOUR = 60 * MINUTE;
var DAY = 24 * HOUR;
var WEEK = 7 * DAY;
var MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
var formatDate = (date, verbose, utc) => {
  if (!date) {
    return;
  }
  if (typeof date === "number") {
    date *= 1e3;
  }
  date = new Date(date);
  const year = date[`get${utc ? "UTC" : ""}FullYear`]();
  const month = date[`get${utc ? "UTC" : ""}Month`]();
  const day = date[`get${utc ? "UTC" : ""}Date`]();
  const hour = date[`get${utc ? "UTC" : ""}Hours`]();
  const minute = date[`get${utc ? "UTC" : ""}Minutes`]();
  const second = date[`get${utc ? "UTC" : ""}Seconds`]();
  if (verbose) {
    const minute2 = date.getMinutes();
    return `${year} ${MONTHS[month]} ${day} \xB7 ${date.getHours()}:${minute2 < 10 ? `0${minute2}` : minute2}`;
  }
  return `${year}-${month + 1}-${day} ${hour}:${minute}:${second}`;
};

// src/background.ts
var secrets;
var lockTimer;
var eventListeners = {};
var pushEventListener = (event, listener) => {
  if (!Array.isArray(eventListeners[event])) {
    eventListeners[event] = [];
  }
  eventListeners[event].push(listener);
};
var runAndClearEventListener = (event, data) => {
  (eventListeners[event] || []).forEach((listener) => listener(data));
  delete eventListeners[event];
};
var clearEventListeners = () => {
  eventListeners = {};
};
chrome.runtime.onConnect.addListener((chromePort) => {
  chromePort.postMessage({ secrets, type: "opening" });
  chromePort.onMessage.addListener((message) => {
    switch (message.type) {
      case "reopen":
        if (lockTimer) {
          clearTimeout(lockTimer);
          lockTimer = void 0;
        }
        break;
      case "updateSecrets":
        secrets = message.secrets;
        break;
      case "connectDomain":
        runAndClearEventListener("vitePassportConnectDomain", { domain: message.domain });
        break;
      case "writeAccountBlock":
        runAndClearEventListener("vitePassportWriteAccountBlock", { block: message.block });
        break;
      case "lock":
        secrets = void 0;
        break;
      default:
        break;
    }
  });
  chromePort.onDisconnect.addListener(async () => {
    if (secrets) {
      if (lockTimer) {
        clearTimeout(lockTimer);
      }
      lockTimer = setTimeout(() => {
        secrets = void 0;
      }, 30 * MINUTE);
    }
    runAndClearEventListener("vitePassportChromePortDisconnect");
  });
});
chrome.runtime.onMessage.addListener((message, sender, reply) => {
  const replyOnEvent = (event, cb) => {
    const connectListener = (data) => {
      reply(cb(data));
      clearEventListeners();
    };
    const disconnectListener = () => {
      reply({ error: "Vite Passport closed before user approved domain" });
      clearEventListeners();
    };
    pushEventListener(event, connectListener);
    pushEventListener("vitePassportChromePortDisconnect", disconnectListener);
  };
  (async () => {
    if (await getFocusedTabId() !== sender.tab?.id) {
      throw new Error("sender.tab?.id does not match focused tab Id");
    }
    if (!sender.origin) {
      throw new Error("sender.origin does not exist");
    }
    const hostname = getHostname(sender.origin);
    const { connectedDomains } = await getValue("connectedDomains");
    const domainConnected = !!connectedDomains?.[hostname];
    const connectError = () => {
      reply({
        error: "Wallet must connect via `vitePassport.connectWallet()` first"
      });
    };
    switch (message.method) {
      case "getConnectedAddress":
        if (!domainConnected) {
          return reply({ result: void 0 });
        }
        const { accountList, activeAccountIndex } = await getValue([
          "accountList",
          "activeAccountIndex"
        ]);
        reply({ result: accountList[activeAccountIndex].address });
        break;
      case "connectWallet":
        openPopup("/connect" + toQueryString({ hostname }));
        replyOnEvent("vitePassportConnectDomain", () => ({ result: true }));
        break;
      case "getNetwork":
        if (!domainConnected)
          return connectError();
        const { networkList, activeNetworkIndex } = await getValue([
          "networkList",
          "activeNetworkIndex"
        ]);
        const networkUrl = networkList[activeNetworkIndex].rpcUrl;
        reply({ result: networkUrl });
        break;
      case "writeAccountBlock":
        if (!domainConnected)
          return connectError();
        openPopup("/sign-tx" + toQueryString({
          methodName: message.args[0],
          params: JSON.stringify(message.args[1])
        }));
        replyOnEvent("vitePassportWriteAccountBlock", (data) => {
          console.log("data:", data);
          return { result: data.block };
        });
        break;
      default:
        break;
    }
  })();
  return true;
});
var host = chrome.runtime.getURL("src/confirmation.html");
var openPopup = async (routeAfterUnlock) => {
  const lastFocused = await chrome.windows.getCurrent();
  chrome.windows.create({
    url: host + toQueryString({ routeAfterUnlock }),
    type: "popup",
    width: 9 / 16 * 35 * 16,
    height: 35 * 16 + 22,
    top: lastFocused.top,
    left: lastFocused.left + (lastFocused.width - 18 * 16)
  });
};
var getFocusedTabId = () => {
  return new Promise((resolve) => {
    chrome.tabs.query({ currentWindow: true, active: true }, ([tab]) => resolve(tab.id));
  });
};
//# sourceMappingURL=background.js.map
