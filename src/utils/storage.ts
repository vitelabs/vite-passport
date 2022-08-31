import { Storage } from './types';

type Dict = Partial<Storage>;

export const setValue = (value: Dict): Promise<void> => {
	// @ts-ignore
	if (value.secrets) {
		throw new Error('Attempting to store secrets!');
	}
	return chrome.storage.local.set(value);
};

export type StorageFields = keyof Storage;

export const getValue = (keys: StorageFields | StorageFields[] | null): Promise<Dict> => {
	return chrome.storage.local.get(keys);
};

export const removeKeys = (keys: StorageFields | StorageFields[]): Promise<void> => {
	return chrome.storage.local.remove(keys);
};
