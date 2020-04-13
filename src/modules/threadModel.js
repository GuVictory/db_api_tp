class threadModel {
    constructor(author, created, forum, id, message, slug, title, votes) {
        this._author = author;
        this._created = created;
        this._forum = forum;
        this._id = id;
        this._message = message;
        this._slug = slug;
        this._title = title;
        this._votes = votes;
    }

    get author() {
        return this._author;
    }

    set author(author) {
        this._author = author;
    }

    get created() {
        return this._created;
    }

    set created(created) {
        this._created = created;
    }

    get forum() {
        return this._forum;
    }

    set forum(forum) {
        this._forum = forum;
    }

    get id() {
        return this._id;
    }

    set id(id) {
        this._id = id;
    }

    get message() {
        return this._message;
    }

    set message(message) {
        this._message = message;
    }

    get slug() {
        return this._slug;
    }

    set slug(slug) {
        this._slug = slug;
    }

    get title() {
        return this._title;
    }

    set title(title) {
        this._title = title;
    }

    get votes() {
        return this._votes;
    }

    set votes(votes) {
        this._votes = votes;
    }

    getThreadJSON() {
        return {
            author: this.author,
            created: this.created,
            forum: this.forum,
            id: this.id,
            message: this.message,
            slug: this.slug,
            title: this.title,
            votes: this.votes
        }
    }
}

const getThreadJSON = (threads) => {
    let result = [];
    threads.forEach(thread => {
        let item = 
        {
            author: thread.author,
            created: thread.created,
            forum: thread.forum,
            id: thread.id,
            message: thread.message,
            slug: thread.slug,
            title: thread.title
        }
        if (thread.votes !== 0 ) {
            item.votes = thread.votes;
        }
        result.push(item)
    });
    return result;
}

module.exports = {
    threadModel,
    getThreadJSON
}