const axiosInstance = require("../utils/axios.instance");
const IN_APP_NOTIFICATION_URL = "https://backendapi.projectw.ai/api/notifications/sendInAppNotification";
const IN_APP_AUTHORIZATION_KEY = "2YgRXW8KzOVupzUYY/qFsBpcu6lEXADYseyGlgTSkT7XAu5VqlE3oyP/ZhL+91tn";

module.exports.sendInAppNotification = async(payload) => {
  axiosInstance.post(IN_APP_NOTIFICATION_URL,
    payload,
    {
       headers: {
         Authorization: IN_APP_AUTHORIZATION_KEY,
         "Content-Type": "application/json"
       },
       maxBodyLength: Infinity
    }).then(response => {
       console.log("Notification sent:", response.data);
    }).catch(error => {
       console.error("Error sending notification:", error.response?.data || error.message);
    });
};
