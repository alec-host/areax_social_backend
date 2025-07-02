const { validationResult } = require("express-validator");
const { findUserCountByEmail } = require("./user/find.user.count.by.email");
const { findUserCountByReferenceNumber } = require("./user/find.user.count.by.reference.no");
const { getUserDetailByReferenceNumber } = require("./user/get.user.details");
const { addComment } = require("./user/comment/add.comment");
const { editComment } = require("./user/comment/edit.comment");
const { removeComment } = require("./user/comment/remove.comment");
const { getCommentsByPostId } = require("./user/comment/get.comment");
const { getCommentCount } = require("./user/comment/get.comment.count");
const { addCommentReply } = require("./user/comment/add.comment.reply");
const { getCommentRepliesByCommentId } = require("./user/comment/get.comment.reply");
const { getPostCountById } = require("./user/wall/post.exist");
const { getCommentCountById } = require("./user/comment/comment.exist");

module.exports.AddComment = async(req,res) => {
    const errors = validationResult(req);
    const { email, reference_number, post_id, comment } = req.body;
    if(!errors.isEmpty()){
       return res.status(422).json({ success: false, error: true, message: errors.array() }); 	    
    }
    try{
       const email_found = await findUserCountByEmail(email);
       if(email_found === 0){
          res.status(404).json({
              success: false,
              error: true,
              message: "Email not found."
          });
          return;	       
       }
       const reference_number_found = await findUserCountByReferenceNumber(reference_number);
       if(reference_number_found === 0){
          res.status(404).json({
              success: false,
              error: true,
              message: "Reference number not found."
          });
          return;
       }
       const post_found = await getPostCountById(post_id);
       if(post_found === 0){
          res.status(404).json({
              success: false,
              error: true,
              message: `Post with id ${post_id} not found.`
          });
          return;
       }	    
       const userDetails = await getUserDetailByReferenceNumber(reference_number);	
       const payload = {
          post_id,
          user_id: userDetails._id,
          commentor_email: email,
          commentor_reference_number: reference_number,
          commentor_profile_url_image: userDetails.profile_picture_url,
	  commentor_username: userDetails.display_name,	    
          comment_text: comment,
       };		
       const response = await addComment(payload);
       if(response[0]){	
          res.status(201).json({
              success: true,
              error: false,
	      data: response[1],	
              message: "Comment was added"
          });
       }else{
          res.status(400).json({
              success: false,
              error: true,
              message: response[1]
          });
       }
    }catch(e){
       if(e){
          res.status(500).json({
              success: false,
              error: true,
              message: e?.response?.message || e?.message || 'Something wrong has happened'
          });
       }
    }
};

module.exports.AddCommentReply = async(req,res) => {
    const errors = validationResult(req);
    const { email, reference_number, post_id, comment_id, reply } = req.body;
    if(!errors.isEmpty()){
       return res.status(422).json({ success: false, error: true, message: errors.array() });	    
    }
    try{
       const email_found = await findUserCountByEmail(email);
       if(email_found === 0){
          res.status(404).json({
              success: false,
              error: true,
              message: "Email not found."
          });
	  return;
       }
       const reference_number_found = await findUserCountByReferenceNumber(reference_number);
       if(reference_number_found === 0){
          res.status(404).json({
              success: false,
              error: true,
              message: "Reference number not found."
          });
	  return;     
       }
       const post_found = await getPostCountById(post_id);
       if(post_found === 0){
          res.status(404).json({
              success: false,
              error: true,
              message: `Post with id ${post_id} not found.`
          });
          return;
       }	    
       const comment_found = await getCommentCountById(comment_id);    
       if(comment_found === 0){
          res.status(404).json({
              success: false,
              error: true,
              message: `Comment with id ${comment_id} not found.`
          });
          return;
       }
       const userDetails = await getUserDetailByReferenceNumber(reference_number);
       const payload = {
          post_id,
	  comment_id,   
          user_id: userDetails._id,
          commentor_email: email,
          commentor_reference_number: reference_number,
          commentor_profile_url_image: userDetails.profile_picture_url,
          commentor_username: userDetails.display_name,
          comment_text: reply,
       };
       const response = await addCommentReply(payload);
       if(response[0]){
          res.status(201).json({
              success: true,
              error: false,
              data: response[1],
              message: "Comment reply was added"
          });
       }else{
          res.status(400).json({
              success: false,
              error: true,
              message: response[1]
          });
       }
    }catch(e){
       if(e){
          res.status(500).json({
              success: false,
              error: true,
              message: e?.response?.message || e?.message || 'Something wrong has happened'
          });
       }
    }
};

module.exports.EditComment = async(req,res) => {
    const errors = validationResult(req);
    const { email, reference_number, comment_id, comment } = req.body;
    if(!errors.isEmpty()){
       return res.status(422).json({ success: false, error: true, message: errors.array() });	    
    }
    try{
       const email_found = await findUserCountByEmail(email);
       if(email_found === 0){
          res.status(404).json({
              success: false,
              error: true,
              message: "Email not found."
          });
          return;	       
       }
       const reference_number_found = await findUserCountByReferenceNumber(reference_number);
       if(reference_number_found === 0){
          res.status(404).json({
              success: false,
              error: true,
              message: "Reference number not found."
          });
          return;	       
       }
       const comment_found = await getCommentCountById(comment_id);
       if(comment_found === 0){
          res.status(404).json({
              success: false,
              error: true,
              message: `Comment with id ${comment_id} not found.`
          });
          return;
       }
       const payload = {
	  commentor_email: email,	   
	  commentor_reference_number: reference_number,	    
          comment_id,
	  comment_text: comment	    
       }; 	
       const response = await editComment(payload);
       if(response[0]){
          res.status(200).json({
              success: true,
              error: false,
              message: response[1]
          });
       }else{
          res.status(404).json({
              success: false,
              error: true,
              message: response[1]
          });
       }
    }catch(e){
       if(e){
          res.status(500).json({
              success: false,
              error: true,
              message: e?.response?.message || e?.message || 'Something wrong has happened'
          });
       }
    }
};

