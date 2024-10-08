const isSignedIn = (req, res, next) => {
    if (req.session.user) return next()    
    return res.redirect('/auth/sign-in')
}

module.exports = isSignedIn
  