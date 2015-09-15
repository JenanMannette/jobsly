var express = require('express');
var router = express.Router();
var moment = require('moment');
var currentDate = moment().format("MM/DD/YY");
var rawDate = Date.now();

var db = require('monk')('localhost/jobs');
var postings = db.get('postings');

/* GET home page. */
router.get('/', function(req, res, next) {
    postings.find({}, {"sort" : [['rawDate', -1]]}, function (err, docs) {
        res.render('index', {postings: docs})
    })
});

// ------- new job posting ------- //
router.get('/postings/new', function (req, res, next) {
    res.render('new');
});

// ------- post ------- //
router.post('/', function (req, res, next) {
    req.body.date = currentDate;
    req.body.rawDate = rawDate;
    req.body.isOpen = true;
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
    postings.findOne({_id: req.params.id}, function(err,doc) {
        if (doc.isOpen) {
            res.render('edit', {
                postings: doc,
                open: true,
            });
        } else {
            res.render('edit', {
                postings: doc,
                open: false,
            });
        }
        postings.findOne({_id: req.params.id}, function (err, doc) {
            doc.title = req.body.title;
            doc.company = req.body.company;
            doc.description = req.body.description;
            doc.responsibilities = req.body.responsibilities;
            doc.isOpen = req.body.isOpen;

            postings.update({_id: req.params.id}, doc, function (err, doc) {
                res.redirect('/postings/' + req.params.id);
            })
        })
    })
});

// ------- add applicant form ------- //
router.get('/applicants/:id', function(req,res,next){
    postings.findOne({_id:req.params.id}, function(err,doc){
        res.render('applicants', {postings: doc});
    })

});

 //--------------------------- NESTED ROUTES --------------------------- //

// ------- add applicant ------- //
router.post('/applicants/:id', function(req,res,next) {
    postings.findOne({_id: req.params.id}, function (err, doc) {
        var idCount = 0;
        if (doc.applicants.length < 1) {
            idCount = 1;
            req.body.applicationId = idCount;
            doc.applicants.push(req.body);
        }
        else {
            var lastIndex = doc.applicants.length - 1;
            var lastItem = doc.applicants[lastIndex];
            idCount = lastItem.applicationId + 1;
            req.body.applicationId = idCount;
            doc.applicants.push(req.body);
        }
        postings.update({_id: req.params.id}, doc, function (err, doc) {
            res.redirect('/postings/' + req.params.id);
        });
    });
});

// ------- delete applicant ------- //
router.post('/postings/:id/applicants/:applicationId/delete', function(req, res, next){
    postings.findOne({_id: req.params.id}, function(err,doc){

        var a = req.url.split('/');
        var b = a.length -2;

        console.log(a)
        console.log(b)

        var idFilter = doc.applicants.filter(function(application){
            return application.applicationId != a[b];
        })

        doc.applicants = idFilter;
        postings.update({_id:req.params.id},doc, function(err,doc){
            if(err){
                console.log(err);
            }
            res.redirect('/postings/' + req.params.id);

        })
    })
})

// ------- delete job posting ------- //
router.post('/postings/:id/delete', function (req, res, next) {
    postings.remove({_id: req.params.id}, function (err, docs) {
        res.redirect('/');
    });
});


module.exports = router;