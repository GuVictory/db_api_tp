const db = require('../server/config');

const { voteModule } = require('../modules/voteModule');
const { forumService } = require('./forumService');
const forumServ = new forumService();

class threadService {
    async insertThread(author, created, forum, message, slug, title, votes) {
        await forumServ.updateForumThreads(author);

        await forumServ.insertUserToForum(author, forum);
        try {
            if (slug == null) {
                let createQuery = 'INSERT INTO threads (author, created, forum, message, title, votes) VALUES ( $1::citext, $2::TIMESTAMPTZ, $3, $4, $5, $6 ) RETURNING *'
                let inserdedThread = await db.query(createQuery, [author, created, forum, message, title, votes]);
                return inserdedThread.rows;
            } else {
                let createQuery = 'INSERT INTO threads (author, created, forum, message, slug, title, votes) VALUES ($1, $2::TIMESTAMPTZ, $3, $4, $5, $6, $7) RETURNING *'
                let inserdedThread = await db.query(createQuery, [author, created, forum, message, slug, title, votes]);
                return inserdedThread.rows;
            }
        } catch (err)
        {
            console.log('[ERROR]: Error while insertForum');
            console.log(err);
        }
    }

    async getThreadBySlug(slug) {
        const selectQuery = 'SELECT * FROM threads WHERE slug = $1::citext';
        try 
        {
            const fThread = await db.query(selectQuery, [slug]);
            return fThread.rows;
        } catch (err)
        {
            console.log('[ERROR]: Error while getThreadBySlug');
            console.log(err);
        }
    }

    async getThreadBySlugOrId(slug_or_id) {
        let selectQuery = slug_or_id.match(/^\d+$/) 
                        ? 'select * from threads where  id = $1 ' 
                        : 'select * from threads where  slug = $1::citext ';

        try 
        {
            const fThread = await db.query(selectQuery, [slug_or_id]);
            return fThread.rows;
        } catch (err)
        {
            console.log('[ERROR]: Error while getThreadBySlugOrId');
            console.log(err);
        }
    }

    async getThreadById(id) {
        let selectQuery = 'select * from threads where  id = $1 '

        try 
        {
            const fThread = await db.query(selectQuery, [id]);
            return fThread.rows;
        } catch (err)
        {
            console.log('[ERROR]: Error while getThreadById');
            console.log(err);
        }
    }

    async getThreadsBySlug(slug, limit, since, desc) {
        let selectQuery = 'SELECT * FROM threads WHERE forum = $1::citext ';
        let valInUse = [slug];

        if (!since) {
            if (desc) {
                selectQuery += ' ORDER BY created DESC ';
            } else {
                selectQuery += ' ORDER BY created ';
            }
            if (limit !== 0) {
                valInUse.push(limit);
                selectQuery += ' LIMIT $2 ';
            }
            
            let result = await db.query(selectQuery, valInUse);
            return result.rows;
        } else {
            valInUse.push(since);
            if (desc) {
                selectQuery += ' AND created <= $2::timestamptz ORDER BY created DESC ';
            } else {
                selectQuery += ' AND created >= $2::timestamptz ORDER BY created ';
            }
            if (limit !== 0) {
                valInUse.push(limit);
                selectQuery += ' LIMIT $3 ';
            }
            
            let result = await db.query(selectQuery, valInUse);
            return result.rows;
        }
    }

    async getVote(vote) {
        let selectQuery = 'SELECT * FROM votes WHERE thread = $1 AND nickname = $2::citext ';
        
        try {
            let foundedVote = await db.query(selectQuery, [vote.thread, vote.nickname])
            return foundedVote.rows;
        } catch (err) {
            console.log('[ERROR]: while getVote');
            console.log(err);
        }
    }

    async setVote(vote) {
        let foundedVote = await this.getVote(vote);

        try {
            if (foundedVote.length !== 0) {
                let updateQuery = 'UPDATE votes SET (nickname, thread, voice) = ($1, $2, $3) WHERE thread = $4 AND  nickname = $5::citext';
                await db.query(updateQuery, [vote.nickname, vote.thread, vote.voice, vote.thread, vote.nickname]);
            } else {
                let insertQuery = 'INSERT INTO  votes (nickname, thread, voice) VALUES ($1, $2, $3)'
                await db.query(insertQuery, [vote.nickname, vote.thread, vote.voice]);
            }
     
        } catch (err) {
            console.log('[ERROR]: while setVote');
            console.log(err);
        }
    }

    async updateVotesByIdThread(id) {
        let selectQuery = 'SELECT sum(voice) AS sum FROM votes WHERE thread = $1';
        let updateQuery = 'UPDATE threads SET votes = $1 WHERE id = $2';

        try {
            let newVotes = await db.query(selectQuery, [id]);
            await db.query(updateQuery, [newVotes.rows[0].sum, id]);
        } catch (err) {
            console.log('[ERROR]: while updateVotesByIdThread');
            console.log(err);
        }
        
    } 

    async updateThread(thread, oldThread) {
        let updateQuery = 'UPDATE threads SET ( author, created, forum, message, slug, title)'
                        + ' = ($1,$2::timestamptz,$3,$4,$5,$6) WHERE id = $7';

        if (thread.author != null) {
            oldThread.author = thread.author;
        }
        if (thread.forum != null) {
            oldThread.forum = thread.forum;
        }
        if (thread.message != null) {
            oldThread.message = thread.message;
        }
        if (thread.slug != null) {
            oldThread.slug != null;
        }
        if (thread.title != null) {
            oldThread.title = thread.title;
        }

        try {
            await db.query(updateQuery, [oldThread.author, 
                                        oldThread.created, 
                                        oldThread.forum, 
                                        oldThread.message,
                                        oldThread.slug,
                                        oldThread.title,
                                        oldThread.id]);

            return oldThread;
        } catch (err) {
            console.log('[ERROR]: while updateThread');
            console.log(err);
        }
        
    } 
}

module.exports = {
    threadService ,
}