const Router = require('express-promise-router');
const bodyParser = require('body-parser');
var jsonParser = bodyParser.json()
const { resAnswer } = require('../utils/answers');

const db = require('../server/config');

const router = new Router();
module.exports = router;

router.post('/clear', jsonParser, async (req, res) => 
    {
        await db.query('TRUNCATE forums, forum_users, users, threads, posts, votes', []);
        res.status(resAnswer.OK).send(null);
    }
)

router.get('/status', jsonParser, async (req, res) => 
    {
        let users = await db.query('SELECT COUNT(*) as cnt from users', []);
        let posts = await  db.query('SELECT COUNT(*) as cnt from posts', []);
        let threads = await db.query('SELECT COUNT(*) as cnt from threads', []);
        let forums = await db.query('SELECT COUNT(*) as cnt from forums', []);

        res.status(resAnswer.OK).send({
            forum: parseInt(forums.rows[0].cnt),
            post: parseInt(posts.rows[0].cnt),
            thread: parseInt(threads.rows[0].cnt),
            user: parseInt(users.rows[0].cnt),
        });
    }
)