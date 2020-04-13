const db = require('../server/config');

const { userService } = require('../services/userService');
const userServ = new userService();

class forumService {
    async insertForum(posts, slug, threads, title, user) {
        const createQuery = 'INSERT INTO forums (posts, slug, threads, title, nickname) '
                        + 'VALUES ($1,$2::citext,$3,$4,$5::citext) RETURNING *';
        try {
            let inserdedForum = await db.query(createQuery, [posts, slug, threads, title, user]);
            return inserdedForum.rows;
        } catch (err)
        {
            console.log('[ERROR]: Error while insertForum');
            console.log(err);
        }
    }

    async getForumBySlug(slug) {
        const selectQuery = 'SELECT * FROM forums WHERE slug = $1::citext';
        try 
        {
            const fForum = await db.query(selectQuery, [slug]);
            return fForum.rows;
        } catch (err)
        {
            console.log('[ERROR]: Error while getForumBySlug');
            console.log(err);
        }
    }

    async updateForumThreads(slug) {
        const updateQuery = 'UPDATE forums SET threads = threads + 1 WHERE slug = $1::citext';
        try 
        {
            await db.query(updateQuery, [slug]);
        } catch (err)
        {
            console.log('[ERROR]: Error while updateForumThreads');
            console.log(err);
        }
    }

    async updateForumPosts(slug) {
        const updateQuery = 'UPDATE forums SET posts = posts + 1 WHERE slug = $1::citext';
        try 
        {
            await db.query(updateQuery, [slug]);
        } catch (err)
        {
            console.log('[ERROR]: Error while updateForumPosts');
            console.log(err);
        }
    }

    async insertUserToForum(nickname, slug) {
        const createQuery = 'INSERT INTO forum_users (about, fullname, nickname, email, forum) '
                        + 'VALUES ($1,$2,$3::citext,$4::citext,$5::citext) ON CONFLICT DO NOTHING ';
        
        const user = await userServ.getUsersByNickname(nickname);
        try {
            await db.query(createQuery, [user[0].about, user[0].fullname, nickname, user[0].email, slug]);
        } catch (err)
        {
            console.log('[ERROR]: Error while insertUserToForum');
            console.log(err);
        }
    }
}

module.exports = {
    forumService,
}