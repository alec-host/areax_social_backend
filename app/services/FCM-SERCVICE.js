const admin = require("./firebase");

module.exports.sendNotification = async(recipient, title, message, data = {}, isTopic = false) => {
    const payload = {
        [isTopic ? "topic" : "token"]: recipient, // Send to device or topic
        notification: {
            title: title,
            body: message,
        },
        data,
        android: {
            priority: "high",
            notification: {
                sound: "default",
            },
        },
        apns: {
            payload: {
                aps: {
                    sound: "default",
                },
            },
        },
    };

    try {
        const response = await admin.messaging().send(payload);
        console.log("Push notification sent successfully:", response);
        return response;
    } catch (error) {
        console.error("Error sending notification:", error);
        throw error;
    }
};
