const db = require('../server/config');
const { postModel, getPostJSON } = require('../modules/postModel');
const { userModel, getUserJSON } = require('../modules/userModel');
const { getForumJSON } = require('../modules/forumModel');
const { getThreadJSON } = require('../modules/threadModel');

const { threadService } = require('./threadService');
const { userService } = require('./userService');
const { forumService } = require('./forumService');
const threadServ = new threadService();
const userServ = new userService();
const forumServ = new forumService();

const MAX_ID = 2147483647;

class postService {

    async getNextPostId() {
        let selectQuery = "SELECT nextval(pg_get_serial_sequence('posts', 'id'))";
        try {
            let res = await db.query(selectQuery, []);
            return res.rows[0].nextval;
        } catch (err) {
            console.log('[ERROR]: wtile getNextPostId');
            console.log(err);
        }
    }

    async getPostById(id) {
        let selectQuery = "select author, created, forum, id, isedited, message, parent, thread from posts where id = $1";
        try {
            let res = await db.query(selectQuery, [id]);
            return res.rows;
        } catch (err) {
            console.log('[ERROR]: wtile getPostById');
            console.log(err);
        }
    }

    async getPathById(id) {
        let selectQuery = "SELECT path FROM posts WHERE id = $1";
        try {
            let res = await db.query(selectQuery, [id]);
            return res.rows[0].path;
        } catch (err) {
            console.log('[ERROR]: wtile getPathById');
            console.log(err);
        }
    }

    async insertPost(posts, slug_or_id) {
        let insertQuery = 'INSERT INTO posts ' +
            '(author, created, forum, isEdited, message, parent, thread )' +
            ' VALUES ($1, $2::TIMESTAMPTZ, $3, $4, $5, $6, $7) RETURNING id';

        let currentTime = new Date().toISOString();
        
        let nextId = await this.getNextPostId();
        let thread = await threadServ.getThreadBySlugOrId(slug_or_id);

        let realPosts = [];
        posts.forEach((post, indx) => {
            realPosts.push( new postModel(post.author, 
                                    currentTime, 
                                    thread[0].forum,
                                    0,
                                    false, 
                                    post.message, 
                                    post.hasOwnProperty('parent') ? post.parent : 0,
                                    thread[0].id))
        })


        let users = [];
        let correctPosts = [];

        for ( let post of realPosts ) {
            let postAuthor = await userServ.getUsersByNickname(post.author);
            if (postAuthor.length === 0) {
                return { message: `user with nickname ${post.author} not found`,
                        status: 404  }
            }
            let user = new userModel(postAuthor[0]);
            users.push(user);

            let path = [];

            let parentPostFound = await this.getPostById(post.parent);
            if (post.parent !== 0 && parentPostFound.length === 0) {
                return { message: `parent post with id ${post.parent} not found`,
                         status: 409 
                        }
            } else {
                let parentPost = null;
                if (post.parent !== 0)
                    parentPost = new postModel(parentPostFound[0].author, 
                                                parentPostFound[0].created, 
                                                parentPostFound[0].forum,
                                                parentPostFound[0].id, 
                                                parentPostFound[0].isEdit, 
                                                parentPostFound[0].message, 
                                                parentPostFound[0].parent,
                                                parentPostFound[0].thread)

                if (post.parent !== 0 && parentPostFound.length !== 0 && parentPost.thread != thread[0].id) {
                    return { message: `parent thread is not the same`,
                             status: 409 
                            }
                }
                if (post.parent !== 0) {
                    path = await this.getPathById(post.parent);
                }
                post.path = path;
                correctPosts.push(post);
            }
        }

        for( let post of correctPosts) {
            let id = await db.query(insertQuery, [post.author, post.created, post.forum, post.isEdited, post.message, post.parent, post.thread])
            // array_append($7, $8::INTEGER), post.path, post.id,
            console.log(id.rows[0].id);
            console.log(post.path);
            await db.query('update posts set path = $1::integer[] || $2::INTEGER where id = $3', [post.path, id.rows[0].id, id.rows[0].id])
            post.id = id.rows[0].id;
        }
        return correctPosts;
    }

    async updatePost(post, oldPost) {
        let updateQuery = "UPDATE posts SET ( author, created, forum, isEdited, message) = ($1,$2::TIMESTAMPTZ,$3,$4,$5) WHERE id = $6";

        if (post.author != null) {
            if (oldPost.author !== post.author) {
                oldPost.author = post.author;
                oldPost.isEdited = true;
            }
        }
        if (post.created != null) {
            if (oldPost.created !== post.created) {
                oldPost.created != post.created;
                oldPost.isEdited = true;
            }
        }
        if (post.forum != null) {
            if (oldPost.forum !== post.forum) {
                oldPost.forum = post.forum;
                oldPost.isEdited = true;
            }
        }
        if (post.message != null) {
            if (oldPost.message !== post.message) {
                oldPost.message = post.message;
                oldPost.isEdited = true;
            }
        }

        try {
            await db.query(updateQuery, [oldPost.author,
                                            oldPost.created,
                                            oldPost.forum,
                                            oldPost.isEdited,
                                            oldPost.message,
                                            oldPost.id]);
            return oldPost;
        } catch (err) {
            console.log('[ERROR]: wtile updatePost');
            console.log(err);
        }
    }

