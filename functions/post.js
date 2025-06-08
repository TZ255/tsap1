const { default: axios } = require("axios");
const baseUrl = "https://mkeka-wa-leo-production-3114.up.railway.app"

async function postGrantVip(email, param) {
    try {
        const response = await axios.post(`${baseUrl}/post/grant-vip`, {
            email: email,
            param: param,
            secret: process.env.SECRET
        });

        return response.data;
    } catch (error) {
        console.error('Error making grant VIP request:', error.response?.data || error.message);
        throw error;
    }
}

module.exports = {
    postGrantVip
}