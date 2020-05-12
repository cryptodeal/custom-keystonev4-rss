var dateFormat = require('date-format-lite'),
	rss = require('rss'),
	setHeaders = require('setheaders').setWritableHeader;
	var async = require('async');

var KeystoneRSS = function(keystone, req, res) {
	var map = {};
	var route = {};
	var dynamicRoutes = [];
	var dateFormatString = 'YYYY-MM-DD';
	

	/* Retrieve selected model and compile feed structure from model entries */
	var parseItems = function(feedModel, feedCategory, feedMeta, feedUrl) {
		var feed = new rss(feedMeta);
		async.waterfall([
			function getCategory(done) {
				// use findOne, not find -- as you only want to retrive ONE user; using find is more expensive
				keystone.list('PostCategory').model.findOne({ key: feedCategory }).exec(done)
			},
			function getPosts(category, done) {
				keystone.list(feedModel).model.find().sort('-publishedDate').where('state', 'published').populate('author categories')
				.where('categories').in([category])
				.exec(done);
			},
		], function (err, results) {
			// if an error occurs during the above tasks ^, it will come down here
			if (err) {
				return err;
			}
			// otherwise if all tasks finish, it will come down here
			for (var i = 0; i < results.length; i++) {
				var name = '';
				for (var j = 0; j < results[i].author.length; j++) {
					if (j < results[i].author.length - 1) {
						name = name + results[i].author[j].name.first + ' ' + results[i].author[j].name.last + ', '
					} else name = name + results[i].author[j].name.first + ' ' + results[i].author[j].name.last
				}
				feed.item({
					title:  results[i].title,
					description: results[i].content.full,
					url: feedUrl + results[i].slug,
					author: name,
					date: results[i].publishedDate,
					enclosure: { url: results[i].image.secure_url},
				});
			}

			createXmlFile(feed);
		});
	};

	/* Set header appropriately */
	function stream(data, res, header) {
		return setHeaders(res, 'Content-Type', header) === true ? res.send(data)
		: null;
	}

	/* Convert feed structure to XML and stream */
	var createXmlFile = function(feed) {
		//express 3.x.x does not define req.hostname, only req.host
		//express 4.x.x has separate parameters for hostname and protocol
		var host = req.hostname ? req.hostname : req.host;
		stream(feed.xml(), res, 'application/xml');
	};

	/* Create RSS feed */
	var create = function(ks, rq, rs, opt) {
		// set variables to be used by all other KeystoneRSS functions
		keystone = ks;
		req = rq;
		res = rs;
		options = opt;

		parseItems(options.model, options.category, options.meta, options.url);
	};

	return {
		create: create
	}
};

module.exports = KeystoneRSS();