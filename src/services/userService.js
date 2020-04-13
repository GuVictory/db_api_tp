const db = require('../server/config');

class userService {
    async getSameUsers(nickname, email) {
        const selectQuery = 'SELECT * FROM users WHERE nickname = $1::citext OR email = $2::citext';
        try 
        {
            const fUsers = await db.query(selectQuery, [nickname, email]);
            return fUsers.rows;
        } catch (err)
        {
            console.log('[ERROR]: Error while getSameUsers');
            console.log(err);
        }
    }

    async insertUser(about, email, fullname, nickname) {
        const createQuery = 'INSERT INTO users (about, email, fullname, nickname) VALUES ($1, $2, $3, $4)';
        try 
        {
            await db.query(createQuery, [about, email, fullname, nickname]);
        } catch (err)
        {
            console.log('[ERROR]: Error while insertUser');
            console.log(err);
        }
    }

    async getUsersByNickname(nickname) {
        const selectQuery = 'SELECT * FROM users WHERE nickname = $1::citext';
        try 
        {
            const fUsers = await db.query(selectQuery, [nickname]);
            return fUsers.rows;
        } catch (err)
        {
            console.log('[ERROR]: Error while getUsersByNickname');
            console.log(err);
        }
    }

    async updateUserByNickname(user, oldUser) {
        let createQuery = 'UPDATE users SET (about, email, fullname, nickname) '
                    + ' = ($1::citext, $2::citext, $3::citext, $4::citext) WHERE nickname = $5::citext';
        
        if(user.about != null){
            oldUser.about = user.about;
        }
        if(user.email != null){
            oldUser.email = user.email;
        }
        if(user.fullname != null){
            oldUser.fullname = user.fullname;
        }
        if(user.nickname != null){
            oldUser.nickname = user.nickname;
        }   
        
        
        await db.query(createQuery, [oldUser.about, oldUser.email, oldUser.fullname, oldUser.nickname, oldUser.nickname]);
    }

    async getUsersByForum(slug, limit, since, desc) {
        let selectQuery = 'SELECT DISTINCT about, email, fullname, nickname FROM forum_users WHERE forum = $1::citext ';
        let dataInUse = [slug];
        let counter = 1;

        if (since !== null) {
            dataInUse.push(since);
            counter++;
            if (!desc) {
                selectQuery += ' AND nickname > $2::citext ';
            } else {
                selectQuery += ' AND nickname < $2::citext ';
            }
        }
        
        selectQuery += ' ORDER BY nickname ';
        if (desc) {
            selectQuery += ' DESC ';
        }

        if (limit != 0) {
            counter++;
            dataInUse.push(limit);
            selectQuery += ' LIMIT $' + counter + '::bigint';
        }

        try {
            let users = await db.query(selectQuery, dataInUse);
            return users.rows;
        } catch (err) {
            console.log('[ERROR]: Error while getUsersByForum');
            console.log(err);
        }
    }

}

module.exports = {
    userService,
}