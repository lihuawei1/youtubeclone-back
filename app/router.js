'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const auth = app.middleware.auth();
  router.prefix('/api/v1');
  router.post('/users', controller.user.create);
  router.post('/users/login', controller.user.login);
  router.get('/user', auth, controller.user.getCurrentUser);
  router.patch('/user', auth, controller.user.update);
  // 获取用户资料
  router.get('/users/:userId', app.middleware.auth({ required: false }), controller.user.getUser);

  // 用户订阅
  router.post('/user/:userId/subscribe', auth, controller.user.subscribe);
  // 取消订阅
  router.delete('/user/:userId/unsubscribe', auth, controller.user.unsubscribe);
  // 获取用户订阅得频道列表
  router.post('/user/:userId/subscription', controller.user.getSubscriptions);
  // 阿里云 VOD
  router.get('/user/CreateUploadVideo', auth, controller.vod.createUploadVideo);// 获取视频上传地址和凭证
  router.get('/user/RefreshUploadVideo', auth, controller.vod.refreshUploadVideo);// 刷新视频上传凭证
  // 创建视频
  router.post('/videos', auth, controller.video.createVideo);
  // 获取视频详情
  router.get('/videos/:videoId', app.middleware.auth({ required: false }), controller.video.getVideo);
  // 获取视频列表
  router.get('/videos', controller.video.getVideos);
  // 获取用户发布得视频列表
  router.get('/users/:userId/videos', controller.video.getUserVideos);
  // 获取用户关注的频道视频列表
  router.get('/user/videos/feed', auth, controller.video.getUserFeedVideos);
  // 更新视频
  router.patch('/videos/:videoId', auth, controller.video.updateVideo);
  // 删除视频
  router.delete('/videos/:videoId', auth, controller.video.deleteVideo);
  // 添加视频评论
  router.post('/videos/:videoId/comments', auth, controller.video.createComment);
  // 获取视频评论列表
  router.get('/videos/:videoId/comments', controller.video.getVideoComments);
  // 删除视频评论
  router.delete('/videos/:videoId/comments/:commentId', auth, controller.video.deleteVideoComment);
  // 喜欢视频
  router.post('/videos/:videoId/like', auth, controller.video.likeVideo);
  // 不喜欢视频
  router.post('/videos/:videoId/dislike', auth, controller.video.dislikeVideo);
  // 获取用户喜欢的视频列表
  router.get('/user/videos/liked', auth, controller.video.getUserLikedVideos);
};
