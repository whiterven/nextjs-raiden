import { DEFAULT_CHAT_MODEL } from './models';

let selectedModelId: string = DEFAULT_CHAT_MODEL;

export const getSelectedModel = () => selectedModelId;

export const setSelectedModel = (modelId: string) => {
  selectedModelId = modelId;
}; 