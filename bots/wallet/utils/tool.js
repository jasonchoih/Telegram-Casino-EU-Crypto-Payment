const mTon = (n) =>
{
  n = n+'';
  n = n.replace(/,/gi, '');
  n = parseInt(n)
  return !n ? '' : n;
}
// 
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
module.exports = {
    nTom,
    mTon
}