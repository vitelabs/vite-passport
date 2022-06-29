import { Storage } from './types';

type Dict = Partial<Storage>;

export const setValue = (value: Dict): Promise<undefined> => {
	return new Promise((resolve) => {
		chrome.storage.local.set(value, () => resolve(undefined));
	});
};

export type StorageFields = keyof Storage;

// export const getValue = (keys: string | string[] | Dict | null): Promise<Dict> => {
export const getValue = (
	keys: StorageFields | StorageFields[] | null
): Promise<Dict> => {
	return new Promise((resolve) => {
		chrome.storage.local.get(keys, (items) => resolve(items as Dict));
	});
};

export const removeKeys = (
	keys: StorageFields | StorageFields[]
): Promise<undefined> => {
	return new Promise((resolve) => {
		chrome.storage.local.remove(keys, () => resolve(undefined));
	});
};
