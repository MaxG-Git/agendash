var axiosConfig = (function() {
    var axiosInstance = axios;
  
    // Add a request interceptor to add JWT bearer token authentication
    axiosInstance.interceptors.request.use(function(config) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = 'Bearer ' + token;
      }
      return config;
    }, function(err) {
      return Promise.reject(err);
    });
  
    // Define the endpoint which refreshes the token
    const refreshTokenEndpoint = '/auth/refresh';
  
    // Function to refresh token
    function refreshToken() {
      const refreshTokenValue = localStorage.getItem('refresh');
      return axiosInstance.post(refreshTokenEndpoint, {
        refresh: refreshTokenValue
      }).then(response => {
        if (response.data && response.data.token) {
          localStorage.setItem('token', response.data.token);
          return response.data.token;
        } else {
          throw new Error('No token received');
        }
      });
    }
  
    // Add a response interceptor for handling token expiration
    axiosInstance.interceptors.response.use(
      function(response) {
        return response;
      },
      function(error) {
        const originalRequest = error.config;
        
        // If it was the refresh token call itself that had an error, or
        // if it's not a 401 error, simply reject
        
        if(error.response.status === 403){
            window.location.href = '/'
        }

        if (error.response.status !== 401 || originalRequest.url === refreshTokenEndpoint) {
            return Promise.reject(error);
        }
        
  
        // If this was not a request to refresh token and the error is 401, try refreshing
        if (!originalRequest._retry) {
          originalRequest._retry = true;
  
          return refreshToken()
            .then(token => {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
              return axios(originalRequest);
            })
            .catch(err => {
              console.error("Token refresh failed: ", err);
  
              // Clear tokens from local storage
              localStorage.removeItem('token');
              localStorage.removeItem('refresh');
              window.location.href = '/login';
              return Promise.reject(error);
            });
        }
  
        // If it's a retry request, reject it
        return Promise.reject(error);
      }
    );
  
    return {
      instance: axiosInstance
    };
  })();
  