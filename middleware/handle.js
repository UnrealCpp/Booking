
const checkIsInRole = (...roles) => (req, res, next) => {
    if (!req.user) {
        
        return res.redirect('/login')
    }
    //console.log(req.user.roles);
    //console.log(roles);
    //const hasRole = req.user.roles.find(role => roles == role);
    const hasRole = roles.filter(element => req.user.roles.includes(element));
    //console.log(hasRole.length);
    //console.log(req.originalUrl);
    
    if (!hasRole.length) {
        res.clearCookie('getSessionReturn');
        return res.redirect('/')//res.redirect('back');????
    }
    return next()
}

//export const isInRole = checkIsInRole;
module.exports = checkIsInRole;