const { Sequelize } = require("sequelize");

const sequelize1 = require("../db/db");
const sequelize2 = require("../db/db2");

const { CreateCommentTrigger } = require("../controllers/user/comment/trigger/comment.trigger"); 
const { CreateLikeTrigger } = require("../controllers/user/like/trigger/like.trigger");

const db = {};
const db2 = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize1;

db2.Sequelize = Sequelize;
db2.sequelize = sequelize2;

db.users = require("./user.model")(sequelize1,Sequelize);

db2.friends = require("./friends.model")(sequelize2,Sequelize);
db2.wall = require("./social.wall.model")(sequelize2,Sequelize);
db2.buys = require("./buys.model")(sequelize2,Sequelize);
db2.bids = require("./bids.model")(sequelize2,Sequelize);
db2.comments = require("./comments.model")(sequelize2,Sequelize);
db2.likes = require("./likes.model")(sequelize2,Sequelize);
db2.shares = require("./shares.model")(sequelize2,Sequelize);

db2.comments.likes = require("./comment.likes.model")(sequelize2,Sequelize);

db2.materialized = require("./materialized.model")(sequelize2,Sequelize);

db2.groups = require("./groups.model")(sequelize2,Sequelize);
db2.members = require("./group.members.model")(sequelize2,Sequelize);
db2.messages = require("./group.messages.model")(sequelize2,Sequelize);
db2.groups.payments = require("./group.payments")(sequelize2,Sequelize);
db2.groups.subscriptions = require("./group.subscriptions")(sequelize2,Sequelize);

db2.files = require("./file.model")(sequelize2,Sequelize);
db2.wallpapers = require("./wallpaper.model")(sequelize2,Sequelize);
db2.queued_friends_requests = require("./request.friend.model")(sequelize2,Sequelize);
db2.report_post = require("./post.feedback.model")(sequelize2,Sequelize);
db2.saved_posts = require("./saved.posts.model")(sequelize2,Sequelize);

//console.log('AM HERE, AM HERE');
(async() => {
  //-like trigger.
  //await CreateLikeTrigger(sequelize2);
  //-comment trigger.
  //await CreateCommentTrigger(sequelize2);
  //console.log('AM HERE, AM HERE');	
})();

module.exports = { db,db2 };
