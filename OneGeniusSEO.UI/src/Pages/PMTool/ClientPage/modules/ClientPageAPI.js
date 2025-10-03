import api from "@/utils/api";

const getClientById = async (clientId) => {
  const response = await api.get(`/api/clients/${clientId}`);
  return response.data;
};

const createList = async (clientId, listData) => {
  const response = await api.post(
    `/api/lists/clients/${clientId}/lists`,
    listData
  );
  return response.data;
};

const updateList = async (listId, listData, reorderData) => {
  const payload = { ...listData };
  if (reorderData) {
    payload.reorderData = reorderData;
  }
  const response = await api.put(`/api/lists/${listId}`, payload);
  return response.data;
};

const deleteList = async (listId) => {
  const response = await api.delete(`/api/lists/${listId}`);
  return response.data;
};

const createTask = async (listId, taskData) => {
  const response = await api.post(`/api/tasks/lists/${listId}/tasks`, taskData);
  return response.data;
};

const updateTask = async (taskId, taskData) => {
  const response = await api.put(`/api/tasks/${taskId}`, taskData);
  return response.data;
};

export {
  getClientById,
  createList,
  updateList,
  deleteList,
  createTask,
  updateTask,
};
