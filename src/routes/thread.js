const Router = require('express-promise-router');
const bodyParser = require('body-parser');
var jsonParser = bodyParser.json()

const { threadModel, getThreadJSON } = require('../modules/threadModel');
const { voteModule } = require('../modules/voteModule');
const { getPostJSON } = require('../modules/postModel');
const { resAnswer } = require('../utils/answers');
const { errMessagesNotFound } = require('../utils/errorMessages');
const { userService } = require('../services/userService');
const { forumService } = require('../services/forumService');
const { threadService } = require('../services/threadService');
const { postService } = require('../services/postService');

const router = new Router();
const userServ = new userService();
const forumServ = new forumService();
const threadServ = new threadService();
const postServ = new postService();
const MAX_ID = 2147483647;

module.exports = router;

router.post('/:slug_or_id/create', jsonParser, async (req, res) => 
    {
        let slug_or_id = req.params.slug_or_id;
        let posts = req.body;

        let foundedThread = await threadServ.getThreadBySlugOrId(slug_or_id);
        if (foundedThread.length === 0) {
            res.status(resAnswer.notFound).send(errMessagesNotFound('thread', slug_or_id));
            return;
        }

        if (posts.length === 0 ) {
            res.status(resAnswer.Created).send([]);
            return;
        }

        let addedPosts = await postServ.insertPost(posts, slug_or_id);
        if (addedPosts.hasOwnProperty('message')) {
            res.status(addedPosts.status).send({ message:  addedPosts.message });
            return;
        } 

        for (let post of addedPosts) {
            await forumServ.insertUserToForum(post.author, post.forum);
            await forumServ.updateForumPosts(post.forum);
        }

        res.status(resAnswer.Created).send(getPostJSON(addedPosts));
    }
)

router.get('/:slug_or_id/details', jsonParser, async (req, res) => 
    {
        let slug_or_id = req.params.slug_or_id;
        let foundedThread = await threadServ.getThreadBySlugOrId(slug_or_id);
        if (foundedThread.length === 0) {
            res.status(resAnswer.notFound).send(errMessagesNotFound('thread', slug_or_id));
            return;
        }
        res.status(resAnswer.OK).send(getThreadJSON(foundedThread)[0]);
    }
)

router.post('/:slug_or_id/vote', jsonParser, async (req, res) => 
    {
        let slug_or_id = req.params.slug_or_id;
        let foundedThread = await threadServ.getThreadBySlugOrId(slug_or_id);
        if (foundedThread.length === 0) {
            res.status(resAnswer.notFound).send(errMessagesNotFound('thread', slug_or_id));
            return;
        }
        let foundedUser = await userServ.getUsersByNickname(req.body.nickname);
        if (foundedUser.length === 0) {
            res.status(resAnswer.notFound).send(errMessagesNotFound('nickname', req.body.nickname));
            return;
        }

        let vote = new voteModule(foundedThread[0].id, foundedUser[0].nickname, req.body.voice);

        await threadServ.setVote(vote);
        await threadServ.updateVotesByIdThread(foundedThread[0].id)

        let foundedThread2 = await threadServ.getThreadBySlugOrId(slug_or_id);
        res.status(resAnswer.OK).send(getThreadJSON(foundedThread2)[0]);
    }
)

router.post('/:slug_or_id/details', jsonParser, async (req, res) => 
    {
        let slug_or_id = req.params.slug_or_id;
        let foundedThread = await threadServ.getThreadBySlugOrId(slug_or_id);

        if (foundedThread.length === 0) {
            res.status(resAnswer.notFound).send(errMessagesNotFound('thread', slug_or_id));
            return;
        }
        //  author, created, forum, id, message, slug, title, votes
        let thread = new threadModel(foundedThread[0].author, 
                                    foundedThread[0].created, 
                                    foundedThread[0].forum,
                                    foundedThread[0].id,
                                    foundedThread[0].message, 
                                    foundedThread[0].slug,
                                    foundedThread[0].title,
                                    foundedThread[0].votes);

        let newThread = new threadModel(req.body.author, 
                                    req.body.created, 
                                    req.body.forum,
                                    req.body.id,
                                    req.body.message, 
                                    req.body.slug,
                                    req.body.title,
                                    req.body.votes);
        
        let result = await threadServ.updateThread(newThread, thread)

        res.status(resAnswer.OK).send(result.getThreadJSON());
    }
)

router.get('/:slug_or_id/posts', jsonParser, async (req, res) => 
    {
        let slug_or_id = req.params.slug_or_id;
        let foundedThread = await threadServ.getThreadBySlugOrId(slug_or_id);
        if (foundedThread.length === 0) {
            res.status(resAnswer.notFound).send(errMessagesNotFound('thread', slug_or_id));
            return;
        }

        let limit = req.query.hasOwnProperty('limit') ? parseInt(req.query.limit) : 0;
        let desc = (req.query.desc === 'true') ? true : false;
        let sort = req.query.sort;
        let since = req.query.hasOwnProperty('since') ? req.query.since : (desc ? MAX_ID : 0);

        let posts = await postServ.getPosts(foundedThread[0].id, limit, since, sort, desc)

        console.log('[DEBUG]: posts: ')
        console.log(posts);

        res.status(resAnswer.OK).send(getPostJSON(posts));
    }
)