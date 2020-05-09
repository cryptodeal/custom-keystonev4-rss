var dateFormat = require('date-format-lite'),
	rss = require('rss'),
	setHeaders = require('setheaders').setWritableHeader;

var KeystoneRSS = function(keystone, req, res) {
	var map = {};
	var route = {};
	var dynamicRoutes = [];
	var dateFormatString = 'YYYY-MM-DD';

	/* Retrieve selected model and compile feed structure from model entries */
	var parseItems = function(feedModel, feedMeta, feedUrl) {
		var feed = new rss(feedMeta);

		var q = keystone.list(feedModel).model.find().sort('-publishedDate').populate('author').where('state', 'published').exec(function (err, results) {
			if (err || !results.length) {
				return err;
			}

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

		parseItems(options.model, options.meta, options.url);
	};

	return {
		create: create
	}
};

module.exports = KeystoneRSS();
