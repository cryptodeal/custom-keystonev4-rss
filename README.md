# README #

This package provides simple RSS Feed generation for your [KeystoneJS](http://keystonejs.com/) data models.

### What is this repository for? ###

This is a first crude implementation of creating RSS feeds for models within Keystone. [KeystoneJS](http://keystonejs.com/) is a powerful CMS/Web App platform, which can be used to create blog-esq content feeds.

Inside index.js add the following:

    ```
    var keystone = require('keystone');
    var rss = require('keystone-rss');

    /* Setup Route Bindings */
    exports = module.exports = function (app) {

        // Your other middleware/dependencies go here

        /* RSS Feeds */
        app.get('/feed/url.xml', function (req, res) {
            rss.create(keystone, req, res, {
                /* The model that is the subject of the feed */
                model: 'Post',
                
                /* The category that is being displayed in this feed */
			    category: 'categoryname',

                /* RSS Feed meta data */
                meta: {
                    title: 'Feed Title',
                    description: 'Description of feed',
                    feed_url: 'https://feed.url',
                    site_url: 'https://site.url',
                    image_url: 'https://feed.image.url',
                    managingEditor: 'someone',
                    webMaster: 'someone else',
                    copyright: '2017 You',
                    language: 'en',
                    categories: ['Category 1', 'Category 2', 'Category 3'],
                    pubDate: 'Jan 1, 2017 12:00:00 GMT',
                },

                /* The url prefix for posts within the feed (the post slug is appended to this) */
                url: 'http://site.url/post/',
            });
        });

        /* You can repeat the above code to create multiple, separate feeds */

    };
    ```

3. For each feed item it expects:
    + title
    + content.extended
    + slug
    + publishedDate
    + state
    + author(s)
    + image.secure_url

`state` is used to filter drafts, and the rest are parsed into xml as:

```
title:  post.title,
description: post.content.brief,
url: feedUrl + post.slug,
date: post.publishedDate,
author: post.name[1].first + ' ' + post.name[1].last + ', ' + post.name[2].first + ' ' + post.name[2].last ...
enclosure: post.image.secure_url
```
