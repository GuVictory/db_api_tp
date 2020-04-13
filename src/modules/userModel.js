
class userModel {

    constructor(user) {
        this._about = user.hasOwnProperty('about') ? user.about : null;
        this._email = user.hasOwnProperty('email') ? user.email : null;
        this._fullname = user.hasOwnProperty('fullname') ? user.fullname : null;
        this._nickname = user.hasOwnProperty('nickname') ? user.nickname : null;
    }
    
    get about() {
        return this._about;
    }

    set about(str) {
        this._about = str;
    }

    get email() {
        return this._email;
    }

    set email(str) {
        this._email = str;
    }

    get fullname() {
        return this._fullname;
    }

    set fullname(str) {
        this._fullname = str;
    }

    get nickname() {
        return this._nickname;
    }
    
    set nickname(str) {
        this._nickname = str;
    }

    getUserJSON() {
        return {
            about: this.about,
            email: this.email,
            fullname: this.fullname,
            nickname: this.nickname
        }
    }
}

const getUserJSON = (users) => 
{
    let result = [];

    for (const user of users)
    {
        result.push(
            {
                about: user.about,
                email: user.email,
                fullname: user.fullname,
                nickname: user.nickname
            }
        )
    }
    return result;
}

module.exports = 
{
    userModel,
    getUserJSON
}