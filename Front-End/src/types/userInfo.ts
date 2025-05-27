export type UserInfo = {
    _id: string;
    token: string;
    name: string;
    email: string;
};

export type JWT = UserInfo['token'];