var express = require('express');
var router = express.Router();
var moment = require('moment');

var db = require('monk')('localhost/jobs');
var postings = db.get('postings');

/* GET home page. */
router.get('/', function(req, res, next) {
    postings.find({}, function (err, docs) {
        res.render('index', {postings: docs})
    })
});

// ------- new job posting ------- //
router.get('/postings/new', function (req, res, next) {
    res.render('new');
});

// ------- post ------- //
router.post('/', function (req, res, next) {
    req.body.applicants = [];
    postings.insert(req.body);
    res.redirect('/');
});

// ------- show job posting ------- //
router.get('/postings/:id', function (req, res, next) {
    postings.findOne({_id: req.params.id}, function (err, docs) {
        res.render('show', {postings: docs});
    });
});

// ------- edit job posting ------- //
router.get('/postings/:id/edit', function (req, res, next) {
    postings.findOne({_id: req.params.id}, function (err, docs) {
       res.render('edit', docs);
    });
});

// ------- update job posting ------- //
router.post('/postings/:id/update', function (req, res, next) {
    postings.update({_id: req.params.id}, req.body, function (err, docs) {
        res.redirect('/');
    });
});

// ------- add applicant form ------- //
router.get('/postings/:id/applicants', function (req, res, next) {
    res.render('applicants');
});

 //--------------------------- NESTED ROUTES --------------------------- //

// ------- add applicant ------- //
router.post('/postings/:id/applicants', function (req, res, next) {
    postings.findOne({_id: req.params.id}, function (err, docs) {
        if (err) res.send('No applicantInfo');
        docs.applicants.push(req.body);
        postings.update({_id: req.params.id}, docs, function (err, docs) {
            res.redirect('/postings/' + req.params.id);
        });
    });
});

// ------- delete applicant ------- //
router.post('/postings/:id/applicants/delete', function (req, res, next) {
    postings.findOne({_id: req.params.id}, function (err, docs) {
        var index = docs.applicants.indexOf(req.body.applicantInfo);
        docs.applicants.splice(index,1);
        postings.update({_id: req.params.id}, docs, function (err, docs) {
            res.redirect('/postings/' + req.params.id);
        });
    });
});

// ------- delete job posting ------- //
router.post('/postings/:id/delete', function (req, res, next) {
    postings.remove({_id: req.params.id}, function (err, docs) {
        res.redirect('/');
    });
});


module.exports = router;
