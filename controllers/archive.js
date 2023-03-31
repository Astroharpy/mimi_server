        // const refreshToken = jwt.sign(
        //     {"username": matchUser.username},
        //     process.env.REFRESH_TOKEN_SECRET,
        //     {expiresIn: '1d'}
        // )

        // console.log(matchUser)
        //saving the refresh token with the current user
        // const otherUsers = usersDb.users.filter(person => person.username !== matchUser.username)
        // const currentUser = { ...matchUser, refreshToken }
        // usersDb.setUsers([...otherUsers, currentUser])

        //setting the modal path
        // const modelFolder = path.join(__dirname,'..','model','users.json')

        //storing the data in the db
        // await fsPromises.writeFile(
        //     modelFolder,
        //     JSON.stringify(usersDb.users)
        // )
        // res.cookie(
        //     'jwt',
        //     refreshToken, 
        //     {
        //         httpOnly: true, 
        //         sameSite: 'None',
        //         maxAge: 1000 * 60 * 60 *24
        //     }
        // )