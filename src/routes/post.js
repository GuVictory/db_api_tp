const Router = require('express-promise-router');
const bodyParser = require('body-parser');
var jsonParser = bodyParser.json()

const { postModel, getPostJSON } = require('../modules/postModel');
const { voteModule } = require('../modules/voteModule');
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

module.exports = router;


router.post('/:id/details', jsonParser, async (req, res) => 
    {
        let id = req.params.id;

        let foundedPost = await postServ.getPostById(id);

        if (foundedPost.length === 0) {
            res.status(resAnswer.notFound).send(errMessagesNotFound('post_id', id));
            return;
        }

        if (Object.keys(req.body) == 0) {
            res.status(resAnswer.OK).send(getPostJSON(foundedPost)[0]);
            return;
        }

        let post = new postModel(
            foundedPost[0].author,
            foundedPost[0].created,
            foundedPost[0].forum,
            foundedPost[0].id,
            foundedPost[0].isEdited,
            foundedPost[0].message,
            foundedPost[0].parent,
            foundedPost[0].thread
        );

        let newPost = new postModel(
            req.body.author,
            req.body.created,
            req.body.forum,
            req.body.id,
            req.body.isEdited,
            req.body.message,
            req.body.parent,
            req.body.thread
        );

        let resPost = await postServ.updatePost(newPost, post);
        res.status(resAnswer.OK).send(resPost.getPostJSON());
    }
)

router.get('/:id/details', jsonParser, async (req, res) => 
    {
        let id = req.params.id;
        let foundedPost = await postServ.getPostById(id);

        if (foundedPost.length === 0) {
            res.status(resAnswer.notFound).send(errMessagesNotFound('post_id', id));
            return;
        }
        let related = req.query.related;
        
        let result = await postServ.getFullModel(id, related === undefined ? '' : related);
        res.status(resAnswer.OK).send(result);
        
    }
)
