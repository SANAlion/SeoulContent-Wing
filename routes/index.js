const express = require('express');
const router = express.Router();

const userDirectoryRouter = require('./user/index');
const boardDirectoryRouter = require('./board/index');
const commentDirectoryRouter = require('./comment/index');
const likeDirectoryRouter = require('./like/index');
const dataDirectoryRouter = require('./data/index');

router.use('/user', userDirectoryRouter);
router.use('/board', boardDirectoryRouter);
router.use('/like', likeDirectoryRouter);
router.use('/comment', commentDirectoryRouter);
router.use('/data', dataDirectoryRouter);

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
