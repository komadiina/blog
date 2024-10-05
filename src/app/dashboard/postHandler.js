import { ref,  uploadBytesResumable, deleteObject } from "firebase/storage";


export const uploadFile = async (storage, file, parentDir = '') => {
  const storageRef = ref(storage, `${parentDir}/${file.name}`);
  const snapshot = await uploadBytesResumable(storageRef, file);
  return snapshot;
}

export const deleteFile = async (storage, file) => {
  const storageRef = ref(storage, file);
  await deleteObject(storageRef);
}
