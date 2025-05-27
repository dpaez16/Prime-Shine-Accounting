export type UserInfo = {
    userID: number;
    token: string;
    name: string;
    email: string;
};

export type UserID = UserInfo['userID'];
export type JWT = UserInfo['token'];