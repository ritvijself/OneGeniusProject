import api from "@/utils/api";

export const getLabels = async (clientId) => {
  const response = await api.get(`/api/clients/${clientId}/labels`);
  return response.data.labels;
};

export const createLabel = async (labelData) => {
  const response = await api.post(
    `/api/clients/${labelData.clientId}/labels`,
    labelData
  );
  return response.data.label;
};

export const updateLabel = async ({ labelId, labelData, clientId }) => {
  const response = await api.put(
    `/api/clients/${clientId}/labels/${labelId}`,
    labelData
  );
  return response.data.label;
};

export const deleteLabel = async ({ labelId, clientId }) => {
  const response = await api.delete(
    `/api/clients/${clientId}/labels/${labelId}`
  );
  return response.data;
};
