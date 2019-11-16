const { UserInputError, AuthenticationError } = require('apollo-server');

const { checkAuth } = require('../../util/check-auth');
const Post = require('../../models/Post');

const Mutations = {
    createComment: async (_, { postId, body }, context) => {
        const { username } = checkAuth(context);
        if (body.trim() === '') {
          throw new UserInputError('Empty Comment', {
            errors: {
              body: 'Comment Required'
            }
          })
        }

        const post = await Post.findById(postId)

        if (post) {
          post.comments.unshift({
            body,
            username,
            createdAt: new Date().toISOString()
          })
          await post.save();
          return post;
        } else { throw new UserInputError('Post not found') }
    },
    deleteComment: async (_, { postId, commentId }, context) => {
        const { username } = checkAuth(context)

        const post = await Post.findById(postId)

        if (post) {
            const i = post.comments.findIndex((c) => c.id === commentId)
            if(post.comments[i].username === username) {
                post.comments.splice(i, 1)
                await post.save()
                return post
            } else {
                throw new AuthenticationError('Action not allowed')
            }
        } else {
            throw new UserInputError('Post not found')
        }
    }
}

module.exports = { Mutations }