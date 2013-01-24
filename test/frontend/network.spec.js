module.exports = function() {
	var chai = require('chai'),
        should = chai.should(),
		wd = require("selenium-webdriverjs"),
        client;

    var expect = chai.expect;
    var should = chai.should();

	describe('Loading google...', function() {
        before(function() {
            client = new wd.Builder().
                usingServer('http://localhost:10000').
                withCapabilities({
                    'browserName': 'phantomjs',
                    'platform': 'ANY',
                    'version': '',
                    'javascriptEnabled': true
                }).
                build();
        })

        after(function() {
            client.quit();
        })

		it('should fail', function(done) {
            client.get('http://github.com');
            client.getTitle().then(function(title) {
                title.should.equal('Google');
                done();
            });
        })

        it('should pass', function(done) {
            client.get('http://google.com')
            client.getTitle().then(function(title) {
                title.should.equal('Google');
                done();
            })
        })
	});
}();

