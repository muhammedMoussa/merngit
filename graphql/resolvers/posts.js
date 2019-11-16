const { AuthenticationError, UserInputError } = require('apollo-server');

const Post = require('../../models/Post')
const { checkAuth } = require('../../util/check-auth')

module.exports = {
  Query: {
    getPosts: async () => {
      try {
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },
    getPost: async (_, {postId}) => {
      try {
        const post = await Post.findById(postId)
        if (post) {
          return post
        } else {
          throw new Error('Post Not Found');
        }
      } catch (error) {
        throw new Error(error);
      }
    }
  },
  Mutation: {
    createPost: async (_, { body }, context) => {
      const user = checkAuth(context)

      if (body.trim() === '') {
        throw new Error('Post Required!')
      }

      const newPost = new Post({
        body: body,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0
      })

      const post = await newPost.save()

      context.pubsub.publish('NEW_POST_CREATED', {
        newPost: post
      })
      return post
    },
    deletePost: async (_, { postId }, context) => {
      const user = checkAuth(context)
      const post = await Post.findById(postId)

      try {
        if (user.username === post.username) {
          await post.delete()
          return 'Post deleted successfully'
        } else {
          throw new AuthenticationError('Action not allowed')
        }
      } catch (error) {
        throw new Error(error)
      }
    },
    likePost: async (_, { postId }, context) => {
      const { username } = checkAuth(context)
      const post = await Post.findById(postId)
      if (post) {
        if (post.likes.find((like) => like.username === username)) {
          post.likes = post.likes.filter((like) => like.username !== username);
        } else {
          post.likes.push({
            username,
            createdAt: new Date().toISOString()
          })
        }

        await post.save()
        return post
      } else {
        throw new UserInputError('Post not found')
      }
    }
  },
  Subscription: {
    newPost: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_POST_CREATED')
    }
  }
}