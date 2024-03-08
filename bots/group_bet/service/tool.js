const math_abs = (e) => 
{
    return Math.abs(parseInt(e));
};
// 
const valsChange = async(vals) => 
{
    let _n = {};
    for(let i in vals)
    {
        _n[i] = await math_abs(vals[i]);
    }
    return _n;
}
// 
const mTon = (n) =>
{
  n = n+'';
  n = n.replace(/,/gi, '');
  n = parseInt(n)
  return !n ? '' : n;
}
// 数字转金额
const nTom = (n) =>
{
    n = n+'';
    if(n==0) return '0';
    return n.replace(/(\d)(?=(\d{3})+$)/g, ($1) => 
    {
        return $1 + ",";
    });
}
// 
module.exports={
    math_abs,
    valsChange,
    nTom,
    mTon
}