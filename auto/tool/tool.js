// 两个数之间的随机数
const twoNumberRandom = async(min, max) =>
{
    return min + Math.floor(Math.random() * (max - min + 1));
}
// 随机顺序
const randSort = async(arr) => 
{
    for(var i = 0,len = arr.length;i < len; i++ )
    {
        var rand = parseInt(Math.random()*len);
        var temp = arr[rand];
        arr[rand] = arr[i];
        arr[i] = temp;
    }
    return arr;
}
// 
module.exports = 
{
    twoNumberRandom,
    randSort
};