const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(method, path, { body, token, formData, headers = {} } = {}) {
  const opts = {
    method,
    headers: { ...headers },
  };

  if (token) {
    opts.headers.Authorization = `Bearer ${token}`;
  }

  if (formData) {
    opts.body = formData;
  } else if (body) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE}${path}`, opts);
  let data;
  try {
    data = await res.json();
  } catch {
    data = { success: false, message: 'Invalid response from server' };
  }

  if (!res.ok) {
    const err = new Error(data.message || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, body, opts) => request('POST', path, { ...opts, body }),
  put: (path, body, opts) => request('PUT', path, { ...opts, body }),
  delete: (path, opts) => request('DELETE', path, opts),
  postForm: (path, formData, opts) => request('POST', path, { ...opts, formData }),
  putForm: (path, formData, opts) => request('PUT', path, { ...opts, formData }),
};
