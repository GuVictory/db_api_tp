class forumModel {

    constructor(posts, slug, threads, title, user) {
        this._posts = posts;
        this._slug = slug;
        this._threads = threads;
        this._title = title;
        this._user = user;
    }

    get posts() {
        return this._posts;
    }

    set posts(posts) {
        this._posts = posts;
    }

    get slug() {
        return this._slug;
    }

    set slug(slug) {
        this._slug = slug;
    }

    get threads() {
        return this._threads;
    }

    set threads(threads) {
        this._threads = threads;
    }

    get title() {
        return this._title;
    }

    set title(title) {
        this._title = title;
    }

    get user() {
        return this._user;
    }

    set user(user) {
        this._user = user;
    }
    
    getForumJSON() {
        return {
            posts: this.posts,
            threads: this.threads,
            slug: this.slug,
            title: this.title,
            user: this.user,
        }
    }
}

const getForumJSON = (forums) => {
    let result = [];
    forums.forEach(forum => {
        result.push(
            {
                posts: forum.posts,
                threads: forum.threads,
                slug: forum.slug,
                title: forum.title,
                user: forum.nickname,
            }
        )
    });
    return result;
}

module.exports = {
    forumModel,
    getForumJSON
}