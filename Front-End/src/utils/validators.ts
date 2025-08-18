export const validatePhoneNumber = function (phoneNumber: string) {
    // https://regexlib.com/REDetails.aspx?regexp_id=61
    const regex = new RegExp(
        /^(\d[- ])?((\(\d{3}\)?)|(\d{3}))([\s-./]?)(\d{3})([\s-./]?)(\d{4})$/,
    );

    return regex.test(phoneNumber);
};

export const validateEmail = function (email: string) {
    // https://regexlib.com/REDetails.aspx?regexp_id=26
    const regex = new RegExp(
        /^([a-zA-Z0-9_\-.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/,
    );

    return regex.test(email);
};

export const validateAddress = function (
    addressLine1: string,
    city: string,
    state: string,
    postalCode: string,
) {
    // https://regexlib.com/REDetails.aspx?regexp_id=23
    const postalCodeRegex = new RegExp(
        /^\d{5}-\d{4}|\d{5}|[A-Z]\d[A-Z] \d[A-Z]\d$/,
    );

    return addressLine1 && city && state && postalCodeRegex.test(postalCode);
};

export const validateMoney = (money: string) => {
    // Slight modification of https://regexlib.com/REDetails.aspx?regexp_id=196
    // - Removed the optional leading $
    const moneyRegex = new RegExp(
        /^([1-9]{1}[0-9]{0,2}(\,[0-9]{3})*(\.[0-9]{0,2})?|[1-9]{1}[0-9]{0,}(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|(\.[0-9]{1,2})?)$/
    );

    const value = parseFloat(money);
    return moneyRegex.test(money) && !Number.isNaN(value);
};