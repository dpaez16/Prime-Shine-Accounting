export type UserInfo = {
    _id: number;
    token: string;
    name: string;
    email: string;
};

export type UserID = UserInfo['_id'];
export type JWT = UserInfo['token'];