module.exports.RemoveComment = async(req,res) => {
    const errors = validationResult(req);
    const { email, reference_number } = req.body;
    const { comment_id } = req.params;	
    if(!errors.isEmpty()){
       return res.status(422).json({ success: false, error: true, message: errors.array() });	    
    }
    try{
       const email_found = await findUserCountByEmail(email);
       if(email_found === 0){
          res.status(404).json({
              success: false,
              error: true,
              message: "Email not found."
          });
          return;	       
       }
       const reference_number_found = await findUserCountByReferenceNumber(reference_number);
       if(reference_number_found === 0){
          res.status(404).json({
              success: false,
              error: true,
              message: "Reference number not found."
          });
          return;	       
       }
       const comment_found = await getCommentCountById(comment_id);
       if(comment_found === 0){
          res.status(404).json({
              success: false,
              error: true,
              message: `Comment with id ${comment_id} not found.`
          });
          return;
       }	    
       const response = await removeComment(comment_id);		
       if(response[0]){	
          res.status(200).json({
              success: true,
              error: false,
              message: response[1]
          });
       }else{
          res.status(404).json({
              success: false,
              error: true,
              message: response[1]
          })
       }
    }catch(e){
       if(e){
          res.status(500).json({
              success: false,
              error: true,
              message: e?.response?.message || e?.message || 'Something wrong has happened'
          });
       }
    }
};

module.exports.GetCommentCount = async(req,res) => {
    const errors = validationResult(req);
    const { email, reference_number, post_id } = req.query;
    if(!errors.isEmpty()){
       return  res.status(422).json({ success: false, error: true, message: errors.array() });	    
    }
    try{
       const email_found = await findUserCountByEmail(email);
       if(email_found === 0){
          res.status(404).json({
              success: false,
              error: true,
              message: "Email not found."
          });
          return;	       
       }
       const reference_number_found = await findUserCountByReferenceNumber(reference_number);
       if(reference_number_found === 0){
          res.status(404).json({
              success: false,
              error: true,
              message: "Reference number not found."
          });
          return;	       
       }
       const response = await getCommentCount(post_id);
       if(response[0]){	
          res.status(200).json({
              success: true,
              error: false,
	      count: response[1],	
              message: response[2]
          });
       }else{
          res.status(404).json({
              success: false,
              error: true,
	      count: response[1],	
              message: response[2]
          });
       }
    }catch(e){
       if(e){
          res.status(500).json({
              success: false,
              error: true,
              message: e?.response?.message || e?.message || 'Something wrong has happened'
          });
       }
    }
};

module.exports.GetComment = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, post_id } = req.query;
  if(!errors.isEmpty()){
     res.status(422).json({ success: false, error: true, message: errors.array() });
     return;	  
  }
  try{
     const email_found = await findUserCountByEmail(email);
     if(email_found === 0){
        res.status(404).json({
            success: false,
            error: true,
            message: "Email not found."
        });	     
        return;
     }
     const reference_number_found = await findUserCountByReferenceNumber(reference_number);
     if(reference_number_found === 0){
        res.status(404).json({
            success: false,
            error: true,
            message: "Reference number not found."
        });
        return;
     }
     const response = await getCommentsByPostId(post_id);
     if(response[0]){
        res.status(200).json({
            success: true,
            error: false,
            data: response[1],
            message: `Comment[s] for post with post_id ${post_id}.` 
        });
     }else{
        res.status(404).json({
            success: false,
            error: true,
            data: [],
            message: 'No comment[s].'
        });
     }
  }catch(e){
     if(e){
        res.status(500).json({
            success: false,
            error: true,
            message: e?.response?.message || e?.message || 'Something wrong has happened'
        });
     }
  }
};

module.exports.GetCommentReplies = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, comment_id } = req.query;
  if(!errors.isEmpty()){
     res.status(422).json({ success: false, error: true, message: errors.array() });
     return;
  }
  try{
     const email_found = await findUserCountByEmail(email);
     if(email_found === 0){
        res.status(404).json({
            success: false,
            error: true,
            message: "Email not found."
        });
        return;
     }
     const reference_number_found = await findUserCountByReferenceNumber(reference_number);
     if(reference_number_found === 0){
        res.status(404).json({
            success: false,
            error: true,
            message: "Reference number not found."
        });
        return;
     }
     const response = await getCommentRepliesByCommentId(comment_id);
     if(response[0]){
        res.status(200).json({
            success: true,
            error: false,
            data: response[1],
            message: `Repies for comment with commment_id ${comment_id}.`
        });
     }else{
        res.status(404).json({
            success: false,
            error: true,
            data: [],
            message: 'No comment replies.'
        });
     }
  }catch(e){
     if(e){
        res.status(500).json({
            success: false,
            error: true,
            message: e?.response?.message || e?.message || 'Something wrong has happened'
        });
     }
  }
};
