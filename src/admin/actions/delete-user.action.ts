import { butcherApi } from "@/api/butcherApi";

type DeleteUserResponse = {
  id: string;
};

export const deleteUserAction = async (userId: string): Promise<DeleteUserResponse> => {
  const { data } = await butcherApi.delete<DeleteUserResponse>(`/auth/users/${userId}`);
  return data;
};
