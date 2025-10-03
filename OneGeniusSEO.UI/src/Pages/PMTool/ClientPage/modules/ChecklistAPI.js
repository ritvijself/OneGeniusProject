import api from "@/utils/api";

// Checklist CRUD operations
export const getChecklistsByTask = async (taskId) => {
  const response = await api.get(`/api/tasks/${taskId}/checklists`);
  return response.data;
};

export const createChecklist = async (taskId, title) => {
  const response = await api.post("/api/checklists", {
    taskId,
    title,
  });
  return response.data;
};

export const updateChecklist = async (checklistId, title) => {
  const response = await api.put(`/api/checklists/${checklistId}`, {
    title,
  });
  return response.data;
};

export const deleteChecklist = async (checklistId) => {
  const response = await api.delete(`/api/checklists/${checklistId}`);
  return response.data;
};

// Checklist Item CRUD operations
export const createChecklistItem = async (checklistId, title) => {
  const response = await api.post(`/api/checklists/${checklistId}/items`, {
    checklistId,
    title,
  });
  return response.data;
};

export const updateChecklistItem = async (itemId, { title, isCompleted }) => {
  const response = await api.put(`/api/checklists/items/${itemId}`, {
    title,
    is_completed: isCompleted,
  });
  return response.data;
};

export const deleteChecklistItem = async (itemId) => {
  const response = await api.delete(`/api/checklists/items/${itemId}`);
  return response.data;
};
