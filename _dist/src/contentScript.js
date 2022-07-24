"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/contentScript.ts
var contentScript_exports = {};
module.exports = __toCommonJS(contentScript_exports);

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

// src/contentScript.ts
var scriptTag = document.createElement("script");
scriptTag.src = chrome.runtime.getURL("src/injectedScript.js");
document.documentElement.appendChild(scriptTag);
scriptTag.remove();
window.addEventListener("vitePassportMethodCalled", (event) => {
  chrome.runtime.sendMessage(event.detail, (response) => {
    window.postMessage({
      ...response,
      _messageId: event.detail._messageId
    });
  });
});
chrome.runtime.onMessage.addListener((message) => {
  dispatchEvent(new CustomEvent(prefixName(message.type), {
    detail: message.payload
  }));
});
//# sourceMappingURL=contentScript.js.map
