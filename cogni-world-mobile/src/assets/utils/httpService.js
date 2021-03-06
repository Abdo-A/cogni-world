import axios from 'axios';

import keys from '../../keys.secret';

const http = {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  patch: axios.patch,
  delete: axios.delete,
};

export default http;

export const setAuthToken = token => {
  if (token) {
    // Apply to every request
    axios.defaults.headers.common.Authorization = token;
  }
};

export const removeAuthToken = () => {
  // Delete auth header
  delete axios.defaults.headers.common.Authorization;
};

export const { serverPath } = keys;
export const userAPI = `${serverPath}/api/user`;
export const canteenAPI = `${serverPath}/api/canteen`;
