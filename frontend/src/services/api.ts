import axios from "axios";

// Get API base URL from environment or use default
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

console.log(`🔌 API connecting to: ${API_BASE_URL}`);

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Add timeout and connection settings
  timeout: 15000, // Increased timeout for slower connections
  withCredentials: true,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper function to get the current user ID from localStorage
const getCurrentUserId = () => {
  try {
    const userStr = localStorage.getItem("bloodbank_user");
    if (!userStr) return null;

    const user = JSON.parse(userStr);
    return user.id || null;
  } catch (error) {
    console.error("Error getting user ID from localStorage:", error);
    return null;
  }
};

// Services for different API endpoints
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post("/auth/login", credentials);
      return response.data; // Backend returns {success, message, token, user: {id, name, email, role}}
    } catch (error: any) {
      console.error(
        "Login error:",
        error.response?.data || error.message || error
      );
      throw error.response?.data || { message: "Login failed" };
    }
  },
  register: async (userData: any) => {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: "Registration failed" };
    }
  },
};

export const donorsApi = {
  getAll: async () => {
    try {
      const response = await api.get("/donors");
      return response.data;
    } catch (error: any) {
      console.error(
        "Get all donors error:",
        error.response?.data || error.message || error
      );
      throw error.response?.data || { message: "Failed to fetch donors" };
    }
  },
  getById: async (id: number) => {
    try {
      const response = await api.get(`/donors/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(
        "Get donor by id error:",
        error.response?.data || error.message || error
      );
      throw error.response?.data || { message: "Failed to fetch donor" };
    }
  },
  create: async (donorData: any) => {
    try {
      const response = await api.post("/donors", donorData);
      return response.data;
    } catch (error: any) {
      console.error(
        "Create donor error:",
        error.response?.data || error.message || error
      );
      throw error.response?.data || { message: "Failed to create donor" };
    }
  },
  update: async (id: number, donorData: any) => {
    try {
      const response = await api.put(`/donors/${id}`, donorData);
      return response.data;
    } catch (error: any) {
      console.error(
        "Update donor error:",
        error.response?.data || error.message || error
      );
      throw error.response?.data || { message: "Failed to update donor" };
    }
  },
  delete: async (id: number) => {
    try {
      const response = await api.delete(`/donors/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(
        "Delete donor error:",
        error.response?.data || error.message || error
      );
      throw error.response?.data || { message: "Failed to delete donor" };
    }
  },
};

export const donationApi = {
  getAll: async () => {
    try {
      const response = await api.get("/donations");
      return response.data;
    } catch (error: any) {
      console.error(
        "Get all donations error:",
        error.response?.data || error.message || error
      );
      throw error.response?.data || { message: "Failed to fetch donations" };
    }
  },
  getByDonor: async (donorId: number) => {
    try {
      const response = await api.get(`/donations/donor/${donorId}`);
      return response.data;
    } catch (error: any) {
      console.error(
        "Get donations by donor error:",
        error.response?.data || error.message || error
      );
      throw error.response?.data || { message: "Failed to fetch donations" };
    }
  },
  create: async (donationData: any) => {
    try {
      const response = await api.post("/donations", donationData);
      return response.data;
    } catch (error: any) {
      console.error(
        "Create donation error:",
        error.response?.data || error.message || error
      );
      throw error.response?.data || { message: "Failed to create donation" };
    }
  },
};

export const inventoryApi = {
  getAll: async () => {
    try {
      const response = await api.get("/inventory");
      return response.data;
    } catch (error: any) {
      console.error(
        "Get all inventory error:",
        error.response?.data || error.message || error
      );
      throw error.response?.data || { message: "Failed to fetch inventory" };
    }
  },
  updateStock: async (inventoryData: any) => {
    try {
      const response = await api.put("/inventory", inventoryData);
      return response.data;
    } catch (error: any) {
      console.error(
        "Update inventory error:",
        error.response?.data || error.message || error
      );
      throw error.response?.data || { message: "Failed to update inventory" };
    }
  },
  updateInventoryForDonation: async (donationData: any) => {
    try {
      // Use the inventory update endpoint with operation "add"
      const updatePayload = {
        bank_id: donationData.bank_id || 1, // Default to main blood bank if not specified
        blood_group: donationData.blood_group,
        units: donationData.units,
        operation: "add",
      };

      const response = await api.post("/inventory/update", updatePayload);
      return response.data;
    } catch (error: any) {
      console.error(
        "Update inventory for donation error:",
        error.response?.data || error.message || error
      );
      throw (
        error.response?.data || {
          message: "Failed to update inventory after donation",
        }
      );
    }
  },
  updateInventoryForRequest: async (requestData: any) => {
    try {
      // Use the inventory update endpoint with operation "subtract"
      const updatePayload = {
        bank_id: requestData.bank_id || 1, // Default to main blood bank if not specified
        blood_group: requestData.blood_group,
        units: requestData.units_requested || requestData.units,
        operation: "subtract",
      };

      const response = await api.post("/inventory/update", updatePayload);
      return response.data;
    } catch (error: any) {
      console.error(
        "Update inventory for request error:",
        error.response?.data || error.message || error
      );
      throw (
        error.response?.data || {
          message: "Failed to update inventory after request",
        }
      );
    }
  },
};

export const requestApi = {
  getAll: async () => {
    try {
      // Get current user info
      const userStr = localStorage.getItem("bloodbank_user");
      const user = userStr ? JSON.parse(userStr) : null;

      // If user is a hospital/recipient, get only their requests
      if (user && (user.role === "hospital" || user.role === "recipient")) {
        // First try to use the user ID directly as recipient_id
        let recipientId = user.id;

        // If that didn't work, try to find the recipient by email or name
        try {
          // Try to find the recipient by matching email or name
          const recipientsResponse = await api.get("/recipients");
          if (recipientsResponse.data.success) {
            const recipients = recipientsResponse.data.data || [];
            // Try to find by email first, then by name
            const matchingRecipient = recipients.find(
              (r) => r.email === user.email || r.organization_name === user.name
            );

            if (matchingRecipient) {
              recipientId = matchingRecipient.recipient_id;
              console.log(
                "Found matching recipient by email/name:",
                matchingRecipient.recipient_id
              );
            }
          }
        } catch (err) {
          console.warn(
            "Could not look up recipient by email/name, using user ID instead:",
            err
          );
        }

        console.log(
          "Fetching requests for recipient/hospital ID:",
          recipientId
        );

        // Now get the requests for this recipient
        try {
          const response = await api.get(`/requests/recipient/${recipientId}`);
          return response.data;
        } catch (recipientError) {
          console.error("Error fetching recipient requests:", recipientError);
          // Return empty data with success flag to avoid throwing errors in component
          return {
            success: true,
            count: 0,
            data: [],
          };
        }
      } else {
        // For admin users, get all requests
        const response = await api.get("/requests");
        return response.data;
      }
    } catch (error: any) {
      console.error(
        "Get all requests error:",
        error.response?.data || error.message || error
      );

      // Return empty data instead of throwing, so the component can still render
      return {
        success: true,
        count: 0,
        data: [],
      };
    }
  },
  getByRecipient: async (recipientId: number) => {
    try {
      const response = await api.get(`/requests/recipient/${recipientId}`);
      return response.data;
    } catch (error: any) {
      console.error(
        "Get requests by recipient error:",
        error.response?.data || error.message || error
      );
      throw (
        error.response?.data || {
          message: "Failed to fetch recipient requests",
        }
      );
    }
  },
  getById: async (id: number) => {
    try {
      const response = await api.get(`/requests/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(
        "Get request by id error:",
        error.response?.data || error.message || error
      );
      throw error.response?.data || { message: "Failed to fetch request" };
    }
  },
  create: async (requestData: any) => {
    try {
      console.log("Sending blood request data:", requestData);
      const response = await api.post("/requests", requestData);
      console.log("Blood request API response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Create request error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        originalError: error,
      });

      // Specific handling for 403 Forbidden
      if (error.response?.status === 403) {
        console.error(
          "Permission denied (403 Forbidden). User may not have hospital/recipient privileges."
        );
        return {
          success: false,
          message:
            "You do not have permission to create blood requests. Contact administrator for assistance.",
        };
      }

      throw error.response?.data || { message: "Failed to create request" };
    }
  },
  update: async (id: number, requestData: any) => {
    try {
      const response = await api.put(`/requests/${id}`, requestData);
      return response.data;
    } catch (error: any) {
      console.error(
        "Update request error:",
        error.response?.data || error.message || error
      );
      throw error.response?.data || { message: "Failed to update request" };
    }
  },
  approve: async (id: number) => {
    try {
      // Get current user ID for the approval
      const userStr = localStorage.getItem("bloodbank_user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user ? user.id : null;

      if (!userId) {
        return {
          success: false,
          message: "User not authenticated. Please login again.",
        };
      }

      // Ensure ID is a number
      const numericId = parseInt(String(id), 10);

      // Log request details for debugging
      console.log("Approving request with ID:", numericId, "User ID:", userId);

      // First get the current request details to preserve notes
      const requestDetails = await api.get(`/requests/${numericId}`);
      const requestData = requestDetails.data.data || {};
      const currentNotes = requestData.notes || "";

      // Use the correct endpoint with status update
      const approveData = {
        status: "approved",
        approved_by: userId,
        notes: currentNotes
          ? `${currentNotes}\n\nRequest approved by admin`
          : "Request approved by admin", // Append approval note to existing notes
      };

      console.log("Sending approval data:", approveData);

      // Get current inventory
      const inventoryResponse = await api.get("/inventory");
      const inventoryData = inventoryResponse.data.data || [];
      const inventoryItem = inventoryData.find(
        (item) => item.blood_group === requestData.blood_group
      );

      if (inventoryItem) {
        const availableUnits = parseFloat(
          String(inventoryItem.available_units)
        );
        const requestedUnits = parseFloat(String(requestData.units_requested));

        if (availableUnits < requestedUnits) {
          return {
            success: false,
            message: `Insufficient units available. Required: ${requestedUnits}, Available: ${availableUnits}`,
          };
        }
      }

      // Use the standard API instance for consistent error handling
      const response = await api.put(
        `/requests/${numericId}/status`,
        approveData
      );

      console.log("Approval response:", response.data);

      // If successful, dispatch event to refresh data
      if (response.data.success) {
        try {
          // Trigger an immediate inventory refresh by other components
          window.dispatchEvent(new CustomEvent("activity-added"));
          console.log("Dispatched activity-added event to refresh inventory");
        } catch (refreshError) {
          console.error("Error triggering refresh:", refreshError);
        }
      }

      return response.data;
    } catch (error: any) {
      // Enhanced error logging
      console.error("Approve request error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      // Return the server's error message directly
      if (error.response?.data) {
        return error.response.data; // Return the server's error response directly
      }

      // If no structured response from server, create a generic error
      return {
        success: false,
        message: error.message || "Failed to approve request",
      };
    }
  },
  reject: async (id: number, reason: string) => {
    try {
      // Ensure ID is a number
      const numericId = parseInt(String(id), 10);

      // Get current user ID
      const userId = getCurrentUserId();

      // Use the /status endpoint with 'rejected' status
      const rejectData = {
        status: "rejected",
        notes: reason,
        approved_by: userId, // Include for consistency
      };

      console.log("Rejecting request with ID:", numericId, "User ID:", userId);
      console.log("Sending rejection data:", rejectData);

      // Use direct axios call for consistency with approve method
      const response = await axios({
        method: "PUT",
        url: `${API_BASE_URL}/requests/${numericId}/status`,
        data: rejectData,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        timeout: 15000, // Longer timeout for this critical operation
        withCredentials: true,
      });

      console.log("Rejection response:", response.data);
      return response.data;
    } catch (error: any) {
      // Enhanced error logging
      console.error("Reject request error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      // Return the server's error message directly
      if (error.response?.data) {
        return error.response.data; // Return the server's error response directly
      }

      // If no structured response from server, create a generic error
      return {
        success: false,
        message: error.message || "Failed to reject request",
      };
    }
  },
};

export const recipientApi = {
  getAll: async () => {
    try {
      const response = await api.get("/recipients");
      return response.data;
    } catch (error: any) {
      console.error(
        "Get all recipients error:",
        error.response?.data || error.message || error
      );
      throw error.response?.data || { message: "Failed to fetch recipients" };
    }
  },
  getById: async (id: number) => {
    try {
      const response = await api.get(`/recipients/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(
        "Get recipient by id error:",
        error.response?.data || error.message || error
      );
      throw error.response?.data || { message: "Failed to fetch recipient" };
    }
  },
  create: async (recipientData: any) => {
    try {
      const response = await api.post("/recipients", recipientData);
      return response.data;
    } catch (error: any) {
      console.error(
        "Create recipient error:",
        error.response?.data || error.message || error
      );
      throw error.response?.data || { message: "Failed to create recipient" };
    }
  },
  update: async (id: number, recipientData: any) => {
    try {
      const response = await api.put(`/recipients/${id}`, recipientData);
      return response.data;
    } catch (error: any) {
      console.error(
        "Update recipient error:",
        error.response?.data || error.message || error
      );
      throw error.response?.data || { message: "Failed to update recipient" };
    }
  },
};

export const reportsApi = {
  getDonorReport: async (params: any) => {
    try {
      const response = await api.get("/reports/donors", { params });
      return response.data;
    } catch (error: any) {
      console.error(
        "Get donor report error:",
        error.response?.data || error.message || error
      );
      throw error.response?.data || { message: "Failed to fetch donor report" };
    }
  },
  getInventoryReport: async (params: any) => {
    try {
      const response = await api.get("/reports/inventory", { params });
      return response.data;
    } catch (error: any) {
      console.error(
        "Get inventory report error:",
        error.response?.data || error.message || error
      );
      throw (
        error.response?.data || { message: "Failed to fetch inventory report" }
      );
    }
  },
  getRequestReport: async (params: any) => {
    try {
      const response = await api.get("/reports/requests", { params });
      return response.data;
    } catch (error: any) {
      console.error(
        "Get request report error:",
        error.response?.data || error.message || error
      );
      throw (
        error.response?.data || { message: "Failed to fetch request report" }
      );
    }
  },
};

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message || error);

    // Handle network errors
    if (error.message === "Network Error") {
      console.error("Network error detected. Backend may be unavailable.");
      // You can add additional handling here if needed
    }

    // Handle 401 unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      // Clear auth data and redirect to login if needed
      localStorage.removeItem("auth_token");
      localStorage.removeItem("bloodbank_user");

      // If we're not already on the login page, redirect there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
