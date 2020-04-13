const Router = require('express-promise-router');
const db = require('../server/config');
const bodyParser = require('body-parser');
var jsonParser = bodyParser.json()

const { userModel, getUserJSON } = require('../modules/userModel');
const { resAnswer } = require('../utils/answers');
const { errMessagesNotFound } = require('../utils/errorMessages');
const { userService } = require('../services/userService')

const router = new Router();
const userServ = new userService();

module.exports = router;

router.post('/:nickname/create', jsonParser, async (req, res) => 
    {
        req.body.nickname = req.params.nickname;
        let user = new userModel(req.body);

        let checkSameUser = await userServ.getSameUsers(user.nickname, user.email);
        
        if (checkSameUser.length !== 0) {
            res.status(resAnswer.alreadyExist).send(getUserJSON(checkSameUser));
        } else {
            await userServ.insertUser(user.about, user.email, user.fullname, user.nickname)
            res.status(resAnswer.Created).send(user.getUserJSON());
        }
    }
)

router.post('/:nickname/profile', jsonParser, async (req, res) => {
        req.body.nickname = req.params.nickname;
        let user = new userModel(req.body);

        if (user.email != null) {
            let userConflict = await userServ.getSameUsers(user.nickname, user.email);
            if (userConflict.length !== 1 ) {
                res.status(resAnswer.alreadyExist).send(errMessagesNotFound('email', user.email));
                return;
            }
        }
        
        let oldUser = await userServ.getUsersByNickname(user.nickname);
        if (oldUser.length !== 0) {
            let oldU = new userModel(oldUser[0]);
            await userServ.updateUserByNickname(user, oldU);
            let resUser = await userServ.getUsersByNickname(oldU.nickname)
            res.status(resAnswer.OK).send(getUserJSON(resUser)[0])
        } else {
            res.status(resAnswer.notFound).send(errMessagesNotFound('nickname', user.nickname))
        }
    }
)

router.get('/:nickname/profile', jsonParser, async (req, res) => {
        let nickname = req.params.nickname;
        let user = await userServ.getUsersByNickname(nickname);

        if (user.length !== 0) {
            res.status(resAnswer.OK).send(getUserJSON(user)[0])
        } else {
            res.status(resAnswer.notFound).send(errMessagesNotFound('nickname', user))
        }
    }
)
