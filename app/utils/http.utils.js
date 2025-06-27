const axios = require('axios');
const { BASIC_AUTH_USERNAME, BASIC_AUTH_PASSWORD } = require('../constants/app_constants');
  
const basicAuth = Buffer.from(`${BASIC_AUTH_USERNAME}:${BASIC_AUTH_PASSWORD}`).toString('base64')

const httpAddLikePost = async (payload) => {
  try {
    const email = payload.email;
    const reference_number = payload.reference_number;
    const post_id = payload.post_id;
    const response = await axios({
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api.projectw.ai/social/api/v1/like',
      headers: { 
	 'Authorization': `Basic ${basicAuth}`,    
	 'Content-Type': 'application/json'
      },
      data: JSON.stringify({ email, reference_number, post_id })
    });

    return [true, response.data];
  } catch (error) {
    console.error('Add Like request failed:', error.message);
    return [false, error.response?.data || 'Request failed'];
  }
};

const httpRemoveLikePost = async (payload) => {
  try {
    const email = payload.email;
    const reference_number = payload.reference_number;
    const like_id = payload.like_id;
    const url = `https://api.projectw.ai/social/api/v1/like/${like_id}`;
    console.log(url);	  
    const response = await axios({
      method: 'delete',
      maxBodyLength: Infinity,
      url: url,
      headers: { 
         'Authorization': `Basic ${basicAuth}`,	      
	 'Content-Type': 'application/json' 
      },
      data: JSON.stringify({ email, reference_number })
    });

    return [true, response.data];
  } catch (error) {
    console.error('Remove Like request failed:', error.message);
    return [false, error.response?.data || 'Request failed'];
  }
};

const httpReportContentPost = async (payload) => {
  try {
    const email = payload.email;
    const reference_number = payload.reference_number;
    const flag = payload.flag;	  
    const post_id = parseInt(payload.post_id);	  
    const url = `https://api.projectw.ai/social/api/v1/toggle/report/${post_id}`;
    console.log(BASIC_AUTH_USERNAME, BASIC_AUTH_PASSWORD);	  
    const response = await axios({
      method: 'patch',
      maxBodyLength: Infinity,
      url: url,
      headers: {
         'Authorization': `Basic ${basicAuth}`,
         'Content-Type': 'application/json'
      },
      data: JSON.stringify({ email, reference_number, flag })
    });

    return [true, response.data];
  } catch (error) {
    const err =  error?.message || error.response?.data;	  
    console.error('Flagging Failed:', err);
    return [false, err || 'Request failed'];
  }
};

module.exports = { httpAddLikePost, httpRemoveLikePost, httpReportContentPost };
