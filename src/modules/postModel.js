class postModel {
    
    constructor(
        author,
        created,
        forum,
        id,
        isEdited,
        message,
        parent,
        thread
    ) {
        this._author = author;
        this._created = created;
        this._forum = forum;
        this._id = id;
        this._isEdited = isEdited;
        this._message = message;
        this._parent = parent;
        this._thread = thread;
    }
    
    get author() {
        return this._author;
    }

    set author(str) {
        this._author = str;
    }

    get created() {
        return this._created;
    }

    set created(str) {
        this._created = str;
    }

    get forum() {
        return this._forum;
    }

    set forum(str) {
        this._forum = str;
    }

    get id() {
        return this._id;
    }
    
    set id(str) {
        this._id = str;
    }

    get isEdited() {
        return this._isEdited;
    }

    set isEdited(str) {
        this._isEdited = str;
    }

    get message() {
        return this._message;
    }

    set message(str) {
        this._message = str;
    }

    get parent() {
        return this._parent;
    }
    
    set parent(str) {
        this._parent = str;
    }

    get thread() {
        return this._thread;
    }
    
    set thread(str) {
        this._thread = str;
    }

    getPostJSON() {
        return {
            author: this.author,
            created: this.created,
            forum: this.forum,
            id: this.id,
            isEdited: this.isEdited,
            message: this.message,
            parent: this.parent,
            thread: this.thread,
        }
    }
}

const getPostJSON = (posts) => {
    let result = [];
    posts.forEach(post => {
        let item = 
        {
            author: post.author,
            created: post.created,
            forum: post.forum,
            id: parseInt(post.id),
            isEdited: post.isedited,
            message: post.message,
            thread: post.thread,
        }
        if (parseInt(post.parent) !== 0) {
            item.parent = post.parent;
        }
        result.push(item)
    });
    return result;
}

const getPostJSONCreation = (posts) => {
    let result = [];
    posts.forEach(post => {
        result.push(
            {
                author: post.author,
                created: post.created,
                forum: post.forum,
                id: parseInt(post.id),
                message: post.message,
                thread: post.thread,
            }
        )
    });
    return result;
}

module.exports = 
{
    postModel,
    getPostJSON,
    getPostJSONCreation
}