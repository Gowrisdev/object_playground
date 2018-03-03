// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global desc, task, jake, fail, complete, directory, require, console, process */
(function () {
	"use strict";

	var NODE_VERSION = "v4.4.4";

	var TESTED_BROWSERS = [
		// "IE 8.0 (Windows)",  // DOES NOT WORK -- no SVG support
		// "IE 9.0 (Windows)",  // DOES NOT WORK -- no Int32Array support and shim causes 'Out of memory' error
		"IE 10.0.0 (Windows 7)",
		"Firefox 46.0.0 (Mac OS X 10.11)",
		"Chrome 50.0.2661 (Mac OS X 10.11.4)",
		"Safari 9.1.0 (Mac OS X 10.11.4)",
		"Mobile Safari 9.0.0 (iOS 9.3)",
		"IE 11.0.0 (Windows 7)"
	];

	var KARMA_CONFIG = "./build/config/karma.conf.js";

	// Lazy-load dependencies to avoid run-time errors if using wrong version of Node
	function lint() { return require("./build/util/lint_runner.js"); }
	function karma() { return require("./build/util/karma_runner.js"); }
	function version() { return require("./build/util/version_checker.js"); }

	checkNodeVersion();

	desc("Lint and test");
	task("default", ["lint", "test"], function() {
		console.log("\n\nBUILD OK");
	});

	desc("Start Karma server -- run this first");
	task("karma", function() {
		karma().serve(KARMA_CONFIG, complete, fail);
	}, {async: true});

	desc("Start HTTP server for manual testing");
	task("run", function() {
		jake.exec("node ./node_modules/http-server/bin/http-server ./src", { interactive: true }, complete);
	}, {async: true});

	desc("Lint everything");
	task("lint", [], function () {
		var passed = lint().validateFileList(nodeFilesToLint(), nodeLintOptions(), {});
		passed = lint().validateFileList(browserFilesToLint(), browserLintOptions(), browserLintGlobals()) && passed;
		if (!passed) fail("Lint failed");
	});

	desc("Test browser code");
	task("test", function() {
		karma().runTests({
			configFile: KARMA_CONFIG,
			browsers: TESTED_BROWSERS,
			strict: true
		}, complete, fail);
	}, {async: true});

	function checkNodeVersion() {
		var installedVersion = process.version;
		version().check("Node", !process.env.loose, NODE_VERSION, installedVersion, fail);
	}

	function nodeFilesToLint() {
		var files = new jake.FileList();
		files.include("build/util/**/*.js");
		files.include("Jakefile.js");
		return files.toArray();
	}

	function browserFilesToLint() {
		var files = new jake.FileList();
		files.include("src/*.js");
		return files.toArray();
	}

	function sharedLintOptions() {
		return {
			bitwise:true,
			curly:false,
			eqeqeq:true,
			forin:true,
			immed:true,
			latedef:false,
			newcap:true,
			noarg:true,
			noempty:true,
			nonew:true,
			regexp:true,
			undef:true,
			strict:true,
			trailing:true
		};
	}

	function nodeLintOptions() {
		var options = sharedLintOptions();
		options.node = true;
		return options;
	}

	function browserLintOptions() {
		var options = sharedLintOptions();
		options.browser = true;
		return options;
	}

	function browserLintGlobals() {
		return {
			jdls: true,

			console: false,
			mocha: false,
			describe: false,
			it: false,
			expect: false,
			dump: false,
			beforeEach: false,
			afterEach: false
		};
	}

}());