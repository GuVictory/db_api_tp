const Router = require('express-promise-router');
const bodyParser = require('body-parser');
var jsonParser = bodyParser.json()

const { forumModel, getForumJSON } = require('../modules/forumModel');
const { getUserJSON } = require('../modules/userModel');
const { getThreadJSON } = require('../modules/threadModel');
const { resAnswer } = require('../utils/answers');
const { errMessagesNotFound } = require('../utils/errorMessages');

const { threadModel } = require('../modules/threadModel');
const { userService } = require('../services/userService');
const { forumService } = require('../services/forumService');
const { threadService } = require('../services/threadService');

const router = new Router();
const userServ = new userService();
const forumServ = new forumService();
const threadServ = new threadService();

module.exports = router;

router.post('/create', jsonParser, async (req, res) => 
    {
        let forum = new forumModel(0, req.body.slug, 0, req.body.title, req.body.user);

        let fForum = await forumServ.getForumBySlug(forum.slug);
        let fUser = await userServ.getUsersByNickname(forum.user);

        if (fUser.length === 0 ) {
            res.status(resAnswer.notFound).send(errMessagesNotFound('nickname', forum.user));
            return;
        }

        if (fForum.length !== 0) {
            res.status(resAnswer.alreadyExist).send(getForumJSON(fForum)[0]);
        } else {
            let insertedForum = await forumServ.insertForum(0, forum.slug, forum.threads, forum.title, fUser[0].nickname);
            res.status(resAnswer.Created).send(getForumJSON(insertedForum)[0]);
        }
    }
)

router.get('/:slug/details', jsonParser, async (req, res) => 
    {
        const slug = req.params.slug;
        let foundedForum =  await forumServ.getForumBySlug(slug);
        if (foundedForum.length !== 0) {
            res.status(resAnswer.OK).send(getForumJSON(foundedForum)[0]);
        } else {
            res.status(resAnswer.notFound).send(errMessagesNotFound('forum', slug));
        }
    }
)

router.post('/:slug/create', jsonParser, async (req, res) => 
    {
        req.body.forum = req.params.slug;
        const thread = new threadModel(req.body.author, req.body.created, req.body.forum, req.body.id, req.body.message, req.body.slug, req.body.title, 0);

        const user = await userServ.getUsersByNickname(thread.author);
        if (user.length === 0) {
            res.status(resAnswer.notFound).send(errMessagesNotFound('nickname', thread.author));
            return;
        }
        const forum = await forumServ.getForumBySlug(thread.forum)
        if (forum.length === 0) {
            res.status(resAnswer.notFound).send(errMessagesNotFound('forum', thread.slug));
            return;
        }
        if (thread.slug) {
            const conflictThread = await threadServ.getThreadBySlug(thread.slug);
            if (conflictThread.length !== 0) {
                res.status(resAnswer.alreadyExist).send(getThreadJSON(conflictThread)[0]);
                return;
            }
        }
        let threadCreated = await threadServ.insertThread(user[0].nickname, thread.created, forum[0].slug, thread.message, thread.slug, thread.title, 0);
        await forumServ.updateForumThreads(forum[0].slug);

        res.status(resAnswer.Created).send(getThreadJSON(threadCreated)[0]);
    }
)

router.get('/:slug/threads', jsonParser, async (req, res) => 
    {
        const slug = req.params.slug;
        let limit = req.query.hasOwnProperty('limit') ? parseInt(req.query.limit) : 0;
        let desc = (req.query.desc === 'true') ? true : false;
        let since = req.query.hasOwnProperty('since') ? req.query.since : null;

        let foundedForum =  await forumServ.getForumBySlug(slug);
        if (foundedForum.length === 0) {
            res.status(resAnswer.notFound).send(errMessagesNotFound('forum', slug));
            return;
        }

        let forumThreads = await threadServ.getThreadsBySlug(slug, limit, since, desc);
        res.status(resAnswer.OK).send(getThreadJSON(forumThreads));
    }
)

router.get('/:slug/users', jsonParser, async (req, res) => 
    {
        const slug = req.params.slug;
        let limit = req.query.hasOwnProperty('limit') ? parseInt(req.query.limit) : 0;
        let desc = (req.query.desc === 'true') ? true : false;
        let since = req.query.hasOwnProperty('since') ? req.query.since : null;

        let foundedForum =  await forumServ.getForumBySlug(slug);
        if (foundedForum.length === 0) {
            res.status(resAnswer.notFound).send(errMessagesNotFound('forum', slug));
            return;
        }

        let forumUsers = await userServ.getUsersByForum(slug, limit, since, desc);
        res.status(resAnswer.OK).send(getUserJSON(forumUsers));
    }
)