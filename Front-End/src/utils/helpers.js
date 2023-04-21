export const deleteItemFromArray = function(arr, valObj) {
    const val = valObj._id;
    const idx = arr.findIndex(obj => obj._id === val);
    arr.splice(idx, 1);
    return arr;
}

export const replaceItemFromArray = function(arr, valObj, newObj) {
    const val = valObj._id;
    const idx = arr.findIndex(obj => obj._id === val);
    arr.splice(idx, 1, newObj);
    return arr;
}

export const dateToStr = function(date) {
    const dateNum = Number(date);
    return new Date(dateNum).toLocaleString();
}

export const constructDate = function(date) {
    // Wave likes invoice dates in yyyy-mm-dd
    return new Date(`${date} 00:00`);
}