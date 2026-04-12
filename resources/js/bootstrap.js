import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.headers.common['Accept'] = 'application/json';
window.axios.defaults.withCredentials = true;

window.axios.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const url = String(error.config?.url ?? '');
        if (status === 401 && url.includes('/api/mwadmin')) {
            const login = '/mwadmin/login';
            if (!window.location.pathname.startsWith('/mwadmin/login')) {
                window.location.assign(login);
            }
        }
        return Promise.reject(error);
    },
);
