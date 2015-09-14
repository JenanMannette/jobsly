var express = require('express');
var router = express.Router();
var moment = require('moment');
var timestamp = moment().format('MM/DD/YY');

var db = require('monk')('localhost/jobs');
var postings = db.get('postings');

/* GET home page. */
router.get('/', function(req, res, next) {
    postings.find({}, function (err, docs) {
        res.render('index', {postings: docs, title: 'Jobsly.io'})
    })
});

//new job posting
router.get('/postings/new', function (req, res, next) {
    res.render('new');
});

//post
router.post('/', function (req, res, next) {
    postings.insert(req.body);
    //postings.update({_id: req.params.id}, {'$set': {'timestamp': timestamp}});
        res.redirect('/');
});

//show job posting
router.get('/postings/:id', function (req, res, next) {
    postings.findOne({_id: req.params.id}, function (err, docs) {
        res.render('show', {postings: docs});
    });
});

//edit job posting
router.get('/postings/:id/edit', function (req, res, next) {
    postings.findOne({_id: req.params.id}, function (err, docs) {
       res.redirect('/'); 
    });
});

//update job posting
router.post('/postings/:id/update', function (req, res, next) {
    postings.findOne({_id: req.params.id}, req.body, function (err, docs) {
        res.redirect('/');
    });
});

//add applicant

//delete applicant

//delete job posting
router.post('/postings/:id/delete', function (req, res, next) {
    postings.remove({_id: req.params.id}, function (err, docs) {
        res.redirect('/');
    });
});


module.exports = router;
