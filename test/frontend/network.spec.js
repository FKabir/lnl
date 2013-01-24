module.exports = function() {
	var chai = require('chai'),
		should = chai.should(),
		wd = require("webdriverjs")
		client = wd.remote({
			host: 'localhost',
			port: '10000',
			logLevel: 'verbose',
			desiredCapabilities: {
				browserName: 'phantomjs'
			}
		});

	describe('Loading google...', function() {

		it('should fail', function(done) {
      client
        .init()
        .url('http://google.com')
        .getTitle(function(result) {
          try {
          	result.should.equal('Github');
          	done();
          } catch(e) {
          	done(e);
          }
        })
        .end();
    })

    it('should pass', function(done) {
      client
        .init()
        .url('http://google.com')
        .getTitle(function(result) {
           result.should.equal('Google');
           done();
        })
        .end()
    })

	});

	describe('Loading google 2...', function() {
		it('should pass', function(done) {
			client.init()
				.url("http://google.com")
				.getTitle(function(result) {
					result.should.equal("Google");
					done();
				})
				.end();
			
		})
	})
}();

