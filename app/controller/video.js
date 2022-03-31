'use strict';
const Controller = require('egg').Controller;

class VideoController extends Controller {
  async createVideo() {
    const body = this.ctx.request.body;
    const { Video } = this.app.model;
    this.ctx.validate({
      title: { type: 'string' },
      description: { type: 'string' },
      vodVideoId: { type: 'string' },
      cover: { type: 'string' },
    }, body);
    body.user = this.ctx.user._id;
    const video = await new Video(body).save();
    this.ctx.status = 201;
    this.ctx.body = {
      video,
    };
  }
  async getVideo() {
    const { Video, VideoLike, Subscription } = this.app.model;
    const { videoId } = this.ctx.params;
    let video = await Video.findById(videoId).populate('user', '_id username avatar subscribesCount');
    if (!video) {
      this.ctx.throw(404, 'Video Not Found');
    }
    video = video.toJSON();

    video.isLiked = false; // 是否喜欢
    video.isDisliked = false; // 是否不喜欢
    video.user.Subscribed = false; // 是否已订阅作者

    if (this.ctx.user) {
      const userId = this.ctx.user._id;
      if (await VideoLike.findOne({ user: userId, videoId, like: 1 })) {
        video.isLiked = true;
      }
      if (await VideoLike.findOne({ user: userId, videoId, like: -1 })) {
        video.isDisliked = true;
      }
      if (await Subscription.findOne({ user: userId, channel: video.user._id, like: 1 })) {
        video.user.Subscribed = true;
      }
    }
    this.ctx.body = {
      video,
    };
  }
  async getVideos() {
    const { Video } = this.app.model;
    const { pageNum = 1, pageSize = 10 } = this.ctx.query;
    // const userId = this.ctx.params.userId;
    // // eslint-disable-next-line no-const-assign
    // pageNum = Number.parseInt(pageNum);
    // // eslint-disable-next-line no-const-assign
    // pageSize = Number.parseInt(pageSize);
    const getvideos = Video
      .find()
      .populate('user')
      .sort({
        createdAt: -1,
      })
      .skip((pageNum - 1) * pageSize)
      .limit(Number(pageSize));
    const getvideosCount = Video.countDocuments();
    const [ videos, videosCount ] = await Promise.all([
      getvideos,
      getvideosCount,
    ]);
    this.ctx.body = {
      videos,
      videosCount,
    };
  }
  async getUserVideos() {
    const { Video } = this.app.model;
    const { pageNum = 1, pageSize = 10 } = this.ctx.query;
    const userId = this.ctx.params.userId;
    // // eslint-disable-next-line no-const-assign
    // pageNum = Number.parseInt(pageNum);
    // // eslint-disable-next-line no-const-assign
    // pageSize = Number.parseInt(pageSize);
    const getvideos = Video
      .find({ user: userId })
      .populate('user')
      .sort({
        createdAt: -1,
      })
      .skip((pageNum - 1) * pageSize)
      .limit(Number(pageSize));
    const getvideosCount = Video.countDocuments({ user: userId });
    const [ videos, videosCount ] = await Promise.all([
      getvideos,
      getvideosCount,
    ]);
    this.ctx.body = {
      videos,
      videosCount,
    };
  }
  async getUserFeedVideos() {
    const { Video, Subscription } = this.app.model;
    const { pageNum = 1, pageSize = 10 } = this.ctx.query;
    const userId = this.ctx.user._id;
    // // eslint-disable-next-line no-const-assign
    // pageNum = Number.parseInt(pageNum);
    // // eslint-disable-next-line no-const-assign
    // pageSize = Number.parseInt(pageSize);
    const channels = await Subscription.find({ user: userId }).populate('channel');
    console.log(channels, 'ccc');
    const getvideos = Video
      .find({ user: {
        $in: channels.map(item => item.channel._id),
      } })
      .populate('user')
      .sort({
        createdAt: -1,
      })
      .skip((pageNum - 1) * pageSize)
      .limit(Number(pageSize));
    const getvideosCount = Video.countDocuments({ user: {
      $in: channels.map(item => item.channel._id),
    } });
    const [ videos, videosCount ] = await Promise.all([
      getvideos,
      getvideosCount,
    ]);
    this.ctx.body = {
      videos,
      videosCount,
    };
  }
  async updateVideo() {
    const body = this.ctx.request.body;
    const { Video } = this.app.model;
    const { videoId } = this.ctx.params;
    const userId = this.ctx.user._id;
    // 数据验证
    this.ctx.validate(
      {
        title: { type: 'string', required: false },
        description: { type: 'string', required: false },
        vodVideoId: { type: 'string', required: false },
        cover: { type: 'string', required: false },
      }, body);
    // 查询视频
    const video = await Video.findById(videoId);
    if (!video) {
      this.ctx.throw(404, 'Video Not Found');
    }
    // 视频作者必须是当前登录用户
    if (!video.user.equals(userId)) {
      this.ctx.throw(403);
    }
    const updatevideo = await Video.findByIdAndUpdate(videoId, body, {
      new: true, // 返回更新之后的数据
    });
    this.ctx.body = {
      video: {
        title: updatevideo.title,
        description: updatevideo.description,
        cover: updatevideo.cover,
      },
    };
  }
  async deleteVideo() {
    const { videoId } = this.ctx.params;
    const { Video } = this.app.model;
    const userId = this.ctx.user._id;
    // 查询视频
    const video = await Video.findById(videoId);
    if (!video) {
      this.ctx.throw(404, 'Video Not Found');
    }
    // 视频作者必须是当前登录用户
    if (!video.user.equals(userId)) {
      this.ctx.throw(403);
    }
    await video.remove();
    this.ctx.status = 204;
  }
  async createComment() {
    const { body } = this.ctx.request;
    const { videoId } = this.ctx.params;
    const { Video, Comment } = this.app.model;
    // 数据验证
    this.ctx.validate(
      {
        content: { type: 'string' },
      }, body);
    // 获取评论所属的视频
    const video = await Video.findById(videoId);

    if (!video) {
      this.ctx.throw(404);
    }
    // 创建评论
    const comment = await new Comment({
      content: body.content,
      video: videoId,
      user: this.ctx.user._id,
    }).save();

    // 更新视频的评论数量
    video.commentsCount = await Comment.countDocuments({
      video: videoId,
    });
    console.log(video.commentsCount, 'video.commentsCount');
    video.save();

    // 映射评论所属用户和视频字段数据
    await comment.populate('user').populate('video').execPopulate();

    this.ctx.body = {
      comment,
    };
  }
  async getVideoComments() {
    const { videoId } = this.ctx.params;
    const { Comment } = this.app.model;
    const { pageNum = 1, pageSize = 10 } = this.ctx.query;

    const getComments = Comment
      .find({ video: videoId })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .populate('user')
      .populate('video');
    const getCommentsCount = Comment.countDocuments({
      video: videoId,
    });

    const [ comments, commentsCount ] = await Promise.all([
      getComments,
      getCommentsCount,
    ]);

    this.ctx.body = {
      comments,
      commentsCount,
    };
  }
  async deleteVideoComment() {
    const { videoId, commentId } = this.ctx.params;
    const { Video, Comment } = this.app.model;
    const userId = this.ctx.user._id;
    // 校验视频是否存在
    const video = await Video.findById(videoId);
    if (!video) {
      this.ctx.throw(404, 'Video Not Found');
    }
    // 校验评论是否存在
    const comment = await Comment.findById(commentId);

    if (!comment) {
      this.ctx.throw(404, 'Comment Not Found');
    }
    // 视频作者必须是当前登录用户
    if (!comment.user.equals(userId)) {
      this.ctx.throw(403);
    }
    // 删除视频评论
    await comment.remove();

    // 更新视频的评论数量
    video.commentsCount = await Comment.countDocuments({
      video: videoId,
    });

    video.save();
    this.ctx.status = 204;
  }
  async likeVideo() {
    const { videoId } = this.ctx.params;
    const { Video, Like } = this.app.model;
    const userId = this.ctx.user._id;
    // 校验视频是否存在
    const video = await Video.findById(videoId);
    if (!video) {
      this.ctx.throw(404, 'Video Not Found');
    }
    const doc = await Like.findOne({
      user: userId,
      video: videoId,
    });
    let isLiked = true;
    if (doc && doc.like === 1) {
      await doc.remove();
      isLiked = false;
    } else if (doc && doc.like === -1) {
      await doc.save();
    } else {
      await new Like({
        user: userId,
        video: videoId,
        like: 1,
      }).save();
    }
    // 更新喜欢视频的数量
    video.likesCount = await Like.countDocuments({
      video: videoId,
      like: 1,
    });

    // 更新不喜欢视频的数量
    video.dislikesCount = await Like.countDocuments({
      video: videoId,
      like: -1,
    });

    // 将修改保存到数据库中
    await video.save();

    this.ctx.body = {
      video: {
        ...video.toJSON(),
        isLiked,
      },
    };
  }
  async dislikeVideo() {
    const { videoId } = this.ctx.params;
    const { Video, Like } = this.app.model;
    const userId = this.ctx.user._id;
    // 校验视频是否存在
    const video = await Video.findById(videoId);
    if (!video) {
      this.ctx.throw(404, 'Video Not Found');
    }
    const doc = await Like.findOne({
      user: userId,
      video: videoId,
    });
    let isDisliked = true;
    if (doc && doc.like === -1) {
      await doc.remove();
      isDisliked = false;
    } else if (doc && doc.like === 1) {
      doc.like = -1;
      await doc.save();
    } else {
      await new Like({
        user: userId,
        video: videoId,
        like: -1,
      }).save();
    }
    // 更新喜欢视频的数量
    video.likesCount = await Like.countDocuments({
      video: videoId,
      like: 1,
    });

    // 更新不喜欢视频的数量
    video.dislikesCount = await Like.countDocuments({
      video: videoId,
      like: -1,
    });

    // 将修改保存到数据库中
    await video.save();

    this.ctx.body = {
      video: {
        ...video.toJSON(),
        isDisliked,
      },
    };
  }
  // 获取用户喜欢的视频列表
  async getUserLikedVideos() {
    const { Like, Video } = this.app.model;
    const { pageNum = 1, pageSize = 10 } = this.ctx.query;

    const filterDoc = {
      user: this.ctx.user._id,
      like: 1,
    };

    const likes = await Like
      .find(filterDoc)
      .sort({
        createdAt: -1,
      })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize);

    const getVideos = Video.find({
      _id: {
        $in: likes.map(item => item.video),
      },
    }).populate('user');

    const getVideosCount = Like.countDocuments(filterDoc);

    const [ videos, videosCount ] = await Promise.all([
      getVideos,
      getVideosCount,
    ]);

    this.ctx.body = {
      videos,
      videosCount,
    };
  }
}
module.exports = VideoController;