    async getFullModel(id, flags) {

        let result = {};
        let post = await this.getPostById(id);


        result.post = getPostJSON(post)[0];



        if (flags.indexOf('user') != -1) {
            let user = await userServ.getUsersByNickname(post[0].author);
            result.author = getUserJSON(user)[0];
        }
        if (flags.indexOf('forum') != -1) {
            let forum = await forumServ.getForumBySlug(post[0].forum);
            result.forum = getForumJSON(forum)[0];
        }
        if (flags.indexOf('thread') != -1) {
            let thread = await threadServ.getThreadById(post[0].thread)
            result.thread = getThreadJSON(thread)[0];
        }

        return result;
    }

    async getPosts(id, limit, since, sort, desc) {

        if (sort === 'tree') {
            let  { sqlQuery, data } = this.createTreeSortQuery(id, limit, since, desc);
            let result = await db.query(sqlQuery, data);
            return result.rows;
        } else if(sort === 'parent_tree') {
            let  { sqlQuery, data } = this.createParentTreeSortQuery(id, limit, since, desc);
            let result = await db.query(sqlQuery, data);
            return result.rows;
        } else {
            let  { sqlQuery, data } = this.createNormalSortQuery(id, limit, since, desc);
            console.log(sqlQuery);
            console.log(data);
            let result = await db.query(sqlQuery, data);
            return result.rows;
        }
    }


    createTreeSortQuery = (thread, limit, since, desc) => {
        let selectQuery = 'SELECT author, created, forum, id, isedited, message, parent, thread FROM posts WHERE thread = $1 ';
        let usedData = [thread];
        if (desc) {
            if (since !== 0 && since !== MAX_ID) {
                selectQuery += ' and path < (select path from posts where id  = $2) '
                usedData.push(since);
            } else {
                selectQuery +=  ' and path[1] < $2 '; 
                usedData.push(since);
            }
            selectQuery += ' order by path DESC ';
        } else {
            if (since !== 0 && since !== MAX_ID) {
                selectQuery += ' and path > (select path from posts where id  = $2) ';
                usedData.push(since);
            } else {
                selectQuery +=  ' and path[1] > $2 '; 
                usedData.push(since);
            }
            selectQuery += ' order by path ';
        }

        if (limit != null) {
            selectQuery += " limit $3 ";
            usedData.push(limit);
        }

        return { sqlQuery: selectQuery, data: usedData }
    }

    createParentTreeSortQuery = (thread, limit, since, desc) => {
        let selectQuery = 'SELECT author, created, forum, id, isedited, message, parent, thread FROM posts '
                    + 'where thread = $1 and path[1] in (select distinct path[1] from posts ';
        let usedData = [thread];

        if (desc) {
            if (since !== 0 && since !== MAX_ID) {
                selectQuery += ' where thread = $2 and path[1] < (select path[1] from posts where id = $3) order by path[1] desc ';
                usedData.push(thread);
                usedData.push(since);

            } else {
                selectQuery +=  ' where thread = $2 and path[1] <  $3 order by path[1] desc '; 
                usedData.push(thread);
                usedData.push(since);
            }

            if (limit != null) {
                selectQuery += ' limit $4) ';
                usedData.push(limit);
            } else {
                selectQuery += ' ) ';
            }

            selectQuery += ' order by path[1] DESC ';
        } else {
            if (since !== 0 && since !== MAX_ID) {
                selectQuery += ' where thread = $2 and path[1] > (select path[1] from posts where id = $3) order by path[1] ';
                usedData.push(thread);
                usedData.push(since);

            } else {
                selectQuery +=  ' where thread = $2 and path[1] > $3 order by path[1] '; 
                usedData.push(thread);
                usedData.push(since);
            }

            if (limit != null) {
                selectQuery += ' limit $4) ';
                usedData.push(limit);
            } else {
                selectQuery += ' ) ';
            }

            selectQuery += ' order by path[1] ';
        }
        selectQuery += " , path ";

        return { sqlQuery: selectQuery, data: usedData }
    }

    createNormalSortQuery = (thread, limit, since, desc) => {
        let selectQuery = ' SELECT author, created, forum, id, isedited, message, parent, thread FROM posts WHERE thread = $1'
        let usedData = [thread, since];

        if (desc) {
            selectQuery += ' and id < $2 order by id  DESC ';
        } else {
            selectQuery += ' and id > $2 order by id  ';
        }

        if (limit !== 0) {
            usedData.push(limit);
            selectQuery += ' LIMIT $3'
        }

        return { sqlQuery: selectQuery, data: usedData }
    }

}

module.exports = {
    postService,
}
